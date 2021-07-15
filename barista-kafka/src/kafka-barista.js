const pino = require('pino');
const Kafka = require('node-rdkafka');
const Beverage = require('./models/beverage');

require('dotenv').config();

const logger = pino({
  prettyPrint: true
});

const consumer = new Kafka.KafkaConsumer(
  {
    'group.id': 'baristas',
    'metadata.broker.list':
      process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092',
    'enable.auto.commit': true
  },
  {
    'auto.offset.reset': 'earliest'
  }
);

const producer = new Kafka.Producer({
  'client.id': 'barista-kafka-node',
  'metadata.broker.list':
    process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092'
});

consumer.on('ready', () => {
  logger.info('Consumer connected to kafka cluster');
  consumer.subscribe(['orders']);
  consumer.consume();
});

producer.on('ready', () => {
  logger.info('Producer connected to kafka cluster');
});

consumer.on('data', async (message) => {
  // get the order from kafka and prepare the beverage
  const order = JSON.parse(message.value.toString());
  const beverage = await Beverage.prepare(order);

  // debug statement
  logger.info(`Order ${order.orderId} for ${order.name} is ready`);

  try {
    producer.produce(
      'queue',
      null,
      Buffer.from(JSON.stringify({ ...beverage })),
      null,
      Date.now()
    );
  } catch (err) {
    logger.error(err);
  }
});

// without this, we do not get delivery events and the queue
producer.setPollInterval(100);

// subscribe to error events
producer.on('connection.failure', (err) => {
  logger.error(err.message);
});

consumer.on('connection.failure', (err) => {
  logger.error(err.message);
});

consumer.connect();
producer.connect();
