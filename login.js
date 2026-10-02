import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// UI Toggle
window.toggleForm = function(type) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (type === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
    }
}

// Helper to identify admin
function checkIsAdmin(email) {
    if (!email) return false;
    const lower = email.toLowerCase().trim();
    return lower === 'admin@gadgetsixtynine.com' || 
           lower === 'admin@gadget69.com' || 
           lower.startsWith('admin@');
}

// Redirect if already logged in (Local check for quick UI, proper Firebase auth state is better for production)
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        if (currentUser.role === 'admin' || checkIsAdmin(currentUser.email)) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'profile.html';
        }
    }
});

// Firebase Registration
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('r-name').value;
    const email = document.getElementById('r-email').value;
    const password = document.getElementById('r-password').value;
    const errorEl = document.getElementById('register-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    submitBtn.textContent = "Creating Account...";
    submitBtn.disabled = true;
    errorEl.style.display = 'none';
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with name
        await updateProfile(userCredential.user, { displayName: name });
        
        // Immediately sign them out so they are not automatically logged in
        await signOut(auth);
        
        alert("Registration Successful! Please sign in with your email and password.");
        
        // Reset the registration form
        e.target.reset();
        
        // Pre-fill the login email and switch to login tab
        document.getElementById('l-email').value = email;
        document.getElementById('l-password').value = '';
        
        // Enable signup button back for future attempts
        submitBtn.textContent = "Sign Up";
        submitBtn.disabled = false;
        
        window.toggleForm('login');
    } catch (error) {
        console.error("Registration Error: ", error);
        errorEl.textContent = error.message.replace('Firebase: ', '');
        errorEl.style.display = 'block';
        submitBtn.textContent = "Sign Up";
        submitBtn.disabled = false;
    }
});

// Firebase Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('l-email').value;
    const password = document.getElementById('l-password').value;
    const errorEl = document.getElementById('login-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    submitBtn.textContent = "Signing In...";
    submitBtn.disabled = true;
    errorEl.style.display = 'none';
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const isAdmin = checkIsAdmin(user.email);
        
        // Save to local storage for quick UI access
        localStorage.setItem('currentUser', JSON.stringify({ 
            name: user.displayName || (isAdmin ? 'Admin' : 'User'), 
            email: user.email,
            role: isAdmin ? 'admin' : 'customer'
        }));

        // Role-based redirection
        if (isAdmin) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'profile.html';
        }
    } catch (error) {
        console.error("Login Error: ", error);
        errorEl.textContent = "Invalid email or password!";
        errorEl.style.display = 'block';
        submitBtn.textContent = "Sign In";
        submitBtn.disabled = false;
    }
});
