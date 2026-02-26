import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, Users, History as HistoryIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { AppView, AttendanceRecord, Sewadar } from './types';
import { Splash } from './views/Splash';
import { Home } from './views/Home';
import { Team } from './views/Team';
import { History } from './views/History';
import { supabase } from './utils/supabaseClient';

export default function App() {
  const [view, setView] = useState<AppView>(AppView.SPLASH);
  const [loading, setLoading] = useState(true);
  
  // App State
  const [sewadars, setSewadars] = useState<Sewadar[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Fetch Data from Supabase
  const fetchData = async () => {
    try {
      const { data: sewadarsData, error: sewadarsError } = await supabase
        .from('sewadars')
        .select('*')
        .order('name');
      
      if (sewadarsError) throw sewadarsError;
      if (sewadarsData) {
        const mappedSewadars: Sewadar[] = sewadarsData.map((s: any) => ({
          id: s.id,
          name: s.name,
          avatar: s.avatar,
          phoneNumber: s.phone_number
        }));
        setSewadars(mappedSewadars);
      }

      const { data: recordsData, error: recordsError } = await supabase
        .from('attendance_records')
        .select('*')
        .order('created_at', { ascending: true });

      if (recordsError) throw recordsError;
      if (recordsData) {
        const mappedRecords: AttendanceRecord[] = recordsData.map((r: any) => ({
          id: r.id,
          sewadarId: r.sewadar_id,
          sewadarName: r.sewadar_name,
          counter: r.counter,
          date: r.date,
          startTime: r.start_time,
          endTime: r.end_time
        }));
        setRecords(mappedRecords);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMember = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('sewadars')
        .insert([{ name }])
        .select()
        .single();
      if (error) throw error;
      if (data) {
        const newMember: Sewadar = {
          id: data.id,
          name: data.name,
          avatar: data.avatar,
          phoneNumber: data.phone_number
        };
        setSewadars(prev => [newMember, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
      }
    } catch (error) { alert('Failed to add member.'); }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      const { error } = await supabase.from('sewadars').delete().eq('id', id);
      if (error) throw error;
      setSewadars(prev => prev.filter(s => s.id !== id));
    } catch (error) { alert('Failed to remove member.'); }
  };

  const handleUpdateMember = async (id: string, updates: Partial<Sewadar>) => {
    try {
      const dbUpdates: any = { ...updates };
      if (updates.phoneNumber !== undefined) {
        dbUpdates.phone_number = updates.phoneNumber;
        delete dbUpdates.phoneNumber;
      }
      
      const { error } = await supabase.from('sewadars').update(dbUpdates).eq('id', id);
      if (error) throw error;
      setSewadars(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (error) { 
      console.error(error);
      alert('Failed to update member.'); 
    }
  };

  const handleAddEntry = async (sewadarId: string, counter: string, startTime: string, endTime?: string) => {
    const sewadar = sewadars.find(s => s.id === sewadarId);
    if (!sewadar) return;
    const newRecordPayload = {
      sewadar_id: sewadarId,
      sewadar_name: sewadar.name,
      counter,
      date: currentDate,
      start_time: startTime,
      end_time: endTime || null
    };
    try {
      const { data, error } = await supabase.from('attendance_records').insert([newRecordPayload]).select().single();
      if (error) throw error;
      if (data) {
        setRecords(prev => [...prev, {
          id: data.id,
          sewadarId: data.sewadar_id,
          sewadarName: data.sewadar_name,
          counter: data.counter,
          date: data.date,
          startTime: data.start_time,
          endTime: data.end_time || undefined
        }]);
      }
    } catch (error: any) { 
      console.error('Add Entry Error:', error);
      alert(`Failed to mark attendance: ${error.message || JSON.stringify(error)}`); 
    }
  };

  const handleMarkOut = async (recordId: string, endTime: string) => {
    try {
      const { error } = await supabase.from('attendance_records').update({ end_time: endTime }).eq('id', recordId);
      if (error) throw error;
      setRecords(prev => prev.map(r => r.id === recordId ? { ...r, endTime } : r));
    } catch (error: any) { 
      console.error('Mark Out Error:', error);
      alert(`Failed to mark out: ${error.message || JSON.stringify(error)}`); 
    }
  };

  const handleDeleteDate = async (date: string) => {
    try {
      const { error } = await supabase.from('attendance_records').delete().eq('date', date);
      if (error) throw error;
      setRecords(prev => prev.filter(r => r.date !== date));
    } catch (error) {
      console.error(error);
      alert('Failed to delete records.');
    }
  };

  if (view === AppView.SPLASH) {
    return <Splash onEnter={() => setView(AppView.HOME)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-lg bg-white sm:shadow-2xl sm:my-4 sm:rounded-[2.5rem] overflow-hidden h-[100dvh] sm:h-[840px] flex flex-col relative border-x border-gray-100">
        
        {/* Fixed Header */}
        <header className="bg-white text-gray-900 px-6 py-5 flex justify-between items-center border-b border-gray-100 shadow-sm z-30 shrink-0">
           <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 font-extrabold text-xl shadow-sm border border-brand-100">JS</div>
             <span className="font-bold text-2xl tracking-tight">JalpanSewa</span>
           </div>
           <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
             {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" /> : <><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span>Live Sync</span></>}
           </div>
        </header>

        {/* Scrollable Main View Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-gray-50/50">
          <div className="h-full">
            {loading && sewadars.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
                <p className="text-sm font-bold tracking-wide">Syncing Portal Data...</p>
              </div>
            ) : (
              <>
                {view === AppView.HOME && (
                  <Home 
                    currentDate={currentDate} 
                    setCurrentDate={setCurrentDate} 
                    todayRecords={records.filter(r => r.date === currentDate)} 
                    allSewadars={sewadars} 
                    onAddEntry={handleAddEntry} 
                    onMarkOut={handleMarkOut}
                  />
                )}
                {view === AppView.TEAM && (
                  <Team members={sewadars} onAddMember={handleAddMember} onRemoveMember={handleRemoveMember} onUpdateMember={handleUpdateMember} />
                )}
                {view === AppView.HISTORY && (
                  <History allRecords={records} onDeleteDate={handleDeleteDate} />
                )}
              </>
            )}
          </div>
        </main>

        {/* Fixed Bottom Navigation - Placed in Flow to prevent overlap */}
        <nav className="bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-30">
           <div className="flex items-center justify-around gap-1">
             <NavTab active={view === AppView.HOME} onClick={() => setView(AppView.HOME)} icon={<HomeIcon size={20} />} label="Home" />
             <NavTab active={view === AppView.TEAM} onClick={() => setView(AppView.TEAM)} icon={<Users size={20} />} label="Team" />
             <NavTab active={view === AppView.HISTORY} onClick={() => setView(AppView.HISTORY)} icon={<HistoryIcon size={20} />} label="History" />
           </div>
        </nav>

      </div>
    </div>
  );
}

const NavTab = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm select-none ${
      active 
        ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-100 shadow-sm translate-y-[-2px]' 
        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 active:scale-95'
    }`}
  >
    {icon}
    <span className={`transition-all duration-300 ${active ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{label}</span>
  </button>
);