const state = {
  IN_QUEUE: 'IN_QUEUE',
  BEING_PREPARED: 'BEING_PREPARED',
  READY: 'READY',
  FAILED: 'FAILED'
};

function inQueue(order) {
  return {
    ...order,
    preparationState: state.IN_QUEUE
  };
}

function createFallbackBeverage(order) {
  return {
    ...order,
    preparationState: state.FAILED
  };
}

module.exports = {
  createFallbackBeverage,
  inQueue
};
