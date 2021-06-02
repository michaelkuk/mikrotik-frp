const { expect } = require('chai');

const { __encodeLength, toDeviceWord } = require('../../src/protocol/mappers');
const {
  __calculateLenBytes,
  __getLenFromSingleByte,
  __getLenFromTwoBytes,
  __getLenFromThreeBytes,
  __getLenFromFourBytes,
  __getLenFromFiveBytes,
  parseApiSentence,
} = require('../../src/protocol/parsers');

describe('protocol', () => {
  describe('encode/decode single byte length', () => {
    it('should encode length <128 using single byte', () => {
      const encodedLen = __encodeLength(55);

      expect(encodedLen.length).equal(1);
      expect(encodedLen[0]).equal(55);
    });

    it('should be able to parse single byte length', () => {
      const encodedLen = __encodeLength(62);

      expect(__calculateLenBytes(encodedLen[0])).equal(1);
      expect(__getLenFromSingleByte(encodedLen)).equal(62);
    });
  });

  describe('encode/decode two byte length', () => {
    it('should encode length <16384 using two byte', () => {
      const encodedLen = __encodeLength(10000);

      expect(encodedLen.length).equal(2);
    });

    it('should be able to parse two byte length', () => {
      const encodedLen = __encodeLength(10000);

      expect(__calculateLenBytes(encodedLen[0])).equal(2);
      expect(__getLenFromTwoBytes(encodedLen)).equal(10000);
    });
  });

  describe('encode/decode three byte length', () => {
    it('should encode length <2097152 using three byte', () => {
      const encodedLen = __encodeLength(2097149);

      expect(encodedLen.length).equal(3);
    });

    it('should be able to parse three byte length', () => {
      const encodedLen = __encodeLength(2097149);

      expect(__calculateLenBytes(encodedLen[0])).equal(3);
      expect(__getLenFromThreeBytes(encodedLen)).equal(2097149);
    });
  });

  describe('encode/decode four byte length', () => {
    it('should encode length <268435456 using four byte', () => {
      const encodedLen = __encodeLength(268435455);

      expect(encodedLen.length).equal(4);
    });

    it('should be able to parse four byte length', () => {
      const encodedLen = __encodeLength(268435455);

      expect(__calculateLenBytes(encodedLen[0])).equal(4);
      expect(__getLenFromFourBytes(encodedLen)).equal(268435455);
    });
  });

  describe('encode/decode five byte length', () => {
    it('should encode length>=268435456 using five byte', () => {
      const encodedLen = __encodeLength(268435457);

      expect(encodedLen.length).equal(5);
    });

    it('should be able to parse five byte length', () => {
      const encodedLen = __encodeLength(268435457);

      expect(__calculateLenBytes(encodedLen[0])).equal(5);
      expect(__getLenFromFiveBytes(encodedLen)).equal(268435457);
    });
  });

  describe('parseApiSentence', () => {
    let originalWords;
    let encodedData;
    let result;

    before(() => {
      originalWords = [
        '/some/endpoint',
        '=some=attr',
        '=other=attr2',
        '.tag=xyzChannelId',
      ];

      encodedData = Buffer.concat(originalWords.map((w) => toDeviceWord(w)));

      result = parseApiSentence(encodedData);
    });

    it('should produce corrent number of words', () => {
      expect(result.length).equal(originalWords.length);
    });

    it('should produce words that are identical to input', () => {
      result.forEach((val, idx) => {
        expect(val).equal(originalWords[idx]);
      });
    });
  });
});
