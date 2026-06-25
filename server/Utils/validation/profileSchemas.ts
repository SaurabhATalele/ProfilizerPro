import { z } from "zod";

export const nameSchema = z
  .string()
  .transform((val) => val.trim())
  .pipe(
    z
      .string()
      .min(1, "Name is required")
      .max(50, "Name must be 50 characters or fewer"),
  );

export const usernameSchema = z
  .string()
  .transform((val) => val.trim())
  .pipe(
    z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be 30 characters or fewer")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens",
      ),
  );

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be 128 characters or fewer");

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });
