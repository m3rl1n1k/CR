'use server';
/**
 * @fileOverview Analyzes downtime comments to categorize reasons and identify trends.
 *
 * - analyzeDowntimeComments - Analyzes downtime comments and categorizes reasons.
 * - AnalyzeDowntimeCommentsInput - The input type for the analyzeDowntimeComments function.
 * - AnalyzeDowntimeCommentsOutput - The return type for the analyzeDowntimeComments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDowntimeCommentsInputSchema = z.object({
  comments: z
    .string()
    .describe('Downtime comments to analyze, separated by newlines.'),
});
export type AnalyzeDowntimeCommentsInput = z.infer<
  typeof AnalyzeDowntimeCommentsInputSchema
>;

const AnalyzeDowntimeCommentsOutputSchema = z.object({
  categories: z
    .array(z.string())
    .describe('Categories of downtime reasons found in the comments.'),
  trends: z
    .string()
    .describe(
      'Identified trends in the downtime comments, and potential solutions to improve uptime.'
    ),
});
export type AnalyzeDowntimeCommentsOutput = z.infer<
  typeof AnalyzeDowntimeCommentsOutputSchema
>;

export async function analyzeDowntimeComments(
  input: AnalyzeDowntimeCommentsInput
): Promise<AnalyzeDowntimeCommentsOutput> {
  return analyzeDowntimeCommentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDowntimeCommentsPrompt',
  input: {schema: AnalyzeDowntimeCommentsInputSchema},
  output: {schema: AnalyzeDowntimeCommentsOutputSchema},
  prompt: `You are an expert production line analyst.

  Analyze the following downtime comments to identify categories of downtime reasons and trends.
  Suggest potential solutions to improve uptime.

  Downtime Comments:
  {{comments}}`,
});

const analyzeDowntimeCommentsFlow = ai.defineFlow(
  {
    name: 'analyzeDowntimeCommentsFlow',
    inputSchema: AnalyzeDowntimeCommentsInputSchema,
    outputSchema: AnalyzeDowntimeCommentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
