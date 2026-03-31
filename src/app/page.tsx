"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isReservationUnlocked } from "@/lib/utils";
import {
  setDay,
  setHours,
  setMinutes,
  setSeconds,
  differenceInSeconds,
} from "date-fns";

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const checkTime = () => {
      if (isReservationUnlocked()) {
        setUnlocked(true);
        setCountdown("");
      } else {
        setUnlocked(false);
        const now = new Date();
        // 다음 오픈 시간: 일요일 20시
        let nextSundayOpen = setSeconds(
          setMinutes(setHours(setDay(now, 0), 20), 0),
          0,
        );
        let nextSundayClose = setSeconds(
          setMinutes(setHours(setDay(now, 0), 22), 0),
          0,
        );

        // 이미 이번 주 일요일 밤 10시가 지났다면 다음 주 일요일로 타겟 변경
        if (now > nextSundayClose) {
          nextSundayOpen.setDate(nextSundayOpen.getDate() + 7);
        }

        const diff = Math.max(0, differenceInSeconds(nextSundayOpen, now));
        const days = Math.floor(diff / (3600 * 24));
        const hours = Math.floor((diff % (3600 * 24)) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setCountdown(`${days}일 ${hours}시간 ${minutes}분 ${seconds}초 남음`);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ... (상단 import 생략)
  // 중략: 타이머 로직은 유지하되 텍스트만 '풋살장'으로 변경

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        금오공대 풋살장 예약 시스템
      </h1>

      {!unlocked ? (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-md border border-gray-100">
          <h2 className="text-xl text-red-500 font-bold mb-3">
            예약 오픈 전입니다 🔒
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            매주 일요일 20:00 ~ 22:00에 오픈됩니다.
          </p>
          <div className="text-2xl font-mono font-bold bg-gray-100 text-gray-800 p-4 rounded-lg">
            {countdown}
          </div>
          <Link
            href="/status"
            className="block mt-6 bg-blue-600 text-white py-4 rounded-xl font-bold"
          >
            이번 주 풋살장 예약 현황 보기
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-md grid gap-5">
          <div className="text-center mb-2">
            <span className="bg-green-100 text-green-700 px-5 py-2 rounded-full font-bold text-sm animate-pulse">
              현재 예약 오픈 중! (22:00 마감) 🔓
            </span>
          </div>
          <Link
            href="/b-field"
            className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold py-5 rounded-xl shadow-md"
          >
            풋살장 예약하기
          </Link>
          <Link
            href="/status"
            className="block w-full text-center bg-gray-200 text-gray-800 text-sm font-bold py-3 rounded-xl mt-2"
          >
            예약 현황 보기
          </Link>
        </div>
      )}
    </div>
  );
}
