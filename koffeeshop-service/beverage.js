const State = Object.freeze({
  IN_QUEUE: Symbol('IN_QUEUE'),
  BEING_PREPARED: Symbol('BEING_PREPARED'),
  READY: Symbol('READY'),
  FAILED: Symbol('FAILED'),
});

function Beverage(order, baristaName, state) {
  this.beverage = order.product;
  this.customer = order.name;
  this.orderId = order.id;
  this.preparedBy = baristaName;
  this.preparationState = state;
}

module.exports = {
  Beverage,
  State,
};

