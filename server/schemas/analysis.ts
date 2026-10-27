import { z } from 'zod';

export const AnalysisRequestSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  model: z.string().optional().default('GPT-4o'),
});

export const AnalysisResponseSchema = z.object({
  riskLevel: z.enum(['CRÍTICO', 'ALTO', 'MÉDIO', 'BAIXO']),
  owaspTag: z.string(),
  rootCause: z.string(),
  diff: z.object({
    original: z.string(),
    corrected: z.string(),
  }),
});

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>;
