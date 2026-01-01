import { Clock, MessageSquare, User, CheckCircle, Edit } from 'lucide-react';

const ActivityTimeline = ({ ticket }) => {
    const events = [];

    // Ticket created
    events.push({
        type: 'created',
        icon: Edit,
        title: 'Ticket Created',
        description: `Created by user`,
        timestamp: ticket.createdAt,
        color: 'blue'
    });

    // AI Classification
    if (ticket.classification) {
        events.push({
            type: 'classified',
            icon: CheckCircle,
            title: 'AI Classification',
            description: `Category: ${ticket.classification.predictedCategory}, Priority: ${ticket.classification.predictedPriority}`,
            timestamp: ticket.classification.classifiedAt || ticket.createdAt,
            color: 'purple'
        });
    }

    // Comments
    if (ticket.comments && ticket.comments.length > 0) {
        ticket.comments.forEach(comment => {
            events.push({
                type: 'comment',
                icon: MessageSquare,
                title: 'Comment Added',
                description: `${comment.userName}: ${comment.commentText.substring(0, 50)}...`,
                timestamp: comment.createdAt,
                color: 'green'
            });
        });
    }

    // Resolution
    if (ticket.resolution) {
        events.push({
            type: 'resolved',
            icon: CheckCircle,
            title: 'Ticket Resolved',
            description: `Resolved in ${ticket.resolution.resolutionTimeMinutes} minutes`,
            timestamp: ticket.resolution.resolvedAt,
            color: 'green'
        });
    }

    // Sort by timestamp
    events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
        purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
        green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
        orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
    };

    return (
        <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                Activity Timeline
            </h2>
            <div className="space-y-4">
                {events.map((event, index) => {
                    const Icon = event.icon;
                    return (
                        <div key={index} className="flex items-start space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses[event.color]}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(event.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityTimeline;
