import z from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1)
});

export type LoginSchemaInput = z.input<typeof loginSchema>;
export type LoginSchemaOutput = z.output<typeof loginSchema>;