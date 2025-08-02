"use client";
import "../app/globals.css";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Target,
    CheckCircle,
    ClipboardList,
    AlertCircle,
    Sparkles,
    Send,
    MessageSquare,
    CalendarDays,
    RefreshCw,
    MoreVertical,
    TrendingUp,
    Zap,
    Lock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// --- MOCK API FOR JOSH W. ---
const mockApi = {
    getDashboardData: () => {
        return new Promise(resolve => {
            setTimeout(() => {
                const mockData = {
                    stats: {
                        activeClients: 24,
                        roadmapCompletion: 68,
                        tasksCompleted: 157,
                        nudgesSent: 42
                    },
                    clientActivity: [
                        { month: 'Jan', activity: 45 }, { month: 'Feb', activity: 60 },
                        { month: 'Mar', activity: 75 }, { month: 'Apr', activity: 70 },
                        { month: 'May', activity: 90 }, { month: 'Jun', activity: 110 },
                    ],
                    sevenDayRoadmap: [
                        { day: 1, title: 'Define Your Goals & SMART Objectives', status: 'complete' },
                        { day: 2, title: 'Finalize Budget & Target Segments', status: 'complete' },
                        { day: 3, title: 'Explore Growth Hacks & Marketing Mediums', status: 'inProgress' },
                        { day: 4, title: 'Integrate SEO & PPC Resources', status: 'inProgress' },
                        { day: 5, title: 'Draft Promotional Campaign', status: 'locked' },
                        { day: 6, title: 'Launch & Gather Initial Data', status: 'locked' },
                        { day: 7, title: 'Prepare for Implementation Audit', status: 'locked' },
                    ],
                    recentActivity: [
                        { client: 'Innovate Inc.', action: 'Completed "Finalize Budget & Target Segments"', date: new Date('2025-08-01'), status: 'completed' },
                        { client: 'Growth Co.', action: 'Is behind on "Explore Growth Hacks"', date: new Date('2025-07-31'), status: 'alert' },
                        { client: 'Momentum LLC', action: 'Requested an Audit Session', date: new Date('2025-07-30'), status: 'info' },
                        { client: 'Future Forward', action: 'Completed "Define Your Goals"', date: new Date('2025-07-29'), status: 'completed' },
                    ]
                };
                resolve(mockData);
            }, 500);
        });
    }
};

// This function calls our API route to generate the Smart Nudge
const generateNudgeWithGemini = async (clientName, task) => {
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
        console.error("Error generating nudge:", error);
        return `Could not generate a nudge for ${clientName}. Please try again.`;
    }
};

