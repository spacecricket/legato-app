import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { DateTime } from 'luxon'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatTimestamp(date: Date, { weekday = false } = {}) {
  const dt = DateTime.fromJSDate(date)
  if (!dt.isValid) return ''
  return dt.hasSame(DateTime.now(), 'day')
    ? dt.toLocaleString(DateTime.TIME_SIMPLE)
    : dt.toLocaleString(weekday ? DateTime.DATETIME_MED_WITH_WEEKDAY : DateTime.DATE_SHORT)
}
