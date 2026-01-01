import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { TrendingUp, Clock, CheckCircle, Ticket, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const COLORS = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#8b5cf6'
};

const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [slaStats, setSlaStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [analyticsRes, slaRes] = await Promise.all([
                analyticsAPI.getAnalytics(),
                analyticsAPI.getSLAStats()
            ]);
            setAnalytics(analyticsRes.data);
            setSlaStats(slaRes.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container-custom py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                </div>
            </div>
        );
    }

    const categoryData = analytics ?
        Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        })) : [];

    const priorityData = analytics ?
        Object.entries(analytics.priorityBreakdown).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: name === 'critical' ? COLORS.danger : name === 'high' ? COLORS.warning : name === 'medium' ? COLORS.info : COLORS.primary
        })) : [];

    const statusData = analytics ? [
        { name: 'Open', value: analytics.totalTickets - analytics.resolvedTickets },
        { name: 'Resolved', value: analytics.resolvedTickets }
    ] : [];

    return (
        <div className="container-custom py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                    Analytics Dashboard
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                    Comprehensive insights into your support performance
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Tickets */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Total Tickets
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {analytics?.totalTickets || 0}
                    </p>
                </div>

                {/* Resolution Rate */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Resolution Rate
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {analytics?.resolutionRate ? `${analytics.resolutionRate}%` : '0%'}
                    </p>
                </div>

                {/* Avg Resolution Time */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Avg Resolution
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {analytics?.avgResolutionTime || '0h'}
                    </p>
                </div>

                {/* SLA Compliance */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        SLA Compliance
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {slaStats?.complianceRate ? `${slaStats.complianceRate}%` : '0%'}
                    </p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Category Breakdown */}
                <div className="card p-6">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5" />
                        Category Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Priority Breakdown */}
                <div className="card p-6">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Priority Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={priorityData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]}>
                                {priorityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Overview */}
            <div className="card p-6">
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-6">
                    Status Overview
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* SLA Stats */}
            {slaStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="card p-6">
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                            Within SLA
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {slaStats.withinSLA || 0}
                        </p>
                    </div>
                    <div className="card p-6">
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                            Approaching SLA
                        </p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {slaStats.approachingSLA || 0}
                        </p>
                    </div>
                    <div className="card p-6">
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                            Breached SLA
                        </p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {slaStats.breachedSLA || 0}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
