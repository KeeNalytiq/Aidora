const TicketSkeleton = () => {
    return (
        <div className="block p-6 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="flex items-start justify-between mb-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="flex space-x-2">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
            </div>
            <div className="space-y-2 mb-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
            <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        </div>
    );
};

const LoadingSkeleton = ({ count = 3, type = "ticket" }) => {
    if (type === "ticket") {
        return (
            <div className="space-y-4">
                {[...Array(count)].map((_, i) => (
                    <TicketSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Card skeleton for dashboard
    if (type === "card") {
        return (
            <div className="glass rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
        );
    }

    return null;
};

export default LoadingSkeleton;
