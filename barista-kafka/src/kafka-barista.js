const pino = require('pino');
const { Kafka } = require('kafkajs');
const Beverage = require('./models/beverage');

require('dotenv').config();

const logger = pino({
  prettyPrint: true
});

const kafka = new Kafka({
  clientId: 'barista-kafka-node',
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVER || 'localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'baristas' });

const run = async () => {
  // connect the consumer adn producer instances to Kafka
  await consumer.connect();
  await producer.connect();

  // subscribe consumer to the `orders` topic
  await consumer.subscribe({ topic: 'orders', fromBeginning: true });

  // start listening for messages
  await consumer.run({
    eachMessage: async ({ message }) => {
      // get the order from kafka and prepare the beverage
      const order = JSON.parse(message.value.toString());
      const beverage = await Beverage.prepare(order);
      // debug statement
      logger.info(`Order ${order.orderId} for ${order.customer} is ready`);
      // create a kafka-message from a JS object and send it to kafka
      producer.send({
        topic: 'queue',
        messages: [{ value: JSON.stringify({ ...beverage }) }]
      });
    }
  });
};

run().catch((err) => logger.error(err));

process.once('SIGINT', consumer.disconnect);
process.once('SIGINT', producer.disconnect);
