const { expect } = require('chai');
const Chance = require('chance');

const { toDeviceWord } = require('../../src/protocol/mappers');

describe('protocol/mappers', () => {
  describe('toDeviceWord', () => {
    it('should be a function', () => {
      expect(typeof toDeviceWord).equals('function');
    });

    it('should use single byte encoding for words shorter than 128 chars', () => {
      const word = '/some/endpoint';
      const encodedWord = toDeviceWord(word);
      const encodedFirstByte = encodedWord[0];
      const encodedRestString = encodedWord
        .slice(1, Number.MAX_SAFE_INTEGER)
        .toString();

      expect(encodedWord.length).equals(word.length + 1);
      expect(encodedFirstByte).equals(word.length);
      expect(encodedRestString).equals(word);
    });

    it('should use two byte encoding for words with length 128 <= l < 16384', () => {
      const generator = new Chance();
      const wordPayload = generator.paragraph({ length: 1000 });
      const word = `=comment=${wordPayload}`;
      const encodedWord = toDeviceWord(word);

      const encodedFirstByte = encodedWord[0];
      const encodedSecondByte = encodedWord[1];
      const encodedRestString = encodedWord
        .slice(2, Number.MAX_SAFE_INTEGER)
        .toString();

      expect(encodedFirstByte & 0xc0).equals(0x80);
      expect(((encodedFirstByte & ~0xc0) << 8) + encodedSecondByte).equals(
        word.length
      );
      expect(encodedRestString).equals(word);
    });

    it('should use three byte encoding for words with length 16384 <= l < 2097152', () => {
      const generator = new Chance();
      const wordPayload = generator.paragraph({ sentences: 22000 });
      const word = `=comment=${wordPayload}`;
      const encodedWord = toDeviceWord(word);

      const encodedFirstByte = encodedWord[0];
      const encodedSecondByte = encodedWord[1];
      const encodedThirdByte = encodedWord[2];
      const encodedRestString = encodedWord
        .slice(3, Number.MAX_SAFE_INTEGER)
        .toString();

      expect(encodedFirstByte & 0xe0).equals(0xc0);
      expect(
        ((encodedFirstByte & ~0xe0) << 16) +
          (encodedSecondByte << 8) +
          encodedThirdByte
      ).equals(word.length);
      expect(encodedRestString).equals(word);
    });
  });
});
