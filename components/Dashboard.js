"use client";
import "../app/globals.css";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Target,
    MoreVertical,
    RefreshCw,
    TrendingUp,
    Clock,
    Zap,
    Info,
    CheckCircle,
    ClipboardList,
    AlertCircle,
    Sparkles
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- MOCK DATA AND API ---
const mockApi = {
    getDashboardData: () => {
        return new Promise(resolve => {
            setTimeout(() => {
                const mockData = {
                    stats: {
                        clientsOnTrack: 14,
                        avgProgressScore: 85,
                        newLeadsThisMonth: 124,
                        avgTimeInPlan: 45
                    },
                    monthlyEngagement: [
                        { month: 'Jan', engagement: 300 }, { month: 'Feb', engagement: 450 },
                        { month: 'Mar', engagement: 620 }, { month: 'Apr', engagement: 580 },
                        { month: 'May', engagement: 750 }, { month: 'Jun', engagement: 910 },
                    ],
                    contentPerformance: [
                        { name: 'Blog Posts', value: 35, color: '#8B5CF6' }, { name: 'Videos', value: 25, color: '#14B8A6' },
                        { name: 'Case Studies', value: 20, color: '#3B82F6' }, { name: 'Social Media', value: 20, color: '#F59E0B' },
                    ],
                    upcomingMilestones: [
                        { name: 'Define Buyer Persona', progress: 100, id: 'day-1' }, { name: 'Develop Social Media Strategy', progress: 85, id: 'day-2' },
                        { name: 'Launch Lead Generation Campaign', progress: 20, id: 'day-3' }, { name: 'Create 7-Day Content Plan', progress: 50, id: 'day-4' },
                    ],
                    recentActivity: [
                        { client: 'Jane Doe', action: 'Completed "Develop Social Media Strategy"', date: new Date('2025-07-31'), status: 'completed' },
                        { client: 'Acme Corp', action: 'Requested a call about advanced SEO', date: new Date('2025-07-30'), status: 'info' },
                        { client: 'Marketing Masters', action: 'Uploaded a new content asset', date: new Date('2025-07-29'), status: 'completed' },
                        { client: 'John Smith', action: 'Failed to complete "Week 2 Tasks"', date: new Date('2025-07-28'), status: 'alert' },
                    ]
                };
                resolve(mockData);
            }, 500);
        });
    }
};

// This function calls our own API route to securely use the Gemini API
const generatePromptWithGemini = async (clientName, task) => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientName, task }),
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const result = await response.json();
        return result.message;
    } catch (error) {
        console.error("Error generating prompt:", error);
        return `Could not generate a prompt for ${clientName}. Please try again.`;
    }
};

