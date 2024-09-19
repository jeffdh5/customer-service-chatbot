import { defineFlow, runFlow } from '@genkit-ai/flow';
import { promptRef } from '@genkit-ai/dotprompt';
import { z } from 'zod';
import { getCustomerByEmail, getOrderById, getProductById, getRecentOrders, getRecentOrdersByEmail, listProducts, createEscalation } from './db';
import { executeHandler } from './handlers';

const classifyInquiryPrompt = promptRef('classify_inquiry');
const generateDraftPrompt = promptRef('generate_draft');
const extractInfoPrompt = promptRef('extract_info');

export const classifyInquiryFlow = defineFlow(
  {
    name: 'classifyInquiryFlow',
    inputSchema: z.object({
      inquiry: z.string(),
    }),
    outputSchema: z.object({
      intent: z.string(),
      subintent: z.string(),
    }),
  },
  async (input) => {
    const classificationResult = await classifyInquiryPrompt.generate({
      input: { inquiry: input.inquiry },
    });
    return classificationResult.output();
  }
);

export const customerServiceFlow = defineFlow(
  {
    name: 'customerServiceFlow',
    inputSchema: z.object({
      customerInquiry: z.string(),
      email: z.string(),
    }),
    outputSchema: z.object({
      intent: z.string(),
      subintent: z.string(),
      response: z.string(),
      needsUserInput: z.boolean(),
      nextAction: z.string().optional(),
    }),
  },
  async (input) => {
    // Step 1: Classify the inquiry
    const classificationResult = await runFlow(classifyInquiryFlow, {
      inquiry: input.customerInquiry,
    });
    const { intent, subintent } = classificationResult;

    // Step 2: Augment data
    const augmentedData = await runFlow(augmentInfo, {
      intent,
      customerInquiry: input.customerInquiry,
      email: input.email,
    });

    // Step 3: Execute Handler
    let handlerResult;
    try {
      handlerResult = await runFlow(executeHandlerFlow, {
        intent,
        subintent,
        inquiry: input.customerInquiry,
        context: augmentedData.responseData,
      });
    } catch (error) {
      // Escalate if no handler
      if (error instanceof Error && error.message.startsWith('NoHandlerPromptError')) {
        const escalationResult = await escalateToHuman(input.customerInquiry, input.email, 'No handler found');
        return {
          intent,
          subintent,
          response: escalationResult.message,
          needsUserInput: false,
          nextAction: 'wait_for_human',
          escalated: true,
          escalationReason: 'No handler found',
        };
      } else {
        throw error; // Re-throw other errors
      }
    }

    // Step 4: Generate response
    const responseResult = await runFlow(generateDraftFlow, {
      intent,
      subintent,
      inquiry: input.customerInquiry,
      context: augmentedData.responseData,
      handlerResult: handlerResult.data,
    });

    return {
      intent,
      subintent,
      response: responseResult.draftResponse,
      needsUserInput: handlerResult.needsUserInput ?? false,
      nextAction: handlerResult.nextAction,
      escalated: false,
    };
  }
);

async function escalateToHuman(inquiry: string, email: string, reason: string) {
  const customer = await getCustomerByEmail(email);
  if (!customer) {
    throw new Error('Customer not found');
  }

  const escalation = await createEscalation(
    customer.id,
    'Customer Inquiry Escalation',
    `Inquiry: ${inquiry}\n\nReason for escalation: ${reason}`,
    'medium' // Add a priority level as the fourth argument
  );

  return {
    message: "Your inquiry has been escalated to our customer service team. We'll get back to you as soon as possible.",
    escalationId: escalation.id
  };
}

