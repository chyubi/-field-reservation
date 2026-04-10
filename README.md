# Field Reservation

## Structure

```text
frontend/  # Next.js frontend
backend/   # Spring Boot backend
```

## Run

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
mvn spring-boot:run
```

프론트는 `NEXT_PUBLIC_API_BASE_URL` 로 백엔드 주소를 받아 외부 API만 호출한다.  
Next 내부 API 라우트와 Supabase 직접 접근 코드는 프론트에서 제거한다.

# Field Reservation Refactoring Guide

## 목적

이 프로젝트는 현재 `Next.js` 안에 화면(`frontend`)과 서버 로직(`backend`)이 함께 들어있는 구조다.  
작은 서비스에서는 빠르게 만들 수 있지만, 기능이 늘어나면 다음 문제가 생긴다.

- 화면 코드와 서버 코드의 책임이 섞여서 수정 범위가 커진다.
- 인증, 권한, 검증 같은 백엔드 정책이 프론트 로직에 묻힌다.
- API를 다른 클라이언트에서 재사용하기 어렵다.
- 운영 중 보안 이슈를 프론트 수정으로만 막으려는 잘못된 구조가 생긴다.

이 문서는 현재 코드베이스를 기준으로:

- 무엇을 백엔드로 옮겨야 하는지
- 프론트와 백엔드를 어떻게 연결해야 하는지
- 어떤 순서로 분리 작업을 진행해야 하는지

를 정리한 작업 기준서다.

## 현재 구조

현재 프로젝트는 하나의 Next.js 앱 안에 다음이 같이 들어 있다.

- 화면 페이지
  - `src/app/page.tsx`
  - `src/app/b-field/page.tsx`
  - `src/app/status/page.tsx`
  - `src/app/admin/page.tsx`
- API 라우트
  - `src/app/api/reservations/route.ts`
  - `src/app/api/reservations/cancel/route.ts`
  - `src/app/api/admin/route.ts`
- 공통 유틸
  - `src/lib/utils.ts`
  - `src/lib/supabase.ts`

즉, 지금은 `BFF(Backend For Frontend)`처럼 Next.js가 프론트와 간단한 백엔드 역할을 동시에 하고 있다.

## 문제의 본질

보통 "프론트와 백엔드를 분리한다"는 말은 단순히 폴더를 나누는 것이 아니다.  
핵심은 **책임을 분리하는 것**이다.

현재 코드에서 가장 먼저 분리해야 하는 책임은 아래와 같다.

- 예약 생성
- 예약 조회
- 예약 취소
- 관리자 조회/삭제
- 예약 가능 시간 검증
- 입력값 검증
- 인증/인가
- 데이터베이스 접근

이 로직들은 모두 백엔드 책임이다.  
프론트는 화면 렌더링, 사용자 입력 수집, API 호출, 상태 표시만 담당해야 한다.

## 무엇을 백엔드로 옮겨야 하나

### 1. 데이터베이스 접근

현재는 `src/lib/supabase.ts`를 통해 API 라우트에서 직접 DB에 접근한다.

이 책임은 백엔드로 이동해야 한다.

- 대상
  - `src/lib/supabase.ts`
  - `src/app/api/**/*`

백엔드에서는 다음 형태 중 하나로 관리한다.

- `services/reservationService.ts`
- `repositories/reservationRepository.ts`
- `infra/supabaseClient.ts`

즉, DB 접근은 프론트 프로젝트 안에 두지 말고 백엔드 프로젝트 내부 계층으로 이동한다.

### 2. 예약 비즈니스 로직

현재 예약 생성은 `src/app/api/reservations/route.ts` 안에 직접 들어 있다.

옮겨야 할 로직:

- 중복 예약 방지
- 예약 가능 시간 체크
- 예약 데이터 저장
- 입력값 유효성 검사
- 취소 비밀번호 검증
- 관리자 삭제 정책

이 로직은 라우트 핸들러가 아니라 서비스 계층으로 분리해야 한다.

예시:

```ts
// backend/src/services/reservationService.ts
export async function createReservation(input: CreateReservationInput) {
  validateReservationInput(input);
  validateReservationWindow();
  await assertSlotAvailable(input.fieldType, input.date, input.timeSlot);
  return reservationRepository.create(input);
}
```

### 3. 인증/보안 로직

현재 관리자 인증은 `src/app/admin/page.tsx`에서만 검사한다.

이건 반드시 백엔드로 이동해야 한다.

- 관리자 로그인 검증
- 관리자 세션 발급
- 관리자 권한 확인
- 관리자 API 접근 제한
- 취소 비밀번호 해시 비교

프론트는 로그인 폼만 보여주고, 실제 검증은 백엔드가 해야 한다.

### 4. 날짜/예약 오픈 정책

`src/lib/utils.ts`의 `isReservationUnlocked()`는 현재 프론트에서도 쓰이고 있다.  
하지만 "예약 가능 여부"는 화면 표시용 보조 정보가 아니라 서버가 강제해야 하는 정책이다.

정리하면:

- 프론트에서 사용: 안내 문구, 버튼 비활성화
- 백엔드에서 사용: 실제 예약 요청 허용/거부

따라서 이 정책은 백엔드 기준으로 먼저 구현하고, 프론트는 백엔드 응답을 따라가야 한다.

## 프론트에 남겨야 하는 것

아래는 프론트 책임으로 남겨야 한다.

- 페이지 라우팅
- UI 렌더링
- 폼 입력 상태 관리
- 로딩/에러/성공 메시지 표시
- API 호출
- 예약 현황 테이블 렌더링

즉, 현재 페이지 파일들은 남길 수 있지만 내부 로직은 줄어들어야 한다.

예를 들어 `src/app/b-field/page.tsx`는 나중에 다음 정도만 남는 게 맞다.

- 날짜 선택 UI
- 시간 선택 UI
- form state
- `POST /reservations` 호출
- 응답 처리

## 권장 분리 구조

### 옵션 1. 저장소 분리

추천 구조:

```text
field-reservation-frontend/
field-reservation-backend/
```

프론트:

- Next.js
- 화면 전용 코드
- API 호출 유틸

백엔드:

- NestJS / Express / Fastify 중 하나
- 인증, 검증, 서비스, DB 접근

이 방식이 가장 명확하다.

### 옵션 2. 모노레포 분리

프로젝트를 한 저장소에 두되 앱만 분리:

```text
apps/
  frontend/
  backend/
