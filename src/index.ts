import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

// Configure Genkit with necessary plugins
export const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash
});
