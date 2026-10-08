/** Parse calendar input without silently rolling invalid dates into another month. */
export function localDateTime(date: string, time = '00:00'): Date | null {
 if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
 const [y,m,d]=date.split('-').map(Number), [h,min]=time.split(':').map(Number);
 const value=new Date(`${date}T${time}:00`);
 return Number.isFinite(value.getTime()) && value.getFullYear()===y && value.getMonth()===m-1 && value.getDate()===d && value.getHours()===h && value.getMinutes()===min ? value : null;
}
