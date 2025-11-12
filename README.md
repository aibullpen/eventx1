# 행사 관리 웹서비스 (Event Management System)

매월 반복되는 행사를 효율적으로 관리하고 참석자들에게 초대 이메일을 발송하며 참석 여부를 추적하는 웹 애플리케이션입니다.

## 주요 기능

- 🔐 **Google 계정 기반 인증** - 별도 회원가입 없이 Google 계정으로 로그인
- 📅 **행사 생성 및 관리** - 행사명, 장소, 설명, 강사, 날짜 등 상세 정보 관리
- 👥 **다양한 참석자 등록 방법** - 단일 이메일, Excel 파일, Google Sheets 링크
- 📧 **자동 초대 이메일 발송** - Gmail API를 통한 일괄 이메일 발송
- 📝 **Google Forms 자동 생성** - 참석 확인을 위한 폼 자동 생성
- 📊 **실시간 참석 현황 추적** - 참석자의 응답을 실시간으로 확인
- 🔄 **행사 복사 기능** - 반복되는 행사를 쉽게 생성
- 💾 **Google Sheets 데이터베이스** - 별도 DB 없이 Google Sheets로 데이터 관리

## 기술 스택

### 프론트엔드
- React 18+ with TypeScript
- React Router
- Axios
- React Query
- Vite

### 백엔드
- Node.js 18+ with Express
- TypeScript
- Passport.js (Google OAuth)
- Google APIs (Sheets, Forms, Gmail)

### 배포
- Docker & Docker Compose
- PM2 (프로세스 관리)
- Nginx (프론트엔드 서빙)

## 빠른 시작

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Google Cloud Platform 계정

### 로컬 개발 환경 설정

1. **저장소 클론**

```bash
git clone <repository-url>
cd event-management-system
```

2. **환경 변수 설정**

```bash
cp .env.example .env
```

`.env` 파일을 열고 Google OAuth 정보를 입력합니다.

3. **백엔드 실행**

```bash
cd backend
npm install
npm run dev
```

4. **프론트엔드 실행** (새 터미널)

```bash
cd frontend
npm install
npm run dev
```

5. **브라우저에서 접속**

http://localhost:3000

자세한 내용은 [QUICKSTART.md](./QUICKSTART.md)를 참조하세요.

## Google Cloud 설정

이 애플리케이션을 사용하려면 Google Cloud Console에서 다음을 설정해야 합니다:

1. **새 프로젝트 생성**
2. **API 활성화**
   - Google+ API
   - Google Sheets API
   - Google Forms API
   - Gmail API
3. **OAuth 2.0 클라이언트 ID 생성**
4. **OAuth 동의 화면 구성**

자세한 설정 방법은 [QUICKSTART.md](./QUICKSTART.md)를 참조하세요.

## 프로젝트 구조

```
event-management-system/
├── frontend/              # React 프론트엔드
│   ├── src/
│   │   ├── components/   # React 컴포넌트
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── services/     # API 클라이언트
│   │   └── types/        # TypeScript 타입
│   ├── Dockerfile
│   └── nginx.conf
├── backend/              # Node.js 백엔드
│   ├── src/
│   │   ├── services/    # 비즈니스 로직
│   │   ├── routes/      # API 엔드포인트
│   │   ├── middleware/  # Express 미들웨어
│   │   └── models/      # 데이터 모델
│   ├── Dockerfile
│   └── ecosystem.config.js
├── scripts/             # 유틸리티 스크립트
├── .env.example         # 환경 변수 템플릿
├── .env.production.example
├── docker-compose.yml
├── DEPLOYMENT.md        # 배포 가이드
├── QUICKSTART.md        # 빠른 시작 가이드
└── README.md
```

## 배포

### Docker Compose (권장)

```bash
# 프로덕션 환경 변수 설정
cp .env.production.example .env.production
# .env.production 파일 편집

# 빌드 및 실행
docker-compose build
docker-compose up -d
```

### 기타 배포 옵션

