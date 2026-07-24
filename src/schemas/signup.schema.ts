import {z} from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2),
  username: z
    .string()
    .min(3)
    .regex(/^(?![_-])[a-z0-9_-]{3,16}(?<![_-])$/, "Use letters numbers and symbols only."),
  email: z.email(),
  password: z.string().min(8),
  bio: z.string().max(240).optional()
});


export type SignUpSchemaInput = z.input<typeof signUpSchema>;
export type SignUpSchemaOutput = z.output<typeof signUpSchema>;
