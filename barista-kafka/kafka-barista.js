const pino = require('pino');
const { Kafka } = require('kafkajs');

const { Beverage, State } = require('./beverage');
const names = require('./names');

const logger = pino({
  prettyPrint: true,
});

function preparationTime() {
  return Math.floor(Math.random() * Math.floor(5)) * 1000;
}

async function prepare(order) {
  const delay = preparationTime();
  await new Promise((resolve) => setTimeout(resolve, delay));
  logger.info(`Order ${order.id} for ${order.name} is ready`);
  return new Beverage(order, names.pick(), State.READY);
}

const kafka = new Kafka({
  clientId: 'barista-kafka-node',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER || 'localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'baristas' });

const run = async () => {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: 'orders', fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const order = JSON.parse(message.value.toString());
      const beverage = await prepare(order);
      logger.info(`Order ${order.id} for ${order.name} is ready`);
      const msg = { value: JSON.stringify({ ...beverage }) };
      await producer.send({
        topic: 'queue',
        messages: [msg],
      });
    },
  });
};

run();

process.once('SIGINT', consumer.disconnect);
process.once('SIGINT', producer.disconnect);