// --- Dashboard Component for Josh W. ---
function Dashboard() {
    const [stats, setStats] = useState({ activeClients: 0, roadmapCompletion: 0, tasksCompleted: 0, nudgesSent: 0 });
    const [dashboardData, setDashboardData] = useState({ clientActivity: [], sevenDayRoadmap: [], recentActivity: [] });
    const [nudgeData, setNudgeData] = useState(null);
    const [isGeneratingNudge, setIsGeneratingNudge] = useState(false);
    const [nudgeMessage, setNudgeMessage] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState("Quick update: I've added a new guide on B2B lead generation to the resources section. Let's crush it this week!");
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [error, setError] = useState(null);

    const loadDashboardData = useCallback(async () => {
        const generateNudge = async (clientName, task) => {
            setIsGeneratingNudge(true);
            setNudgeData({ client: clientName, task: task });
            const generatedMessage = await generateNudgeWithGemini(clientName, task);
            setNudgeMessage(generatedMessage);
            setIsGeneratingNudge(false);
        };
        
        try {
            if (isLoading) setIsLoading(true);
            setError(null);
            const data = await mockApi.getDashboardData();
            setStats(data.stats);
            setDashboardData(data);
            setLastUpdate(new Date());

            // Auto-trigger a nudge for the first completed activity if none is active
            const completedActivity = data.recentActivity.find(act => act.status === 'completed');
            if (completedActivity && !nudgeData) {
                generateNudge(completedActivity.client, completedActivity.action);
            }
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setError('Failed to load dashboard data.');
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, nudgeData]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);


    const handleSendNudge = () => {
        console.log(`Sending nudge to ${nudgeData.client}: "${nudgeMessage}"`);
        alert(`Nudge sent to ${nudgeData.client}!`);
        setNudgeData(null);
        setNudgeMessage('');
    };
    
    const handleSendBroadcast = () => {
        console.log(`Sending broadcast message: "${broadcastMessage}"`);
        alert('Broadcast message sent to all clients!');
    };

    const refreshData = () => {
        loadDashboardData();
    };

    const cardStyle = "bg-white/60 p-6 rounded-2xl shadow-lg border border-white/30";

    const getActivityIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-teal-500" />;
            case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <ClipboardList className="w-5 h-5 text-blue-500" />;
        }
    };
    
    const getRoadmapStatusIcon = (status) => {
        switch (status) {
            case 'complete': return <CheckCircle className="w-6 h-6 text-teal-500" />;
            case 'inProgress': return <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" style={{ animationDuration: '3s' }} />;
            case 'locked': return <Lock className="w-6 h-6 text-gray-400" />;
            default: return null;
        }
    };

    if (error) {
        return (
            <div className={`p-8 rounded-2xl shadow-xl text-center ${cardStyle}`}>
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-xl mb-2 text-gray-800">Dashboard Error</h2>
                <p className="text-sm text-gray-600">{error}</p>
                <button onClick={refreshData} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* --- Header --- */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Josh W. | Implementation OS</h1>
                    <p className="text-gray-500 mt-1">Your personalized marketing strategy, in action.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={refreshData} className="p-3 rounded-full bg-white/60 border border-white/30 shadow-md hover:bg-gray-50 transition-colors" disabled={isLoading}>
                        <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className={`${cardStyle} px-4 py-3`}>
                        <span className="text-sm text-gray-600">Updated: {lastUpdate.toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>

            {/* --- Smart Nudge & Broadcast --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Smart Nudge */}
                <div className={cardStyle}>
                    <div className="flex items-start gap-4">
                        <Sparkles className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1 text-gray-800">Smart Nudge</h3>
                            {nudgeData ? (
                                <>
                                    <p className="text-sm mb-3 text-gray-600">
                                        For <span className="font-semibold">{nudgeData.client}</span>, who just completed: <span className="italic">"{nudgeData.task}"</span>
                                    </p>
                                    <textarea
                                        value={isGeneratingNudge ? "Generating personalized message..." : nudgeMessage}
                                        onChange={(e) => setNudgeMessage(e.target.value)}
                                        className="w-full h-24 p-3 mb-3 text-sm text-gray-800 bg-gray-50/80 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        disabled={isGeneratingNudge}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setNudgeData(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm">Dismiss</button>
                                        <button onClick={handleSendNudge} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"><Send className="w-4 h-4" />Send Nudge</button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500 pt-2">No key actions detected recently. The system is monitoring client progress for opportunities to engage.</p>
                            )}
                        </div>
                    </div>
                </div>
                {/* Broadcast Message */}
                <div className={cardStyle}>
                    <div className="flex items-start gap-4">
                        <MessageSquare className="w-8 h-8 text-teal-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-1 text-gray-800">Broadcast Message</h3>
                             <p className="text-sm mb-3 text-gray-600">Send a message to all active clients.</p>
                            <textarea
                                value={broadcastMessage}
                                onChange={(e) => setBroadcastMessage(e.target.value)}
                                className="w-full h-24 p-3 mb-3 text-sm text-gray-800 bg-gray-50/80 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            />
                            <div className="flex justify-end">
                                <button onClick={handleSendBroadcast} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm flex items-center gap-2"><Send className="w-4 h-4" />Send Broadcast</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- KPIs --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className={cardStyle}>
                    <div className="flex items-center justify-between"><div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-purple-600" /></div><TrendingUp className="w-5 h-5 text-green-500"/></div>
                    <div className="mt-4"><h3 className="text-3xl font-bold text-gray-800">{stats.activeClients}</h3><p className="text-sm text-gray-500 mt-1">Active Clients</p></div>
                </div>
                <div className={cardStyle}>
                    <div className="flex items-center justify-between"><div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center"><Target className="w-6 h-6 text-teal-600" /></div><TrendingUp className="w-5 h-5 text-green-500"/></div>
                    <div className="mt-4"><h3 className="text-3xl font-bold text-gray-800">{stats.roadmapCompletion}%</h3><p className="text-sm text-gray-500 mt-1">Avg. Roadmap Completion</p></div>
                </div>
                <div className={cardStyle}>
                    <div className="flex items-center justify-between"><div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-blue-600" /></div><TrendingUp className="w-5 h-5 text-green-500"/></div>
                    <div className="mt-4"><h3 className="text-3xl font-bold text-gray-800">{stats.tasksCompleted}</h3><p className="text-sm text-gray-500 mt-1">Tasks Completed (Month)</p></div>
                </div>
                 <div className={cardStyle}>
                    <div className="flex items-center justify-between"><div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center"><Zap className="w-6 h-6 text-orange-600" /></div><TrendingUp className="w-5 h-5 text-red-500"/></div>
                    <div className="mt-4"><h3 className="text-3xl font-bold text-gray-800">{stats.nudgesSent}</h3><p className="text-sm text-gray-500 mt-1">Nudges Sent (Month)</p></div>
                </div>
            </div>

            {/* --- 7-Day Roadmap & Recent Activity --- */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                 <div className={`lg:col-span-3 ${cardStyle}`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">7-Day Implementation Roadmap</h3>
                    <div className="space-y-3">
                        {dashboardData.sevenDayRoadmap.map((item) => (
                            <div key={item.day} className={`p-4 rounded-xl flex items-center gap-4 border ${item.status === 'inProgress' ? 'bg-purple-50 border-purple-200' : 'bg-gray-50/80 border-gray-200'}`}>
                                {getRoadmapStatusIcon(item.status)}
                                <div className="flex-1">
                                    <p className={`font-semibold ${item.status === 'locked' ? 'text-gray-500' : 'text-gray-800'}`}>Day {item.day}: {item.title}</p>
                                </div>
                                <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                                    item.status === 'complete' ? 'bg-teal-100 text-teal-800' :
                                    item.status === 'inProgress' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`lg:col-span-2 ${cardStyle}`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Client Activity</h3>
                    <div className="space-y-4">
                        {dashboardData.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div>{getActivityIcon(activity.status)}</div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-800">{activity.client}</p>
                                    <p className="text-xs text-gray-500">{activity.action}</p>
                                </div>
                                <p className="text-xs text-gray-400">{activity.date.toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Charts --- */}
            <div className={cardStyle}>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Client Activity Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={dashboardData.clientActivity}>
                        <defs>
                            <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.7}/>
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <Area type="monotone" dataKey="activity" stroke="#8B5CF6" strokeWidth={2} fill="url(#activityGradient)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default Dashboard;
