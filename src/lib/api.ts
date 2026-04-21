const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  code?: string;
  message?: string;
  timestamp?: string;
};

export type Reservation = {
  id: string;
  fieldType: "A" | "B";
  reservationDate: string;
  timeSlot: string;
  userName: string;
  clubName: string;
  contact: string;
  createdAt: string;
};

export type ReservationPolicy = {
  unlocked: boolean;
  openDay: string;
  openTime: string;
  closeTime: string;
  allowedClubs: string[];
  allowedClubCount: number;
};

export type AdminLoginResponse = {
  token: string;
};

function buildUrl(path: string) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }
  return `${API_BASE_URL}${path}`;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = response.headers
    .get("content-type")
    ?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const errorPayload = payload as ApiErrorResponse | null;
    throw new Error(
      errorPayload?.message ?? "요청 처리 중 오류가 발생했습니다.",
    );
  }

  const successPayload = payload as ApiSuccessResponse<T> | null;
  if (!successPayload?.success) {
    throw new Error("응답 형식이 올바르지 않습니다.");
  }

  return successPayload.data;
}
