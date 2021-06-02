const { expect } = require('chai');
const { toDeviceWord } = require('../../src/protocol/mappers');
const { parseApiSentence } = require('../../src/protocol/parsers');

describe('protocol', () => {
  describe('parsers', () => {
    let raw1byte;
    let raw2byte;
    let raw3byte;

    let encoded1byte;
    let encoded2byte;
    let encoded3byte;

    before(() => {
      raw1byte = `=attr=${'abcde'.repeat(10)}`;
      raw2byte = `=attribute=${'abcde'.repeat(Math.floor(16384 / 2 / 5))}`;
      raw3byte = `=attribute=${'abcde'.repeat(Math.floor(2097152 / 2 / 5))}`;

      encoded1byte = toDeviceWord(raw1byte);
      encoded2byte = toDeviceWord(raw2byte);
      encoded3byte = toDeviceWord(raw3byte);
    });

    it('should correctly parse sentence consisting of 1,2 and 3 byte words', () => {
      const result = parseApiSentence(
        Buffer.concat([encoded1byte, encoded2byte, encoded3byte])
      );

      expect(Array.isArray(result)).equal(true);
      expect(result[0]).equal(raw1byte);
      expect(result[1]).equal(raw2byte);
      expect(result[2]).equal(raw3byte);
    });
  });
});
