import React, { useState, useRef } from 'react';
import { Share2, Download, FileText, Calendar, ArrowRight } from 'lucide-react';
import { AttendanceRecord } from '../types';
import { format } from 'date-fns';
import { generatePDF, shareReport } from '../utils/reportUtils';

interface HistoryProps {
  allRecords: AttendanceRecord[];
  onDeleteDate: (date: string) => Promise<void>;
}

export const History: React.FC<HistoryProps> = ({ allRecords, onDeleteDate }) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showControls, setShowControls] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const filteredRecords = allRecords.filter(r => r.date === selectedDate);
  
  const getDisplayDate = () => {
    if (!selectedDate) return 'Select Date';
    const date = new Date(`${selectedDate}T00:00:00`);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, 'd MMMM yyyy');
  };

  const displayDate = getDisplayDate();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to DELETE ALL records for ${displayDate}? This action cannot be undone.`)) {
      setIsDeleting(true);
      await onDeleteDate(selectedDate);
      setIsDeleting(false);
    }
  };

  const handleContainerClick = () => {
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

  return (
    <div className="p-5 max-w-lg mx-auto w-full animate-in fade-in duration-500 flex flex-col">
       <div className="flex justify-between items-center mb-4 shrink-0">
         <h2 className="text-2xl font-bold text-gray-900 tracking-tight">History</h2>
         <button 
           onClick={() => setShowControls(!showControls)}
           className={`p-2 rounded-xl border shadow-sm transition-all ${showControls ? 'bg-white border-gray-100 text-brand-600' : 'bg-brand-600 border-brand-600 text-white'}`}
         >
            <Calendar size={20} />
         </button>
       </div>

       {/* Collapsible Control Card */}
       {showControls ? (
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 mb-6 overflow-hidden relative shrink-0 animate-in slide-in-from-top-5 duration-300">
           <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
           
           <div className="flex items-center gap-3 mb-4 text-brand-600 relative z-10">
             <div className="p-2 bg-brand-100 rounded-lg"><FileText size={20} /></div>
             <h3 className="font-bold text-gray-900 text-lg">Duty Report Access</h3>
           </div>
           <p className="text-gray-500 text-sm mb-6 leading-relaxed relative z-10">
             Select any past date to review attendance logs, download PDF reports, or share summaries with the team.
           </p>
           
           {/* Date Picker */}
           <div className="relative mb-6 cursor-pointer group" onClick={handleContainerClick}>
             <input 
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-4 pl-5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all hover:bg-white hover:border-brand-200 cursor-pointer"
             />
             <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-600 bg-white p-2 rounded-xl shadow-sm border border-gray-100 pointer-events-none">
               <Calendar size={18} />
             </div>
           </div>

           {/* Actions */}
           <div className="grid grid-cols-2 gap-4 relative z-10">
             <button 
              onClick={() => shareReport(selectedDate, filteredRecords)}
              disabled={filteredRecords.length === 0}
              className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all font-bold text-sm shadow-sm disabled:opacity-50"
             >
               <Share2 size={20} className="text-brand-500" />
               Share Report
             </button>
             <button 
              onClick={() => generatePDF(selectedDate, filteredRecords)}
              disabled={filteredRecords.length === 0}
              className="flex flex-col items-center justify-center gap-2 bg-brand-600 text-white py-4 rounded-2xl hover:bg-brand-700 active:scale-95 transition-all font-bold text-sm shadow-lg shadow-brand-100 disabled:opacity-50"
             >
               <Download size={20} />
               Download PDF
             </button>
             {filteredRecords.length > 0 && (
               <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="col-span-2 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 py-3 rounded-2xl hover:bg-red-100 active:scale-95 transition-all font-bold text-xs mt-2"
               >
                 {isDeleting ? 'Deleting...' : 'Delete All Records for This Date'}
               </button>
             )}
           </div>
         </div>
       ) : (
         <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4 flex items-center justify-between shrink-0 animate-in fade-in duration-300">
            <div className="flex items-center gap-3" onClick={handleContainerClick}>
              <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase">Viewing Date</p>
                <p className="text-sm font-bold text-gray-900">{displayDate}</p>
              </div>
              {/* Hidden input for date picker trigger */}
              <input 
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute opacity-0 w-0 h-0"
              />
            </div>
            <button 
              onClick={() => setShowControls(true)}
              className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100"
            >
              Expand
            </button>
         </div>
       )}

       {/* Report Preview */}
       <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col transition-all duration-500">
         <div className="bg-gray-50 p-6 text-center text-gray-900 relative overflow-hidden shrink-0 border-b border-gray-100">
           <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4">
             <FileText size={120} />
           </div>
           <h3 className="font-bold tracking-widest uppercase mb-1 text-[10px] text-gray-400">Jalpan Sewa Record</h3>
           <p className="text-2xl font-black text-brand-600">{displayDate}</p>
         </div>
         
         <div className="p-0 relative">
           {filteredRecords.length === 0 ? (
             <div className="text-center py-12 flex flex-col items-center justify-center text-gray-400">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100 border-dashed">
                 <Calendar size={32} className="opacity-20" />
               </div>
               <p className="text-sm font-medium px-4">No sewa records found for this date.</p>
             </div>
           ) : (
            <div className="flex flex-col">
              {/* Desktop/Wide Tablet Tip */}
              <div className="flex justify-end px-4 py-2 bg-gray-50/50 border-b border-gray-100 sm:hidden shrink-0">
                <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold">
                  SWIPE TO SEE FULL REPORT <ArrowRight size={10} />
                </span>
              </div>
              
              <div className="overflow-x-auto overflow-y-auto max-h-[65vh] cursor-grab active:cursor-grabbing border-t border-gray-100">
                <table className="w-full text-sm text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="sticky top-0 z-10 text-xs text-gray-400 font-extrabold uppercase tracking-widest border-b border-gray-100 bg-gray-50 shadow-sm">
                      <th className="py-4 pl-6">Sewadar Name</th>
                      <th className="py-4">Sewa Spot</th>
                      <th className="py-4">Time In</th>
                      <th className="py-4 pr-6 text-right">Time Out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRecords.map((r) => (
                      <tr key={r.id} className="group hover:bg-brand-50/30 transition-colors">
                        <td className="py-5 pl-6 font-bold text-gray-900 whitespace-nowrap">{r.sewadarName}</td>
                        <td className="py-5 text-gray-600 font-medium whitespace-nowrap pr-4">{r.counter}</td>
                        <td className="py-5 text-brand-600 font-black whitespace-nowrap">{r.startTime}</td>
                        <td className="py-5 pr-6 text-right whitespace-nowrap">
                          {r.endTime ? (
                            <span className="text-gray-900 font-bold">{r.endTime}</span>
                          ) : (
                            <span className="text-green-600 font-black text-[10px] bg-green-100 px-2 py-1 rounded-full border border-green-200">ACTIVE</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
           )}
         </div>
       </div>
    </div>
  );
};