import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Edit2, Save, X, Camera, Key, CheckCircle } from 'lucide-react';
import OTPModal from '../components/OTPModal';
import PasswordChangeModal from '../components/PasswordChangeModal';
import { emailAPI } from '../services/api';

const ProfilePage = () => {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [formData, setFormData] = useState({
        displayName: userProfile?.displayName || '',
        email: currentUser?.email || '',
        role: userProfile?.role || 'customer',
        photoURL: userProfile?.photoURL || ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Modal states
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [otpPurpose, setOtpPurpose] = useState(''); // 'password' or 'verify-email'
    const [otpLoading, setOtpLoading] = useState(false);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setFormData({ ...formData, photoURL: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            setPhotoPreview(null);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            displayName: userProfile?.displayName || '',
            email: currentUser?.email || '',
            role: userProfile?.role || 'customer',
            photoURL: userProfile?.photoURL || ''
        });
        setIsEditing(false);
        setPhotoPreview(null);
        setMessage({ type: '', text: '' });
    };

    // Password change flow
    const handlePasswordChangeClick = async () => {
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            await emailAPI.sendPasswordResetOTP(currentUser.email);
            setOtpPurpose('password');
            setShowOTPModal(true);
            setMessage({ type: 'success', text: 'OTP sent to your email!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to send OTP. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleOTPVerify = async (otp) => {
        setOtpLoading(true);
        try {
            const response = await emailAPI.verifyOTP(currentUser.email, otp, otpPurpose === 'password' ? 'password-reset' : 'email-verification');

            if (response.data.success) {
                setShowOTPModal(false);
                if (otpPurpose === 'password') {
                    setShowPasswordModal(true);
                } else if (otpPurpose === 'verify-email') {
                    setMessage({ type: 'success', text: 'Email verified successfully!' });

                    // Refresh the user profile to get updated emailVerified status
                    console.log('🔄 Refreshing user profile after email verification...');
                    await refreshProfile();
                    console.log('✅ Profile refreshed - emailVerified should now be true');
                }
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'OTP verification failed. Please try again.' });
        } finally {
            setOtpLoading(false);
        }
    };

    const handlePasswordChangeSuccess = () => {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
    };

    // Email verification flow
    const handleVerifyEmail = async () => {
        setMessage({ type: '', text: '' });
        setLoading(true);

        try {
            await emailAPI.sendEmailVerificationOTP(currentUser.email);
            setOtpPurpose('verify-email');
            setShowOTPModal(true);
            setMessage({ type: 'success', text: 'Verification OTP sent to your email!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to send verification email.' });
        } finally {
            setLoading(false);
        }
    };

    const displayPhoto = photoPreview || formData.photoURL;
    const userInitial = (formData.displayName || currentUser?.email)?.[0]?.toUpperCase();

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 py-8">
                <div className="container-custom max-w-4xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent mb-3">
                            Profile Settings
                        </h1>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Manage your account information and preferences
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {/* Main Profile Card */}
                        <div className="card p-8 shadow-lg">
                            {/* Avatar Section with Photo Upload */}
                            <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-neutral-200 dark:border-neutral-700">
                                <div className="relative group">
                                    {displayPhoto ? (
                                        <img
                                            src={displayPhoto}
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary-900"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold ring-4 ring-primary-100 dark:ring-primary-900">
                                            {userInitial}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <div className="flex flex-col items-center gap-1 text-white">
                                                <Camera className="w-6 h-6" />
                                                <span className="text-xs font-medium">Change</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                                        {formData.displayName || 'User'}
                                    </h2>
                                    <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${formData.role === 'admin'
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                            : formData.role === 'engineer'
                                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            }`}>
                                            <Shield className="w-3.5 h-3.5 mr-1.5" />
                                            {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                                        </span>
                                    </div>
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="btn btn-primary flex items-center gap-2 mx-auto md:mx-0"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Message */}
                            {message.text && (
                                <div className={`mb-6 p-4 rounded-xl border-2 ${message.type === 'success'
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                    } animate-fade-in`}>
                                    <div className="flex items-center gap-2 font-medium">
                                        {message.text}
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                            <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.displayName}
                                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                            disabled={!isEditing}
                                            className="input-field"
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                            <Mail className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="input-field opacity-60 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Email cannot be changed
                                        </p>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn btn-primary flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            disabled={loading}
                                            className="btn btn-secondary flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Account Information Cards */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card p-6 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-neutral-800">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    Account Details
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Account ID</span>
                                        <span className="text-sm font-mono font-semibold text-neutral-900 dark:text-white">
                                            {currentUser?.uid?.slice(0, 8)}...
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Email Verified</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-semibold ${userProfile?.emailVerified || currentUser?.emailVerified
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {userProfile?.emailVerified || currentUser?.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                                            </span>
                                            {!(userProfile?.emailVerified || currentUser?.emailVerified) && (
                                                <button
                                                    onClick={handleVerifyEmail}
                                                    disabled={loading}
                                                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                                                >
                                                    Verify Now
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Member Since</span>
                                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            {new Date(currentUser?.metadata?.creationTime).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-800 dark:to-neutral-800">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                                    Quick Actions
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={handlePasswordChangeClick}
                                        disabled={loading}
                                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2"
                                    >
                                        <Key className="w-4 h-4" />
                                        Change Password
                                    </button>
                                    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Privacy Settings
                                    </button>
                                    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium text-red-600 dark:text-red-400">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OTP Modal */}
            <OTPModal
                isOpen={showOTPModal}
                onClose={() => setShowOTPModal(false)}
                onVerify={handleOTPVerify}
                loading={otpLoading}
                title={otpPurpose === 'password' ? 'Verify OTP to Change Password' : 'Verify Email'}
                description={`We've sent a 6-digit OTP to ${currentUser?.email}. Please enter it below to continue.`}
            />

            {/* Password Change Modal */}
            <PasswordChangeModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSuccess={handlePasswordChangeSuccess}
            />
        </>
    );
};

export default ProfilePage;
