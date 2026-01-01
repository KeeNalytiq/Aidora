import { Star } from 'lucide-react';
import { useState } from 'react';

const RatingWidget = ({ onSubmit, disabled = false }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating > 0) {
            setSubmitting(true);
            try {
                await onSubmit({ score: rating, feedback });
            } finally {
                setSubmitting(false);
            }
        }
    };

    return (
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <h3 className="font-bold mb-3">Rate this resolution</h3>
            <div className="flex space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        disabled={disabled || submitting}
                        className="transition-transform hover:scale-110 focus:outline-none"
                    >
                        <Star
                            className={`w-8 h-8 ${star <= (hover || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                        />
                    </button>
                ))}
            </div>
            <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Optional: Share your feedback..."
                className="input-field w-full mb-3"
                rows={3}
                disabled={disabled || submitting}
            />
            <button
                onClick={handleSubmit}
                disabled={rating === 0 || disabled || submitting}
                className="btn-primary"
            >
                {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
        </div>
    );
};

export default RatingWidget;