// --- MarketingDashboard Component ---
function MarketingDashboard() {
    const [stats, setStats] = useState({ clientsOnTrack: 0, avgProgressScore: 0, newLeadsThisMonth: 0, avgTimeInPlan: 0 });
    const [dashboardData, setDashboardData] = useState({ monthlyEngagement: [], contentPerformance: [], upcomingMilestones: [], recentActivity: [] });
    const [promptData, setPromptData] = useState(null);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [promptMessage, setPromptMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [error, setError] = useState(null);

    const loadDashboardData = useCallback(async () => {
        const generatePrompt = async (clientName, task) => {
            setIsGeneratingPrompt(true);
            setPromptData({ client: clientName, task: task });
            const generatedMessage = await generatePromptWithGemini(clientName, task);
            setPromptMessage(generatedMessage);
            setIsGeneratingPrompt(false);
        };
        
        try {
            if (isLoading) setIsLoading(true);
            setError(null);
            const data = await mockApi.getDashboardData();
            setStats(data.stats);
            setDashboardData(data);
            setLastUpdate(new Date());

            const completedActivity = data.recentActivity.find(act => act.status === 'completed');
            if (completedActivity && !promptData) {
                generatePrompt(completedActivity.client, completedActivity.action);
            }
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setError('Failed to load dashboard data.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, promptData]);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, [loadDashboardData]);

    const handleSendPrompt = () => {
        console.log(`Sending prompt to ${promptData.client}: "${promptMessage}"`);
        alert(`Prompt sent to ${promptData.client}!`);
        setPromptData(null);
        setPromptMessage('');
    };

    const refreshData = () => {
        loadDashboardData();
    };

    const glassStyle = {
        backdropFilter: 'blur(16px)',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'info': return 'bg-blue-100 text-blue-700';
            case 'alert': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getActivityIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'info': return <Info className="w-4 h-4 text-blue-500" />;
            case 'alert': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <ClipboardList className="w-4 h-4 text-yellow-500" />;
        }
    };

    if (error) {
        return (
            <div className="space-y-6">
                <div className="rounded-2xl p-8 shadow-xl text-center" style={glassStyle}>
                    <div className="text-red-500 mb-4">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                        <h2 className="text-xl mb-2">Dashboard Error</h2>
                        <p className="text-sm">{error}</p>
                    </div>
                    <button
                        onClick={refreshData}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                        Sadia K
                    </h1>
                    <p className="text-gray-600 mt-1">Guided implementation and progress tracking for clients.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={refreshData}
                        className="p-2 rounded-xl hover:bg-white/30 transition-colors border border-white/30"
                        style={glassStyle}
                        disabled={isLoading || isGeneratingPrompt}
                    >
                        <RefreshCw className={`w-4 h-4 text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="rounded-xl px-6 py-3 shadow-lg border border-white/30" style={glassStyle}>
                        <span className="text-sm text-gray-700">
                            Updated: {lastUpdate.toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </div>

            {promptData && (
                <div className="rounded-2xl p-6 shadow-xl bg-blue-50/50 border-blue-200" style={glassStyle}>
                    <div className="flex items-start gap-4">
                        <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-lg mb-2 text-blue-800">
                                Suggested Prompt for {promptData.client}
                            </h3>
                            <p className="text-sm mb-3 text-blue-700">
                                {isGeneratingPrompt ? 'Generating personalized message...' : 'The system has detected a key moment and has drafted a personalized message for your review.'}
                            </p>

                            {!isGeneratingPrompt && (
                                <>
                                    <textarea
                                        value={promptMessage}
                                        onChange={(e) => setPromptMessage(e.target.value)}
                                        className="w-full h-24 p-3 mb-4 text-sm text-gray-800 bg-white/50 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-blue-500/50"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setPromptData(null)}
                                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            onClick={handleSendPrompt}
                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            Send Prompt
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={glassStyle}>
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center text-green-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="text-sm">+12%</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl text-gray-800">{stats.clientsOnTrack}</h3>
                        <p className="text-sm text-gray-600 mt-1">Clients On Track</p>
                    </div>
                </div>

                <div className="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={glassStyle}>
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center text-green-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="text-sm">+8%</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl text-gray-800">{stats.avgProgressScore}%</h3>
                        <p className="text-sm text-gray-600 mt-1">Avg. Progress Score</p>
                    </div>
                </div>

                <div className="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={glassStyle}>
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center text-red-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="text-sm">-5%</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl text-gray-800">{stats.newLeadsThisMonth}</h3>
                        <p className="text-sm text-gray-600 mt-1">New Leads This Month</p>
                    </div>
                </div>

                <div className="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={glassStyle}>
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center text-green-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="text-sm">+2 days</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl text-gray-800">{stats.avgTimeInPlan} days</h3>
                        <p className="text-sm text-gray-600 mt-1">Avg. Time in Plan</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg text-gray-800">Monthly Engagement</h3>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={dashboardData.monthlyEngagement}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Area
                                type="monotone"
                                dataKey="engagement"
                                stroke="#8B5CF6"
                                fill="url(#gradient1)"
                                strokeWidth={2}
                            />
                            <defs>
                                <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg text-gray-800">Content Performance</h3>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                            <Pie
                                data={dashboardData.contentPerformance}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={75}
                                dataKey="value"
                            >
                                {dashboardData.contentPerformance.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-4 mt-4">
                        {dashboardData.contentPerformance.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-sm text-gray-700">{item.name} ({item.value})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg text-gray-800">Upcoming Milestones</h3>
                        <span className="text-sm text-gray-600">4 active</span>
                    </div>
                    <div className="space-y-4">
                        {dashboardData.upcomingMilestones.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    <span className="text-sm text-gray-800 truncate max-w-48">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                                        <div
                                            className="h-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full transition-all duration-300"
                                            style={{ width: `${item.progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-gray-600">{Math.round(item.progress)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg text-gray-800">Recent Client Activity</h3>
                        <button className="text-sm text-purple-600 hover:text-purple-700 transition-colors">
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {dashboardData.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                                        <span className="text-white text-sm">
                                            {activity.client?.substring(0, 2).toUpperCase() || 'R'}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-800 truncate max-w-32">{activity.client}</h4>
                                        <p className="text-sm text-gray-600">{activity.action}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        {getActivityIcon(activity.status)}
                                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(activity.status)}`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                        <MoreVertical className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MarketingDashboard;