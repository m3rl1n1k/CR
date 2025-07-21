'use server';

/**
 * @fileOverview AI flow to suggest potential solutions to improve uptime based on analyzed downtime data.
 *
 * - suggestUptimeSolutions - A function that suggests potential solutions to improve uptime.
 * - SuggestUptimeSolutionsInput - The input type for the suggestUptimeSolutions function.
 * - SuggestUptimeSolutionsOutput - The return type for the suggestUptimeSolutions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestUptimeSolutionsInputSchema = z.object({
  downtimeAnalysis: z
    .string()
    .describe('The analysis of downtime, including common reasons and trends.'),
});
export type SuggestUptimeSolutionsInput = z.infer<
  typeof SuggestUptimeSolutionsInputSchema
>;

const SuggestUptimeSolutionsOutputSchema = z.object({
  suggestedSolutions: z
    .string()
    .describe(
      'A list of potential solutions to improve uptime, based on the downtime analysis.'
    ),
});
export type SuggestUptimeSolutionsOutput = z.infer<
  typeof SuggestUptimeSolutionsOutputSchema
>;

export async function suggestUptimeSolutions(
  input: SuggestUptimeSolutionsInput
): Promise<SuggestUptimeSolutionsOutput> {
  return suggestUptimeSolutionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestUptimeSolutionsPrompt',
  input: {schema: SuggestUptimeSolutionsInputSchema},
  output: {schema: SuggestUptimeSolutionsOutputSchema},
  prompt: `You are an expert production engineer. Based on the following downtime analysis, suggest potential solutions to improve uptime. Be specific and actionable.

Downtime Analysis: {{{downtimeAnalysis}}}`,
});

const suggestUptimeSolutionsFlow = ai.defineFlow(
  {
    name: 'suggestUptimeSolutionsFlow',
    inputSchema: SuggestUptimeSolutionsInputSchema,
    outputSchema: SuggestUptimeSolutionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
