#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://xjxgapahcookarqiwjww.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqeGdhcGFoY29va2FycWl3and3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mzc3MDMsImV4cCI6MjA2NDIxMzcwM30.S2C4PwG_RTv91Fm0VVN3B3lj0A909XddBaqPjZWAKXQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 PomoMate Demo Account Debug Tool\n');

async function testSupabaseConnection() {
    console.log('1. Testing Supabase Connection...');
    try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            return false;
        }
        console.log('✅ Supabase connection successful!');
        return true;
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        return false;
    }
}

async function checkDemoAccount() {
    console.log('\n2. Checking for existing demo account...');
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'demo@example.com')
            .single();
        
        if (error && error.code === 'PGRST116') {
            console.log('ℹ️  Demo account does not exist yet');
            return null;
        } else if (error) {
            console.error('❌ Error checking demo account:', error.message);
            return null;
        }
        
        console.log('✅ Demo account found:', {
            id: data.id,
            email: data.email,
            username: data.username,
            created_at: data.created_at
        });
        return data;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

async function testDemoLogin() {
    console.log('\n3. Testing demo login...');
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'demo@example.com',
            password: 'password123'
        });
        
        if (error) {
            console.error('❌ Demo login failed:', error.message);
            return false;
        }
        
        console.log('✅ Demo login successful!');
        console.log('   User ID:', data.user.id);
        console.log('   Email:', data.user.email);
        console.log('   Session:', data.session ? 'Active' : 'None');
        
        // Sign out after test
        await supabase.auth.signOut();
        return true;
    } catch (error) {
        console.error('❌ Login error:', error.message);
        return false;
    }
}

async function createDemoAccount() {
    console.log('\n4. Attempting to create demo account...');
    try {
        const { data, error } = await supabase.auth.signUp({
            email: 'demo@example.com',
            password: 'password123',
            options: {
                data: {
                    username: 'demo_user',
                    display_name: 'Demo User'
                },
                emailRedirectTo: 'http://localhost:8081'
            }
        });
        
        if (error) {
            console.error('❌ Demo account creation failed:', error.message);
            return false;
        }
        
        console.log('✅ Demo account created successfully!');
        console.log('   User ID:', data.user?.id);
        console.log('   Email confirmation required:', !data.session);
        
        // Create user profile if session exists
        if (data.user && data.session) {
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: data.user.id,
                    email: data.user.email,
                    username: 'demo_user',
                    display_name: 'Demo User'
                });
                
            if (profileError) {
                console.error('❌ Profile creation failed:', profileError.message);
            } else {
                console.log('✅ User profile created!');
            }
        }
        
        return true;
    } catch (error) {
        console.error('❌ Creation error:', error.message);
        return false;
    }
}

async function checkAuthSettings() {
    console.log('\n5. Checking Supabase Auth Settings...');
    console.log('   Please ensure the following in your Supabase dashboard:');
    console.log('   - Email confirmations are disabled for testing');
    console.log('   - Site URL is set to: http://localhost:8081');
    console.log('   - Redirect URLs include: http://localhost:8081/**');
    console.log('   - Email provider is configured (if using email confirmations)');
}

async function runDebug() {
    console.log('Starting debug process...\n');
    
    // Test connection
    const connected = await testSupabaseConnection();
    if (!connected) {
        console.log('\n❌ Cannot proceed without Supabase connection');
        return;
    }
    
    // Check for existing demo account
    const existingAccount = await checkDemoAccount();
    
    if (existingAccount) {
        // Try to login
        await testDemoLogin();
    } else {
        // Try to create account
        const created = await createDemoAccount();
        if (created) {
            // Try to login after creation
            await testDemoLogin();
        }
    }
    
    // Show auth settings reminder
    await checkAuthSettings();
    
    console.log('\n✨ Debug complete!');
    console.log('\nNext steps:');
    console.log('1. Start the app with: npm start');
    console.log('2. Navigate to http://localhost:8081');
    console.log('3. Click "Demo Account Login" button');
    console.log('4. Check browser console for any errors');
}

// Run the debug
runDebug().catch(console.error);