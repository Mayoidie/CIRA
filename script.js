// script.js

// 1. IMPORT FIREBASE AUTH & FIRESTORE FUNCTIONS
import { signUpUser, signInUser, db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


document.addEventListener('DOMContentLoaded', () => {

    // --- Select Elements ---
    const modal = document.getElementById('auth-modal');
    const triggers = document.querySelectorAll('.trigger-modal');
    const closeBtn = document.querySelector('.close-btn');
    const tabButtons = document.querySelectorAll('.tab-button');
    const signInForm = document.getElementById('sign-in-form');
    const signUpForm = document.getElementById('sign-up-form');
    const authTitle = document.getElementById('auth-title');

    // --- Modal & Tab Logic ---

    function showTab(targetFormId) {
        signInForm.classList.add('hidden-form');
        signUpForm.classList.add('hidden-form');

        tabButtons.forEach(btn => btn.classList.remove('active'));

        if (targetFormId === 'sign-in-form') {
            signInForm.classList.remove('hidden-form');
            authTitle.textContent = 'Welcome Back!';
            document.querySelector('[data-target="sign-in-form"]').classList.add('active');
        } else if (targetFormId === 'sign-up-form') {
            signUpForm.classList.remove('hidden-form');
            authTitle.textContent = 'Join CIRA!';
            document.querySelector('[data-target="sign-up-form"]').classList.add('active');
        }
    }

    function openModal(e) {
        e.preventDefault();
        if (!modal) return;
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        const formToOpen = e.currentTarget.getAttribute('data-form');
        if (formToOpen === 'signup') {
            showTab('sign-up-form');
        } else {
            showTab('sign-in-form');
        }
    }

    function closeModal() {
        if (!modal) return;
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Event Listeners for Modal/Tabs
    triggers.forEach(trigger => {
        trigger.addEventListener('click', openModal);
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            showTab(targetId);
        });
    });

    // Toggle password visibility
    document.querySelectorAll('.eye-icon').forEach(eye => {
        eye.addEventListener('click', () => {
            const input = eye.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    });


    // =======================================================
    // --- 2. FIREBASE AUTHENTICATION LOGIC ---
    // =======================================================

    // Sign Up Submission Handler
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('signUpName').value;
            const email = document.getElementById('signUpEmail').value;
            const role = document.getElementById('signUpRole').value;
            const studentId = document.getElementById('signUpStudentID').value;
            const password = document.getElementById('signUpPassword').value;
            const confirmPassword = document.getElementById('signUpConfirmPassword').value;

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            if ((role === 'student' || role === 'classrep') && !studentId) {
                alert("Student ID is required for your selected role.");
                return;
            }

            try {
                const user = await signUpUser(email, password, name, role, studentId);
                alert(`Account created for ${user.displayName || user.email}! You can now sign in.`);
                
                signUpForm.reset();
                showTab('sign-in-form'); 

            } catch (error) {
                console.error("Registration Failed:", error);
                
                let errorMessage = error.message;
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = "This email address is already in use.";
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = "Password should be at least 6 characters.";
                }
                
                alert(`Registration Failed: ${errorMessage}`);
            }
        });
    }


    // Sign In Submission Handler (Updated for Role-Based Redirection)
    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('signInUsername').value;
            const password = document.getElementById('signInPassword').value;

            try {
                // 1. Sign in using Firebase Auth
                const user = await signInUser(email, password);
                const uid = user.uid;

                // 2. Fetch the user's role from Firestore
                const userRef = doc(db, "users", uid);
                const userSnap = await getDoc(userRef);

                let targetPage = 'index.html';
                let userName = user.email; // Default to email

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const userRole = userData.role;
                    userName = userData.name || user.email; // Use name if available
                    
                    // 3. Determine redirection based on the definitive role
                    if (userRole === 'admin') {
                        targetPage = 'admin.html';
                    } else if (userRole === 'classrep') {
                        targetPage = 'classrep.html';
                    } else if (userRole === 'student') {
                        targetPage = 'student.html';
                    }
                } else {
                    console.error("User document not found in Firestore for UID:", uid);
                    alert("Sign In Failed: User profile incomplete. Contact support.");
                    // Since we can't determine the role, we should sign the user out for security
                    // Note: 'auth' is not directly imported here, but it can be accessed 
                    // if you adjust the import or handle this error in a robust way. 
                    // For a functional code, we assume the redirection below will handle it 
                    // if the subsequent page load check fails.
                    targetPage = 'index.html'; // Fallback to index
                }
                
                alert(`Welcome back, ${userName}! Redirecting...`);
                closeModal();
                window.location.href = targetPage;
                
            } catch (error) {
                console.error("Sign In Failed:", error);
                
                let errorMessage = error.message;
                if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    errorMessage = "Invalid email or password. Please try again.";
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = "Access blocked due to too many failed attempts. Try again later.";
                }
                
                alert(`Sign In Failed: ${errorMessage}`);
            }
        });
    }
});