packages/
  shared/
```

`shared`에는 다음만 둔다.

- 타입
- DTO
- 상수
- 날짜 포맷 유틸

DB 클라이언트나 서버 비즈니스 로직은 `shared`로 빼면 안 된다.

## 현재 프로젝트에서 실제로 옮길 파일

### 백엔드로 이동 대상

- `src/app/api/reservations/route.ts`
- `src/app/api/reservations/cancel/route.ts`
- `src/app/api/admin/route.ts`
- `src/lib/supabase.ts`

### 일부만 남기고 정책을 백엔드 기준으로 바꿔야 하는 대상

- `src/lib/utils.ts`
  - `getCurrentWeekDays`, `getNextWeekDays`는 프론트에서도 사용 가능
  - `isReservationUnlocked`는 백엔드 정책 기준으로 재구성 필요

### 프론트에 남길 대상

- `src/app/page.tsx`
- `src/app/b-field/page.tsx`
- `src/app/status/page.tsx`
- `src/app/admin/page.tsx`
- `src/components/**/*`

단, 프론트 페이지는 DB나 보안 정책을 직접 알면 안 된다.

## 연결 방식

프론트와 백엔드 연결은 HTTP API 기준으로 단순하게 가는 것이 좋다.

### 프론트에서 호출할 API 예시

```text
GET    /api/v1/reservations?fieldType=B&week=next
POST   /api/v1/reservations
POST   /api/v1/reservations/{id}/cancel
POST   /api/v1/admin/login
GET    /api/v1/admin/reservations
DELETE /api/v1/admin/reservations/{id}
GET    /api/v1/reservation-policy
```

프론트는 이 API만 알고 있으면 된다.

### 프론트 코드 예시

```ts
const res = await fetch(`${API_BASE_URL}/api/v1/reservations`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fieldType: "B",
    reservationDate: selectedDay,
    timeSlot: selectedTime,
    userName,
    clubName,
    contact,
    password,
  }),
});
```

즉, 프론트는 `Supabase`를 직접 몰라도 되고, 오직 API 응답만 처리하면 된다.

## 추천 백엔드 계층 구조

```text
backend/src/
  controllers/
    reservationController.ts
    adminController.ts
  services/
    reservationService.ts
    adminService.ts
  repositories/
    reservationRepository.ts
  middleware/
    authMiddleware.ts
  utils/
    reservationPolicy.ts
    password.ts
  infra/
    supabaseClient.ts
  types/
    reservation.ts
