describe('Basic Test Suite', () => {
  test('should run basic math test', () => {
    const result = 2 + 3
    expect(result).toBe(5)
  })

  test('should handle boolean operations', () => {
    expect(true).toBe(true)
    expect(false).toBe(false)
  })

  test('should work with strings', () => {
    const greeting = 'Hello'
    expect(greeting + ' World').toBe('Hello World')
  })

  test('should handle arrays', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers.includes(3)).toBe(true)
  })

  test('should work with objects', () => {
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    }

    expect(user.id).toBe(1)
    expect(user.name).toBe('Test User')
  })
})