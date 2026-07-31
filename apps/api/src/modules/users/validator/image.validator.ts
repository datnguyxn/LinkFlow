import { extname } from 'node:path';
import type { MultipartFile } from '@fastify/multipart';

import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_TYPES,
  MAX_AVATAR_SIZE,
  ERROR_CODE,
} from '../../../common/constants/index.ts';

import { BadRequestError } from '../../../common/errors/index.ts';

export async function validateImage(file: MultipartFile) {
  if (!file) {
    throw new BadRequestError('image.fileRequired', ERROR_CODE.FILE_REQUIRED);
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw new BadRequestError('image.invalidType', ERROR_CODE.INVALID_FILE_TYPE);
  }

  const ext = extname(file.filename).toLowerCase();

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    throw new BadRequestError('image.invalidExtension', ERROR_CODE.INVALID_FILE_EXTENSION);
  }

  const buffer = await file.toBuffer();

  if (buffer.length === 0) {
    throw new BadRequestError('image.emptyFile', ERROR_CODE.EMPTY_FILE);
  }

  if (buffer.length > MAX_AVATAR_SIZE) {
    throw new BadRequestError('image.fileTooLarge', ERROR_CODE.FILE_TOO_LARGE);
  }

  return buffer;
}
