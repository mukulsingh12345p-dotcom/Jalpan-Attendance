export interface Sewadar {
  id: string;
  name: string;
  avatar?: string;
  phoneNumber?: string;
}

export interface AttendanceRecord {
  id: string;
  sewadarId: string;
  sewadarName: string;
  counter: string; // e.g., Water Service, Tea Stall
  date: string; // ISO Date string YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
}

export interface DailyReport {
  date: string;
  totalSewadars: number;
  records: AttendanceRecord[];
}

export enum AppView {
  SPLASH = 'SPLASH',
  HOME = 'HOME',
  TEAM = 'TEAM',
  HISTORY = 'HISTORY'
}
