
import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Clock, MapPin, Search, Calendar, ChevronDown, LogOut, Sparkles, FileText, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { AttendanceRecord, Sewadar } from '../types';
import { format } from 'date-fns';
import { parseChatWithAI, ParsedAttendance } from '../utils/aiUtils';

interface HomeProps {
  todayRecords: AttendanceRecord[];
  allSewadars: Sewadar[];
  onAddEntry: (sewadarId: string, counter: string, startTime: string, endTime?: string) => Promise<void>;
  onMarkOut: (recordId: string, endTime: string) => Promise<void>;
  onDeleteEntry: (recordId: string) => Promise<void>;
  currentDate: string;
  setCurrentDate: (date: string) => void;
}

const COUNTERS = [
  "Roti, Dal / Subzi",
  "Special Counter",
  "Dessert",
  "Chole Bhature",
  "Kadi / Rajma Chawal",
  "Bread Pakoda",
  "Tea",
  "Coffee / Cold Drink",
  "Chips Counter",
  "Sweets Counter",
  "Main office - Coupon Counters",
  "Main Office - Card Counter",
  "Main Office - Admin"
];

const convertTo24Hour = (hour: string, minute: string, period: string) => {
  let h = parseInt(hour, 10);
  if (isNaN(h)) h = 0;
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${h.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
};

const TimePicker = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: { hour: string, minute: string, period: string };
  onChange: (val: { hour: string, minute: string, period: string }) => void;
}) => {
  const [activeField, setActiveField] = useState<'hour' | 'minute' | 'period' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeField === 'hour' && hourListRef.current) {
        const selectedEl = hourListRef.current.querySelector(`[data-value="${value.hour}"]`);
        if (selectedEl) selectedEl.scrollIntoView({ block: 'center' });
    }
    if (activeField === 'minute' && minuteListRef.current) {
        const selectedEl = minuteListRef.current.querySelector(`[data-value="${value.minute}"]`);
        if (selectedEl) selectedEl.scrollIntoView({ block: 'center' });
    }
  }, [activeField, value.hour, value.minute]);

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="mb-5 relative" ref={containerRef}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value.hour}
            onClick={() => setActiveField('hour')}
            className={`w-full p-3 bg-white border rounded-xl outline-none font-bold text-xl text-center transition-all ${
              activeField === 'hour' ? 'border-brand-500 ring-2 ring-brand-100 shadow-lg' : 'border-gray-200 text-gray-900'
            }`}
            readOnly
          />
          {activeField === 'hour' && (
            <div className="absolute bottom-full mb-2 left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
               <div ref={hourListRef} className="max-h-48 overflow-y-auto no-scrollbar scroll-smooth bg-white">
                 {hours.map(h => (
                   <button
                    key={h}
                    data-value={h}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ ...value, hour: h });
                      setActiveField(null);
                    }}
                    className={`w-full p-3 text-sm font-bold transition-colors border-b border-gray-50 last:border-0 ${
                      value.hour === h ? 'bg-brand-600 text-white' : 'hover:bg-gray-50 text-gray-900'
                    }`}
                   >
                     {h}
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
        <div className="self-center font-bold text-gray-300 text-xl pb-3">:</div>
        <div className="relative flex-1">
          <input
            type="text"
            value={value.minute}
            onClick={() => setActiveField('minute')}
            className={`w-full p-3 bg-white border rounded-xl outline-none font-bold text-xl text-center transition-all ${
              activeField === 'minute' ? 'border-brand-500 ring-2 ring-brand-100 shadow-lg' : 'border-gray-200 text-gray-900'
            }`}
            readOnly
          />
          {activeField === 'minute' && (
            <div className="absolute bottom-full mb-2 left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
               <div ref={minuteListRef} className="max-h-48 overflow-y-auto no-scrollbar scroll-smooth bg-white">
                 {minutes.map(m => (
                   <button
                    key={m}
                    data-value={m}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ ...value, minute: m });
                      setActiveField(null);
                    }}
                    className={`w-full p-3 text-sm font-bold transition-colors border-b border-gray-50 last:border-0 ${
                      value.minute === m ? 'bg-brand-600 text-white' : 'hover:bg-gray-50 text-gray-900'
                    }`}
                   >
                     {m}
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
        <div className="relative w-24">
          <button
            onClick={() => setActiveField(activeField === 'period' ? null : 'period')}
            className="w-full p-3 bg-brand-600 text-white border border-brand-600 rounded-xl outline-none focus:ring-2 focus:ring-brand-400 font-bold text-xl text-center flex items-center justify-center gap-2 shadow-md"
          >
            {value.period} <ChevronDown size={14} />
          </button>
          {activeField === 'period' && (
            <div className="absolute bottom-full mb-2 right-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
              {['AM', 'PM'].map(p => (
                <button
                  key={p}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange({ ...value, period: p });
                    setActiveField(null);
                  }}
                  className={`w-full p-3 text-sm font-bold text-center hover:bg-gray-50 transition-colors ${
                    value.period === p ? 'bg-brand-50 text-brand-600' : 'text-gray-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Home: React.FC<HomeProps> = ({ 
  todayRecords, 
  allSewadars, 
  onAddEntry, 
  onMarkOut,
  onDeleteEntry,
  currentDate, 
  setCurrentDate
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Import State
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResults, setParsedResults] = useState<ParsedAttendance[]>([]);
  const [selectedResults, setSelectedResults] = useState<Set<number>>(new Set());

  // New Entry Modal State
  const [selectedSewadarId, setSelectedSewadarId] = useState('');
  const [selectedCounter, setSelectedCounter] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [sewadarSearch, setSewadarSearch] = useState('');
  const [inTime, setInTime] = useState({ hour: '09', minute: '00', period: 'AM' });
  const [outTime, setOutTime] = useState({ hour: '05', minute: '00', period: 'PM' });
  const [hasOutTime, setHasOutTime] = useState(false);

  // Mark Out Modal State
  const [markOutRecordId, setMarkOutRecordId] = useState<string | null>(null);
  const [manualOutTime, setManualOutTime] = useState({ hour: '05', minute: '00', period: 'PM' });

  const activeCount = todayRecords.filter(r => !r.endTime).length;

  const handleConfirmEntry = () => {
    if (selectedSewadarId) {
      const formattedInTime = convertTo24Hour(inTime.hour, inTime.minute, inTime.period);
      const formattedOutTime = hasOutTime 
        ? convertTo24Hour(outTime.hour, outTime.minute, outTime.period) 
        : undefined;
      // Pass empty string if no counter selected, backend/UI handles it
      onAddEntry(selectedSewadarId, selectedCounter || '', formattedInTime, formattedOutTime);
      setShowModal(false);
      setSelectedSewadarId('');
      setSelectedCounter('');
      setSewadarSearch('');
      setInTime({ hour: '09', minute: '00', period: 'AM' });
      setHasOutTime(false);
    }
  };

  const handleAIFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParsedResults([]);
    setSelectedResults(new Set());

    try {
      const text = await file.text();
      // Only extract data for the currently selected date in the UI
      const results = await parseChatWithAI(text, allSewadars, currentDate);
      setParsedResults(results);
      // Auto-select results that have a valid matchedSewadarId
      const validIndices = results
        .map((r, i) => r.matchedSewadarId ? i : -1)
        .filter(i => i !== -1);
      setSelectedResults(new Set(validIndices));
    } catch (err: any) {
      if (err.message === 'API_KEY_MISSING') {
        alert("Gemini API Key is missing. In Vercel, you MUST name the variable 'VITE_GEMINI_API_KEY' (with the VITE_ prefix) for it to work in the browser. Please update your Vercel settings and redeploy.");
      } else {
        alert("Failed to parse chat log for " + currentDate + ". This can happen if the file is too large, the internet is slow, or the selected date is not present in the chat log.");
      }
      console.error("AI Import Error:", err);
    } finally {
      setIsParsing(false);
    }
  };

  const sanitizeTime = (timeStr: string): string => {
    if (!timeStr) return '';
    try {
      // Remove any non-alphanumeric chars except : and space
      const cleanStr = timeStr.replace(/[^0-9:APMapm\s]/g, '').trim();
      
      // Check if it already looks like HH:mm (24h)
      if (/^\d{1,2}:\d{2}$/.test(cleanStr)) {
        const [h, m] = cleanStr.split(':');
        return `${h.padStart(2, '0')}:${m}`;
      }

      // Try to parse AM/PM
      let [timePart, period] = cleanStr.split(/\s+/);
      if (!period && /[APap][Mm]$/.test(timePart)) {
        period = timePart.slice(-2);
        timePart = timePart.slice(0, -2);
      }

      const [hStr, mStr] = timePart.split(':');
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr || '0', 10);

      if (isNaN(h)) return timeStr; // Fallback

      if (period) {
        if (period.toUpperCase() === 'PM' && h < 12) h += 12;
        if (period.toUpperCase() === 'AM' && h === 12) h = 0;
      }

      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    } catch (e) {
      return timeStr;
    }
  };

  const confirmAIImport = async () => {
    setIsParsing(true); // Reuse parsing state for loading indicator
    try {
      // Group selected results by sewadar ID to handle IN/OUT pairs
      const selectedItems = Array.from(selectedResults).map(index => parsedResults[index]);
      const sewadarMap = new Map<string, { in?: ParsedAttendance, out?: ParsedAttendance }>();

      selectedItems.forEach(item => {
        if (item.matchedSewadarId) {
          const current = sewadarMap.get(item.matchedSewadarId) || {};
          if (item.type === 'IN') {
            if (!current.in) current.in = item; 
          } else if (item.type === 'OUT') {
            current.out = item;
          }
          sewadarMap.set(item.matchedSewadarId, current);
        }
      });

      // Process sequentially to avoid race conditions
      for (const [sewadarId, records] of sewadarMap) {
        if (records.in) {
          await onAddEntry(
            sewadarId, 
            records.in.counter || 'General', 
            sanitizeTime(records.in.time), 
            records.out ? sanitizeTime(records.out.time) : undefined
          );
        } else if (records.out) {
          const activeRecord = todayRecords.find(r => r.sewadarId === sewadarId && !r.endTime);
          if (activeRecord) {
            await onMarkOut(activeRecord.id, sanitizeTime(records.out.time));
          }
        }
      }

      setShowAIModal(false);
      setParsedResults([]);
      setSelectedResults(new Set());
      alert('Import successful!');
    } catch (error) {
      console.error("Import failed:", error);
      alert('Some records failed to import. Please check the console.');
    } finally {
      setIsParsing(false);
    }
  };

  const toggleResult = (index: number) => {
    const next = new Set(selectedResults);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedResults(next);
  };

  const handleMarkOutClick = (id: string) => {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const period = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    const roundedM = Math.floor(m / 5) * 5;
    setManualOutTime({
      hour: h.toString().padStart(2, '0'),
      minute: roundedM.toString().padStart(2, '0'),
      period
    });
    setMarkOutRecordId(id);
  };

  const handleConfirmMarkOut = () => {
    if (markOutRecordId) {
      const formatted = convertTo24Hour(manualOutTime.hour, manualOutTime.minute, manualOutTime.period);
      onMarkOut(markOutRecordId, formatted);
      setMarkOutRecordId(null);
    }
  };

  const handleDateClick = () => {
    const input = dateInputRef.current;
    if (input) {
      try {
        if ('showPicker' in input) {
          (input as any).showPicker();
        } else {
          (input as HTMLInputElement).click();
        }
      } catch (e) {
        // Fallback for cross-origin iframes where showPicker might be blocked
        (input as HTMLInputElement).click();
      }
    }
  };

  const filteredSewadarsForModal = allSewadars.filter(s => 
    s.name.toLowerCase().includes(sewadarSearch.toLowerCase())
  );
  
  const filteredCounters = COUNTERS.filter(c => 
    c.toLowerCase().includes(selectedCounter.toLowerCase())
  );

  const displayDate = new Date(`${currentDate}T00:00:00`);
  const isDateValid = !isNaN(displayDate.getTime());

  const formatTimeDisplay = (time24: string | undefined) => {
    if (!time24) return '';
    try {
      const [h, m] = time24.split(':');
      const date = new Date();
      const hours = parseInt(h, 10);
      const minutes = parseInt(m, 10);
      
      if (isNaN(hours) || isNaN(minutes)) return time24;
      
      date.setHours(hours);
      date.setMinutes(minutes);
      date.setSeconds(0);
      date.setMilliseconds(0);
      
      if (isNaN(date.getTime())) return time24;
      return format(date, 'h:mm a');
    } catch (e) {
      return time24;
    }
  };

  const recordToMarkOut = todayRecords.find(r => r.id === markOutRecordId);

  return (
    <div className="p-4 pb-4 max-w-lg mx-auto w-full">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Daily Overview</p>
          <div className="relative group cursor-pointer inline-block" onClick={handleDateClick}>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              {isDateValid ? format(displayDate, 'MMM d') : 'Select Date'}
              <ChevronDown size={20} className="text-gray-400 group-hover:text-brand-600 transition-colors" />
            </h2>
            <div className="absolute -bottom-1 left-0 h-1.5 bg-brand-600 w-0 group-hover:w-full transition-all duration-300 rounded-full"></div>
            <input 
              ref={dateInputRef}
              type="date" 
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              value={currentDate}
              onChange={(e) => {
                setCurrentDate(e.target.value);
                // Clear any results if date changes while modal might be open
                setParsedResults([]);
              }}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAIModal(true)}
            className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm border border-indigo-100 hover:bg-indigo-100 transition-colors"
            title="Import from WhatsApp"
          >
            <Sparkles size={20} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200 active:scale-95 transition-transform hover:bg-brand-700"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="bg-brand-600 rounded-3xl p-6 text-white shadow-xl shadow-brand-200 mb-8 relative overflow-hidden transition-all duration-500 hover:shadow-brand-300">
        <div className="absolute -right-4 -bottom-8 opacity-20">
          <svg width="150" height="150" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0L61.8 38.2L100 50L61.8 61.8L50 100L38.2 61.8L0 50L38.2 38.2L50 0Z" fill="white"/>
          </svg>
        </div>
        <p className="text-brand-100 text-sm font-medium mb-1">Active Sewadars</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold">{activeCount}</span>
          <span className="text-brand-200">/ {allSewadars.length} total team</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Activity Feed</h3>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
          {isDateValid ? format(displayDate, 'EEEE') : ''}
        </span>
      </div>
      
      <div className="space-y-4">
        {todayRecords.length === 0 ? (
           <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
            No entries for {isDateValid ? format(displayDate, 'MMM d') : 'this date'} yet.
          </div>
        ) : (
          [...todayRecords].reverse().map((record) => {
            const sewadar = allSewadars.find(s => s.id === record.sewadarId);
            return (
              <div key={record.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 font-bold text-lg overflow-hidden border border-brand-100">
                    {sewadar?.avatar ? (
                      <img src={sewadar.avatar} alt={record.sewadarName} className="w-full h-full object-cover" />
                    ) : (
                      record.sewadarName.substring(0,1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 leading-tight">{record.sewadarName}</h4>
                    <p className="text-[10px] text-gray-500 font-medium">{record.counter || 'General'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-lg border border-brand-100 whitespace-nowrap">
                      <Clock size={10} /> {formatTimeDisplay(record.startTime)}
                    </div>
                    {!record.endTime ? (
                      <button 
                        onClick={() => handleMarkOutClick(record.id)}
                        className="text-[10px] bg-brand-600 text-white px-2.5 py-1 rounded-lg font-bold hover:bg-brand-700 transition-colors"
                      >
                        Mark Out
                      </button>
                    ) : (
                      <div className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded border border-gray-100 whitespace-nowrap">
                        Out: {formatTimeDisplay(record.endTime)}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => onDeleteEntry(record.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Delete Entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Import Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowAIModal(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">AI Chat Import</h3>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                    For {isDateValid ? format(displayDate, 'MMM d, yyyy') : 'Selected Date'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAIModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {parsedResults.length === 0 && !isParsing ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-gray-50 border border-dashed border-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <FileText size={32} />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Upload WhatsApp Export</h4>
                <p className="text-sm text-gray-500 mb-6 max-w-[240px]">
                  AI will extract records ONLY for <span className="text-brand-600 font-bold">{isDateValid ? format(displayDate, 'MMM d') : 'Selected Date'}</span>.
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAIFileUpload} 
                  className="hidden" 
                  accept=".txt" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-brand-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100"
                >
                  Select .txt File
                </button>
              </div>
            ) : isParsing ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-600 animate-pulse text-center px-4">
                  Gemini is filtering records for <br/>{isDateValid ? format(displayDate, 'MMMM d') : 'Selected Date'}...
                </p>
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Extracted Activities ({isDateValid ? format(displayDate, 'MMM d') : ''})</p>
                  {parsedResults.map((result, idx) => (
                    <div 
                      key={idx}
                      onClick={() => result.matchedSewadarId && toggleResult(idx)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        selectedResults.has(idx) 
                          ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' 
                          : !result.matchedSewadarId 
                            ? 'border-red-100 bg-red-50/30 opacity-60' 
                            : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${result.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            {result.type === 'IN' ? <CheckCircle2 size={16} /> : <LogOut size={16} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-900 text-sm">
                                {result.matchedSewadarId ? allSewadars.find(s => s.id === result.matchedSewadarId)?.name : result.rawName}
                              </span>
                              {!result.matchedSewadarId && (
                                <AlertCircle size={12} className="text-red-500" />
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">
                              {result.type} • {result.counter || 'General'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-gray-900 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                            {formatTimeDisplay(result.time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {parsedResults.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-sm text-gray-400 font-medium px-4">No records found for this specific date in the uploaded log.</p>
                      <button 
                        onClick={() => setParsedResults([])}
                        className="mt-4 text-xs font-bold text-brand-600 hover:underline"
                      >
                        Try another file
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setParsedResults([])}
                    className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={confirmAIImport}
                    disabled={selectedResults.size === 0}
                    className="flex-[2] bg-brand-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-100 hover:bg-brand-700 disabled:opacity-50"
                  >
                    Import {selectedResults.size} Records
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 relative z-10 shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden opacity-80" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Mark Attendance</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto no-scrollbar flex-1 pb-4">
              <div className="mb-4 relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sewadar Name</label>
                {selectedSewadarId ? (
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                    <span className="font-bold text-gray-900">{allSewadars.find(s => s.id === selectedSewadarId)?.name}</span>
                    <button onClick={() => { setSelectedSewadarId(''); setSewadarSearch(''); }} className="text-gray-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    <input 
                      type="text"
                      className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-900 bg-white placeholder-gray-400 font-medium"
                      placeholder="Names of Sewadar"
                      value={sewadarSearch}
                      onChange={(e) => setSewadarSearch(e.target.value)}
                    />
                    {sewadarSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-40 overflow-auto">
                        {filteredSewadarsForModal.map(s => (
                          <button
                            key={s.id}
                            className="w-full text-left p-3 hover:bg-brand-50 hover:text-brand-700 text-sm font-medium text-gray-700 border-b border-gray-50 last:border-0"
                            onClick={() => { setSelectedSewadarId(s.id); setSewadarSearch(''); }}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mb-4 relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Location (Optional)</label>
                <div className="relative">
                  <input 
                    type="text"
                    className={`w-full p-3 border rounded-xl outline-none font-bold text-gray-900 transition-all ${
                      showLocationSuggestions ? 'border-brand-500 ring-2 ring-brand-100 shadow-lg' : 'border-gray-200 bg-white'
                    }`}
                    value={selectedCounter}
                    onChange={(e) => {
                      setSelectedCounter(e.target.value);
                      setShowLocationSuggestions(true);
                    }}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                    placeholder="Enter or select location"
                  />
                  <MapPin className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                  {showLocationSuggestions && (
                    <div className="absolute top-full mt-2 left-0 z-50 w-full bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="max-h-48 overflow-y-auto no-scrollbar scroll-smooth bg-white">
                        {filteredCounters.map(c => (
                          <button
                            key={c}
                            className={`w-full text-left p-3 hover:bg-gray-50 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                              c === selectedCounter ? 'bg-brand-600 text-white hover:bg-brand-700' : 'text-gray-700'
                            }`}
                            onClick={() => { setSelectedCounter(c); setShowLocationSuggestions(false); }}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <TimePicker label="In Time" value={inTime} onChange={setInTime} />
              <div className="mb-4">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                    type="checkbox" 
                    checked={hasOutTime} 
                    onChange={(e) => setHasOutTime(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                   />
                   <span className="text-sm font-medium text-gray-700">Mark Out Time Immediately</span>
                 </label>
              </div>
              {hasOutTime && (
                <div className="animate-fade-in">
                  <TimePicker label="Out Time" value={outTime} onChange={setOutTime} />
                </div>
              )}
              <button 
                disabled={!selectedSewadarId}
                onClick={handleConfirmEntry}
                className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                Confirm Entry <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Out Modal */}
      {markOutRecordId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setMarkOutRecordId(null)} />
          <div 
             className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative z-10 shadow-2xl animate-in slide-in-from-bottom-10 duration-300"
             onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden opacity-80" />
            <div className="flex justify-between items-center mb-6">
              <div>
                 <h3 className="text-xl font-bold text-gray-900">Mark Out</h3>
                 <p className="text-sm text-gray-500">{recordToMarkOut?.sewadarName}</p>
              </div>
              <button onClick={() => setMarkOutRecordId(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <TimePicker label="Out Time" value={manualOutTime} onChange={setManualOutTime} />
            <button 
              onClick={handleConfirmMarkOut}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-colors mt-4"
            >
              <LogOut size={18} /> Confirm Mark Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
