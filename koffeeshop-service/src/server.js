const path = require('path');
const Fastify = require('fastify');
const FastifySSEPlugin = require('fastify-sse-v2');
const axios = require('axios');
const { nanoid } = require('nanoid');

const { createFallbackBeverage } = require('./models/beverage');

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
    console.log('DEBUG =>', response);
    reply.send(response.data);
  } catch (err) {
    reply.send(createFallbackBeverage(order));
  }
});

// fastify.get('/queue', (request, reply) => {
//   console.log(request.body);
//   reply.sse('ok');
// });

// fastify.post('/messaging', (request, reply) => {
//   console.log(request.body);
//   reply.send('Hello!');
// });

fastify.listen(8080, '0.0.0.0', (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
