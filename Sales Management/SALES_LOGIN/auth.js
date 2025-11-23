/**
 * Full Authentication Implementation for Sales Management App
 * Handles: Sign-up, Sign-in, Google OAuth, Logout, Session Management
 */

import { supabase } from './supabaseClient.js';

// ==================== SIGN UP ====================
/**
 * Sign up with email, password, and name
 * Creates user in auth and profile in 'profiles' table
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User full name
 * @returns {object} { success: boolean, data: object, error: string }
 */
export async function signUp(email, password, name) {
  try {
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // Insert profile into profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        name,
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Auth user created but profile failed - log for manual intervention
    }

    return {
      success: true,
      data: authData,
      message: 'Sign up successful. Please check your email to confirm your account.'
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ==================== SIGN IN ====================
/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object} { success: boolean, data: object, error: string }
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data,
      message: 'Sign in successful'
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ==================== GOOGLE OAUTH ====================
/**
 * Sign in with Google OAuth
 * Redirects to dashboard.html on success
 * @returns {object} { success: boolean, error: string }
 */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/DASHBOARD/dashboard.html`
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Redirecting to Google Sign-In...'
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ==================== LOGOUT ====================
/**
 * Sign out user and redirect to login page
 * @returns {object} { success: boolean, error: string }
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    // Redirect to login page
    window.location.href = '/index.html';

    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ==================== SESSION MANAGEMENT ====================
/**
 * Get current session
 * @returns {object} Session object or null
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }

    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

/**
 * Get current user
 * @returns {object} User object or null
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }

    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// ==================== AUTH STATE LISTENER ====================
/**
 * Listen to auth state changes
 * Useful for redirects and UI updates
 * @param {function} callback - Callback function(event, session)
 * @returns {function} Unsubscribe function
 */
export function onAuthStateChange(callback) {
  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  // Return unsubscribe function
  return () => {
    authListener?.subscription?.unsubscribe();
  };
}

// ==================== ROUTE PROTECTION ====================
/**
 * Protect route by checking session
 * If no session, redirect to login
 * @param {string} redirectUrl - URL to redirect if not authenticated (default: /index.html)
 * @returns {Promise<object>} User object if authenticated
 */
export async function protectRoute(redirectUrl = '/index.html') {
  try {
    const session = await getCurrentSession();

    if (!session) {
      window.location.href = redirectUrl;
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('Route protection error:', error);
    window.location.href = redirectUrl;
    return null;
  }
}

// ==================== GET USER PROFILE ====================
/**
 * Get user profile from 'profiles' table
 * @param {string} userId - User ID
 * @returns {object} Profile data or null
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Profile fetch warning:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    return null;
  }
}

// ==================== UPDATE USER PROFILE ====================
/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {object} { success: boolean, data: object, error: string }
 */
export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
