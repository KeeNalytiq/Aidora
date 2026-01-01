import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketsAPI, authAPI } from '../services/api';
import {
    MessageSquare, CheckCircle, Clock, User, AlertCircle,
    Sparkles, Send, Calendar, Tag, ArrowRight, Users, FileText
} from 'lucide-react';
import ActivityTimeline from '../components/ActivityTimeline';
import RatingWidget from '../components/RatingWidget';

const TicketDetailPage = () => {
    const { id } = useParams();
    const { userProfile } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [similarTickets, setSimilarTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [resolutionText, setResolutionText] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [engineers, setEngineers] = useState([]);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchTicket();
        fetchEngineers();
    }, [id]);

    const fetchEngineers = async () => {
        try {
            const response = await authAPI.getEngineers();
            setEngineers(response.data.engineers || []);
        } catch (error) {
            console.error('Error fetching engineers:', error);
        }
    };

    const fetchTicket = async () => {
        try {
            const response = await ticketsAPI.getTicketById(id);
            setTicket(response.data);

            try {
                const similarRes = await ticketsAPI.getSimilarTickets(id);
                setSimilarTickets(similarRes.data.similarTickets || []);
            } catch (err) {
                console.error('Error fetching similar tickets:', err);
            }
        } catch (error) {
            console.error('Error fetching ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        try {
            await ticketsAPI.addComment(id, commentText);
            setCommentText('');
            fetchTicket();
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleResolve = async (e) => {
        e.preventDefault();
        try {
            await ticketsAPI.resolveTicket(id, resolutionText);
            fetchTicket();
        } catch (error) {
            console.error('Error resolving ticket:', error);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            await ticketsAPI.updateTicket(id, { status: newStatus });
            fetchTicket();
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleAssignment = async (engineerUid) => {
        setAssigning(true);
        try {
            await ticketsAPI.updateTicket(id, { assignedTo: engineerUid });
            fetchTicket();
        } catch (error) {
            console.error('Error assigning ticket:', error);
        } finally {
            setAssigning(false);
        }
    };

    const handleRating = async (ratingData) => {
        try {
            await ticketsAPI.rateTicket(id, ratingData.score, ratingData.feedback);
            fetchTicket();
        } catch (error) {
            console.error('Error rating ticket:', error);
        }
    };

    if (loading) {
        return (
            <div className="container-custom py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
                    <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="container-custom py-8">
                <div className="card p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                        Ticket Not Found
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        The ticket you're looking for doesn't exist or you don't have access.
                    </p>
                </div>
            </div>
        );
    }

    const canUpdateTicket = userProfile?.role === 'engineer' || userProfile?.role === 'admin';

    return (
        <div className="container-custom py-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    <span>Ticket</span>
                    <ArrowRight className="w-4 h-4" />
                    <span className="font-medium">#{ticket.ticketId?.slice(-8)}</span>
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                    {ticket.title}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                    <span className={`badge badge-${ticket.status === 'resolved' ? 'success' : ticket.status === 'in_progress' ? 'warning' : 'info'}`}>
                        {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`badge badge-${ticket.priority === 'critical' ? 'critical' : ticket.priority === 'high' ? 'high' : ticket.priority === 'medium' ? 'medium' : 'low'}`}>
                        {ticket.priority}
                    </span>
                    <span className="badge badge-neutral">
                        {ticket.category}
                    </span>
                </div>
            </div>

            {/* 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Description
                        </h3>
                        <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                            {ticket.description}
                        </p>
                    </div>

                    {/* AI Classification */}
                    {ticket.classification && (
                        <div className="card p-6">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary-600" />
                                AI Classification
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Category</p>
                                    <p className="font-semibold capitalize">{ticket.classification.predictedCategory}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Priority</p>
                                    <p className="font-semibold capitalize">{ticket.classification.predictedPriority}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Confidence</p>
                                    <p className="font-semibold">{(ticket.classification.confidenceScore * 100).toFixed(0)}%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comments */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Comments ({ticket.comments?.length || 0})
                        </h3>

                        {/* Comment List */}
                        <div className="space-y-4 mb-6">
                            {ticket.comments && ticket.comments.length > 0 ? (
                                ticket.comments.map((comment, idx) => (
                                    <div key={idx} className="flex gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                            {comment.userName?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-neutral-900 dark:text-white">
                                                    {comment.userName || 'User'}
                                                </span>
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {new Date(comment.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-neutral-700 dark:text-neutral-300">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-neutral-500 dark:text-neutral-400 text-center py-4">
                                    No comments yet
                                </p>
                            )}
                        </div>

                        {/* Add Comment Form */}
                        <form onSubmit={handleAddComment} className="space-y-3">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="textarea-field"
                                rows={3}
                                required
                            />
                            <button type="submit" className="btn btn-primary btn-sm flex items-center gap-2">
                                <Send className="w-4 h-4" />
                                Post Comment
                            </button>
                        </form>
                    </div>

                    {/* Resolution (Engineers only) */}
                    {canUpdateTicket && ticket.status !== 'resolved' && (
                        <div className="card p-6">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Resolve Ticket
                            </h3>
                            <form onSubmit={handleResolve} className="space-y-3">
                                <textarea
                                    value={resolutionText}
                                    onChange={(e) => setResolutionText(e.target.value)}
                                    placeholder="Describe the resolution..."
                                    className="textarea-field"
                                    rows={4}
                                    required
                                />
                                <button type="submit" className="btn btn-primary flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Mark as Resolved
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Rating Widget */}
                    {ticket.status === 'resolved' && ticket.userId === userProfile?.uid && !ticket.rating && (
                        <div className="card p-6">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                                Rate This Ticket
                            </h3>
                            <RatingWidget onSubmit={handleRating} />
                        </div>
                    )}
                </div>

                {/* Sidebar - 1/3 width */}
                <div className="space-y-6">
                    {/* Ticket Info */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                            Ticket Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Created
                                </p>
                                <p className="font-medium text-neutral-900 dark:text-white">
                                    {new Date(ticket.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Reporter
                                </p>
                                <p className="font-medium text-neutral-900 dark:text-white">
                                    {ticket.userEmail}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    SLA Target
                                </p>
                                <p className="font-medium text-neutral-900 dark:text-white">
                                    {ticket.slaTarget ? new Date(ticket.slaTarget).toLocaleString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Assignment (Engineers only) */}
                    {canUpdateTicket && (
                        <div className="card p-6">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Assignment
                            </h3>
                            <select
                                value={ticket.assignedTo || ''}
                                onChange={(e) => handleAssignment(e.target.value)}
                                disabled={assigning}
                                className="input-field"
                            >
                                <option value="">Unassigned</option>
                                {engineers.map((eng) => (
                                    <option key={eng.uid} value={eng.uid}>
                                        {eng.displayName || eng.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Status (Engineers only) */}
                    {canUpdateTicket && (
                        <div className="card p-6">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                                Update Status
                            </h3>
                            <div className="space-y-2">
                                {['open', 'in_progress', 'resolved'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusChange(status)}
                                        disabled={updatingStatus || ticket.status === status}
                                        className={`w-full btn btn-sm ${ticket.status === status ? 'btn-primary' : 'btn-secondary'
                                            }`}
                                    >
                                        {status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Activity Timeline */}
                    {ticket.activityTimeline && ticket.activityTimeline.length > 0 && (
                        <div className="card p-6">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                                Activity
                            </h3>
                            <ActivityTimeline activities={ticket.activityTimeline} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketDetailPage;
