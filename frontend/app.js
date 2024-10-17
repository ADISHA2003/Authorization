// app.js
document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:5000/api/auth'; // Update with your backend URL
  
    // Function to get the reset token from the URL
    const getResetToken = () => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('token');
    };
  
    // Handle signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
  
        try {
          const response = await fetch(`${apiUrl}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
  
          if (response.ok) {
            alert('Signup successful! You can now log in.');
            window.location.href = '/login.html'; // Redirect to login page
          } else {
            const errorData = await response.json();
            alert(`Signup failed: ${errorData.error}`);
          }
        } catch (error) {
          console.error('Error during signup:', error);
          alert('An error occurred during signup.');
        }
      });
    }
  
    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
  
        try {
          const response = await fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
  
          if (response.ok) {
            alert('Login successful!');
            window.location.href = '/index.html'; // Redirect to home page after login
          } else {
            const errorData = await response.json();
            if (errorData.redirectToSignup) {
              window.location.href = '/signup.html';
            } else {
              alert(`Login failed: ${errorData.message}`);
            }
          }
        } catch (error) {
          console.error('Error during login:', error);
          alert('An error occurred during login.');
        }
      });
    }
  
    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        try {
          const response = await fetch(`${apiUrl}/logout`, {
            method: 'POST'
          });
  
          if (response.ok) {
            alert('Logout successful!');
            window.location.href = '/login.html'; // Redirect to login after logout
          } else {
            alert('Logout failed. Try again.');
          }
        } catch (error) {
          console.error('Error during logout:', error);
          alert('An error occurred during logout.');
        }
      });
    }
  
    // Handle forgot password form submission
const forgotPasswordForm = document.getElementById('forgot-password-form');
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('forgot-password-email').value;

    // 1. Display the loader
    document.getElementById('loader').style.display = 'block'; // Assuming you have a loader element with id 'loader'

    try {
      const response = await fetch(`${apiUrl}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      // 2. Hide the loader after the response is received
      document.getElementById('loader').style.display = 'none';

      if (response.ok) {
        alert('Password reset email sent!');
        // You might want to redirect to the login page or display a success message
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);

      // 3. Hide the loader in case of an error as well
      document.getElementById('loader').style.display = 'none';

      alert('An error occurred. Please try again later.');
    }
  });
}
  
    // Handle reset password form submission
    const resetPasswordForm = document.getElementById('reset-password-form');
    if (resetPasswordForm) {
      resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const resetToken = getResetToken(); // Get token from URL
        const newPassword = document.getElementById('new-password').value;
  
        try {
          const response = await fetch(`${apiUrl}/reset-password/${resetToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
          });
  
          if (response.ok) {
            alert('Password reset successful! You can now log in with your new password.');
            window.location.href = '/login.html'; 
          } else {
            const errorData = await response.json();
            alert(`Password reset failed: ${errorData.error}`);
          }
        } catch (error) {
          console.error('Error resetting password:', error);
          alert('An error occurred. Please try again later.');
        }
      });
    }
  });
  