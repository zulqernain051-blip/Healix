export type ScheduleView = 'DAY' | 'WEEK' | 'MONTH';
export function scheduleRange(date: Date, view: ScheduleView) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (view === 'WEEK') start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  if (view === 'MONTH') start.setDate(1);
  const end = new Date(start);
  if (view === 'MONTH') end.setMonth(end.getMonth() + 1);
  else end.setDate(end.getDate() + (view === 'WEEK' ? 7 : 1));
  return { start, end };
}
export function shiftScheduleDate(date: Date, view: ScheduleView, direction: number) {
  const next = new Date(date);
  if (view === 'MONTH') { next.setDate(1); next.setMonth(next.getMonth() + direction); }
  else next.setDate(next.getDate() + direction * (view === 'WEEK' ? 7 : 1));
  return next;
}
