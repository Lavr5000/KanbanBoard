describe('Simple Task Test', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should handle async operations', async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(1 + 1).toBe(2);
  });
});