
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
  summary: z.string().describe('A concise summary of the manual in Japanese.'),
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
      prompt: `以下のマニュアルのセクションを要約すべきかどうかを判断してください。重要な情報や主要な指示が含まれている場合はtrueを、冗長、明白、または重要でない場合はfalseを返してください。\n\nセクション: {{{sectionText}}}`,
    });
    return text?.toLowerCase().includes('true') ?? false;
  }
);

const summarizeSection = ai.defineTool({
  name: 'summarizeSection',
  description: 'Generates a concise summary of a given section of text from a manual in Japanese.',
  inputSchema: z.object({
    sectionText: z.string().describe('The text content of the manual section.'),
  }),
  outputSchema: z.string().describe('A concise summary of the manual section in Japanese.'),
}, async input => {
  const {text} = await ai.generate({
    prompt: `以下のマニュアルのセクションを日本語で簡潔に要約してください：\n\nセクション: {{{sectionText}}}`,
  });
  return text ?? '';
});

const summarizeManualPrompt = ai.definePrompt({
  name: 'summarizeManualPrompt',
  tools: [shouldSummarizeSection, summarizeSection],
  input: {schema: SummarizeManualInputSchema},
  output: {schema: SummarizeManualOutputSchema},
  prompt: `あなたは長いマニュアルを要約するために設計されたAIアシスタントです。マニュアルをセクションに分割し、shouldSummarizeSectionツールを使用して各セクションを要約する価値があるかどうかをインテリジェントに判断してください。要約すべきセクションについては、summarizeSectionツールを使用して日本語で簡潔な要約を生成してください。最後に、重要なセクションの要約を組み合わせて、マニュアルのまとまりのある概要を日本語で作成してください。\n\nマニュアル本文: {{{manualText}}}`,
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
