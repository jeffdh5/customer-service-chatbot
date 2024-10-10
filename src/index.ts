import { configureGenkit } from '@genkit-ai/core';
import { dotprompt } from '@genkit-ai/dotprompt';
import { startFlowsServer } from '@genkit-ai/flow';
import { gemini15Flash, googleAI } from '@genkit-ai/googleai';
import { textEmbeddingGecko, vertexAI } from '@genkit-ai/vertexai';
import genkitEval, { GenkitMetric } from '@genkit-ai/evaluator';
import { googleCloud } from '@genkit-ai/google-cloud';
import { AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';

// Configure Genkit with necessary plugins
configureGenkit({
  plugins: [
    vertexAI({ projectId: 'genkit-devrel-samples', location: 'us-central1' }),
    googleAI(),
    dotprompt(), // Load the Dotprompt plugin,
    genkitEval({
      judge: gemini15Flash,
      metrics: [GenkitMetric.FAITHFULNESS],
      embedder: textEmbeddingGecko, // GenkitMetric.ANSWER_RELEVANCY requires an embedder
    }),
    googleCloud({
      projectId: 'genkit-devrel-samples',
      telemetryConfig: {
        forceDevExport: true, // Set this to true to export telemetry for local runs
        sampler: new AlwaysOnSampler(),
        autoInstrumentation: true,
        autoInstrumentationConfig: {
          '@opentelemetry/instrumentation-fs': { enabled: false },
          '@opentelemetry/instrumentation-dns': { enabled: false },
          '@opentelemetry/instrumentation-net': { enabled: false },
        },
        metricExportIntervalMillis: 5_000,
      },
    })
  ],
  logLevel: 'debug', // Set log level to debug for development
  enableTracingAndMetrics: true, // Enable tracing and metrics
  telemetry: {
    instrumentation: 'googleCloud',
    logger: 'googleCloud',
  },
});

import { customerServiceFlow } from './customerServiceFlow';

// Export the flow(s) you've defined
export { customerServiceFlow };

// Start the flows server
startFlowsServer();