- **Vercel (프론트엔드) + Railway (백엔드)**
- **PM2 (Node.js 프로세스 관리자)**
- **Google Cloud Run**
- **AWS Elastic Beanstalk**

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

## 개발 가이드

### 백엔드 개발

```bash
cd backend
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run lint         # 코드 스타일 체크
npm run lint:fix     # 코드 스타일 자동 수정
```

### 프론트엔드 개발

```bash
cd frontend
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
npm run lint         # 코드 스타일 체크
npm run lint:fix     # 코드 스타일 자동 수정
```

## API 엔드포인트

### 인증
- `POST /api/auth/google` - Google OAuth 시작
- `GET /api/auth/google/callback` - OAuth 콜백
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/logout` - 로그아웃

### 행사
- `POST /api/events` - 행사 생성
- `GET /api/events` - 행사 목록 조회
- `GET /api/events/:id` - 행사 상세 조회
- `POST /api/events/:id/copy` - 행사 복사
- `PUT /api/events/:id` - 행사 수정
- `DELETE /api/events/:id` - 행사 삭제

### 참석자
- `POST /api/events/:id/attendees` - 참석자 추가
- `POST /api/events/:id/attendees/from-excel` - Excel에서 참석자 추가
- `POST /api/events/:id/attendees/from-sheets` - Google Sheets에서 참석자 추가
- `GET /api/events/:id/attendees` - 참석자 목록 조회
- `PUT /api/attendees/:id/status` - 참석 상태 업데이트

### 초대
- `POST /api/events/:id/send-invitations` - 초대 이메일 발송

### 웹훅
- `POST /api/webhooks/form-response` - Google Form 응답 수신

## 환경 변수

### 필수 환경 변수

```env
GOOGLE_CLIENT_ID=           # Google OAuth 클라이언트 ID
GOOGLE_CLIENT_SECRET=       # Google OAuth 클라이언트 시크릿
GOOGLE_REDIRECT_URI=        # OAuth 리디렉션 URI
SESSION_SECRET=             # 세션 암호화 키 (최소 32자)
FRONTEND_URL=               # 프론트엔드 URL
BACKEND_URL=                # 백엔드 URL
NODE_ENV=                   # development 또는 production
PORT=                       # 백엔드 포트 (기본값: 5000)
```

### 선택적 환경 변수

```env
ALLOWED_ORIGINS=            # CORS 허용 오리진 (쉼표로 구분)
COOKIE_SECURE=              # 쿠키 보안 설정 (true/false)
COOKIE_SAMESITE=            # 쿠키 SameSite 설정 (strict/lax/none)
COOKIE_DOMAIN=              # 쿠키 도메인
```

## 보안

- ✅ Google OAuth 2.0 인증
- ✅ HTTPS 필수 (프로덕션)
- ✅ CORS 설정
- ✅ Secure, HttpOnly 쿠키
- ✅ 환경 변수로 민감 정보 관리
- ✅ 입력 값 검증
- ✅ Rate Limiting (선택사항)

## 문제 해결

### CORS 오류
- `.env` 파일의 `FRONTEND_URL`과 `BACKEND_URL` 확인
- 프로덕션 환경에서는 `ALLOWED_ORIGINS` 설정 확인

### OAuth 로그인 실패
- Google Cloud Console에서 OAuth 클라이언트 ID 설정 확인
- 리디렉션 URI가 정확한지 확인
- 테스트 사용자에 본인 이메일 추가 확인

### Google API 권한 오류
- Google Cloud Console에서 필요한 API가 활성화되어 있는지 확인
- OAuth 동의 화면에서 필요한 범위(scope)가 추가되어 있는지 확인

자세한 문제 해결 방법은 [DEPLOYMENT.md](./DEPLOYMENT.md)의 트러블슈팅 섹션을 참조하세요.

## 라이선스

MIT License

## 기여

이슈와 풀 리퀘스트를 환영합니다!

## 지원

문제가 발생하면 GitHub Issues를 통해 문의해주세요.

---

**Made with ❤️ for efficient event management**
