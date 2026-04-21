"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiRequest, ReservationPolicy } from "@/lib/api";

export default function HomePage() {
  const [unlocked, setUnlocked] = useState(false);
  const [allowedClubs, setAllowedClubs] = useState<string[]>([]);
  const [allowedClubCount, setAllowedClubCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      try {
        const policy = await apiRequest<ReservationPolicy>("/api/v1/reservation-policy");
        if (mounted) {
          setUnlocked(policy.unlocked);
          setAllowedClubs(policy.allowedClubs);
          setAllowedClubCount(policy.allowedClubCount);
        }
      } catch {
        if (mounted) {
          setUnlocked(false);
          setAllowedClubs([]);
          setAllowedClubCount(0);
        }
      }
    };

    checkStatus();
    const timer = setInterval(checkStatus, 60000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-black mb-2 text-emerald-600">
          풋살장 예약
        </h1>
        <p className="text-gray-400 text-sm mb-10 font-medium">
          동아리 전용 예약 시스템
        </p>

        {!unlocked ? (
          /* 예약 닫힘 상태 */
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              현재 예약 기간이 아닙니다
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              매주{" "}
              <span className="text-emerald-600 font-bold">
                일요일 20:00 ~ 22:00
              </span>
              에만
              <br />
              다음 주 예약을 진행할 수 있습니다.
            </p>
            <Link
              href="/status"
              className="block w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
            >
              현재 예약 현황 보기
            </Link>
          </div>
        ) : (
          /* 예약 오픈 상태 */
          <div className="space-y-4">
            <div className="bg-emerald-100 text-emerald-700 py-2 px-4 rounded-full text-xs font-bold animate-pulse inline-block mb-2">
              OPEN: 예약 가능 시간입니다! (22:00 마감)
            </div>
            <Link
              href="/b-field"
              className="block w-full py-6 bg-emerald-600 text-white rounded-3xl font-black text-xl shadow-lg shadow-emerald-200 hover:scale-[1.02] transition-all"
            >
              풋살장 예약하기 ⚽️
            </Link>
            <Link
              href="/status"
              className="block w-full py-4 bg-white text-gray-400 rounded-2xl font-bold border border-gray-100"
            >
              실시간 현황판 보기
            </Link>
          </div>
        )}

        <div className="mt-6 rounded-3xl border border-emerald-100 bg-white p-5 text-left shadow-sm">
          <h3 className="mb-3 text-sm font-extrabold text-gray-800">
            예약 안내
          </h3>
          <p className="text-sm leading-6 text-gray-600">
            현재는 아래 허용 동아리의 정확한 동아리명을 입력한 경우에만
            예약할 수 있습니다.
          </p>
          <p className="mt-2 text-xs font-semibold text-emerald-700">
            현재 허용 동아리 {allowedClubCount}개
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {allowedClubs.map((club) => (
              <span
                key={club}
                className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
              >
                {club}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-gray-500">
            이 부분은 추후 로그인 기반 예약 방식으로 변경할 예정이며,
            빠른 시일 내에 예약 편의성을 더 높이겠습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
