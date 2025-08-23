import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
    newsletter: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const editProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const editCarDesignSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Design name is required" })
    .max(50, { message: "Name must be less than 50 characters" }),
  description: z
    .string()
    .max(200, { message: "Description must be less than 200 characters" })
    .optional()
    .or(z.literal("")),
  category: z.string().min(1, { message: "Please select a category" }),
  date: z.coerce.date().refine((val) => !!val, {
    message: "Please select a date",
  }),
});

// ✅ Types for all forms
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EditProfileFormData = z.infer<typeof editProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// 🔑 Dual types for Car Design
export type EditCarDesignFormInput = z.input<typeof editCarDesignSchema>; // raw form input
export type EditCarDesignFormData = z.output<typeof editCarDesignSchema>; // parsed & validated
