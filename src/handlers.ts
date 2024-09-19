import { z } from 'zod';
import { promptRef } from '@genkit-ai/dotprompt';
import * as fs from 'fs';
import * as path from 'path';

const HandlerResult = z.object({
  needsUserInput: z.boolean(),
  nextAction: z.string().optional(),
  actionsTaken: z.array(z.string()),
  data: z.record(z.unknown()),
  handlerCompleted: z.boolean(),
});

type HandlerInput = {
  intent: string;
  subintent: string;
  inquiry: string;
  context: Record<string, unknown>;
};

export async function executeHandler(input: HandlerInput): Promise<z.infer<typeof HandlerResult>> {
  const handlerPrompt = getHandlerPrompt(input.intent, input.subintent);
  const handlerResult = await handlerPrompt.generate({
    input: {
      inquiry: input.inquiry,
      context: JSON.stringify(input.context, null, 2),
    },
  });

  const output = handlerResult.output();

  return {
    needsUserInput: output.needsUserInput || false,
    nextAction: output.nextAction,
    actionsTaken: output.actionsTaken || [],
    data: output.data || {},
    handlerCompleted: output.handlerCompleted || false,
  };
}

function getHandlerPrompt(intent: string, subintent: string) {
  const promptKey = `handler_${intent.toLowerCase()}_${subintent.toLowerCase()}`;


  const promptPath = path.join(__dirname, '..', 'prompts', `${promptKey}.prompt`);
  
  if (fs.existsSync(promptPath)) {
    return promptRef(promptKey);
  } else {
    throw new Error(`NoHandlerPromptError: No handler prompt found for intent '${intent}' and subintent '${subintent}'`);
  }
}