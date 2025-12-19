describe('Simple Test', () => {
  test('should run a simple test', () => {
    expect(true).toBe(true)
  })

  test('should add numbers correctly', () => {
    const result = 2 + 3
    expect(result).toBe(5)
  })
})