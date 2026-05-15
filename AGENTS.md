# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

**Next.js 16 specific:** Use `src/proxy.ts` instead of `middleware.ts`. The file must export `proxy` (not `middleware`) and a `config` object.

---

# Project: Togate 사내앱

모바일 웹 기반 PWA 사내앱. AI 음성 회의록, 일정/연차 관리, 공지사항, 비상연락망, 웹 푸시 알림 포함.

## 기술 스택

- **Next.js 16.2.2** (App Router) + TypeScript + React 19.2.4
- Tailwind CSS v4 (PostCSS 방식, `@tailwindcss/postcss`)
- Auth.js v5 (`next-auth@beta`) — JWT 세션
- **Prisma 7** + PostgreSQL + `@prisma/adapter-pg` — 어댑터 없으면 런타임 에러
- AI: `gemini-2.5-flash` 기본, `AI_PROVIDER=openai` 시 `gpt-4o-mini` 전환
- 웹 푸시: `web-push` 패키지
- Capacitor 8 — iOS 네이티브 앱 래퍼

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `src/proxy.ts` | 인증 게이트, 초기 비밀번호 강제 변경, admin 권한 체크 |
| `src/lib/db.ts` | Prisma 클라이언트 (PrismaPg 어댑터) |
| `src/lib/auth.ts` | NextAuth 설정 |
| `src/lib/ai/provider.ts` | AI 추상화 레이어 (Gemini / OpenAI) |
| `src/lib/push.ts` | 웹 푸시 발송 |
| `prisma/schema.prisma` | DB 스키마 |
| `prisma.config.ts` | Prisma 7 설정 (DATABASE_URL 등) |
| `src/generated/prisma/client.ts` | Prisma 생성 클라이언트 (gitignore됨) |

## Prisma 7 규칙

- `generator client { provider = "prisma-client"; output = "../src/generated/prisma" }` 필수
- datasource에 `url = env(...)` 작성 불필요 — `prisma.config.ts`가 처리
- import 경로: `@/generated/prisma/client`
- 빌드 스크립트: `prisma generate && next build --webpack`

## DB 모델

- `User` — 이메일/비밀번호, role(ADMIN/EMPLOYEE), annualLeave, passwordChanged
- `Employee` — 직원 정보(이름, 전화, 직책), User와 1:1 연결
- `LeaveRequest` — 연차/반차(ANNUAL/HALF_DAY_AM/HALF_DAY_PM), PENDING/APPROVED/REJECTED
- `Schedule` — 일정, inviteeIds(Employee ID 배열), allDay, leaveRequestId
- `MeetingMinute` — AI 회의록, keywords, speakerMap JSON
- `MeetingFolder` — PERSONAL/SHARED, deletedAt 소프트딜리트
- `Notice` — 공지사항
- `Notification` — 앱 내 알림
- `PushSubscription` — 웹 푸시 구독

## 라우트 구조

```
/ (홈)
/login
/settings/password        ← 초기 로그인 시 강제 이동
/calendar /calendar/new /calendar/[id]
/contacts /contacts/[id] /contacts/[id]/edit
/meeting /meeting/new /meeting/new/record /meeting/new/result
/meeting/[id] /meeting/folder/[id]
/notice /notice/new /notice/[id] /notice/[id]/edit
/notification
/schedule /schedule/week /schedule/new /schedule/[id] /schedule/[id]/edit
/users /users/new /users/new/profile
/menu
/admin/leave /admin/leave/approve /admin/leave/[id]
```

## 공용 컴포넌트 (`src/components/common/`)

- `Dialog.tsx` — **`confirm()` 금지, 항상 이 컴포넌트 사용**
  ```tsx
  <Dialog
    message="내용\n두번째줄"
    buttons={[
      { label: "취소", onClick: () => setOpen(false) },
      { label: "확인", variant: "primary", onClick: handleConfirm },
    ]}
  />
  ```
- `Button.tsx`, `Input.tsx`, `BoxInput.tsx`, `FieldLabel.tsx`
- `BottomButtonBar.tsx`, `EmptyState.tsx`, `AdminBadge.tsx`

## Vercel Cron (vercel.json)

- `/api/cron/reset-annual-leave` — 매년 12/31 15:00 UTC
- `/api/cron/daily-schedule-reminder` — 매일 00:00 UTC

## 개발 명령어

```bash
npm run dev          # next dev --webpack
npm run db:migrate   # prisma migrate dev
npm run db:seed      # 초기 관리자 계정 생성 (admin@togate.com / admin1234!)
npm run db:studio    # Prisma Studio
```
