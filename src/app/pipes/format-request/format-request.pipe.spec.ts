import { FormatRequestPipe } from './format-request.pipe';

describe('RequestPipe', () => {
  it('create an instance', () => {
    const pipe = new FormatRequestPipe();
    expect(pipe).toBeTruthy();
  });
});
