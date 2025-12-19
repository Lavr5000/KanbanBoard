// Test runner configuration and utilities
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function runCommand(command, description) {
  log(`\n🔄 ${description}...`, colors.blue)

  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'inherit', 'inherit'],
      cwd: path.join(__dirname, '..')
    })

    log(`✅ ${description} completed successfully!`, colors.green)
    return true
  } catch (error) {
    log(`❌ ${description} failed!`, colors.red)
    log(`Error: ${error.message}`, colors.red)
    return false
  }
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath)
  if (fs.existsSync(fullPath)) {
    log(`✅ ${description} exists`, colors.green)
    return true
  } else {
    log(`❌ ${description} not found at ${fullPath}`, colors.red)
    return false
  }
}

function validateTestStructure() {
  log('\n🔍 Validating test structure...', colors.cyan)

  const requiredFiles = [
    { path: 'jest.config.js', desc: 'Jest configuration' },
    { path: 'jest.setup.js', desc: 'Jest setup file' },
    { path: 'package.json', desc: 'Package.json' }
  ]

  const requiredDirs = [
    { path: 'src/shared/store/__tests__', desc: 'Store tests directory' },
    { path: 'src/features/kanban/ui/__tests__', desc: 'UI components tests directory' },
    { path: '__tests__/e2e', desc: 'E2E tests directory' }
  ]

  let allValid = true

  // Check files
  requiredFiles.forEach(({ path, desc }) => {
    if (!checkFileExists(path, desc)) {
      allValid = false
    }
  })

  // Check directories
  requiredDirs.forEach(({ path, desc }) => {
    if (!checkFileExists(path, desc)) {
      allValid = false
    }
  })

  return allValid
}

function runTestSuites() {
  log('\n🚀 Running Kanban Board Test Suites', colors.magenta)
  log('='.repeat(50), colors.cyan)

  const testSuites = [
    {
      name: 'Store Unit Tests',
      command: 'npm test -- --testPathPattern=kanbanStore.test.ts',
      description: 'Testing Zustand store functionality'
    },
    {
      name: 'KanbanCard Component Tests',
      command: 'npm test -- --testPathPattern=KanbanCard.test.tsx',
      description: 'Testing KanbanCard component (Bug #1 fix)'
    },
    {
      name: 'FilterPanel Component Tests',
      command: 'npm test -- --testPathPattern=FilterPanel.test.tsx',
      description: 'Testing FilterPanel component (Bug #2 fix)'
    },
    {
      name: 'KanbanBoard Integration Tests',
      command: 'npm test -- --testPathPattern=KanbanBoard.integration.test.tsx',
      description: 'Testing KanbanBoard integration'
    },
    {
      name: 'End-to-End User Journey Tests',
      command: 'npm test -- --testPathPattern=user-journeys.test.tsx',
      description: 'Testing complete user workflows'
    }
  ]

  const results = []

  for (const suite of testSuites) {
    const success = runCommand(suite.command, suite.description)
    results.push({ name: suite.name, success })

    if (!success) {
      log(`\n⚠️  Stopping test run due to failures in ${suite.name}`, colors.yellow)
      break
    }
  }

  return results
}

function runCoverageReport() {
  log('\n📊 Generating coverage report...', colors.cyan)
  return runCommand('npm run test:coverage', 'Coverage analysis')
}

function showSummary(results) {
  log('\n📋 Test Results Summary', colors.magenta)
  log('='.repeat(30), colors.cyan)

  const passed = results.filter(r => r.success).length
  const total = results.length

  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    const color = result.success ? colors.green : colors.red
    log(`${status} ${result.name}`, color)
  })

  log(`\n${passed}/${total} test suites passed`, passed === total ? colors.green : colors.yellow)

  if (passed === total) {
    log('\n🎉 All tests passed successfully!', colors.green)
    log('\n📝 Test coverage highlights:', colors.blue)
    log('   • Unit tests: Store CRUD operations and filtering logic')
    log('   • Component tests: UI interactions and state management')
    log('   • Integration tests: Cross-component functionality')
    log('   • E2E tests: Complete user workflows')
    log('\n🐛 Bug fixes verified:')
    log('   • Bug #1: Edit mode persistence (KanbanCard)')
    log('   • Bug #2: Filter functionality (FilterPanel)')
  } else {
    log('\n⚠️  Some tests failed. Please review the output above.', colors.yellow)
  }
}

// Main execution
function main() {
  log('\n🧪 Kanban Board Test Runner', colors.magenta)
  log('📍 Project: c:\\Users\\user\\.claude\\0 ProEKTi\\kanban-board', colors.blue)
  log(`📅 Run at: ${new Date().toLocaleString()}`, colors.blue)

  // Validate structure
  if (!validateTestStructure()) {
    log('\n❌ Test structure validation failed. Please check required files.', colors.red)
    process.exit(1)
  }

  // Run test suites
  const results = runTestSuites()

  // Generate coverage if all tests pass
  if (results.every(r => r.success)) {
    runCoverageReport()
  }

  // Show summary
  showSummary(results)

  // Exit with appropriate code
  const allPassed = results.every(r => r.success)
  process.exit(allPassed ? 0 : 1)
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  runCommand,
  checkFileExists,
  validateTestStructure,
  runTestSuites,
  runCoverageReport,
  showSummary
}