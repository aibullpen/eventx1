# 배포 체크리스트 (Deployment Checklist)

프로덕션 배포 전에 다음 항목들을 확인하세요.

## 배포 전 체크리스트

### 1. Google Cloud 설정

- [ ] Google Cloud 프로젝트 생성 완료
- [ ] 필요한 API 활성화 완료
  - [ ] Google+ API (OAuth)
  - [ ] Google Sheets API
  - [ ] Google Forms API
  - [ ] Gmail API
- [ ] OAuth 2.0 클라이언트 ID 생성 완료
- [ ] OAuth 동의 화면 구성 완료
- [ ] 프로덕션 리디렉션 URI 추가 완료
- [ ] 필요한 OAuth 범위(scope) 추가 완료

### 2. 환경 변수 설정

- [ ] `.env.production` 파일 생성 완료
- [ ] `GOOGLE_CLIENT_ID` 설정 완료
- [ ] `GOOGLE_CLIENT_SECRET` 설정 완료
- [ ] `GOOGLE_REDIRECT_URI` 설정 완료 (프로덕션 URL)
- [ ] `SESSION_SECRET` 생성 및 설정 완료 (최소 32자)
- [ ] `FRONTEND_URL` 설정 완료 (HTTPS)
- [ ] `BACKEND_URL` 설정 완료 (HTTPS)
- [ ] `ALLOWED_ORIGINS` 설정 완료
- [ ] `NODE_ENV=production` 설정 완료
- [ ] `COOKIE_SECURE=true` 설정 완료

### 3. 도메인 및 SSL

