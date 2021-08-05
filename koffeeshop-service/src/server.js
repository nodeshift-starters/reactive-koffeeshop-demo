const path = require('path');
const { EventEmitter } = require('events');
const Fastify = require('fastify');
const FastifySSEPlugin = require('fastify-sse');
const { nanoid } = require('nanoid');
const { Kafka } = require('kafkajs');
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
  const { name, product } = request.body;
  const order = { orderId: nanoid(), customer: name, beverage: product };
  try {
    const response = await axios.post('http://localhost:8081', order);
    reply.send(response.data);
  } catch (err) {
    reply.send(createFallbackBeverage(order));
  }
});

const kafka = new Kafka({
  clientId: 'koffeeshop-services',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER || 'localhost:9092']
});

const queue = new EventEmitter();

const producer = kafka.producer(); // orders
const consumer = kafka.consumer({ groupId: 'koffeeshop' }); // beverages

fastify.get('/queue', (_, reply) => {
  queue.on('update', (data) => {
    reply.sse(data);
  });
});

fastify.post('/messaging', (request, reply) => {
  const { name, product } = request.body;
  const order = { orderId: nanoid(), customer: name, beverage: product };
  producer.send({
    topic: 'orders',
    messages: [{ value: JSON.stringify({ ...order }) }]
  });
  queue.emit('update', inQueue(order));
  reply.send(order);
});

const start = async () => {
  // connect the consumer and producer instances to Kafka
  await consumer.connect();
  await producer.connect();

  // subscribe to the `queue` topic
  await consumer.subscribe({ topic: 'queue', fromBeginning: true });

  // start the fastify server
  fastify.listen(8080, '0.0.0.0', async (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });

  // start listening for kafka messages
  consumer.run({
    eachMessage: ({ message }) => {
      const beverage = JSON.parse(message.value.toString());
      queue.emit('update', beverage);
    }
  });
};

start();
