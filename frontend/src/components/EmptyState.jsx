import { Inbox, Plus, Search, TrendingUp } from 'lucide-react';

const EmptyState = ({
    icon: Icon = Inbox,
    title = "No items found",
    description = "",
    actionLabel = "",
    onAction = null
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mb-6">
                <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            {description && (
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm mb-6">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <button onClick={onAction} className="btn-primary">
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
