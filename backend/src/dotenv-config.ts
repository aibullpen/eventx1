import dotenv from 'dotenv';
import path from 'path';

// process.cwd()는 'npm run dev'를 실행하는 backend 폴더를 가리킵니다.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

