const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes
} = require('@opentelemetry/semantic-conventions');
const {
  ConsoleSpanExporter,
  SimpleSpanProcessor
} = require('@opentelemetry/sdk-trace-base');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { trace } = require('@opentelemetry/api');
const {
  FastifyInstrumentation
} = require('@opentelemetry/instrumentation-fastify');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');

const exporter = new ConsoleSpanExporter();

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'barista-http'
  })
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();

registerInstrumentations({
  instrumentations: [new HttpInstrumentation(), new FastifyInstrumentation()],
  tracerProvider: provider
});

trace.getTracer('barista-http');
