# 배포 가이드 (Deployment Guide)

이 문서는 행사 관리 웹서비스를 프로덕션 환경에 배포하는 방법을 설명합니다.

## 목차

1. [사전 준비](#사전-준비)
2. [환경 변수 설정](#환경-변수-설정)
3. [Google Cloud 설정](#google-cloud-설정)
4. [배포 방법](#배포-방법)
5. [모니터링 및 유지보수](#모니터링-및-유지보수)

---

## 사전 준비

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Google Cloud Platform 계정
- 도메인 (프로덕션 배포 시)
- SSL 인증서 (HTTPS 필수)

### 권장 플랫폼

**프론트엔드:**
- Vercel (권장)
- Netlify
- AWS S3 + CloudFront
- Google Cloud Storage + CDN

**백엔드:**
- Railway (권장)
- Render
- Google Cloud Run
- AWS Elastic Beanstalk
- Heroku

---

## 환경 변수 설정

### 1. 프로덕션 환경 변수 파일 생성

루트 디렉토리에 `.env.production` 파일을 생성합니다:

```bash
cp .env.production.example .env.production
```

### 2. 환경 변수 설정

`.env.production` 파일을 열고 다음 값들을 설정합니다:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/api/auth/google/callback

# Session Configuration (최소 32자 이상의 랜덤 문자열)
SESSION_SECRET=generate_a_strong_random_secret_here

# Application URLs
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com

# Node Environment
NODE_ENV=production

# Port Configuration
PORT=5000

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Session Cookie Configuration
COOKIE_SECURE=true
COOKIE_SAMESITE=strict
```

### 3. 강력한 SESSION_SECRET 생성

다음 명령어로 안전한 세션 시크릿을 생성할 수 있습니다:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Google Cloud 설정

### 1. Google Cloud Console 접속

[Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.

### 2. 새 프로젝트 생성

1. 프로젝트 선택 드롭다운 클릭
2. "새 프로젝트" 클릭
3. 프로젝트 이름 입력 (예: "event-management-prod")
4. "만들기" 클릭

### 3. API 활성화

다음 API들을 활성화합니다:

1. **Google+ API** (OAuth 인증용)
2. **Google Sheets API** (데이터 저장용)
3. **Google Forms API** (참석 확인 폼용)
4. **Gmail API** (이메일 발송용)

각 API 활성화 방법:
- 좌측 메뉴에서 "API 및 서비스" > "라이브러리" 선택
- API 이름 검색
- "사용 설정" 클릭

### 4. OAuth 2.0 클라이언트 ID 생성

1. "API 및 서비스" > "사용자 인증 정보" 선택
2. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 클릭
3. 애플리케이션 유형: "웹 애플리케이션" 선택
4. 이름 입력 (예: "Event Management Production")
5. 승인된 자바스크립트 원본 추가:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
6. 승인된 리디렉션 URI 추가:
   - `https://api.yourdomain.com/api/auth/google/callback`
7. "만들기" 클릭
8. 클라이언트 ID와 클라이언트 보안 비밀번호를 `.env.production`에 저장

### 5. OAuth 동의 화면 구성

1. "OAuth 동의 화면" 탭 선택
2. 사용자 유형: "외부" 선택 (또는 조직 내부용이면 "내부")
3. 앱 정보 입력:
   - 앱 이름: "행사 관리 시스템"
   - 사용자 지원 이메일
   - 개발자 연락처 정보
4. 범위 추가:
   - `userinfo.email`
   - `userinfo.profile`
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/forms`
   - `https://www.googleapis.com/auth/gmail.send`
5. 테스트 사용자 추가 (개발 단계)
6. "저장 후 계속" 클릭

---

## 배포 방법

### 방법 1: Docker Compose (권장 - 단일 서버)

#### 1. 서버 준비

```bash
# Docker 및 Docker Compose 설치 확인
docker --version
docker-compose --version
```

#### 2. 프로젝트 클론

```bash
git clone <repository-url>
cd event-management-system
```

#### 3. 환경 변수 설정

```bash
cp .env.production.example .env.production
# .env.production 파일 편집
```

#### 4. 빌드 및 실행

```bash
# 이미지 빌드
docker-compose build

# 컨테이너 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

#### 5. 상태 확인

```bash
# 컨테이너 상태 확인
docker-compose ps

# 헬스 체크
curl http://localhost:5000/health
curl http://localhost/health
```

#### 6. 중지 및 재시작

```bash
# 중지
docker-compose down

# 재시작
docker-compose restart

# 업데이트 후 재배포
git pull
docker-compose build
docker-compose up -d
```

---

### 방법 2: Vercel (프론트엔드) + Railway (백엔드)

#### 백엔드 배포 (Railway)

1. [Railway](https://railway.app/) 계정 생성
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 저장소 연결
5. 환경 변수 설정:
   - Settings > Variables에서 `.env.production`의 모든 변수 추가
6. Root Directory를 `backend`로 설정
7. Build Command: `npm run build`
8. Start Command: `npm start`
9. 배포 완료 후 도메인 확인 (예: `your-app.railway.app`)

#### 프론트엔드 배포 (Vercel)

1. [Vercel](https://vercel.com/) 계정 생성
2. "New Project" 클릭
3. GitHub 저장소 연결
4. Framework Preset: "Vite" 선택
5. Root Directory: `frontend`
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. 환경 변수 설정:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
9. "Deploy" 클릭
10. 배포 완료 후 도메인 확인

#### 도메인 연결

**Vercel (프론트엔드):**
1. Project Settings > Domains
2. 커스텀 도메인 추가 (예: `yourdomain.com`)
3. DNS 레코드 설정 (Vercel이 제공하는 값으로)

**Railway (백엔드):**
1. Settings > Domains
2. 커스텀 도메인 추가 (예: `api.yourdomain.com`)
3. DNS 레코드 설정

---

### 방법 3: PM2 (Node.js 프로세스 관리자)

#### 1. PM2 설치

```bash
npm install -g pm2
```

#### 2. 백엔드 빌드

```bash
cd backend
npm install
npm run build
```

#### 3. PM2로 실행

```bash
# 환경 변수 파일 지정하여 실행
pm2 start ecosystem.config.js --env production

# 또는 직접 실행
pm2 start dist/index.js --name event-management-backend -i max
```

#### 4. PM2 관리 명령어

```bash
# 상태 확인
pm2 status

# 로그 확인
pm2 logs event-management-backend

# 재시작
pm2 restart event-management-backend

# 중지
pm2 stop event-management-backend

# 삭제
pm2 delete event-management-backend

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

#### 5. 프론트엔드 빌드 및 서빙

```bash
cd frontend
npm install
npm run build

# Nginx 또는 다른 웹 서버로 dist 폴더 서빙
# nginx.conf 파일을 Nginx 설정에 복사
sudo cp nginx.conf /etc/nginx/sites-available/event-management
sudo ln -s /etc/nginx/sites-available/event-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 방법 4: Google Cloud Run

#### 백엔드 배포

```bash
cd backend

# Google Cloud 프로젝트 설정
gcloud config set project YOUR_PROJECT_ID

# 컨테이너 이미지 빌드
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/event-management-backend

# Cloud Run에 배포
gcloud run deploy event-management-backend \
  --image gcr.io/YOUR_PROJECT_ID/event-management-backend \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "GOOGLE_CLIENT_ID=your_client_id" \
  --set-env-vars "GOOGLE_CLIENT_SECRET=your_client_secret" \
  # ... 기타 환경 변수
```

#### 프론트엔드 배포

```bash
cd frontend

# 빌드
npm run build

# Google Cloud Storage 버킷 생성
gsutil mb gs://your-bucket-name

# 빌드 파일 업로드
gsutil -m cp -r dist/* gs://your-bucket-name

# 공개 액세스 설정
gsutil iam ch allUsers:objectViewer gs://your-bucket-name

# Cloud CDN 설정 (선택사항)
```

---

## SSL/HTTPS 설정

### Let's Encrypt (무료 SSL)

```bash
# Certbot 설치
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

---

## 모니터링 및 유지보수

### 헬스 체크 엔드포인트

- 백엔드: `https://api.yourdomain.com/health`
- 프론트엔드: `https://yourdomain.com/health`

### 로그 확인

**Docker Compose:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**PM2:**
```bash
pm2 logs event-management-backend
```

**Railway:**
- Dashboard > Deployments > Logs

**Vercel:**
- Dashboard > Deployments > Function Logs

### 백업

Google Sheets가 데이터베이스로 사용되므로:
1. Google Drive의 자동 백업 기능 활용
2. 정기적으로 시트 복사본 생성
3. Google Takeout으로 데이터 내보내기

### 업데이트 배포

```bash
# 코드 업데이트
git pull origin main

# Docker Compose
docker-compose build
docker-compose up -d

# PM2
cd backend
npm run build
pm2 restart event-management-backend
```

### 성능 모니터링

- Google Cloud Monitoring 사용
- PM2 Plus (유료) 사용
- New Relic, Datadog 등 APM 도구 연동

---

## 트러블슈팅

### CORS 오류

1. `.env.production`의 `ALLOWED_ORIGINS`에 프론트엔드 도메인이 포함되어 있는지 확인
2. 백엔드 로그에서 CORS 관련 오류 확인
3. 브라우저 개발자 도구의 Network 탭에서 OPTIONS 요청 확인

### OAuth 리디렉션 오류

1. Google Cloud Console에서 승인된 리디렉션 URI 확인
2. `.env.production`의 `GOOGLE_REDIRECT_URI`가 정확한지 확인
3. HTTPS 사용 여부 확인 (프로덕션에서는 필수)

### Google API 권한 오류

1. Google Cloud Console에서 필요한 API가 모두 활성화되어 있는지 확인
2. OAuth 동의 화면에서 필요한 범위(scope)가 추가되어 있는지 확인
3. 서비스 계정 키가 올바르게 설정되어 있는지 확인

### 세션 유지 문제

1. `COOKIE_SECURE=true`인 경우 HTTPS 사용 확인
2. `COOKIE_SAMESITE` 설정 확인
3. 프론트엔드와 백엔드 도메인 확인 (서브도메인 사용 시 `COOKIE_DOMAIN` 설정)

---

## 보안 체크리스트

- [ ] 모든 환경 변수가 안전하게 저장되어 있음
- [ ] SESSION_SECRET가 강력한 랜덤 문자열임
- [ ] HTTPS가 활성화되어 있음
- [ ] CORS가 올바르게 설정되어 있음
- [ ] Google OAuth 리디렉션 URI가 정확함
- [ ] 프로덕션 환경에서 소스맵이 비활성화되어 있음
- [ ] Rate limiting이 설정되어 있음 (선택사항)
- [ ] 로그에 민감한 정보가 포함되지 않음
- [ ] 정기적인 의존성 업데이트 계획이 있음

---

## 추가 리소스

- [Google Cloud Platform 문서](https://cloud.google.com/docs)
- [Docker 문서](https://docs.docker.com/)
- [PM2 문서](https://pm2.keymetrics.io/docs/)
- [Vercel 문서](https://vercel.com/docs)
- [Railway 문서](https://docs.railway.app/)
- [Nginx 문서](https://nginx.org/en/docs/)

---

## 지원

문제가 발생하면 다음을 확인하세요:
1. 로그 파일
2. 환경 변수 설정
3. Google Cloud Console의 API 할당량
4. 네트워크 연결 상태

추가 도움이 필요하면 프로젝트 저장소의 Issues 섹션을 이용하세요.
