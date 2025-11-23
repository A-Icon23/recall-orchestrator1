import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    User,
    Mail,
    FileText,
    MessageSquare,
    Settings,
    LogOut,
    AlertTriangle,
    CheckCircle,
    Clock,
    RefreshCw,
    ShieldAlert,
    Send,
    Lock,
    UserPlus,
    BarChart2,
    Download,
    Bell,
    Search
} from 'lucide-react';
import { useRecalls, useRefunds } from './hooks/useRealtimeData';
import { api } from './lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { NotificationBell } from './components/NotificationBell';

// --- COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${active
            ? 'bg-red-500/10 text-red-500 border-l-4 border-red-500'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </div>
);

const StatusBadge = ({ status }) => {
    if (status === 'issued') {
        return (
            <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                <CheckCircle size={12} className="mr-1" /> Issued
            </span>
        );
    }
    return (
        <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            <Clock size={12} className="mr-1" /> Pending
        </span>
    );
};

const ActionButton = ({ refund, onApprove }) => {
    const [processing, setProcessing] = useState(false);

    if (refund.status === 'issued') {
        return <span className="text-gray-500 text-sm italic">Completed</span>;
    }

    const handleClick = async () => {
        if (!confirm(`Approve refund of $${(refund.amount / 100).toFixed(2)} for ${refund.customerId}?`)) return;

        setProcessing(true);
        try {
            await onApprove(refund.id);
        } catch (err) {
            alert("Failed to approve: " + err.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={processing}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all shadow-lg ${processing
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-900/20'
                }`}
        >
            {processing ? 'Processing...' : 'APPROVE'}
        </button>
    );
};

// --- VIEWS ---

const CrisisCommandCenter = () => {
    const { recalls, loading: recallsLoading } = useRecalls();
    const { refunds, loading: refundsLoading } = useRefunds();

    const handleApprove = async (refundId) => {
        await api.issueRefund(refundId);
    };

    return (
        <div className="flex h-full gap-6">
            {/* LEFT PANEL: ALERT FEED */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <ShieldAlert className="mr-2 text-red-500" /> Alert Feed
                    </h2>
                    <span className="text-xs text-gray-500 animate-pulse">LIVE</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {recallsLoading ? (
                        <div className="text-center text-gray-500 py-10">Scanning for threats...</div>
                    ) : recalls.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 bg-gray-800/30 rounded-lg border border-gray-700 border-dashed">
                            No active recalls detected.
                        </div>
                    ) : (
                        recalls.map((recall) => (
                            <div key={recall.id} className="bg-gray-800/50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-lg hover:bg-gray-800 transition-colors group">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-red-400 font-mono text-xs font-bold tracking-wider">CRITICAL ALERT</span>
                                    <span className="text-gray-500 text-xs">{new Date(recall.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <h3 className="text-white font-bold text-lg mb-1">{recall.sku}</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Batch: <span className="text-white font-mono">{recall.batch}</span></span>
                                </div>
                                <p className="text-gray-400 text-xs mt-2 italic border-t border-gray-700 pt-2">
                                    "{recall.reason}"
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MAIN PANEL: REFUND ACTION TABLE */}
            <div className="flex-1 flex flex-col bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/50">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <RefreshCw className="mr-2 text-blue-500" /> Pending Actions
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{refunds.filter(r => r.status === 'pending').length} Pending</span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                        <span>{refunds.filter(r => r.status === 'issued').length} Issued</span>
                    </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-900/50 text-gray-400 text-xs uppercase sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="p-4 font-semibold tracking-wider">Refund ID</th>
                                <th className="p-4 font-semibold tracking-wider">Customer</th>
                                <th className="p-4 font-semibold tracking-wider">Amount</th>
                                <th className="p-4 font-semibold tracking-wider">Status</th>
                                <th className="p-4 font-semibold tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {refundsLoading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading financial data...</td></tr>
                            ) : refunds.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No refund actions required.</td></tr>
                            ) : (
                                refunds.map((refund) => (
                                    <tr key={refund.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-mono text-sm text-gray-400 group-hover:text-white transition-colors">
                                            {refund.id.substring(0, 8)}...
                                        </td>
                                        <td className="p-4 text-white font-medium">
                                            {refund.customerId}
                                        </td>
                                        <td className="p-4 text-white font-mono">
                                            ${(refund.amount / 100).toFixed(2)}
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={refund.status} />
                                        </td>
                                        <td className="p-4 text-right">
                                            <ActionButton refund={refund} onApprove={handleApprove} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    );
};

const BusinessRegistry = ({ business }) => {
    // Fallback to demo data if no business prop (shouldn't happen in prod flow but good for safety)
    const displayBusiness = business || {
        id: 'biz_demo',
        businessName: 'Demo Business',
        industry: 'Food & Beverage',
        email: '', // No fallback email to avoid confusion
        createdAt: new Date().toISOString()
    };

    // Sample stores for demo - in real app this would fetch from API based on business.id
    const [stores] = useState([
        { id: 'store_1', name: 'Downtown Branch', location: '123 Main St, New York, NY', region: 'Northeast', customers: 245 },
        { id: 'store_2', name: 'Uptown Branch', location: '456 Park Ave, New York, NY', region: 'Northeast', customers: 189 },
        { id: 'store_3', name: 'Boston Hub', location: '789 Commonwealth Ave, Boston, MA', region: 'Northeast', customers: 156 }
    ]);

    const [selectedStore, setSelectedStore] = useState(stores[0]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Business Info Card */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                            {displayBusiness.businessName?.substring(0, 2).toUpperCase() || 'BZ'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{displayBusiness.businessName}</h2>
                            <p className="text-gray-400 text-sm">{displayBusiness.industry}</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium border border-green-500/20">
                        Active
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Business Email</label>
                        <p className="text-white font-medium">{displayBusiness.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Business ID</label>
                        <p className="text-white font-mono text-sm">{displayBusiness.id}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Registered Date</label>
                        <p className="text-white">{new Date(displayBusiness.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Total Stores</label>
                        <p className="text-white font-bold text-xl">{stores.length}</p>
                    </div>
                </div>
            </div>

            {/* Store Switcher */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Store Locations</h3>

                {/* Store Selector Dropdown */}
                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">Select Store to View</label>
                    <select
                        value={selectedStore.id}
                        onChange={(e) => setSelectedStore(stores.find(s => s.id === e.target.value))}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                    >
                        {stores.map(store => (
                            <option key={store.id} value={store.id}>
                                {store.name} - {store.location}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selected Store Details */}
                <div className="bg-gray-900/50 p-5 rounded-lg border border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h4 className="text-lg font-bold text-white">{selectedStore.name}</h4>
                            <p className="text-gray-400 text-sm">{selectedStore.location}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium border border-blue-500/20">
                            {selectedStore.region}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <p className="text-gray-400 text-xs mb-1">Total Customers</p>
                            <p className="text-white font-bold text-2xl">{selectedStore.customers}</p>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <p className="text-gray-400 text-xs mb-1">Status</p>
                            <p className="text-green-400 font-bold text-lg">Operational</p>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <p className="text-gray-400 text-xs mb-1">Store ID</p>
                            <p className="text-white font-mono text-sm">{selectedStore.id}</p>
                        </div>
                    </div>
                </div>

                {/* All Stores List */}
                <div className="mt-6">
                    <h4 className="text-sm font-bold text-gray-400 mb-3">All Store Locations</h4>
                    <div className="space-y-2">
                        {stores.map(store => (
                            <div
                                key={store.id}
                                onClick={() => setSelectedStore(store)}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${selectedStore.id === store.id
                                    ? 'bg-blue-500/10 border border-blue-500/30'
                                    : 'bg-gray-900/30 border border-gray-700 hover:bg-gray-800/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">{store.name}</p>
                                        <p className="text-gray-500 text-xs">{store.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 text-xs">{store.customers} customers</p>
                                        <span className="text-xs text-gray-600">{store.region}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MessagesView = () => (
    <div className="flex h-full bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
        <div className="w-1/3 border-r border-gray-700 bg-gray-900/50">
            <div className="p-4 border-b border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input placeholder="Search messages..." className="w-full bg-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white outline-none focus:ring-1 ring-blue-500" />
                </div>
            </div>
            <div className="overflow-y-auto h-full">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors">
                        <div className="flex justify-between mb-1">
                            <span className="font-bold text-white">Customer {i}</span>
                            <span className="text-xs text-gray-500">10:3{i} AM</span>
                        </div>
                        <p className="text-sm text-gray-400 truncate">I haven't received my refund yet for the lettuce...</p>
                    </div>
                ))}
            </div>
        </div>
        <div className="flex-1 flex flex-col bg-gray-900/30">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <span className="font-bold text-white">Customer 1</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Online</span>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="flex justify-start">
                    <div className="bg-gray-800 rounded-lg p-3 max-w-md text-gray-300 text-sm">
                        Hello, I bought the recalled lettuce but haven't got an email.
                    </div>
                </div>
                <div className="flex justify-end">
                    <div className="bg-blue-600 rounded-lg p-3 max-w-md text-white text-sm">
                        Hi there! Please provide your receipt number and we will check immediately.
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                    <input placeholder="Type a message..." className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:ring-1 ring-blue-500" />
                    <button className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500"><Send size={20} /></button>
                </div>
            </div>
        </div>
    </div>
);

const EmailView = () => {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        setSending(true);
        try {
            const res = await fetch('/api/sendEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to, subject, html: body })
            });
            const data = await res.json();
            if (data.ok) {
                alert('Email sent successfully!');
                setTo(''); setSubject(''); setBody('');
            } else {
                alert('Failed to send: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Error: ' + e.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-gray-800/50 p-8 rounded-xl border border-gray-700 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Mail className="mr-2 text-blue-500" /> Compose Email
            </h2>
            <div className="space-y-4 flex-1 flex flex-col">
                <input
                    placeholder="To: customer@example.com"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                />
                <input
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                />
                <textarea
                    placeholder="Write your message here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none resize-none"
                />
                <div className="flex justify-end">
                    <button
                        onClick={handleSend}
                        disabled={sending}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {sending ? 'Sending...' : <><Send size={18} /> Send Email</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReportsView = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/getStats');
                const data = await res.json();
                setStats(data);
            } catch (e) {
                console.error("Failed to fetch stats:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center text-gray-500 py-20">Loading financial data...</div>;
    if (!stats) return <div className="text-center text-gray-500 py-20">Failed to load reports.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Financial Reports</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors">
                    <Download size={18} /> Export CSV
                </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm mb-2">Total Refunded</h3>
                    <p className="text-3xl font-bold text-white">${(stats.totalRefunded / 100).toFixed(2)}</p>
                    <span className="text-green-500 text-sm">{stats.issuedCount} processed</span>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm mb-2">Pending Approvals</h3>
                    <p className="text-3xl font-bold text-white">{stats.pendingCount}</p>
                    <span className="text-yellow-500 text-sm">Requires attention</span>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm mb-2">Avg. Response Time</h3>
                    <p className="text-3xl font-bold text-white">1.2 hrs</p>
                    <span className="text-green-500 text-sm">Estimated</span>
                </div>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 h-96">
                <h3 className="text-white font-bold mb-6">Refund Volume (7 Days)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData}>
                        <defs>
                            <linearGradient id="colorRefunds" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                        <Area type="monotone" dataKey="refunds" stroke="#ef4444" fillOpacity={1} fill="url(#colorRefunds)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const SettingsView = () => {
    const [settings, setSettings] = useState({
        emailNotifs: true,
        autoApprove: false,
        darkMode: true,
        smsAlerts: true
    });

    const Toggle = ({ label, checked, onChange }) => (
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <span className="text-gray-300 font-medium">{label}</span>
            <button
                onClick={() => onChange(!checked)}
                className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-green-500' : 'bg-gray-600'}`}
            >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>
            <div className="space-y-4">
                <Toggle label="Email Notifications" checked={settings.emailNotifs} onChange={v => setSettings({ ...settings, emailNotifs: v })} />
                <Toggle label="Auto-Approve Refunds < $50" checked={settings.autoApprove} onChange={v => setSettings({ ...settings, autoApprove: v })} />
                <Toggle label="Dark Mode" checked={settings.darkMode} onChange={v => setSettings({ ...settings, darkMode: v })} />
                <Toggle label="SMS Alerts for Critical Recalls" checked={settings.smsAlerts} onChange={v => setSettings({ ...settings, smsAlerts: v })} />
            </div>

        </div>
    );
};

// --- AUTH SCREENS ---

const LoginScreen = ({ onLogin, onSwitch }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }
        onLogin(email, password);
    };

    return (
        <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 w-full max-w-md backdrop-blur-xl relative z-10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20 mx-auto mb-4">
                        <AlertTriangle className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white">RecallOS</h1>
                    <p className="text-gray-400">Secure Crisis Management Login</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input
                                type="email"
                                placeholder="admin@business.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-red-500 outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-red-500 outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-[1.02]"
                    >
                        Sign In
                    </button>

                    <div className="text-center mt-4">
                        <span className="text-gray-500 text-sm">Don't have an account? </span>
                        <button type="button" onClick={onSwitch} className="text-red-400 hover:text-red-300 text-sm font-medium">Create Account</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SignupScreen = ({ onRegister, onSwitch }) => {
    const [businessName, setBusinessName] = useState('');
    const [industry, setIndustry] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!businessName || !industry || !email || !password) {
            alert('Please fill in all fields');
            return;
        }
        onRegister(businessName, industry, email, password);
    };

    return (
        <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 w-full max-w-md backdrop-blur-xl relative z-10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 mx-auto mb-4">
                        <UserPlus className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Register Your Business</h1>
                    <p className="text-gray-400">Start managing recalls professionally</p>
                </div>



                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Business Name</label>
                        <input
                            type="text"
                            placeholder="Acme Food Distribution Inc."
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Industry</label>
                        <select
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                        >
                            <option value="">Select Industry</option>
                            <option value="Food & Beverage">Food & Beverage</option>
                            <option value="Pharmaceuticals">Pharmaceuticals</option>
                            <option value="Automotive">Automotive</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Retail">Retail</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <input
                        type="email"
                        placeholder="business@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                    />
                    <input
                        type="password"
                        placeholder="Password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors"
                    />
                    <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg transform hover:scale-[1.02]">
                        Create Business Account
                    </button>
                    <div className="text-center mt-4">
                        <span className="text-gray-500 text-sm">Already have an account? </span>
                        <button type="button" onClick={onSwitch} className="text-blue-400 hover:text-blue-300 text-sm font-medium">Sign In</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- APP SHELL ---

function App() {
    const [isSignup, setIsSignup] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Multi-user authentication
    const [currentBusiness, setCurrentBusiness] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const loggedInEmail = localStorage.getItem('recallos_logged_in');
        if (loggedInEmail) {
            const businesses = JSON.parse(localStorage.getItem('recallos_all_businesses') || '[]');
            const business = businesses.find(b => b.email === loggedInEmail);
            if (business) {
                setCurrentBusiness(business);
            }
        }
        setLoading(false);
    }, []);

    const handleRegister = (businessName, industry, email, password) => {
        // Get all businesses
        const businesses = JSON.parse(localStorage.getItem('recallos_all_businesses') || '[]');

        // Check if email already exists
        if (businesses.find(b => b.email === email)) {
            alert('Email already registered! Please sign in.');
            return;
        }

        const businessId = `biz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const business = {
            id: businessId,
            businessName,
            industry,
            email,
            password, // In production, hash this!
            createdAt: new Date().toISOString()
        };

        // Add to businesses array
        businesses.push(business);
        localStorage.setItem('recallos_all_businesses', JSON.stringify(businesses));

        // Log in the new user
        localStorage.setItem('recallos_logged_in', email);
        setCurrentBusiness(business);
    };

    const handleLogin = (email, password) => {
        const businesses = JSON.parse(localStorage.getItem('recallos_all_businesses') || '[]');
        const business = businesses.find(b => b.email === email && b.password === password);

        if (business) {
            localStorage.setItem('recallos_logged_in', email);
            setCurrentBusiness(business);
        } else {
            alert('Invalid email or password!');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('recallos_logged_in');
        setCurrentBusiness(null);
        setActiveTab('dashboard');
    };

    if (loading) {
        return <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
            <div className="text-white">Loading...</div>
        </div>;
    }

    if (!currentBusiness) {
        return isSignup
            ? <SignupScreen onRegister={handleRegister} onSwitch={() => setIsSignup(false)} />
            : <LoginScreen onLogin={handleLogin} onSwitch={() => setIsSignup(true)} />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <CrisisCommandCenter />;
            case 'profile': return <BusinessRegistry business={currentBusiness} />;
            case 'email': return <EmailView />;
            case 'reports': return <ReportsView />;
            case 'settings': return <SettingsView />;
            default: return <CrisisCommandCenter />;
        }
    };

    return (
        <div className="flex h-screen bg-[#0f1115] text-gray-300 font-sans overflow-hidden selection:bg-red-500/30">
            {/* SIDEBAR */}
            <div className="w-64 border-r border-gray-800 bg-[#0f1115] flex flex-col p-4">
                <div className="flex items-center space-x-3 px-2 mb-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
                        <AlertTriangle className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-lg leading-tight">RecallOS</h1>
                        <p className="text-xs text-gray-500">Safety Orchestrator</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    <SidebarItem icon={LayoutDashboard} label="Command Center" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <SidebarItem icon={User} label="Business Registry" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                    <SidebarItem icon={Mail} label="Email" active={activeTab === 'email'} onClick={() => setActiveTab('email')} />
                    <SidebarItem icon={FileText} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
                    <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-800">
                    <button
                        onClick={() => fetch('/api/seedData', { method: 'POST' }).then(() => window.location.reload())}
                        className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all text-sm mb-2"
                    >
                        <RefreshCw size={16} />
                        <span>Reset / Seed Data</span>
                    </button>
                    <div onClick={handleLogout} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                            {currentBusiness?.businessName?.substring(0, 2).toUpperCase() || 'BZ'}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white truncate">{currentBusiness?.businessName || 'Business'}</p>
                            <p className="text-xs text-gray-500 group-hover:text-red-400 transition-colors">Log Out</p>
                        </div>
                        <LogOut size={16} className="group-hover:text-red-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* HEADER */}
                <header className="h-16 border-b border-gray-800 bg-[#0f1115]/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-bold text-white tracking-tight">Recall Command Center</h2>
                        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">System Active</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <NotificationBell businessId={currentBusiness?.id} />
                        <span className="text-sm text-gray-500 font-mono">{new Date().toLocaleDateString()}</span>
                    </div>
                </header>

                {/* CONTENT */}
                <main className="flex-1 overflow-hidden p-8 relative">
                    {/* Background Grid Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                    <div className="relative z-10 h-full">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
