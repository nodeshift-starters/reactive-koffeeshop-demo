const { Resource } = require('@opentelemetry/resources');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} = require('@opentelemetry/sdk-trace-base');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { trace } = require('@opentelemetry/api');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const {
  KafkaJsInstrumentation,
} = require('opentelemetry-instrumentation-kafkajs');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');

const exporter = new ConsoleSpanExporter();

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'barista-kafka',
  }),
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register();

registerInstrumentations({
  instrumentations: [new HttpInstrumentation(), new KafkaJsInstrumentation()],
  tracerProvider: provider,
});

trace.getTracer('barista-kafka');
