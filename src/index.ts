import { configureGenkit } from '@genkit-ai/core';
import { dotprompt } from '@genkit-ai/dotprompt';
import { startFlowsServer } from '@genkit-ai/flow';
import { openAI } from 'genkitx-openai';
import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { textEmbeddingGecko, vertexAI } from '@genkit-ai/vertexai';

// Configure Genkit with necessary plugins
configureGenkit({
  plugins: [
    vertexAI({ projectId: 'cloud-llm-preview1', location: 'us-central1' }),
    dotprompt(), // Load the Dotprompt plugin,
    genkitEval({
      judge: gemini15Flash,
      metrics: [GenkitMetric.FAITHFULNESS, GenkitMetric.ANSWER_RELEVANCY],
      embedder: textEmbeddingGecko, // GenkitMetric.ANSWER_RELEVANCY requires an embedder
    }),
  ],
  logLevel: 'debug', // Set log level to debug for development
  enableTracingAndMetrics: true, // Enable tracing and metrics
});

import { customerServiceFlow } from './customerServiceFlow';
import genkitEval, { GenkitMetric } from '@genkit-ai/evaluator';

// Export the flow(s) you've defined
export { customerServiceFlow };

// Start the flows server
startFlowsServer();