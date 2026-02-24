import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceRecord } from '../types';
import { format, differenceInMinutes } from 'date-fns';

// Helper to convert 24h string "HH:mm" to "hh:mm a"
const convertToAmPm = (time24: string) => {
  if (!time24 || time24 === '--') return '--';
  const [h, m] = time24.split(':');
  const date = new Date();
  date.setHours(parseInt(h, 10));
  date.setMinutes(parseInt(m, 10));
  return format(date, 'hh:mm a');
};

const calculateDuration = (dateStr: string, start: string, end?: string) => {
  if (!start) return '--';
  if (!end) return 'Active';
  
  try {
    let startDate = new Date(`${dateStr}T${start}`);
    let endDate = new Date(`${dateStr}T${end}`);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '--';

    if (endDate < startDate) {
      endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
    }
    
    const diffMins = differenceInMinutes(endDate, startDate);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  } catch (e) {
    return '--';
  }
};

export const generatePDF = (dateStr: string, records: AttendanceRecord[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const dateObj = new Date(`${dateStr}T00:00:00`);

  // --- 0. Header Content ---
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.setFont("helvetica", "italic");
  doc.text(
    `With the blessings of H.H. Sant Rajinder Singh Ji Maharaj, Jalpan group presents the report for ${format(dateObj, 'dd/MM/yyyy')}`,
    14,
    15
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text("SKRM Jalpan Sewa Report", 14, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(80);
  doc.text("Duty Report Summary", 14, 32);

  doc.setLineWidth(0.5);
  doc.setDrawColor(200);
  doc.line(14, 35, pageWidth - 14, 35);

  let currentY = 45;

  // --- 1. Duty Overview Table ---
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("1. Duty Overview", 14, currentY);
  currentY += 5;

  const totalSewadars = new Set(records.map(r => r.sewadarId)).size;
  const uniqueLocations = Array.from(new Set(records.map(r => r.counter)));
  const locationsStr = uniqueLocations.join(', ');
  
  const sortedByStart = [...records].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const sortedByEnd = [...records].filter(r => r.endTime).sort((a, b) => (b.endTime || '').localeCompare(a.endTime || ''));
  
  const dutyStartTime = sortedByStart.length > 0 ? convertToAmPm(sortedByStart[0].startTime) : '--';
  const dutyEndTime = sortedByEnd.length > 0 ? convertToAmPm(sortedByEnd[0].endTime!) : (records.length > 0 ? 'Active' : '--');

  autoTable(doc, {
    startY: currentY,
    head: [['Metric', 'Details']],
    body: [
      ['Reporting Group', 'Jalpan Sewa Team'],
      ['Total Sewadars', totalSewadars.toString()],
      ['Locations Covered', uniqueLocations.length > 3 ? `${uniqueLocations.length} Counters` : locationsStr],
      ['Duty Start', `${format(dateObj, 'dd/MM/yyyy')} ${dutyStartTime}`],
      ['Duty End', `${format(dateObj, 'dd/MM/yyyy')} ${dutyEndTime}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 4 }
  });

  const lastTableY = (doc as any).lastAutoTable?.finalY || currentY;
  currentY = lastTableY + 15;

  // --- 2. Deployment ---
  doc.text("2. Sewa Point Deployment", 14, currentY);
  currentY += 5;

  const counterStats: Record<string, number> = {};
  records.forEach(r => { counterStats[r.counter] = (counterStats[r.counter] || 0) + 1; });
  const counterRows = Object.entries(counterStats).map(([cnt, count]) => [cnt, count.toString()]);

  autoTable(doc, {
    startY: currentY,
    head: [['Sewa Point / Spot', 'Manpower Count']],
    body: counterRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: 255 }
  });

  doc.addPage();
  currentY = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Detailed Attendance Log", 14, currentY);
  currentY += 10;

  const logRows = records.map((r, index) => [
    (index + 1).toString(),
    r.sewadarName,
    convertToAmPm(r.startTime),
    r.endTime ? convertToAmPm(r.endTime) : 'Active',
    calculateDuration(dateStr, r.startTime, r.endTime),
    r.counter
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Name', 'In', 'Out', 'Dur', 'Spot']],
    body: logRows,
    theme: 'striped',
    headStyles: { fillColor: [40, 50, 100], textColor: 255 }
  });

  doc.save(`SKRM_JalpanSewa_Report_${dateStr}.pdf`);
};

export const shareReport = async (dateStr: string, records: AttendanceRecord[]) => {
  const dateObj = new Date(`${dateStr}T00:00:00`);
  const formattedDate = format(dateObj, 'dd MMMM yyyy');
  const title = `*Jalpan Sewa Report - ${formattedDate}*`;
  
  const totalSewadars = new Set(records.map(r => r.sewadarId)).size;
  const counters = new Set(records.map(r => r.counter)).size;

  let text = `${title}\n\n`;
  text += `📊 *Summary*\n`;
  text += `• Total Sewadars: ${totalSewadars}\n`;
  text += `• Active Spots: ${counters}\n\n`;
  
  text += `📋 *Attendance Log*\n`;

  if (records.length === 0) {
    text += "_No entries recorded for this date._";
  } else {
    records.forEach(r => {
      const inTime = convertToAmPm(r.startTime);
      const outTime = r.endTime ? convertToAmPm(r.endTime) : 'Active';
      text += `• *${r.sewadarName}* (${r.counter})\n  Time: ${inTime} - ${outTime}\n`;
    });
  }

  text += `\nGenerated via SKRM Jalpan Portal`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Jalpan Sewa Report - ${formattedDate}`,
        text: text,
      });
    } catch (error) {
      console.log('Error sharing', error);
    }
  } else {
    // Basic fallback for environments without Navigator Share
    await navigator.clipboard.writeText(text);
    alert("Report text copied to clipboard! You can now paste it into WhatsApp or email.");
  }
};