import { configureGenkit } from '@genkit-ai/core';
import { dotprompt } from '@genkit-ai/dotprompt';
import { startFlowsServer } from '@genkit-ai/flow';
import { customerServiceFlow } from './customerServiceFlow';
import { openAI } from 'genkitx-openai';

// Configure Genkit with necessary plugins
configureGenkit({
  plugins: [
    openAI(), // Load the OpenAI plugin
    dotprompt(), // Load the Dotprompt plugin
  ],
  logLevel: 'debug', // Set log level to debug for development
  enableTracingAndMetrics: true, // Enable tracing and metrics
});

// Export the flow(s) you've defined
export { customerServiceFlow };

// Start the flows server
startFlowsServer();