import { defineFlow } from '@genkit-ai/flow';
import { promptRef } from '@genkit-ai/dotprompt';
import { z } from 'zod';

const classifyInquiryPrompt = promptRef('classify_inquiry');
const extractInfoPrompt = promptRef('extract_info');
const retrieveInfoPrompt = promptRef('retrieve_info');
const generateDraftPrompt = promptRef('generate_draft');
const refineResponsePrompt = promptRef('refine_response');

export const customerServiceFlow = defineFlow(
  {
    name: 'customerServiceFlow',
    inputSchema: z.object({
      customerInquiry: z.string(),
    }),
    outputSchema: z.object({
      classification: z.string(),
      response: z.string(),
    }),
  },
  async (input) => {
    // Step 1: Classify the inquiry
    const classificationResult = await classifyInquiryPrompt.generate({
      input: { inquiry: input.customerInquiry },
    });
    const classification = classificationResult.output();
    console.log('Classification:', classification);

    // Step 2: Extract key information
    const extractionResult = await extractInfoPrompt.generate({
      input: { inquiry: input.customerInquiry, category: classification.category },
    });
    const extractedInfo = extractionResult.output();
    console.log('Extracted Info:', extractedInfo);

    // Step 4: Generate draft response
    const draftResult = await generateDraftPrompt.generate({
      input: {
        category: classification.category,
        ...extractedInfo,
      },
    });
    const draftResponseResult = draftResult.output();
    console.log('Draft Response:', draftResponseResult);

    // Step 5: Refine and format the response
    const refinedResult = await refineResponsePrompt.generate({
      input: { draftResponse: draftResponseResult.draftResponse, category: classification.category },
    });
    const finalResponseResult = refinedResult.output();
    console.log('Final Response:', finalResponseResult.response);

    return {
      classification: classification.category,
      response: finalResponseResult.response,
    };
  }
);