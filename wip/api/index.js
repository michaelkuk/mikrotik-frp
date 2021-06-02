const {
  identity,
  applySpec,
  always,
  curryN,
  over,
  lensProp,
  append,
} = require('ramda');

const query = require('./query');

const appendAttr = curryN(2, (sentence, attr) =>
  over(lensProp('attributes'), append(attr))(sentence)
);

const createCommand = applySpec({
  endpoint: identity,
  attributes: always([]),
  query: always([]),
  selectProps: always([]),
});

const addAtribute = curryN(3, (key, value, sentence) =>
  appendAttr(sentence, {
    key,
    value,
  })
);

module.exports = {
  query,
  createCommand,
  addAtribute,
};
