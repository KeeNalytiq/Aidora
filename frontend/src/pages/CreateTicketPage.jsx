import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ticketsAPI } from '../services/api';
import { Send, ArrowLeft, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

const CreateTicketPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [classification, setClassification] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await ticketsAPI.createTicket({
                title: formData.title,
                description: formData.description
            });
            setClassification(response.data.classification);

            // Show success and redirect after 2 seconds
            setTimeout(() => {
                navigate(`/tickets/${response.data.ticketId}`);
            }, 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to create ticket. Please try again.';
            setError(errorMsg);
            console.error('Create ticket error:', err);
            console.error('Error response:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-3xl mx-auto pt-8">
                <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="glass rounded-2xl p-8 animate-fade-in">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <Send className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Create Support Ticket</h1>
                            <p className="text-gray-600 dark:text-gray-400">AI will automatically classify your issue</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {classification ? (
                        <div className="space-y-6 animate-slide-up">
                            <div className="p-6 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                                <div className="flex items-start">
                                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                                            Ticket Created Successfully!
                                        </h3>
                                        <p className="text-green-700 dark:text-green-300 mb-4">
                                            Our AI has analyzed your ticket and assigned the following classification:
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-green-600 dark:text-green-400">Category</p>
                                                <p className="text-lg font-semibold text-green-900 dark:text-green-100 capitalize">
                                                    {classification.predictedCategory}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-green-600 dark:text-green-400">Priority</p>
                                                <p className="text-lg font-semibold text-green-900 dark:text-green-100 capitalize">
                                                    {classification.predictedPriority}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-sm text-green-600 dark:text-green-400">Confidence</p>
                                                <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                                                    {(classification.confidenceScore * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-green-700 dark:text-green-300 mt-4">
                                            Redirecting to ticket details...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Ticket Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    maxLength={200}
                                    className="input-field"
                                    placeholder="Brief summary of your issue"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.title.length}/200 characters
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    minLength={10}
                                    maxLength={5000}
                                    className="textarea-field"
                                    rows={8}
                                    placeholder="Provide detailed information about your issue. Include error messages, steps to reproduce, and any relevant context."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.description.length}/5000 characters
                                </p>
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-start">
                                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                            AI-Powered Classification
                                        </h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Our NLP engine will automatically analyze your ticket and assign:
                                        </p>
                                        <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside mt-2 space-y-1">
                                            <li>Category (API, Auth, Payment, Performance, Bug, Feature)</li>
                                            <li>Priority level (Critical, High, Medium, Low)</li>
                                            <li>SLA target based on priority</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Analyzing with AI...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Submit Ticket</span>
                                        </>
                                    )}
                                </button>
                                <Link to="/dashboard" className="btn-secondary">
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateTicketPage;
