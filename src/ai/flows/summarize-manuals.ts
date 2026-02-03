'use server';

/**
 * @fileOverview A manual summarization AI agent.
 *
 * - summarizeManual - A function that summarizes a given manual.
 * - SummarizeManualInput - The input type for the summarizeManual function.
 * - SummarizeManualOutput - The return type for the summarizeManual function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeManualInputSchema = z.object({
  manualText: z.string().describe('The text content of the manual to be summarized.'),
});
export type SummarizeManualInput = z.infer<typeof SummarizeManualInputSchema>;

const SummarizeManualOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the manual.'),
});
export type SummarizeManualOutput = z.infer<typeof SummarizeManualOutputSchema>;

export async function summarizeManual(input: SummarizeManualInput): Promise<SummarizeManualOutput> {
  return summarizeManualFlow(input);
}

const shouldSummarizeSection = ai.defineTool(
  {
    name: 'shouldSummarizeSection',
    description: 'Determines if a section of text from a manual should be summarized based on its relevance and importance.',
    inputSchema: z.object({
      sectionText: z.string().describe('The text content of the manual section.'),
    }),
    outputSchema: z.boolean().describe('True if the section should be summarized, false otherwise.'),
  },
  async input => {
    const {text} = await ai.generate({
      prompt: `Determine if the following section from a manual should be summarized. Return true if it contains important information or key instructions, and false if it is redundant, obvious, or non-essential.\n\nSection: {{{sectionText}}}`,
    });
    return text?.toLowerCase().includes('true') ?? false;
  }
);

const summarizeSection = ai.defineTool({
  name: 'summarizeSection',
  description: 'Generates a concise summary of a given section of text from a manual.',
  inputSchema: z.object({
    sectionText: z.string().describe('The text content of the manual section.'),
  }),
  outputSchema: z.string().describe('A concise summary of the manual section.'),
}, async input => {
  const {text} = await ai.generate({
    prompt: `Summarize the following section from a manual:\n\nSection: {{{sectionText}}}`,
  });
  return text ?? '';
});

const summarizeManualPrompt = ai.definePrompt({
  name: 'summarizeManualPrompt',
  tools: [shouldSummarizeSection, summarizeSection],
  input: {schema: SummarizeManualInputSchema},
  output: {schema: SummarizeManualOutputSchema},
  prompt: `You are an AI assistant designed to summarize lengthy manuals. Break down the manual into sections, and intelligently determine if each section is worth summarizing, using the shouldSummarizeSection tool. If a section should be summarized, use the summarizeSection tool to generate a concise summary. Finally, combine the summaries of the important sections into a cohesive overview of the manual.\n\nManual Text: {{{manualText}}}`,
});

const summarizeManualFlow = ai.defineFlow(
  {
    name: 'summarizeManualFlow',
    inputSchema: SummarizeManualInputSchema,
    outputSchema: SummarizeManualOutputSchema,
  },
  async input => {
    const {output} = await summarizeManualPrompt(input);
    return output!;
  }
);
