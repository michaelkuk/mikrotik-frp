/* eslint-disable no-underscore-dangle */
const {
  cond,
  pipe,
  length,
  gt,
  T,
  converge,
  unapply,
  propOr,
  toPairs,
  prop,
  map,
  unary,
  when,
  ifElse,
} = require('ramda');
const { isNotEmpty } = require('ramda-adjunct');

const __encodeSingleByteLen = (len) => Buffer.of(len);

const __encodeTwoByteLen = (len) =>
  Buffer.concat([
    Buffer.of(((len | 0x8000) >> 8) & 0xff),
    Buffer.of((len | 0x8000) & 0xff),
  ]);

const __encodeThreeByteLen = (len) =>
  Buffer.concat([
    Buffer.of(((len | 0xc00000) >> 16) & 0xff),
    Buffer.of(((len | 0xc00000) >> 8) & 0xff),
    Buffer.of((len | 0xc00000) & 0xff),
  ]);

const __encodeFourByteLen = (len) =>
  Buffer.concat([
    Buffer.of(((len | 0xe0000000) >> 24) & 0xff),
    Buffer.of(((len | 0xe0000000) >> 16) & 0xff),
    Buffer.of(((len | 0xe0000000) >> 8) & 0xff),
    Buffer.of((len | 0xe0000000) & 0xff),
  ]);

const __encodeFiveByteLen = (len) =>
  Buffer.concat([
    Buffer.of(0xf0),
    Buffer.of((len >> 24) & 0xff),
    Buffer.of((len >> 16) & 0xff),
    Buffer.of((len >> 8) & 0xff),
    Buffer.of(len & 0xff),
  ]);

// const __encodeLengthImp = (len) => {
//   if (len < 0x80) {
//     return __encodeSingleByteLen(len);
//   }

//   if (len < 0x4000) {
//     return __encodeTwoByteLen(len);
//   }

//   if (len < 0x200000) {
//     return __encodeThreeByteLen(len);
//   }

//   if (len < 0x10000000) {
//     return __encodeFourByteLen(len);
//   }

//   return __encodeFiveByteLen(len);
// };

const __encodeLength = cond([
  [gt(0x80), __encodeSingleByteLen],
  [gt(0x4000), __encodeTwoByteLen],
  [gt(0x200000), __encodeThreeByteLen],
  [gt(0x10000000), __encodeFourByteLen],
  [T, __encodeFiveByteLen],
]);

const toDeviceWord = converge(unapply(unary(Buffer.concat)), [
  pipe(length, __encodeLength),
  // pipe(length, __encodeLengthImp),
  unary(Buffer.from),
]);

const serializeAttributePair = ([key, val]) => `=${key}=${val}`;
const setTag = (value) => `.tag=${value}`;
const toBuffer = (v) => Buffer.from(v);
const stopWord = () => Buffer.of(0);

// Command -> Buffer
const commandToDeviceSentence = pipe(
  converge(unapply(unary(Buffer.concat)), [
    // Encode endpoint word
    pipe(prop('endpoint'), toDeviceWord),
    // Encode channel tag if present
    pipe(
      propOr('', 'tag'),
      when(isNotEmpty, pipe(setTag, toDeviceWord)),
      toBuffer
    ),
    // Encode attributes
    pipe(
      propOr({}, 'attributes'),
      toPairs,
      map(pipe(serializeAttributePair, toDeviceWord)),
      ifElse(isNotEmpty, unary(Buffer.concat), () => Buffer.from(''))
    ),
    // TODO: Encode query attrybutes
    stopWord,
  ])
);

module.exports = {
  toDeviceWord,
  commandToDeviceSentence,
  __encodeLength,
};
