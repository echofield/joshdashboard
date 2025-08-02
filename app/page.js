"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Rocket, Users, Calendar, Target, Settings } from 'lucide-react';

// This is the key change:
// We dynamically import the Dashboard component and disable Server-Side Rendering (ssr: false).
// This prevents the charting library from crashing the page.
const Dashboard = dynamic(() => import('../components/Dashboard'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-screen w-full">
            <p className="text-lg text-gray-600">Loading Dashboard...</p>
        </div>
    )
});

// --- Sidebar Component ---
const Sidebar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'dashboard', icon: Rocket, label: 'Dashboard' },
        { id: 'clients', icon: Users, label: 'Clients' },
        { id: 'content', icon: Calendar, label: 'Content Hub' },
        { id: 'analytics', icon: Target, label: 'Analytics' },
        { id: 'settings', icon: Settings, label: 'Settings' },
    ];

    const renderNavItems = () => (
        navItems.map(item => (
            <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
          flex items-center gap-4 p-4 rounded-xl transition-colors w-full
          ${activeTab === item.id
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white/10'
                    }
        `}
            >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
            </button>
        ))
    );

    const glassStrongStyle = {
        backdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 12px 40px rgba(31, 38, 135, 0.2)'
    };

    return (
        <aside className="p-4 w-64 flex-shrink-0">
            <div className="rounded-3xl p-6 h-full flex flex-col" style={glassStrongStyle}>
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                        Sadia K
                    </span>
                </div>
                <nav className="flex-1 space-y-2">
                    {renderNavItems()}
                </nav>
                <div className="mt-8 pt-6 border-t border-white/20">
                    <p className="text-sm text-gray-700">Powered by Symi</p>
                </div>
            </div>
        </aside>
    );
};

// --- Main Page Component ---
export default function HomePage() {
    const [activeTab, setActiveTab] = useState("dashboard");

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <Dashboard />;
            case "clients":
                return (
                    <div className="flex items-center justify-center min-h-[500px] text-gray-500 text-lg">
                        <p>Clients view coming soon...</p>
                    </div>
                );
            case "content":
                return (
                    <div className="flex items-center justify-center min-h-[500px] text-gray-500 text-lg">
                        <p>Content Hub view coming soon...</p>
                    </div>
                );
            case "analytics":
                return (
                    <div className="flex items-center justify-center min-h-[500px] text-gray-500 text-lg">
                        <p>Analytics view coming soon...</p>
                    </div>
                );
            case "settings":
                return (
                    <div className="flex items-center justify-center min-h-[500px] text-gray-500 text-lg">
                        <p>Settings view coming soon...</p>
                    </div>
                );
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 text-gray-800">
            <div className="fixed inset-0 opacity-30 -z-10">
                <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-0 right-0 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>
            <div className="relative z-10 flex">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="flex-1 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
