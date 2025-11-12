# 빠른 시작 가이드 (Quick Start Guide)

## 로컬 개발 환경 설정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd event-management-system
```

### 2. 환경 변수 설정

```bash
# 루트 디렉토리에서
cp .env.example .env
```

`.env` 파일을 열고 Google OAuth 정보를 입력합니다:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=your_random_session_secret_here
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
NODE_ENV=development
PORT=5000
```

### 3. 백엔드 실행

```bash
cd backend
npm install
npm run dev
```

백엔드가 http://localhost:5000 에서 실행됩니다.

### 4. 프론트엔드 실행 (새 터미널)

```bash
cd frontend
npm install
npm run dev
```

프론트엔드가 http://localhost:3000 에서 실행됩니다.

### 5. 브라우저에서 접속

http://localhost:3000 으로 접속하여 애플리케이션을 사용합니다.

---

## Google Cloud 설정 (필수)

### 1. Google Cloud Console 접속

https://console.cloud.google.com/ 에 접속합니다.

### 2. 새 프로젝트 생성

1. 프로젝트 선택 → "새 프로젝트"
2. 프로젝트 이름 입력
3. "만들기" 클릭

### 3. API 활성화

좌측 메뉴 → "API 및 서비스" → "라이브러리"에서 다음 API들을 활성화:

- Google+ API
- Google Sheets API
- Google Forms API
- Gmail API

### 4. OAuth 클라이언트 ID 생성

1. "API 및 서비스" → "사용자 인증 정보"
2. "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
3. 애플리케이션 유형: "웹 애플리케이션"
4. 승인된 리디렉션 URI 추가:
   - `http://localhost:5000/api/auth/google/callback`
5. 클라이언트 ID와 보안 비밀번호를 `.env` 파일에 복사

### 5. OAuth 동의 화면 구성

1. "OAuth 동의 화면" 탭
2. 사용자 유형: "외부" 선택
3. 앱 정보 입력
4. 범위 추가:
   - `userinfo.email`
   - `userinfo.profile`
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/forms`
   - `https://www.googleapis.com/auth/gmail.send`
5. 테스트 사용자에 본인 이메일 추가

---

## 프로덕션 배포

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

### Docker Compose로 빠른 배포

```bash
# 환경 변수 설정
cp .env.production.example .env.production
# .env.production 파일 편집

# 빌드 및 실행
docker-compose build
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

---

## 문제 해결

### 백엔드가 시작되지 않음

- `.env` 파일이 올바르게 설정되어 있는지 확인
- `npm install`이 완료되었는지 확인
- 포트 5000이 이미 사용 중인지 확인

### OAuth 로그인 실패

- Google Cloud Console에서 OAuth 클라이언트 ID가 올바르게 설정되어 있는지 확인
- 리디렉션 URI가 정확한지 확인
- 테스트 사용자에 본인 이메일이 추가되어 있는지 확인

### CORS 오류

- 백엔드가 실행 중인지 확인
- `.env` 파일의 `FRONTEND_URL`과 `BACKEND_URL`이 올바른지 확인

---

## 다음 단계

1. [DEPLOYMENT.md](./DEPLOYMENT.md) - 프로덕션 배포 가이드
2. [backend/README.md](./backend/README.md) - 백엔드 API 문서
3. [frontend/README.md](./frontend/README.md) - 프론트엔드 개발 가이드
