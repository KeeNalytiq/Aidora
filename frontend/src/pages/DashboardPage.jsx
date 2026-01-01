import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketsAPI } from '../services/api';
import {
    Ticket, TrendingUp, TrendingDown, Clock, CheckCircle2,
    AlertCircle, FileText, ArrowRight, Zap
} from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const DashboardPage = () => {
    const { userProfile } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0
    });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await ticketsAPI.getTickets();
            const ticketData = response.data.tickets || [];
            setTickets(ticketData);

            // Calculate stats
            const calculatedStats = {
                total: ticketData.length,
                open: ticketData.filter(t => t.status === 'open').length,
                inProgress: ticketData.filter(t => t.status === 'in_progress').length,
                resolved: ticketData.filter(t => t.status === 'resolved').length
            };
            setStats(calculatedStats);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            open: 'text-blue-600 dark:text-blue-400',
            in_progress: 'text-amber-600 dark:text-amber-400',
            resolved: 'text-green-600 dark:text-green-400'
        };
        return colors[status] || colors.open;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            critical: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            high: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
            medium: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            low: 'text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
        };
        return colors[priority] || colors.medium;
    };

    return (
        <div className="container-custom py-8">
            {/* Welcome Section */}
            <div className="mb-8 animate-fade-in">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                    Welcome back, {userProfile?.displayName || 'User'}! 👋
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                    Here's what's happening with your support tickets today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Tickets */}
                <div className="card card-hover p-6 animate-slide-up" style={{ animationDelay: '0ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            12%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Total Tickets
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {stats.total}
                    </p>
                </div>

                {/* Open Tickets */}
                <div className="card card-hover p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            Needs attention
                        </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Open
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {stats.open}
                    </p>
                </div>

                {/* In Progress */}
                <div className="card card-hover p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                            In progress
                        </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Being Worked On
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {stats.inProgress}
                    </p>
                </div>

                {/* Resolved */}
                <div className="card card-hover p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            8%
                        </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                        Resolved
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {stats.resolved}
                    </p>
                </div>
            </div>

            {/* Recent Tickets */}
            <div className="card p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Recent Tickets
                        </h2>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            Your latest support requests
                        </p>
                    </div>
                    <Link
                        to="/tickets"
                        className="btn btn-secondary btn-sm flex items-center gap-2"
                    >
                        <span>View All</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <LoadingSkeleton count={3} />
                ) : tickets.length === 0 ? (
                    <EmptyState
                        icon={Ticket}
                        title="No tickets yet"
                        description="Create your first support ticket to get started"
                        actionLabel="Create Ticket"
                        actionLink="/tickets/new"
                    />
                ) : (
                    <div className="space-y-3">
                        {tickets.slice(0, 5).map((ticket, index) => (
                            <Link
                                key={ticket.ticketId}
                                to={`/tickets/${ticket.ticketId}`}
                                className="block p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                                                {ticket.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1 mb-3">
                                            {ticket.description}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`badge badge-${ticket.status === 'resolved' ? 'success' : ticket.status === 'in_progress' ? 'warning' : 'info'}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className={`badge badge-${ticket.priority === 'critical' ? 'critical' : ticket.priority === 'high' ? 'high' : ticket.priority === 'medium' ? 'medium' : 'low'}`}>
                                                {ticket.priority}
                                            </span>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-shrink-0" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/tickets/new"
                    className="card card-hover p-6 group"
                >
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                        Create New Ticket
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Get help with a new issue
                    </p>
                </Link>

                <Link
                    to="/tickets"
                    className="card card-hover p-6 group"
                >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                        View All Tickets
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Browse your support history
                    </p>
                </Link>

                {(userProfile?.role === 'admin' || userProfile?.role === 'engineer') && (
                    <Link
                        to="/analytics"
                        className="card card-hover p-6 group"
                    >
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                            Analytics
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            View detailed reports
                        </p>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
