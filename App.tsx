import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, Users, History as HistoryIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, where, writeBatch } from 'firebase/firestore';
import { db } from './utils/firebase';
import { seedDatabase } from './utils/seedData';

import { AppView, AttendanceRecord, Sewadar } from './types';
import { Splash } from './views/Splash';
import { Home } from './views/Home';
import { Team } from './views/Team';
import { History } from './views/History';

export default function App() {
  const [view, setView] = useState<AppView>(AppView.SPLASH);
  const [loading, setLoading] = useState(true);
  
  // App State
  const [sewadars, setSewadars] = useState<Sewadar[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [permissionError, setPermissionError] = useState(false);

  // Fetch Data from Firebase
  const fetchData = async () => {
    try {
      setPermissionError(false);
      // 1. Fetch Sewadars
      const sewadarsCol = collection(db, 'sewadars');
      const sewadarsSnapshot = await getDocs(query(sewadarsCol, orderBy('name')));
      
      // Check for seeding
      if (sewadarsSnapshot.empty) {
        const seeded = await seedDatabase();
        if (seeded) {
          // Re-fetch after seeding
          const newSnapshot = await getDocs(query(sewadarsCol, orderBy('name')));
          const mappedSewadars: Sewadar[] = newSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            avatar: doc.data().avatar,
            phoneNumber: doc.data().phone_number
          }));
          setSewadars(mappedSewadars);
        } else {
          setSewadars([]);
        }
      } else {
        const mappedSewadars: Sewadar[] = sewadarsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          avatar: doc.data().avatar,
          phoneNumber: doc.data().phone_number
        }));
        setSewadars(mappedSewadars);
      }

      // 2. Fetch Records
      // Note: In a real app with huge data, you'd want to limit this query.
      // For now, fetching all as per previous behavior, but ordered by date/time.
      const recordsCol = collection(db, 'attendance_records');
      // Simplify query to avoid requiring a composite index
      const recordsSnapshot = await getDocs(query(recordsCol, orderBy('date')));
      
      const mappedRecords: AttendanceRecord[] = recordsSnapshot.docs.map(doc => ({
        id: doc.id,
        sewadarId: doc.data().sewadar_id,
        sewadarName: doc.data().sewadar_name,
        counter: doc.data().counter,
        date: doc.data().date,
        startTime: doc.data().start_time,
        endTime: doc.data().end_time
      }));
      
      // Sort by start time in memory
      mappedRecords.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
      
      setRecords(mappedRecords);

    } catch (error: any) {
      console.error('Error fetching data from Firebase:', error);
      if (error.code === 'permission-denied') {
        setPermissionError(true);
      } else {
        alert(`Failed to load data: ${error.message || 'Check internet connection'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMember = async (name: string) => {
    // Check for duplicate name
    const normalizedName = name.trim().toLowerCase();
    if (sewadars.some(s => s.name.toLowerCase() === normalizedName)) {
      alert('This sewadar is already existed in the team list.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'sewadars'), {
        name: name.trim(),
        created_at: new Date().toISOString()
      });

      const newMember: Sewadar = {
        id: docRef.id,
        name: name.trim(),
        avatar: undefined,
        phoneNumber: undefined
      };
      
      setSewadars(prev => [newMember, ...prev].sort((a,b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Error adding member: ", error);
      alert("Failed to add member to database.");
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'sewadars', id));
      setSewadars(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error removing member: ", error);
      alert("Failed to remove member.");
    }
  };

  const handleUpdateMember = async (id: string, updates: Partial<Sewadar>) => {
    try {
      const dbUpdates: any = { ...updates };
      if (updates.phoneNumber !== undefined) {
        dbUpdates.phone_number = updates.phoneNumber;
        delete dbUpdates.phoneNumber;
      }
      
      await updateDoc(doc(db, 'sewadars', id), dbUpdates);
      setSewadars(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (error) {
      console.error("Error updating member: ", error);
      alert("Failed to update member.");
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
      end_time: endTime || null,
      created_at: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'attendance_records'), newRecordPayload);
      
      const newRecord: AttendanceRecord = {
        id: docRef.id,
        sewadarId,
        sewadarName: sewadar.name,
        counter,
        date: currentDate,
        startTime,
        endTime
      };

      setRecords(prev => [...prev, newRecord]);
    } catch (error) {
      console.error("Error adding entry: ", error);
      alert("Failed to mark attendance.");
    }
  };

  const handleMarkOut = async (recordId: string, endTime: string) => {
    try {
      await updateDoc(doc(db, 'attendance_records', recordId), {
        end_time: endTime
      });
      setRecords(prev => prev.map(r => r.id === recordId ? { ...r, endTime } : r));
    } catch (error) {
      console.error("Error marking out: ", error);
      alert("Failed to mark out.");
    }
  };

  const handleDeleteEntry = async (recordId: string) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    try {
      await deleteDoc(doc(db, 'attendance_records', recordId));
      setRecords(prev => prev.filter(r => r.id !== recordId));
    } catch (error) {
      console.error("Error deleting entry: ", error);
      alert("Failed to delete entry.");
    }
  };

  const handleDeleteDate = async (date: string) => {
    if (!window.confirm(`Are you sure you want to delete all records for ${date}?`)) return;
    
    try {
      // Get all records for this date
      const q = query(collection(db, 'attendance_records'), where('date', '==', date));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      setRecords(prev => prev.filter(r => r.date !== date));
    } catch (error) {
      console.error("Error deleting date records: ", error);
      alert("Failed to delete records.");
    }
  };

  if (permissionError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl p-8 shadow-xl border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Database Locked</h2>
          <p className="text-gray-600 text-center mb-6">
            Your Firebase database is currently in "Locked Mode". You need to enable access for the app to work.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-700 space-y-3">
            <p className="font-bold text-gray-900">How to fix:</p>
            <ol className="list-decimal pl-4 space-y-2">
              <li>Go to <a href="https://console.firebase.google.com/project/jalpsan-attendanvce/firestore/rules" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Firebase Console &gt; Firestore &gt; Rules</a></li>
              <li>Change <code className="bg-gray-200 px-1 rounded">allow read, write: if false;</code> to <code className="bg-green-100 text-green-800 px-1 rounded font-bold">allow read, write: if true;</code></li>
              <li>Click <strong>Publish</strong></li>
            </ol>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100"
          >
            I've Fixed It, Try Again
          </button>
        </div>
      </div>
    );
  }

  if (view === AppView.SPLASH) {
    return <Splash onEnter={() => setView(AppView.HOME)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-lg bg-white sm:shadow-2xl sm:my-4 sm:rounded-[2.5rem] overflow-hidden h-[100dvh] sm:h-[840px] flex flex-col relative border-x border-gray-100">
        
        {/* Fixed Header */}
        <header className="bg-brand-600 text-white px-6 py-5 flex justify-between items-center shadow-md z-30 shrink-0">
           <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-brand-600 font-extrabold text-xl shadow-inner">JS</div>
             <span className="font-bold text-2xl tracking-tight">JalpanSewa</span>
           </div>
           <div className="flex items-center gap-2 bg-brand-700/50 px-3 py-1.5 rounded-full border border-brand-500/30 text-xs font-semibold backdrop-blur-sm">
             {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div><span>Live Sync</span></>}
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
                    onDeleteEntry={handleDeleteEntry}
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
             <NavTab active={view === AppView.TEAM} onClick={() => setView(AppView.TEAM)} icon={<Users size={20} />} label="Sewadars" />
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
        ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 translate-y-[-2px]' 
        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 active:scale-95'
    }`}
  >
    {icon}
    <span className={`transition-all duration-300 ${active ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{label}</span>
  </button>
);