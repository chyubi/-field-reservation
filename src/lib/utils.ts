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

// 1. 일요일 20:00 ~ 22:00 예약 오픈 여부 (복구 완료)
export function isReservationUnlocked(): boolean {
  const now = new Date();

  // setDay(now, 0)은 해당 주의 '일요일'을 의미합니다.
  const sunday20 = setSeconds(setMinutes(setHours(setDay(now, 0), 20), 0), 0);
  const sunday22 = setSeconds(setMinutes(setHours(setDay(now, 0), 22), 0), 0);

  return isAfter(now, sunday20) && isBefore(now, sunday22);
}

// 2. 이번 주 날짜 배열 (현황판용)
export function getCurrentWeekDays() {
  const today = startOfToday();
  const start = startOfWeek(today, { weekStartsOn: 1 }); // 월요일 시작
  return getWeekDays(start);
}

// 3. 다음 주 날짜 배열 (예약 폼용)
export function getNextWeekDays() {
  const today = startOfToday();
  const start = startOfWeek(addWeeks(today, 1), { weekStartsOn: 1 });
  return getWeekDays(start);
}

// 공통 날짜 생성 함수
function getWeekDays(startDate: Date) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push({
      fullDate: format(date, "yyyy-MM-dd"),
      display: format(date, "MM/dd(EE)", { locale: ko }),
      isWeekend: i >= 5,
    });
  }
  return days;
}
