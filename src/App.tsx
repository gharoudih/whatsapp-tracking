import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Mail, 
  User, 
  ShieldCheck, 
  Activity, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  LogOut,
  Search,
  MoreVertical,
  Send
} from 'lucide-react';
import { cn } from './lib/utils';

// Types
interface UserData {
  name: string;
  email: string;
  phone: string;
}

interface TrackingLog {
  id: string;
  status: 'online' | 'offline';
  timestamp: string;
  duration?: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: ''
  });

  const [logs, setLogs] = useState<TrackingLog[]>([
    { id: '1', status: 'online', timestamp: '10:45 AM', duration: '15m' },
    { id: '2', status: 'offline', timestamp: '11:00 AM' },
    { id: '3', status: 'online', timestamp: '12:30 PM', duration: '45m' },
    { id: '4', status: 'offline', timestamp: '01:15 PM' },
    { id: '5', status: 'online', timestamp: '03:20 PM', duration: '10m' },
  ]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        setError('Please configure your Supabase URL and Key in the environment variables (Secrets panel).');
        setIsLoading(false);
        return;
      }

      // In a real app, we would insert this into a Supabase table
      // Table: tracking_users (id, name, email, phone, created_at)
      const { error: supabaseError, data: insertedData } = await supabase
        .from('tracking_users')
        .insert([
          { 
            name: userData.name, 
            email: userData.email, 
            phone: userData.phone 
          }
        ])
        .select();

      if (supabaseError) {
        console.error('Supabase Error Details:', supabaseError);
        
        if (supabaseError.code === '42P01') {
          setError('Table "tracking_users" not found. Please run the SQL code in Supabase.');
        } else if (supabaseError.message.includes('row-level security')) {
          setError('Supabase RLS Error: Please ensure you have enabled the "Allow public insert" policy in Supabase SQL Editor.');
        } else {
          setError(`Supabase Error: ${supabaseError.message}`);
        }
        
        setIsLoading(false);
        return;
      }

      console.log('Successfully inserted data:', insertedData);

      // Successful login
      setIsLoggedIn(true);
      setIsLoading(false);

    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData({ name: '', email: '', phone: '' });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#111b21] flex items-center justify-center p-4 font-sans text-[#e9edef]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#202c33] p-8 rounded-2xl shadow-2xl border border-[#3b4a54]"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#00a884]/20">
              <MessageSquare className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">WhatsApp Tracker</h1>
            <p className="text-[#8696a0] text-sm mt-2 text-center">
              Enter your details to start tracking activity
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#8696a0] flex items-center gap-2">
                <User size={16} /> Full Name
              </label>
              <input
                required
                type="text"
                placeholder="John Doe"
                className="w-full bg-[#2a3942] border border-[#3b4a54] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00a884] transition-colors"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#8696a0] flex items-center gap-2">
                <Mail size={16} /> Email Address
              </label>
              <input
                required
                type="email"
                placeholder="john@example.com"
                className="w-full bg-[#2a3942] border border-[#3b4a54] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00a884] transition-colors"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#8696a0] flex items-center gap-2">
                <Phone size={16} /> Phone Number
              </label>
              <input
                required
                type="tel"
                placeholder="+212 600-000000"
                className="w-full bg-[#2a3942] border border-[#3b4a54] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00a884] transition-colors"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-3 text-sm"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className={cn(
                "w-full bg-[#00a884] hover:bg-[#06cf9c] text-[#111b21] font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#111b21] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[#8696a0] text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] font-sans flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-[#111b21] border-r border-[#222d34] flex flex-col h-screen">
        <header className="p-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center text-[#111b21] font-bold">
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate w-32">{userData.name}</span>
              <span className="text-[10px] text-[#00a884] flex items-center gap-1">
                <CheckCircle2 size={10} /> Verified Account
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#aebac1]">
            <Activity size={18} className="cursor-pointer hover:text-white" />
            <MoreVertical size={18} className="cursor-pointer hover:text-white" />
          </div>
        </header>

        <div className="p-3">
          <div className="bg-[#202c33] rounded-lg flex items-center px-3 py-2 gap-3">
            <Search size={18} className="text-[#8696a0]" />
            <input 
              type="text" 
              placeholder="Search or start new track" 
              className="bg-transparent text-sm w-full focus:outline-none text-[#d1d7db]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-[#222d34] bg-[#2a3942] cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#3b4a54] rounded-full flex items-center justify-center relative">
                <User className="text-[#8696a0]" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Target: {userData.phone}</span>
                  <span className="text-[10px] text-[#00a884]">Online</span>
                </div>
                <p className="text-xs text-[#8696a0] truncate">Currently active on WhatsApp</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="p-4 border-t border-[#222d34]">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium py-2 transition-colors"
          >
            <LogOut size={16} /> Logout Session
          </button>
        </footer>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen bg-[#0b141a] relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669ae5z23.png")' }} />

        <header className="p-4 bg-[#202c33] flex items-center justify-between border-b border-[#222d34] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3b4a54] rounded-full flex items-center justify-center">
              <User className="text-[#8696a0]" />
            </div>
            <div>
              <h2 className="font-medium text-sm">Activity Log: {userData.phone}</h2>
              <p className="text-[10px] text-[#8696a0]">Last seen today at 03:45 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[#aebac1]">
            <Search size={20} className="cursor-pointer hover:text-white" />
            <MoreVertical size={20} className="cursor-pointer hover:text-white" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10">
          <div className="flex justify-center mb-8">
            <span className="bg-[#182229] text-[#8696a0] text-[11px] px-3 py-1 rounded-md uppercase tracking-wider">Today</span>
          </div>

          <AnimatePresence>
            {logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex w-full",
                  log.status === 'online' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[80%] p-3 rounded-lg shadow-md relative",
                  log.status === 'online' ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none" : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {log.status === 'online' ? (
                      <Activity size={14} className="text-[#00a884]" />
                    ) : (
                      <Clock size={14} className="text-[#8696a0]" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-tighter">
                      {log.status === 'online' ? 'Session Started' : 'Session Ended'}
                    </span>
                  </div>
                  <p className="text-sm">
                    Target became {log.status} at {log.timestamp}
                    {log.duration && <span className="block text-[10px] mt-1 opacity-70 italic">Duration: {log.duration}</span>}
                  </p>
                  <div className="text-[9px] text-right mt-1 opacity-60">
                    {log.timestamp}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-3 bg-[#202c33] flex items-center gap-3 z-10">
          <div className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2 text-sm text-[#8696a0]">
            System monitoring active...
          </div>
          <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center text-[#111b21]">
            <Send size={18} />
          </div>
        </div>
      </main>
    </div>
  );
}
