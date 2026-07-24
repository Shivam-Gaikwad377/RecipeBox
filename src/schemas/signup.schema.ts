import {z} from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2),
  username: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/i, "Use letters, numbers, and hyphens only."),
  email: z.string().email(),
  password: z.string().min(8),
  bio: z.string().max(240).optional()
});


export type SignUpSchemaInput = z.input<typeof signUpSchema>;
export type SignUpSchemaOutput = z.output<typeof signUpSchema>;
