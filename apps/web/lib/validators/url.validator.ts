import { z } from 'zod';

const RESERVED_CODES = [
  'api',
  'admin',
  'login',
  'register',
  'health',
  'docs',
];

const urlValidator = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .url()
  .refine((value) => {
    const url = new URL(value);

    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    const host = url.hostname.toLowerCase();

    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.')
    ) {
      return false;
    }

    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) {
      return false;
    }

    return true;
  }, 'Invalid URL');

const customCodeValidator = z
  .string()
  .trim()
  .min(4)
  .max(20)
  .regex(/^[a-zA-Z0-9_-]+$/)
  .refine(
    (value) => !RESERVED_CODES.includes(value.toLowerCase()),
    'Reserved short code',
  );

export const createUrlSchema = z.object({
  originalUrl: urlValidator,

  customCode: customCodeValidator.optional(),

  password: z.string().min(8).max(100).optional(),

  expiresAt: z.coerce
    .date()
    .refine((date) => date > new Date(), 'Expiration must be in the future')
    .optional(),

  title: z.string().trim().max(255).optional(),

  description: z.string().trim().max(500).optional(),

  faviconUrl: z.string().trim().url().optional(),

  redirectType: z.enum(['301', '302']).optional(),

  maxClicks: z.coerce.number().int().positive().optional(),

  clickCount: z.coerce.number().int().nonnegative().optional(),
});

export const updateUrlSchema = z.object({
  originalUrl: urlValidator.optional(),

  customCode: customCodeValidator.optional(),

  password: z.string().min(8).max(100).optional(),

  expiresAt: z.coerce.date().optional().nullable(),

  title: z.string().trim().max(255).optional(),

  description: z.string().trim().max(500).optional(),

  faviconUrl: z.string().trim().url().optional().nullable(),

  redirectType: z.enum(['301', '302']).optional(),

  maxClicks: z.coerce.number().int().positive().optional().nullable(),

  status: z.enum(['ACTIVE', 'DISABLED', 'EXPIRED']).optional(),

  clickCount: z.coerce.number().int().nonnegative().optional(),
});

export const listUrlSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().optional(),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
export type UpdateUrlInput = z.infer<typeof updateUrlSchema>;
export type ListUrlQuery = z.infer<typeof listUrlSchema>;