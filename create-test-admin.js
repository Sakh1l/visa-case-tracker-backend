const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check if environment variables are set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing required environment variables. Please ensure .env file is properly configured.');
  console.log('Required variables:');
  console.log('- SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestAdmin() {
  const email = 'admin@sakhil.in';
  const password = 'Test@1234$';
  
  console.log('Attempting to create admin user with email:', email);

  try {
    // Sign up the admin user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'admin',
          name: 'Test Admin'
        }
      }
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError.message);
      
      if (signUpError.message.includes('already registered') || signUpError.message.includes('already in use')) {
        console.log('Admin user already exists. Attempting to sign in...');
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('Error signing in:', error.message);
          
          // Try to reset the password if sign-in fails
          console.log('Attempting to reset password...');
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3000/update-password'
          });
          
          if (resetError) {
            console.error('Error resetting password:', resetError.message);
          } else {
            console.log('Password reset email sent. Please check your email to set a new password.');
          }
          
          return;
        }
        
        console.log('Successfully signed in admin user:', data.user.email);
        console.log('Admin user ID:', data.user.id);
        return;
      }
      
      // If it's not a duplicate user error, re-throw
      throw signUpError;
    }

    console.log('✅ Successfully created admin user!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n⚠️  IMPORTANT: Please change this password after first login.');
    console.log('You can now log in to the admin dashboard using these credentials.');
    
  } catch (error) {
    console.error('Error creating test admin:', error.message);
  }
}

// Run the function
createTestAdmin();
