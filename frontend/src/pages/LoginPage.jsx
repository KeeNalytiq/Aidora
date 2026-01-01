import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignIn from '../components/GoogleSignIn';
import { Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = () => {
        navigate('/dashboard');
    };

    const handleGoogleError = (err) => {
        setError('Google Sign-In failed. Please try again.');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

            {/* Login Card */}
            <div className="relative w-full max-w-md animate-fade-in">
                {/* Logo & Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-700 rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-transform">
                        <Sparkles className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 dark:from-primary-400 dark:via-indigo-400 dark:to-primary-500 bg-clip-text text-transparent mb-3">
                        Aidora
                    </h1>
                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-4 tracking-wide uppercase">
                        Intelligent Support at the Right Time
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Sign in to access your support dashboard
                    </p>
                </div>


                {/* Main Card */}
                <div className="card p-8 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-slide-down">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    {/* Google Sign-In */}
                    <GoogleSignIn onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-300 dark:border-neutral-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-neutral-700 dark:text-neutral-300">Remember me</span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="text-center text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">
                            Don't have an account?{' '}
                        </span>
                        <Link
                            to="/register"
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
                        >
                            Sign up for free
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center space-y-3">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        By signing in, you agree to our{' '}
                        <a href="#" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="underline hover:text-neutral-700 dark:hover:text-neutral-300">
                            Privacy Policy
                        </a>
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        Developed with ❤️ by <span className="font-semibold text-primary-600 dark:text-primary-400">Keeistu M S</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
