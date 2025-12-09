import { FormatRequestPipe } from './format-request.pipe';
import { Request } from '@app/models';

describe('FormatRequestPipe', () => {
  it('create an instance', () => {
    const pipe = new FormatRequestPipe();
    expect(pipe).toBeTruthy();
  });

  describe('test formatting request', () => {
    it('format request', () => {
      const pipe = new FormatRequestPipe();
      const request = new Request(1, 1, 0)
      expect(pipe.transform(request)).toBe('1-1');
    });

    it('skip formatting null', () => {
      const pipe = new FormatRequestPipe();
      expect(pipe.transform(null)).toBeUndefined();
    });

    it('skip formatting undefined', () => {
      const pipe = new FormatRequestPipe();
      expect(pipe.transform(undefined)).toBeUndefined();
    });
  });
});
