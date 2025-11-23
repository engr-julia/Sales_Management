//Main authentication form handler for Sales Management App

import { signUp, signIn, signInWithGoogle, onAuthStateChange } from './auth.js';

// DOM ELEMENTS
const signUpForm = document.querySelector('.form-container.sign-up form');
const signInForm = document.querySelector('.form-container.sign-in form');
const googleButtons = document.querySelectorAll('.social-icons .icon');

//HELPER FUNCTIONS

function showAlert(message, type = 'error') {
  const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
  const alertHTML = `<div class="alert ${alertClass}">${message}</div>`;
  
  const container = document.getElementById('container');
  if (!container) return;
  
  const existingAlert = container.querySelector('.alert');
  
  if (existingAlert) {
    existingAlert.remove();
  }
  
  container.insertAdjacentHTML('beforebegin', alertHTML);
  
  setTimeout(() => {
    document.querySelector('.alert')?.remove();
  }, 5000);
}

//Disable/Enable form buttons
function setFormLoading(form, isLoading) {
  const button = form.querySelector('button[type="submit"]');
  const inputs = form.querySelectorAll('input');
  
  if (!button) return;
  
  if (isLoading) {
    button.disabled = true;
    button.textContent = 'Loading...';
    inputs.forEach(input => input.disabled = true);
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Sign Up';
    inputs.forEach(input => input.disabled = false);
  }
}

//Get form input values
function getFormValues(form, fields) {
  const values = {};
  fields.forEach(field => {
    const input = form.querySelector(`input[placeholder="${field.charAt(0).toUpperCase() + field.slice(1)}"]`);
    if (input) {
      values[field] = input.value.trim();
    }
  });
  return values;
}

//Clear form fields
function clearForm(form) {
  form.reset();
}

// SIGN UP HANDLER
if (signUpForm) {
  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const button = signUpForm.querySelector('button[type="submit"]');
    if (button) {
      button.dataset.originalText = 'Sign Up';
    }

    const formValues = getFormValues(signUpForm, ['name', 'email', 'password']);
    const { name, email, password } = formValues;

    // Validation
    if (!name || !email || !password) {
      showAlert('Please fill in all fields', 'error');
      return;
    }

    if (password.length < 6) {
      showAlert('Password must be at least 6 characters', 'error');
      return;
    }

    if (!email.includes('@')) {
      showAlert('Please enter a valid email', 'error');
      return;
    }

    setFormLoading(signUpForm, true);

    const result = await signUp(email, password, name);

    if (result.success) {
      showAlert('Sign up successful! Please check your email to confirm your account.', 'success');
      clearForm(signUpForm);
      
      // Switch to sign in form after 2 seconds
      setTimeout(() => {
        const loginBtn = document.getElementById('login');
        if (loginBtn) loginBtn.click();
      }, 2000);
    } else {
      showAlert(`Sign up failed: ${result.error}`, 'error');
    }

    setFormLoading(signUpForm, false);
  });
}

// SIGN IN HANDLER 
if (signInForm) {
  signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const button = signInForm.querySelector('button[type="submit"]');
    if (button) {
      button.dataset.originalText = 'Sign In';
    }

    const formValues = getFormValues(signInForm, ['email', 'password']);
    const { email, password } = formValues;

    // Validation
    if (!email || !password) {
      showAlert('Please fill in all fields', 'error');
      return;
    }

    if (!email.includes('@')) {
      showAlert('Please enter a valid email', 'error');
      return;
    }

    setFormLoading(signInForm, true);

    const result = await signIn(email, password);

    if (result.success) {
      showAlert('Sign in successful! Redirecting to dashboard...', 'success');
      clearForm(signInForm);
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = '/DASHBOARD/dashboard.html';
      }, 1000);
    } else {
      showAlert(`Sign in failed: ${result.error}`, 'error');
    }

    setFormLoading(signInForm, false);
  });
}

//  GOOGLE OAUTH HANDLER 
googleButtons.forEach(button => {
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const result = await signInWithGoogle();
    
    if (!result.success) {
      showAlert(`Google sign-in failed: ${result.error}`, 'error');
    }
  });
});

//  AUTH STATE LISTENER 
// Optional: Listen for auth state changes
onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('Session:', session);
  
  if (event === 'SIGNED_IN') {
    console.log('User signed in');
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});
