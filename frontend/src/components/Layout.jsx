import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DarkModeToggle from './DarkModeToggle';
import {
    Sparkles, LayoutDashboard, Ticket, Plus, BarChart3,
    LogOut, User, Menu, X, Bell
} from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const navigation = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Tickets', path: '/tickets', icon: Ticket },
        { name: 'New Ticket', path: '/tickets/new', icon: Plus },
        ...(userProfile?.role !== 'customer' ? [
            { name: 'Analytics', path: '/analytics', icon: BarChart3 }
        ] : [])
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-neutral-200 dark:border-neutral-700">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Brand */}
                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div className="hidden sm:block">
                                <div className="font-bold text-lg text-neutral-900 dark:text-white">Aidora</div>
                                <div className="text-xs text-primary-400">Intelligent Support at the Right Time</div>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <button className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* Dark Mode Toggle */}
                            <DarkModeToggle />

                            {/* User Menu */}
                            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-neutral-200 dark:border-neutral-700">
                                <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {userProfile?.displayName || currentUser?.email}
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                                            {userProfile?.role}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {(userProfile?.displayName || currentUser?.email)?.[0]?.toUpperCase()}
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                                ) : (
                                    <Menu className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-neutral-200 dark:border-neutral-700 animate-slide-down">
                            <div className="space-y-1">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                <div className="flex items-center gap-3 px-4 py-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {(userProfile?.displayName || currentUser?.email)?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {userProfile?.displayName || currentUser?.email}
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                                            {userProfile?.role}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 pt-16">
                {children}
            </main>

            {/* Footer - Premium Design */}
            <footer className="relative bg-gradient-to-r from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 border-t border-neutral-200 dark:border-neutral-700 py-6 mt-auto">
                <div className="container-custom">
                    <div className="flex flex-col items-center gap-3">
                        {/* Decorative line */}
                        <div className="flex items-center gap-3 w-full max-w-md">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-300 to-transparent dark:via-primary-700"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-300 to-transparent dark:via-primary-700"></div>
                        </div>

                        {/* Main text */}
                        <div className="text-center">
                            <p className="text-sm font-light tracking-wide text-neutral-500 dark:text-neutral-400">
                                Support, <span className="font-medium italic">reimagined</span>
                            </p>
                            <p className="text-xs mt-1 text-neutral-400 dark:text-neutral-500">
                                Crafted by{' '}
                                <span className="font-semibold bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-400 dark:to-primary-500 bg-clip-text text-transparent">
                                    Keeistu M S
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
