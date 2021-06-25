const Chance = require('chance');

const names = [
  'Olivia',
  'Oliver',
  'Amelia',
  'George',
  'Isla',
  'Harry',
  'Ava',
  'Noah',
  'Emily',
  'Jack',
  'Sophia',
  'Charlie',
  'Grace',
  'Leo',
  'Mia',
  'Jacob',
  'Poppy',
  'Freddie',
  'Ella',
  'Alfie',
  'Tom',
  'Julie',
  'Matt',
  'Joe',
  'Zoe',
];

function pick() {
  return new Chance().pickone(names);
}

module.exports = { pick };