```

역할은 다음처럼 나눈다.

- controller: HTTP 요청/응답 처리
- service: 비즈니스 규칙 처리
- repository: DB 접근
- middleware: 인증/권한
- utils: 정책/해시 등 보조 기능

## 단계별 분리 Workflow

### 1단계. API 명세 먼저 고정

코드를 옮기기 전에 API 계약부터 정한다.

- 요청 바디 형식
- 응답 형식
- 에러 코드
- 인증 방식

예시:

```json
{
  "error": {
    "code": "RESERVATION_CONFLICT",
    "message": "이미 예약된 시간입니다."
  }
}
```

프론트와 백엔드를 나눌 때 가장 많이 깨지는 부분이 API 응답 형태다.  
먼저 문서화하고 그 다음 구현해야 한다.

### 2단계. 백엔드 프로젝트 생성

새 백엔드 앱을 만들고 기본 구조를 잡는다.

- 서버 프레임워크 선택
- 환경변수 정의
- 라우트 기본 구성
- DB 연결 구성

필수 환경변수 예시:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD_HASH=
```

중요한 점:

- 지금처럼 `NEXT_PUBLIC_*`로 서버 보안값을 다루면 안 된다.
- 관리자 비밀번호도 평문 저장이 아니라 해시 비교로 바꿔야 한다.

### 3단계. 기존 Next API 로직을 서비스 계층으로 이동

현재 `route.ts`에 있는 로직을 그대로 복사하지 말고 아래처럼 쪼갠다.

- `reservationController`
- `reservationService`
- `reservationRepository`

이 단계에서 해야 하는 핵심 작업:

- 입력 검증 추가
- 예약 가능 시간 서버 검증 추가
- 취소 비밀번호 해시 처리
- 관리자 인증 강제

### 4단계. 프론트의 fetch 대상 변경

기존:

- `/api/reservations`
- `/api/admin`

변경:

- `${API_BASE_URL}/api/v1/reservations`
- `${API_BASE_URL}/api/v1/admin/reservations`

프론트에서는 공통 API 클라이언트를 두는 것이 좋다.

예시:

```ts
// frontend/src/lib/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
```

### 5단계. 인증 방식 연결

관리자 페이지는 아래 흐름으로 바꾼다.

1. 프론트에서 로그인 폼 제출
2. 백엔드 `POST /admin/login` 호출
3. 백엔드가 세션 또는 토큰 발급
4. 이후 관리자 API는 인증 토큰 또는 쿠키 기반 접근

현재처럼 프론트에서 문자열 비교하는 방식은 제거한다.

### 6단계. Next 내부 API 제거

백엔드가 안정화되면 Next 내부의 `src/app/api`는 제거한다.

남겨도 되는 경우:

- 프론트 전용 프록시가 필요한 경우
- CORS 우회나 쿠키 중계가 필요한 경우

하지만 이 프로젝트는 처음부터 분리할 목적이라면 가능하면 제거하는 편이 더 깔끔하다.

## 화면별 책임 재정의

### 홈 화면

- 예약 오픈 여부 표시
- 백엔드 정책 조회 결과를 화면에 반영

### 예약 화면

- 사용자 입력 수집
- 가능한 시간대 UI 표시
- 예약 생성 API 호출

### 현황 화면

- 주간 예약 목록 조회
- 취소 요청 API 호출

### 관리자 화면

- 로그인 API 호출
- 관리자 전용 목록 조회
- 관리자 삭제 API 호출

## 먼저 고쳐야 할 보안 포인트

분리 작업 전에 반드시 인지해야 할 문제:

- 관리자 API가 서버 인증 없이 열려 있다.
- 예약 오픈 시간 제한이 서버에서 강제되지 않는다.
- 취소 비밀번호가 평문 저장/비교된다.
- 입력값 검증이 거의 없다.

즉, 단순한 폴더 이동이 아니라 **백엔드 정책 강화**가 같이 들어가야 한다.

## 추천 작업 순서

1. API 명세서 작성
2. 백엔드 앱 생성
3. 예약/취소/관리자 API 이관
4. 인증/검증/해시 처리 추가
5. 프론트 fetch 주소 전환
6. Next 내부 API 제거
7. README와 `.env.example` 정리

## 결론

이 프로젝트에서 프론트와 백엔드를 나누려면, 가장 먼저 `src/app/api`와 `src/lib/supabase.ts`에 있는 책임을 백엔드로 이동해야 한다.  
프론트는 화면과 상태 관리만 담당하고, 예약 생성/취소/관리자 기능/정책 검증/DB 접근은 전부 백엔드가 담당해야 한다.

핵심 기준은 하나다.

- 프론트: 보여주고 입력받고 호출한다.
- 백엔드: 검증하고 판단하고 저장한다.

이 기준으로 정리하면 현재 구조에서 무엇을 옮겨야 하는지가 명확해진다.
