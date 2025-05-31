const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://xjxgapahcookarqiwjww.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDemoAccount() {
  const demoEmail = 'demo@pomomate.app';
  const demoPassword = 'DemoPassword123!';
  const demoUsername = 'デモユーザー';

  try {
    console.log('🔧 Setting up demo account...');
    
    // Check if demo user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(demoEmail);
    
    if (existingUser?.user) {
      console.log('ℹ️ Demo user already exists');
      
      // Ensure user profile exists
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', existingUser.user.id)
        .single();
        
      if (!profile) {
        console.log('📝 Creating user profile...');
        await supabase.from('users').insert([{
          id: existingUser.user.id,
          email: demoEmail,
          username: demoUsername,
          display_name: demoUsername,
          level: 1,
          experience: 0,
          coins: 100,
          streak_days: 0,
          focus_time_today: 0,
          total_focus_time: 0,
        }]);
      }
      
      console.log('✅ Demo account is ready');
      return;
    }
    
    // Create demo user
    console.log('📝 Creating demo user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        username: demoUsername,
        display_name: demoUsername,
      }
    });
    
    if (authError) throw authError;
    
    console.log('📝 Creating user profile...');
    // Create user profile
    await supabase.from('users').insert([{
      id: authData.user.id,
      email: demoEmail,
      username: demoUsername,
      display_name: demoUsername,
      level: 1,
      experience: 0,
      coins: 100,
      streak_days: 0,
      focus_time_today: 0,
      total_focus_time: 0,
    }]);
    
    // Create default settings
    await supabase.from('user_settings').insert([{
      user_id: authData.user.id,
      theme: 'dark',
      sound_enabled: true,
      notification_enabled: true,
      work_duration: 25,
      short_break_duration: 5,
      long_break_duration: 15,
      sessions_until_long_break: 4,
    }]);
    
    // Create default character
    await supabase.from('user_characters').insert([{
      user_id: authData.user.id,
      character_id: 'balanced_1',
      is_active: true,
    }]);
    
    console.log('✅ Demo account created successfully');
    console.log('📧 Email:', demoEmail);
    console.log('🔑 Password:', demoPassword);
    
  } catch (error) {
    console.error('❌ Error setting up demo account:', error);
    process.exit(1);
  }
}

setupDemoAccount();