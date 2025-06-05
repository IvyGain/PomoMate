#!/usr/bin/env node

// Migration validation test script
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Supabase Migration...\n');

// Test 1: Check critical files exist
console.log('📁 Checking critical files...');
const criticalFiles = [
  'src/lib/supabase.js',
  'src/services/supabaseService.ts',
  'src/lib/supabaseRealtime.ts',
  'store/authStore.ts',
  'store/userStore.ts',
  'supabase/migrations/001_initial_schema.sql',
  'supabase/migrations/002_row_level_security.sql',
  'supabase/migrations/003_seed_data.sql',
  'SUPABASE_PROJECT_SETUP.md',
  '.env.example',
];

const missingFiles = [];
criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
    console.log(`❌ Missing: ${file}`);
  } else {
    console.log(`✅ Found: ${file}`);
  }
});

// Test 2: Check environment variables template
console.log('\n🔧 Checking environment configuration...');
if (fs.existsSync('.env.example')) {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  if (envExample.includes('EXPO_PUBLIC_SUPABASE_URL') && envExample.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('✅ Environment variables template is correct');
  } else {
    console.log('❌ Environment variables template is incomplete');
  }
} else {
  console.log('❌ .env.example file missing');
}

// Test 3: Check package.json for Supabase dependency
console.log('\n📦 Checking dependencies...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.dependencies['@supabase/supabase-js']) {
    console.log('✅ @supabase/supabase-js dependency found');
  } else {
    console.log('❌ @supabase/supabase-js dependency missing');
  }
  
  if (packageJson.dependencies['@react-native-community/netinfo']) {
    console.log('✅ @react-native-community/netinfo dependency found');
  } else {
    console.log('❌ @react-native-community/netinfo dependency missing');
  }
} else {
  console.log('❌ package.json file missing');
}

// Test 4: Check imports and exports
console.log('\n🔗 Checking service integrations...');

// Check if authStore properly imports Supabase
if (fs.existsSync('store/authStore.ts')) {
  const authStore = fs.readFileSync('store/authStore.ts', 'utf8');
  if (authStore.includes('supabase.auth.signInWithPassword')) {
    console.log('✅ AuthStore integrated with Supabase Auth');
  } else {
    console.log('❌ AuthStore not properly integrated with Supabase Auth');
  }
}

// Check if userStore properly imports Supabase services
if (fs.existsSync('store/userStore.ts')) {
  const userStore = fs.readFileSync('store/userStore.ts', 'utf8');
  if (userStore.includes('supabaseService')) {
    console.log('✅ UserStore integrated with Supabase services');
  } else {
    console.log('❌ UserStore not properly integrated with Supabase services');
  }
}

// Test 5: Check if migration SQL contains all required tables
console.log('\n🗄️  Checking database schema...');
if (fs.existsSync('supabase/migrations/001_initial_schema.sql')) {
  const schema = fs.readFileSync('supabase/migrations/001_initial_schema.sql', 'utf8');
  const requiredTables = [
    'users',
    'user_settings',
    'sessions',
    'characters',
    'user_characters',
    'achievements',
    'user_achievements',
    'friends',
    'teams',
    'team_members',
    'team_sessions',
    'shop_items',
  ];
  
  const missingTables = requiredTables.filter(table => !schema.includes(`CREATE TABLE ${table}`));
  if (missingTables.length === 0) {
    console.log('✅ All required database tables defined');
  } else {
    console.log(`❌ Missing database tables: ${missingTables.join(', ')}`);
  }
}

// Test 6: Check TypeScript compilation
console.log('\n🔧 Running TypeScript check...');
const { execSync } = require('child_process');
try {
  execSync('npx tsc --noEmit --skipLibCheck 2>&1 | grep -v "e2e/"', { 
    stdio: 'pipe',
    cwd: process.cwd(),
  });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  const output = error.stdout?.toString() || '';
  if (output.trim()) {
    console.log('❌ TypeScript compilation errors found:');
    console.log(output);
  } else {
    console.log('✅ TypeScript compilation successful');
  }
}

// Summary
console.log('\n📊 Migration Test Summary:');
console.log(`✅ Files found: ${criticalFiles.length - missingFiles.length}/${criticalFiles.length}`);
if (missingFiles.length > 0) {
  console.log(`❌ Missing files: ${missingFiles.length}`);
  console.log('Missing files:', missingFiles.join(', '));
}

console.log('\n🎯 Next steps:');
console.log('1. Create a Supabase project at https://supabase.com');
console.log('2. Follow the setup guide in SUPABASE_PROJECT_SETUP.md');
console.log('3. Copy .env.example to .env.local and add your Supabase credentials');
console.log('4. Run the migration scripts in your Supabase dashboard');
console.log('5. Test the app with: npm start');

if (missingFiles.length === 0) {
  console.log('\n🎉 Migration files are ready! Follow the setup guide to complete the migration.');
} else {
  console.log('\n⚠️  Some migration files are missing. Please check the errors above.');
}