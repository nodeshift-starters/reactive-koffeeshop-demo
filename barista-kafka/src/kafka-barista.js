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
  consumer.consume(1, consumeNextMessage);
});

producer.on('ready', () => {
  logger.info('Producer connected to kafka cluster');
});

const consumeNextMessage = async (_, messages) => {
  // if no messages recheck in 250 milliseconds. We want to simulate the barista only being
  // able to fill one coffee order at a time. By default, node with node-rdkafka will process
  // all available messages in parallel which it can easily do since Node.js can easily run
  // many async tasks at the same time. For this example though, we want to simulate only
  // being able to do one thing at a time so we need to use the the API that allows us to avoid
  // processing the messages in parallel and this in turn requires that we check for new messages
  // a periodic basis. We choose 250ms to avoid consuming all available CPU in a tight loop.
  if (!messages.length) {
    setTimeout(() => {
      consumer.consume(1, consumeNextMessage);
    }, 250);
    return;
  }

  // get the order from kafka and prepare the beverage
  const order = JSON.parse(messages[0].value.toString());
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

  // pull next message immediately
  consumer.consume(1, consumeNextMessage);
};

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
