import { useState } from 'react';
import { X } from 'lucide-react';

const OTPModal = ({ isOpen, onClose, onVerify, loading, title, description }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }
        setError('');
        onVerify(otp);
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(value);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Description */}
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                    {description}
                </p>

                {/* OTP Input */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                            Enter OTP Code
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={handleOtpChange}
                            placeholder="000000"
                            disabled={loading}
                            className="input-field text-center text-2xl tracking-widest font-mono"
                            maxLength={6}
                            autoFocus
                        />
                        {error && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="btn btn-primary flex-1"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {/* Resend Link */}
                <div className="mt-4 text-center">
                    <button
                        type="button"
                        disabled={loading}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        Resend OTP
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OTPModal;
