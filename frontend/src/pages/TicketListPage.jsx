import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketsAPI } from '../services/api';
import { Search, Filter, Grid, List as ListIcon, Plus, Ticket } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';

const TicketListPage = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        category: ''
    });

    useEffect(() => {
        fetchTickets();
    }, []); // Fetch only once on mount

    useEffect(() => {
        let result = tickets;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(ticket =>
                ticket.title.toLowerCase().includes(query) ||
                ticket.description.toLowerCase().includes(query) ||
                (ticket.classification?.category || ticket.category || '').toLowerCase().includes(query) ||
                (ticket.classification?.priority || ticket.priority || '').toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (filters.status) {
            result = result.filter(ticket => ticket.status === filters.status);
        }

        // Apply priority filter  
        if (filters.priority) {
            result = result.filter(ticket => {
                const ticketPriority = (ticket.classification?.priority || ticket.priority || '').toLowerCase();
                return ticketPriority === filters.priority.toLowerCase();
            });
        }

        setFilteredTickets(result);
    }, [searchQuery, filters, tickets]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await ticketsAPI.getTickets(filters);
            const fetchedTickets = response.data.tickets || [];
            setTickets(fetchedTickets);
            setFilteredTickets(fetchedTickets);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    return (
        <div className="container-custom py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                            All Tickets
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'} found
                        </p>
                    </div>
                    <Link to="/tickets/new" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        <span>New Ticket</span>
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-10 w-full"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="input-field"
                        >
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>

                        <select
                            value={filters.priority}
                            onChange={(e) => handleFilterChange('priority', e.target.value)}
                            className="input-field"
                        >
                            <option value="">All Priority</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-neutral-700' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                            >
                                <ListIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-700' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tickets Display */}
            {loading ? (
                <LoadingSkeleton count={5} />
            ) : filteredTickets.length === 0 ? (
                <EmptyState
                    icon={Ticket}
                    title={searchQuery ? 'No tickets found' : 'No tickets yet'}
                    description={searchQuery ? 'Try adjusting your search or filters' : 'Create your first support ticket'}
                    actionLabel={!searchQuery ? 'Create Ticket' : undefined}
                    actionLink={!searchQuery ? '/tickets/new' : undefined}
                />
            ) : viewMode === 'list' ? (
                <div className="space-y-3">
                    {filteredTickets.map((ticket, index) => (
                        <Link
                            key={ticket.ticketId}
                            to={`/tickets/${ticket.ticketId}`}
                            className="block card p-5 hover:shadow-lg transition-all group"
                            style={{ animationDelay: `${index * 30}ms` }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-lg text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {ticket.title}
                                        </h3>
                                    </div>
                                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3 line-clamp-2">
                                        {ticket.description}
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`badge badge-${ticket.status === 'resolved' ? 'success' : ticket.status === 'in_progress' ? 'warning' : 'info'}`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                        <span className={`badge badge-${(ticket.classification?.priority || ticket.priority || 'low').toLowerCase()}`}>
                                            {(ticket.classification?.priority || ticket.priority || 'low').charAt(0).toUpperCase() + (ticket.classification?.priority || ticket.priority || 'low').slice(1)}
                                        </span>
                                        <span className="badge badge-neutral">
                                            {ticket.classification?.category || ticket.category || 'General'}
                                        </span>
                                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTickets.map((ticket, index) => (
                        <Link
                            key={ticket.ticketId}
                            to={`/tickets/${ticket.ticketId}`}
                            className="card p-5 hover:shadow-lg card-hover group"
                            style={{ animationDelay: `${index * 30}ms` }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className={`badge badge-${ticket.priority === 'critical' ? 'critical' : ticket.priority === 'high' ? 'high' : ticket.priority === 'medium' ? 'medium' : 'low'}`}>
                                    {ticket.priority}
                                </span>
                                <span className={`badge badge-${ticket.status === 'resolved' ? 'success' : ticket.status === 'in_progress' ? 'warning' : 'info'}`}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                            </div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2 line-clamp-2">
                                {ticket.title}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-3">
                                {ticket.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                <span className="badge badge-neutral">{ticket.category}</span>
                                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TicketListPage;
