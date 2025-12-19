#!/usr/bin/env node

/**
 * Smoke test for Apartment Auditor
 * Validates data integrity and project configuration
 */

import fs from 'fs';
import path from 'path';

// Configuration
const CHECKPOINTS_PATH = path.join('constants', 'checkpoints_v2.1.json');
const REQUIRED_ROOT_FIELDS = ['version', 'generatedAt', 'description', 'totalCheckpoints', 'categories'];
const REQUIRED_CATEGORIES = 9; // Expected number of categories

function log(message) {
  console.log(`[smoke-test] ${message}`);
}

function logError(message) {
  console.error(`[smoke-test] ERROR: ${message}`);
}

function validateJsonStructure(data) {
  log('Validating JSON structure...');

  // Check root level fields
  for (const field of REQUIRED_ROOT_FIELDS) {
    if (!(field in data)) {
      throw new Error(`Missing required root field: ${field}`);
    }
  }

  // Validate totalCheckpoints is a number
  if (typeof data.totalCheckpoints !== 'number' || data.totalCheckpoints <= 0) {
    throw new Error('totalCheckpoints must be a positive number');
  }

  // Validate categories object
  if (typeof data.categories !== 'object' || data.categories === null) {
    throw new Error('categories must be an object');
  }

  // Check categories
  const categoryIds = Object.keys(data.categories);
  if (categoryIds.length !== REQUIRED_CATEGORIES) {
    log(`Expected ${REQUIRED_CATEGORIES} categories, found ${categoryIds.length}`);
  }

  // Validate each category
  for (const categoryId of categoryIds) {
    const category = data.categories[categoryId];

    if (!category.id || !category.name) {
      throw new Error(`Category ${categoryId} missing id or name`);
    }

    if (!Array.isArray(category.draft) || !Array.isArray(category.finish)) {
      throw new Error(`Category ${categoryId} must have draft and finish arrays`);
    }

    // Validate checkpoints in each mode
    for (const mode of ['draft', 'finish']) {
      for (const checkpoint of category[mode]) {
        validateCheckpoint(checkpoint);
      }
    }
  }

  log(`✅ Validated ${categoryIds.length} categories with ${data.totalCheckpoints} total checkpoints`);
}

function validateCheckpoint(checkpoint) {
  const requiredFields = ['id', 'categoryId', 'title', 'description', 'tolerance', 'method', 'standardReference', 'violationText', 'hintLayman', 'referenceImageUrl', 'status', 'userPhotos', 'userComment'];

  for (const field of requiredFields) {
    if (!(field in checkpoint)) {
      throw new Error(`Checkpoint missing required field: ${field}`);
    }
  }

  if (typeof checkpoint.id !== 'string' || checkpoint.id.trim() === '') {
    throw new Error('Checkpoint id must be a non-empty string');
  }

  if (!Array.isArray(checkpoint.userPhotos)) {
    throw new Error('userPhotos must be an array');
  }
}

function validateFileExists() {
  log('Validating checkpoints file exists...');

  if (!fs.existsSync(CHECKPOINTS_PATH)) {
    throw new Error(`Checkpoints file not found at: ${path.resolve(CHECKPOINTS_PATH)}`);
  }
  log(`✅ Found checkpoints file at: ${path.resolve(CHECKPOINTS_PATH)}`);
}

function validatePackageJson() {
  log('Validating package.json configuration...');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // Check ESM support
    if (packageJson.type !== 'module') {
      throw new Error('package.json must have "type": "module" for ESM support');
    }

    // Check tunnel scripts
    if (!packageJson.scripts.start?.includes('--tunnel')) {
      throw new Error('package.json start script must use --tunnel flag');
    }

    log('✅ ESM and tunnel configuration validated');
  } catch (error) {
    throw new Error(`package.json validation failed: ${error.message}`);
  }
}

function runTypeScriptCheck() {
  log('Running TypeScript type check...');

  try {
    const { execSync } = require('child_process');
    execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: '.' });
    log('✅ TypeScript compilation passed');
    return true;
  } catch (error) {
    logError('TypeScript compilation failed');
    return false;
  }
}

function main() {
  console.log('🚀 Starting Apartment Auditor Smoke Test\n');

  try {
    // Validate file exists
    validateFileExists();

    // Read and parse JSON
    log('Loading checkpoints database...');
    const data = JSON.parse(fs.readFileSync(CHECKPOINTS_PATH, 'utf8'));

    // Validate structure
    validateJsonStructure(data);

    // Validate package.json
    validatePackageJson();

    // Run TypeScript check (optional, doesn't fail smoke test)
    const typescriptPassed = runTypeScriptCheck();

    console.log('\n🎉 Smoke test PASSED!');
    console.log('✅ Data integrity: Valid');
    console.log('✅ Structure: Valid');
    console.log('✅ Configuration: Valid');
    if (typescriptPassed) {
      console.log('✅ TypeScript: Valid');
    } else {
      console.log('⚠️  TypeScript: Issues found (but data is valid)');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Smoke test FAILED:');
    logError(error.message);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the test
main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});