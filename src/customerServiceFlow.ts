import { defineFlow } from '@genkit-ai/flow';
import { generate } from '@genkit-ai/ai';
import { promptRef } from '@genkit-ai/dotprompt';
import { z } from 'zod';
import { gemini15Pro } from '@genkit-ai/googleai';

const classifyInquiryPrompt = promptRef('classify_inquiry');
const generateResponsePrompt = promptRef('generate_response');
const checkEscalationPrompt = promptRef('check_escalation');
const generateFollowUpPrompt = promptRef('generate_follow_up');

export const customerServiceFlow = defineFlow(
  {
    name: 'customerServiceFlow',
    inputSchema: z.object({
      customerInquiry: z.string(),
    }),
  },
  async (input) => {
    // Step 1: Classify the inquiry
    const classificationResult = await classifyInquiryPrompt.generate({
      input: { inquiry: input.customerInquiry },
    });
    const classification = classificationResult.output();
    console.log('Classification Result:', classificationResult);

    // Step 2: Generate a response based on the classification
    const responseResult = await generateResponsePrompt.generate({
      input: {
        inquiry: input.customerInquiry,
        classification: classification,
      },
    });
    const response = responseResult.output();
    console.log('Response Result:', responseResult);

  }
);