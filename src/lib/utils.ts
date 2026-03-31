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

// 1. 일요일 20:00 ~ 22:00 예약 오픈 여부
export function isReservationUnlocked(): boolean {
  const now = new Date();
  // setDay(now, 0)은 이번 주 일요일을 의미합니다.
  const sunday20 = setSeconds(setMinutes(setHours(setDay(now, 0), 20), 0), 0);
  const sunday22 = setSeconds(setMinutes(setHours(setDay(now, 0), 22), 0), 0);

  return isAfter(now, sunday20) && isBefore(now, sunday22);
}

// 2. "이번 주" 월~일 날짜 배열 생성 (현재 날짜가 포함된 주의 월~일)
export function getCurrentWeekDays() {
  const today = startOfToday();
  // startOfWeek를 사용하여 이번 주 월요일(weekStartsOn: 1)을 구합니다.
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    days.push({
      fullDate: format(date, "yyyy-MM-dd"),
      display: format(date, "MM/dd (EE)", { locale: ko }),
      isWeekend: i >= 5, // 토(5), 일(6)
    });
  }
  return days;
}

// 3. 예약 시 선택할 "다음 주" 날짜 배열 (오늘 기준 다음 주의 월~일)
export function getNextWeekDays() {
  const today = startOfToday();
  // startOfWeek와 addWeeks를 조합하여 다음 주 월요일을 구합니다.
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
