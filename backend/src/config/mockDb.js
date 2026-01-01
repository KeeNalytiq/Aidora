/**
 * Mock Timestamp to emulate Firestore behavior
 */
const wrapDate = (date) => {
    if (date && typeof date.toDate === 'function') return date; // Already wrapped
    if (!(date instanceof Date)) return date;
    return {
        toDate: () => date,
        toISOString: () => date.toISOString(),
        toMillis: () => date.getTime(),
        _isMockTimestamp: true
    };
};

class MockDb {
    constructor() {
        this.stores = {
            tickets: new Map(),
            users: new Map(),
            auditLogs: new Map(),
            otps: new Map(),
            comments: new Map(),
            resolutions: new Map()
        };

        // Seed some data for immediate feedback in Dev Mode
        this._seedData();
    }

    _seedData() {
        const now = new Date();

        // 1. Admin User
        const adminUser = {
            id: 'dev-user-123',
            uid: 'dev-user-123',
            email: 'admin@aidora.com',
            role: 'admin',
            displayName: 'Admin Developer',
            createdAt: now
        };

        // 2. Customer 1 (Keeistu)
        const customer1 = {
            id: 'cust-1',
            uid: 'cust-1',
            email: 'keeistu25@gmail.com',
            role: 'customer',
            displayName: 'Customer One',
            createdAt: now
        };

        // 3. Customer 2
        const customer2 = {
            id: 'cust-2',
            uid: 'cust-2',
            email: 'customer2@test.com',
            role: 'customer',
            displayName: 'Customer Two',
            createdAt: now
        };

        // 4. Support Engineer
        const engineer1 = {
            id: 'eng-1',
            uid: 'eng-1',
            email: 'engineer@aidora.com',
            role: 'engineer',
            displayName: 'Support Engineer One',
            createdAt: now
        };

        this.stores.users.set(adminUser.id, this._processData(adminUser));
        this.stores.users.set(customer1.id, this._processData(customer1));
        this.stores.users.set(customer2.id, this._processData(customer2));
        this.stores.users.set(engineer1.id, this._processData(engineer1));

        const seedTicket = {
            id: 'seed-ticket-1',
            userId: 'cust-1',
            title: 'Welcome to Aidora (Local Mode)',
            description: 'This is a sample ticket to verify your local setup. If you see this, your listing is working!',
            status: 'open',
            category: 'general',
            priority: 'low',
            createdAt: now,
            updatedAt: now,
            classification: {
                predictedCategory: 'general',
                predictedPriority: 'low',
                confidenceScore: 0.9
            },
            sla: {
                targetResolutionTime: 4320,
                slaStatus: 'compliant'
            }
        };
        this.stores.tickets.set(seedTicket.id, this._processData(seedTicket));

        console.log('✅ Mock Database seeded with multiple test users (Admin, 2 Customers, 1 Engineer)');
    }

    _processData(data) {
        if (!data || typeof data !== 'object') return data;
        const processed = { ...data };
        for (const key in processed) {
            if (processed[key] instanceof Date) {
                processed[key] = wrapDate(processed[key]);
            } else if (typeof processed[key] === 'object' && processed[key] !== null) {
                processed[key] = this._processData(processed[key]);
            }
        }
        return processed;
    }

    collection(name) {
        if (!this.stores[name]) {
            this.stores[name] = new Map();
        }

        const store = this.stores[name];

        return {
            add: async (data) => {
                const id = `mock-${name.split('/').pop()}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                const processed = this._processData(data);
                store.set(id, { ...processed, id });
                return { id, get: async () => ({ exists: true, data: () => this._processData(store.get(id)) }) };
            },
            doc: (id) => {
                return {
                    id,
                    set: async (data, options) => {
                        const processed = this._processData(data);
                        const existing = store.get(id) || {};
                        if (options?.merge) {
                            store.set(id, { ...existing, ...processed, id });
                        } else {
                            store.set(id, { ...processed, id });
                        }
                    },
                    get: async () => {
                        const data = store.get(id);
                        return {
                            exists: !!data,
                            data: () => data ? this._processData(data) : undefined,
                            id
                        };
                    },
                    update: async (data) => {
                        const processed = this._processData(data);
                        const existing = store.get(id);
                        if (!existing) throw new Error('Document not found');
                        store.set(id, { ...existing, ...processed });
                    },
                    collection: (subName) => this.collection(`${name}/${id}/${subName}`),
                    ref: {
                        update: async (data) => {
                            const existing = store.get(id);
                            if (!existing) throw new Error('Document not found');
                            store.set(id, { ...existing, ...data });
                        }
                    }
                };
            },
            get: async () => {
                const docs = Array.from(store.values()).map(data => ({
                    id: data.id,
                    data: () => this._processData(data)
                }));
                return {
                    docs,
                    size: docs.length,
                    empty: docs.length === 0,
                    forEach: (callback) => docs.forEach(callback)
                };
            },
            where: (field, op, value) => {
                const filter = (data) => {
                    const fieldValue = data[field];
                    if (op === '==') return fieldValue === value;
                    if (op === 'in') return Array.isArray(value) && value.includes(fieldValue);
                    if (op === '!=') return fieldValue !== value;
                    return true;
                };

                const filteredStore = new Map(
                    Array.from(store.entries()).filter(([k, v]) => filter(v))
                );

                // Return a mock query object
                return this._mockQuery(filteredStore);
            },
            orderBy: (field, direction) => this._mockQuery(store),
            limit: (num) => this._mockQuery(store),
            batch: () => this.batch()
        };
    }

    _mockQuery(store, options = {}) {
        const { sortField, sortDirection, limitNum } = options;

        return {
            get: async () => {
                let docs = Array.from(store.values()).map(data => ({
                    id: data.id,
                    data: () => this._processData(data)
                }));

                // Apply Sorting
                if (sortField) {
                    docs.sort((a, b) => {
                        const valA = a.data()[sortField];
                        const valB = b.data()[sortField];

                        // Extract raw date if wrapped
                        const rawA = valA && valA.toDate ? valA.toDate() : valA;
                        const rawB = valB && valB.toDate ? valB.toDate() : valB;

                        if (rawA < rawB) return sortDirection === 'desc' ? 1 : -1;
                        if (rawA > rawB) return sortDirection === 'desc' ? -1 : 1;
                        return 0;
                    });
                }

                // Apply Limit
                if (limitNum) {
                    docs = docs.slice(0, limitNum);
                }

                return {
                    docs,
                    size: docs.length,
                    empty: docs.length === 0,
                    forEach: (callback) => docs.forEach(callback)
                };
            },
            where: (field, op, value) => {
                const filter = (data) => {
                    const fieldValue = data[field];
                    if (op === '==') return fieldValue === value;
                    if (op === 'in') return Array.isArray(value) && value.includes(fieldValue);
                    return true;
                };
                const nextStore = new Map(
                    Array.from(store.entries()).filter(([k, v]) => filter(v))
                );
                return this._mockQuery(nextStore, options);
            },
            orderBy: (field, direction = 'asc') => this._mockQuery(store, { ...options, sortField: field, sortDirection: direction }),
            limit: (num) => this._mockQuery(store, { ...options, limitNum: num })
        };
    }

    batch() {
        return {
            update: (docRef, data) => {
                // simplified batch update for mock
                if (docRef && docRef.update) docRef.update(data);
            },
            commit: async () => {
                console.log('🛠️ Mock Batch Committed');
            }
        };
    }
}

module.exports = new MockDb();
