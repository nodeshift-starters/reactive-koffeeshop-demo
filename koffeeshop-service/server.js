const path = require('path');
const fastify = require('fastify')({ logger: true });
const FastifySSEPlugin = require('fastify-sse-v2');
const { v4: uuidv4 } = require('uuid');
const { Beverage, State } = require('./beverage');
const { Order } = require('./order');

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'public'),
});

fastify.register(FastifySSEPlugin);

fastify.post('/http', (_, reply) => {
  // TODO: Get the order and pass to the fallBack
  reply.send(fallbackBeverage(null));
});

fastify.get('/queue', (_, reply) => {
  reply.sse('ok');
});

fastify.post('/messaging', (_, reply) => {
  const order = new Order();
  order = order.setId(uuidv4());
});

fastify.listen(8080, (err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});

function fallbackBeverage(order) {
  return new Beverage(order, null, State.FAILED);
}
