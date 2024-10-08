import { configureGenkit } from '@genkit-ai/core';
import { dotprompt } from '@genkit-ai/dotprompt';
import { startFlowsServer } from '@genkit-ai/flow';
import { customerServiceFlow } from './customerServiceFlow';
import { openAI } from 'genkitx-openai';
import { googleAI } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';

// Configure Genkit with necessary plugins
configureGenkit({
  plugins: [
    vertexAI({ projectId: 'cloud-llm-preview1', location: 'us-central1' }),
    dotprompt(), // Load the Dotprompt plugin
  ],
  logLevel: 'debug', // Set log level to debug for development
  enableTracingAndMetrics: true, // Enable tracing and metrics
});

// Export the flow(s) you've defined
export { customerServiceFlow };

// Start the flows server
startFlowsServer();