const { z } = require('zod');

const uidRegex = /^[A-Za-z0-9._:@-]+$/;

const createCustomTokenSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('A valid email address is required'),
  uid: z
    .string({ required_error: 'UID is required' })
    .trim()
    .min(3, 'UID must be at least 3 characters')
    .max(128, 'UID must not exceed 128 characters')
    .regex(uidRegex, 'UID contains invalid characters'),
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name cannot be empty')
    .max(128, 'Display name must not exceed 128 characters')
    .optional()
});

module.exports = {
  createCustomTokenSchema
};
