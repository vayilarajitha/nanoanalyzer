const fs = require('fs');

const content = fs.readFileSync('BrainBattleAppium/tests/12_e2e/mega_android_1100.test.js', 'utf8');

// Match all describe('Category: ...')
const catMatches = [...content.matchAll(/describe\('Category: ([^']+)'/g)].map(m => m[1]);
console.log('Categories count:', catMatches.length);
console.log('Categories:', catMatches.join(', '));

// Match all test IDs
const testMatches = [...content.matchAll(/it\('\[([^\]]+)\]/g)].map(m => m[1]);
console.log('Total tests found:', testMatches.length);

const unique = new Set(testMatches);
console.log('Unique tests count:', unique.size);

const expectedCategories = [
  'Functional',
  'UI/UX',
  'Compatibility',
  'Performance',
  'Security',
  'API',
  'Database',
  'Accessibility',
  'Mobile-Specific',
  'Regression',
  'E2E'
];

let allValid = true;

if (catMatches.length !== 11) {
  console.error('FAIL: Expected 11 categories, got', catMatches.length);
  allValid = false;
}

expectedCategories.forEach(expected => {
  if (!catMatches.includes(expected)) {
    console.error('FAIL: Missing category:', expected);
    allValid = false;
  }
});

// Count tests per category by prefix
const prefixCounts = {};
testMatches.forEach(id => {
  const parts = id.split('-');
  const prefix = parts[1];
  prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
});

console.log('Counts per category prefix:');
for (const [prefix, count] of Object.entries(prefixCounts)) {
  console.log(`  ${prefix}: ${count}`);
  if (count !== 101) {
    console.error(`FAIL: Prefix ${prefix} has ${count} tests instead of 101`);
    allValid = false;
  }
}

if (testMatches.length !== 1111 || unique.size !== 1111) {
  console.error('FAIL: Expected exactly 1,111 unique tests');
  allValid = false;
}

if (allValid) {
  console.log('SUCCESS: All 1,111 unique tests verified across exactly 11 categories (101 each)!');
} else {
  process.exit(1);
}
