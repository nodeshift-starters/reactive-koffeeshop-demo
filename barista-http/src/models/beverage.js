const { pickName, getPreparationTime } = require('../utils/random');

const barista = pickName();

const state = {
  IN_QUEUE: 'IN_QUEUE',
  BEING_PREPARED: 'BEING_PREPARED',
  READY: 'READY',
  FAILED: 'FAILED'
};

// prettier-ignore
const prepare = (order) => new Promise((resolve) => {
  const delay = getPreparationTime();
  setTimeout(() => {
    resolve({
      ...order,
      preparedBy: barista,
      preparationState: state.READY
    });
  }, delay);
});

module.exports = {
  prepare
};
