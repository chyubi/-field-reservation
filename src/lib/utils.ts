import {
  isAfter,
  isBefore,
  setDay,
  setHours,
  setMinutes,
  setSeconds,
  startOfWeek,
  addWeeks,
  format,
  startOfToday,
} from "date-fns";
import { ko } from "date-fns/locale";

// 1. 테스트를 위해 항상 true 반환 (나중에 다시 복구하세요!)
export function isReservationUnlocked(): boolean {
  return true; // 상시 오픈 모드
}

// 2. 이번 주 날짜 배열 (현황판용)
export function getCurrentWeekDays() {
  const today = startOfToday();
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // 월요일 시작

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    days.push({
      fullDate: format(date, "yyyy-MM-dd"),
      display: format(date, "MM/dd (EE)", { locale: ko }),
      isWeekend: i >= 5,
    });
  }
  return days;
}

// 3. 다음 주 날짜 배열 (예약 폼용)
export function getNextWeekDays() {
  const today = startOfToday();
  const nextWeekStart = startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(nextWeekStart);
    date.setDate(date.getDate() + i);
    days.push({
      fullDate: format(date, "yyyy-MM-dd"),
      display: format(date, "MM/dd (EE)", { locale: ko }),
      isWeekend: i >= 5,
    });
  }
  return days;
}
