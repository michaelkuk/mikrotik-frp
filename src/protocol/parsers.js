/* eslint-disable no-underscore-dangle */
const {
  cond,
  always,
  T,
  curryN,
  converge,
  unapply,
  sum,
  pipe,
  view,
  lensIndex,
  map,
  slice,
  toString,
  unary,
} = require('ramda');

const shiftLeft = curryN(2, (n, num) => num << n);
const binaryAnd = curryN(2, (n1, n2) => n2 & n1);

const __getLenFromSingleByte = pipe(view(lensIndex(0)), unary(Number));

const __getLenFromTwoBytes = converge(unapply(sum), [
  pipe(view(lensIndex(0)), binaryAnd(~0xc0), shiftLeft(8)),
  view(lensIndex(1)),
]);

const __getLenFromThreeBytes = converge(unapply(sum), [
  pipe(view(lensIndex(0)), binaryAnd(~0xe0), shiftLeft(16)),
  pipe(view(lensIndex(1)), shiftLeft(8)),
  view(lensIndex(2)),
]);

const __getLenFromFourBytes = converge(unapply(sum), [
  pipe(view(lensIndex(0)), binaryAnd(~0xf0), shiftLeft(24)),
  pipe(view(lensIndex(1)), shiftLeft(16)),
  pipe(view(lensIndex(2)), shiftLeft(8)),
  view(lensIndex(3)),
]);

const __getLenFromFiveBytes = converge(unapply(sum), [
  pipe(view(lensIndex(1)), shiftLeft(24)),
  pipe(view(lensIndex(2)), shiftLeft(16)),
  pipe(view(lensIndex(3)), shiftLeft(8)),
  view(lensIndex(4)),
]);

const __calculateLenBytes = cond([
  [(byte) => (byte & 0x80) === 0x00, always(1)],
  [(byte) => (byte & 0xc0) === 0x80, always(2)],
  [(byte) => (byte & 0xe0) === 0xc0, always(3)],
  [(byte) => (byte & 0xf0) === 0xe0, always(4)],
  [T, always(5)],
]);

function __toWordRanges(data, currentOffset = 0, acc = []) {
  if (currentOffset === data.length) {
    return acc;
  }

  const byteNo = __calculateLenBytes(data[currentOffset]);
  let len;
  let lenOffset;

  switch (byteNo) {
    case 1:
      lenOffset = currentOffset + 1;
      len = __getLenFromSingleByte(
        data.slice(currentOffset, currentOffset + lenOffset)
      );
      break;
    case 2:
      lenOffset = currentOffset + 2;
      len = __getLenFromTwoBytes(
        data.slice(currentOffset, currentOffset + lenOffset)
      );
      break;
    case 3:
      lenOffset = currentOffset + 3;
      len = __getLenFromThreeBytes(
        data.slice(currentOffset, currentOffset + lenOffset)
      );
      break;
    case 4:
      lenOffset = currentOffset + 4;
      len = __getLenFromTwoBytes(
        data.slice(currentOffset, currentOffset + lenOffset)
      );
      break;
    default:
      lenOffset = currentOffset + 5;
      len = __getLenFromTwoBytes(
        data.slice(currentOffset, currentOffset + lenOffset)
      );
  }

  const newOffset = lenOffset + len;

  return __toWordRanges(data, newOffset, [...acc, [lenOffset, newOffset]]);
}

const sliceWordRange = curryN(2, (data, range) =>
  slice(range[0], range[1], data)
);

const __wordRangesToWords = curryN(2, (data, wordRanges) =>
  map(pipe(sliceWordRange(data), toString))(wordRanges)
);

const parseApiSentence = (data) =>
  pipe(unary(__toWordRanges), __wordRangesToWords(data))(data);

module.exports = {
  __calculateLenBytes,
  __getLenFromSingleByte,
  __getLenFromTwoBytes,
  __getLenFromThreeBytes,
  __getLenFromFourBytes,
  __getLenFromFiveBytes,
  __toWordRanges,
  __wordRangesToWords,
  parseApiSentence,
};