- [ ] 프론트엔드 도메인 준비 완료
- [ ] 백엔드 도메인 준비 완료
- [ ] SSL 인증서 발급 완료 (Let's Encrypt 또는 유료)
- [ ] DNS 레코드 설정 완료
- [ ] HTTPS 리디렉션 설정 완료

### 4. 코드 준비

- [ ] 최신 코드 커밋 완료
- [ ] 모든 테스트 통과 확인
- [ ] 린트 오류 수정 완료
- [ ] 프로덕션 빌드 테스트 완료
  - [ ] `cd backend && npm run build`
  - [ ] `cd frontend && npm run build`
- [ ] 민감한 정보가 코드에 하드코딩되지 않았는지 확인
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인

### 5. 보안 설정

- [ ] SESSION_SECRET가 강력한 랜덤 문자열인지 확인
- [ ] 모든 API 키가 환경 변수로 관리되는지 확인
- [ ] CORS 설정이 올바른지 확인
- [ ] 쿠키 보안 설정 확인 (secure, httpOnly, sameSite)
- [ ] Rate limiting 설정 (선택사항)
- [ ] 프로덕션 빌드에서 소스맵 비활성화 확인

### 6. 배포 플랫폼 준비

#### Docker Compose 사용 시
- [ ] Docker 및 Docker Compose 설치 확인
- [ ] `docker-compose.yml` 파일 검토
- [ ] `.env.production` 파일 서버에 업로드
- [ ] 빌드 테스트: `docker-compose build`

#### Vercel + Railway 사용 시
- [ ] Vercel 계정 생성 및 프로젝트 연결
- [ ] Railway 계정 생성 및 프로젝트 연결
- [ ] 각 플랫폼에 환경 변수 설정
- [ ] 빌드 명령어 및 시작 명령어 확인

#### PM2 사용 시
- [ ] PM2 전역 설치 확인
- [ ] `ecosystem.config.js` 파일 검토
- [ ] 로그 디렉토리 생성 확인
- [ ] Nginx 설정 파일 준비

### 7. 데이터베이스 (Google Sheets)

- [ ] Google Sheets API 접근 권한 확인
- [ ] 시트 생성 로직 테스트 완료
- [ ] 시트 읽기/쓰기 권한 확인
- [ ] 백업 계획 수립

### 8. 이메일 발송 (Gmail API)

- [ ] Gmail API 접근 권한 확인
- [ ] 이메일 발송 테스트 완료
- [ ] 일일 발송 제한 확인 (Gmail API 할당량)
- [ ] 이메일 템플릿 검토

## 배포 중 체크리스트

### 1. 배포 실행

- [ ] 배포 명령어 실행
- [ ] 빌드 로그 확인
- [ ] 오류 없이 완료되었는지 확인

### 2. 서비스 시작

- [ ] 백엔드 서비스 시작 확인
- [ ] 프론트엔드 서비스 시작 확인
- [ ] 프로세스가 정상적으로 실행 중인지 확인

### 3. 헬스 체크

- [ ] 백엔드 헬스 체크: `curl https://api.yourdomain.com/health`
- [ ] 프론트엔드 접근 확인: `curl https://yourdomain.com`
- [ ] HTTP 상태 코드 200 확인

## 배포 후 체크리스트

### 1. 기능 테스트

- [ ] 프론트엔드 페이지 로드 확인
- [ ] Google 로그인 기능 테스트
- [ ] 행사 생성 기능 테스트
- [ ] 참석자 추가 기능 테스트
- [ ] 이메일 발송 기능 테스트
- [ ] Google Form 생성 확인
- [ ] 참석 상태 업데이트 확인
- [ ] 행사 복사 기능 테스트

### 2. 성능 확인

- [ ] 페이지 로드 속도 확인
- [ ] API 응답 시간 확인
- [ ] 이미지 및 정적 파일 로딩 확인
- [ ] 모바일 반응형 확인

### 3. 보안 확인

- [ ] HTTPS 연결 확인
- [ ] SSL 인증서 유효성 확인
- [ ] CORS 정책 동작 확인
- [ ] 쿠키 보안 설정 확인
- [ ] 민감한 정보 노출 여부 확인

### 4. 모니터링 설정

- [ ] 로그 수집 설정
- [ ] 에러 추적 설정 (선택사항)
- [ ] 성능 모니터링 설정 (선택사항)
- [ ] 알림 설정 (선택사항)

### 5. 백업 및 복구

- [ ] Google Sheets 백업 계획 확인
- [ ] 환경 변수 백업 (안전한 곳에 보관)
- [ ] 복구 절차 문서화

### 6. 문서화

- [ ] 배포 날짜 및 버전 기록
- [ ] 배포 과정에서 발생한 이슈 기록
- [ ] 운영 매뉴얼 작성 또는 업데이트
- [ ] 팀원들에게 배포 완료 공지

## 검증 스크립트 실행

배포 후 자동 검증을 위해 다음 스크립트를 실행하세요:

### Windows (PowerShell)
```powershell
.\scripts\verify-deployment.ps1
```

### Linux/Mac
```bash
chmod +x scripts/verify-deployment.sh
./scripts/verify-deployment.sh
```

## 롤백 계획

배포 후 문제가 발생할 경우를 대비한 롤백 계획:

### Docker Compose
```bash
# 이전 버전으로 롤백
git checkout <previous-commit>
docker-compose build
docker-compose up -d
```

### Vercel
- Vercel 대시보드에서 이전 배포 버전으로 롤백

### Railway
- Railway 대시보드에서 이전 배포 버전으로 롤백

### PM2
```bash
# 이전 버전으로 롤백
git checkout <previous-commit>
cd backend
npm run build
pm2 restart event-management-backend
```

## 긴급 연락처

배포 중 문제 발생 시 연락할 담당자 정보:

- **개발팀 리더**: [이름] - [연락처]
- **인프라 담당자**: [이름] - [연락처]
- **Google Cloud 관리자**: [이름] - [연락처]

## 추가 리소스

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 상세 배포 가이드
- [QUICKSTART.md](./QUICKSTART.md) - 빠른 시작 가이드
- [README.md](./README.md) - 프로젝트 개요

---

**배포 완료 후 이 체크리스트를 저장하여 다음 배포 시 참고하세요.**
