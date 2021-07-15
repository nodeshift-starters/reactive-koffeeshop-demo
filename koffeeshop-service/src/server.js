const path = require('path');
const { EventEmitter } = require('events');
const Fastify = require('fastify');
const FastifySSEPlugin = require('fastify-sse');
const { nanoid } = require('nanoid');
const Kafka = require('node-rdkafka');
const axios = require('axios');

const { createFallbackBeverage, inQueue } = require('./models/beverage');

require('dotenv').config();

const fastify = Fastify({ logger: { prettyPrint: true } });

fastify.register(require('fastify-static'), {
  root: path.join(process.cwd(), 'public')
});

fastify.register(FastifySSEPlugin);

fastify.post('/http', async (request, reply) => {
  // if we get an order through http just forward it to the barista-http-services
  const order = { orderId: nanoid(), ...request.body };
  try {
    const response = await axios.post('http://localhost:8081', order);
    reply.send(response.data);
  } catch (err) {
    reply.send(createFallbackBeverage(order));
  }
});

const queue = new EventEmitter();

const consumer = new Kafka.KafkaConsumer(
  {
    'group.id': 'koffeeshop-service',
    'metadata.broker.list':
      process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092',
    'enable.auto.commit': true
  },
  {
    'auto.offset.reset': 'earliest'
  }
);

const producer = new Kafka.Producer({
  'client.id': 'koffeeshop',
  'metadata.broker.list':
    process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092'
});

// without this, we do not get delivery events and the queue
producer.setPollInterval(100);

fastify.get('/queue', (_, reply) => {
  queue.on('update', (data) => {
    reply.sse(data);
  });
});

fastify.post('/messaging', (request, reply) => {
  const order = { orderId: nanoid(), ...request.body };
  producer.produce(
    'orders',
    null,
    Buffer.from(JSON.stringify({ ...order })),
    null,
    Date.now()
  );
  queue.emit('update', inQueue(order));
  reply.send(order);
});

// subscribe to the `queue` topic
consumer.on('ready', () => {
  consumer.subscribe(['queue']);
  consumer.consume();
});

consumer.on('data', async (message) => {
  const beverage = JSON.parse(message.value.toString());
  queue.emit('update', beverage);
});

const start = async () => {
  // connect the consumer and producer instances to Kafka
  consumer.connect();
  producer.connect();

  // start the fastify server
  fastify.listen(8080, '0.0.0.0', async (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
};

start();
