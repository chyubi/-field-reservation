import {
  isAfter,
  setDay,
  setHours,
  setMinutes,
  setSeconds,
  startOfWeek,
  addWeeks,
  format,
} from "date-fns";

// 1. 일요일 21시 예약 락(Lock) 해제 여부 확인
export function isReservationUnlocked(): boolean {
  const now = new Date();

  // 이번 주 일요일(0) 21:00:00 객체 생성
  const sunday21 = setSeconds(setMinutes(setHours(setDay(now, 0), 21), 0), 0);

  // 현재 시간이 이번 주 일요일 21시 이후인지 반환 (true면 락 해제)
  return isAfter(now, sunday21);
}

// 2. 예약 가능한 다음 주 월~금 날짜 배열 구하기 (['2026-04-13', '2026-04-14', ...])
export function getNextWeekDays(): string[] {
  const now = new Date();
  // 다음 주 월요일 시작일 구하기 (weekStartsOn: 1은 월요일을 한 주의 시작으로 봄)
  const nextWeekStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });

  const days: string[] = [];
  // 월(0) 부터 금(4) 까지 5일치 날짜 생성
  for (let i = 0; i < 5; i++) {
    const date = new Date(nextWeekStart);
    date.setDate(date.getDate() + i);
    days.push(format(date, "yyyy-MM-dd"));
  }
  return days;
}
