const {
  applySpec,
  always,
  identity,
  over,
  lensProp,
  append,
  curryN,
  pipe,
} = require('ramda');

const appendQuery = curryN(2, (sentence, query) =>
  over(lensProp('query'), append(query))(sentence)
);

// (String, Sentence) -> (Sentence) -> Sentence
const hasProp = curryN(2, (name, sentence) =>
  pipe(
    applySpec({
      prefix: always('?'),
      key: identity,
      value: always(null),
    }),
    appendQuery(sentence)
  )(name)
);

// (String, String, Sentence) -> (Sentence, String) -> (Sentence) -> Sentence
const doesNotHaveProp = curryN(2, (name, sentence) =>
  pipe(
    applySpec({
      prefix: always('?-'),
      key: identity,
      value: always(null),
    }),
    appendQuery(sentence)
  )(name)
);

// (String, String, Sentence) -> (Sentence, String) -> (Sentence) -> Sentence
const propEq = curryN(3, (name, value, sentence) =>
  pipe(
    applySpec({
      prefix: always('?='),
      key: identity,
      value: always(value),
    }),
    appendQuery(sentence)
  )(name)
);

// (String, String, Sentence) -> (Sentence, String) -> (Sentence) -> Sentence
const propGt = curryN(3, (name, value, sentence) =>
  pipe(
    applySpec({
      prefix: always('?>'),
      key: identity,
      value: always(value),
    }),
    appendQuery(sentence)
  )(name)
);

// (String, String, Sentence) -> (Sentence, String) -> (Sentence) -> Sentence
const propLt = curryN(3, (name, value, sentence) =>
  pipe(
    applySpec({
      prefix: always('?<'),
      key: identity,
      value: always(value),
    }),
    appendQuery(sentence)
  )(name)
);

// (String, String, Sentence) -> (Sentence) -> Sentence
const propOperation = curryN(2, (op, sentence) =>
  pipe(
    applySpec({
      prefix: always('?#'),
      key: identity,
      value: always(null),
    }),
    appendQuery(sentence)
  )(op)
);

module.exports = {
  hasProp,
  doesNotHaveProp,
  propEq,
  propGt,
  propLt,
  propOperation,
};