export const augmentInfo = defineFlow(
  {
    name: 'augmentInfoFlow',
    inputSchema: z.object({
      intent: z.string(),
      customerInquiry: z.string(),
      email: z.string(),
    }),
    outputSchema: z.object({
      responseData: z.record(z.unknown()),
    }),
  },
  async (input) => {
    let responseData = {};
    switch (input.intent) {
      case 'Catalog':
        const products = await listProducts();
        responseData = { catalog: products };
        break;
      case 'Product':
        const productInfo = await runFlow(extractInfoFlow, { inquiry: input.customerInquiry });
        if (productInfo.productId !== 0) {
          const product = await getProductById(productInfo.productId);
          responseData = { product };
        } else {
          // todo: add RAG here
          const products = await listProducts();
          responseData = { products };
        }
        break;
      case 'Order':
        const orderInfo = await runFlow(extractInfoFlow, { inquiry: input.customerInquiry });
        console.log('Extracted order info:', orderInfo);
        if (orderInfo.orderId !== 0) {
          const order = await getOrderById(orderInfo.orderId);
          console.log('Retrieved order:', order);
          responseData = { order };
        } else {
          // If no specific order ID, fetch recent orders using the email
          const recentOrders = await getRecentOrdersByEmail(input.email);
          responseData = { recentOrders };
        }
        break;
      case 'Other':
        // For 'Other' intent, we might want to fetch customer information
        const customer = await getCustomerByEmail(input.email);
        responseData = { customer };
        break;
    }
    return { responseData };
  }
);

export const extractInfoFlow = defineFlow(
  {
    name: 'extractInfoFlow',
    inputSchema: z.object({
      inquiry: z.string(),
    }),
    outputSchema: z.object({
      productId: z.number(),
      orderId: z.number(),
      customerId: z.number(),
      issue: z.string(),
    }),
  },
  async (input) => {
    const extractionResult = await extractInfoPrompt.generate({
      input: { inquiry: input.inquiry, category: 'Customer Service' },
    });
    const output = extractionResult.output();
    return {
      productId: output.productId && output.productId !== "" ? parseInt(output.productId, 10) : 0,
      orderId: output.orderId && output.orderId !== "" ? parseInt(output.orderId, 10) : 0,
      customerId: output.customerId && output.customerId !== "" ? parseInt(output.customerId, 10) : 0,
      issue: output.issue && output.issue !== "" ? output.issue : "",
    };
  }
);

export const executeHandlerFlow = defineFlow(
  {
    name: 'executeHandlerFlow',
    inputSchema: z.object({
      intent: z.string(),
      subintent: z.string(),
      inquiry: z.string(),
      context: z.record(z.unknown()),
    }),
    outputSchema: z.object({
      data: z.unknown(),
      needsUserInput: z.boolean().optional(),
      nextAction: z.string().optional(),
    }),
  },
  async (input) => {
    return executeHandler(input);
  }
);

export const generateDraftFlow = defineFlow(
  {
    name: 'generateDraftFlow',
    inputSchema: z.object({
      intent: z.string(),
      subintent: z.string(),
      inquiry: z.string(),
      context: z.record(z.unknown()),
      handlerResult: z.unknown(),
    }),
    outputSchema: z.object({
      draftResponse: z.string(),
    }),
  },
  async (input) => {
    const responseResult = await generateDraftPrompt.generate({
      input: {
        intent: input.intent,
        subintent: input.subintent,
        inquiry: input.inquiry,
        context: JSON.stringify(input.context, null, 2),
        handlerResult: input.handlerResult,
      },
    });
    return { draftResponse: responseResult.output().draftResponse };
  }
);

export const splitInquiriesFlow = defineFlow(
  {
    name: 'splitInquiriesFlow',
    inputSchema: z.object({
      email: z.string(),
    }),
    outputSchema: z.object({
      inquiries: z.array(z.string()),
    }),
  },
  async (input) => {
    const splitResult = await promptRef('split_inquiries').generate({
      input: { email: input.email },
    });
    return splitResult.output();
  }
);

export const combineResponsesFlow = defineFlow(
  {
    name: 'combineResponsesFlow',
    inputSchema: z.object({
      originalEmail: z.string(),
      draftReplies: z.string(),
    }),
    outputSchema: z.object({
      combinedReply: z.string(),
    }),
  },
  async (input) => {
    const combineResult = await promptRef('combine_responses').generate({
      input: {
        originalEmail: input.originalEmail,
        draftReplies: input.draftReplies,
      },
    });
    return combineResult.output();
  }
);