import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants';

const CHAT_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'chat');

// Ensure directory exists
if (!fs.existsSync(CHAT_UPLOADS_DIR)) {
  fs.mkdirSync(CHAT_UPLOADS_DIR, { recursive: true });
}

// 50MB absolute max
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const storage = multer.diskStorage({
  // @ts-ignore
  destination: (req, file, cb) => {
    cb(null, CHAT_UPLOADS_DIR);
  },
  // @ts-ignore
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const secureName = `${randomUUID()}${ext}`;
    cb(null, secureName);
  }
});

// @ts-ignore
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm',
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'audio/m4a', 'audio/mp4', 'audio/aac', 'audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/3gpp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Unsupported file type: ${file.mimetype}`, HTTP_STATUS.BAD_REQUEST));
  }
};

export const chatUploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter
});
