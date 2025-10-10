// 1. IMPORT FIREBASE AUTH & FIRESTORE FUNCTIONS
// Double check: sendEmailVerificationLink must be in your firebase-config.js export list!
import { signUpUser, signInUser, signOutUser, sendEmailVerificationLink, db } from './firebase-config.js'; 
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


document.addEventListener('DOMContentLoaded', () => {

    // --- Select Existing Elements (These are safe) ---
    const modal = document.getElementById('auth-modal');
    const triggers = document.querySelectorAll('.trigger-modal');
    const closeBtn = document.querySelector('.close-btn');
    const tabButtons = document.querySelectorAll('.tab-button');
    const signInForm = document.getElementById('sign-in-form');
    const signUpForm = document.getElementById('sign-up-form');
    const authTitle = document.getElementById('auth-title');

    // --- NEW POPUP ELEMENTS (Initialize safely) ---
    // If these elements aren't in index.html yet, they will be null/undefined.
    const emailSentModal = document.getElementById('email-sent-modal');
    const displaySignupEmail = document.getElementById('display-signup-email');
    const goToLoginBtn = document.getElementById('goToLoginBtn');
    const resendEmailBtn = document.getElementById('resendEmailBtn');
    
    let lastSignedUpUser = null; 

    // --- Modal & Tab Logic (Existing functions) ---
    function showModal(formType) {
        modal.style.display = 'flex';
        // ... (rest of showModal)
        if (formType === 'signup') {
            showTab('sign-up-form');
        } else {
            showTab('sign-in-form');
        }
    }

    function closeModal() {
        if(modal) { // Added null check for safety
            modal.style.display = 'none';
        }
    }
    
    function showTab(targetFormId) {
        // ... (existing implementation)
        signInForm.classList.add('hidden-form');
        signUpForm.classList.add('hidden-form');
        // ... (rest of showTab)
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

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const formType = trigger.getAttribute('data-form');
            showModal(formType);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            showTab(target);
        });
    });

    // --- NEW POPUP LOGIC ---
    function showEmailSentPopup(email, user) {
        // Critical safety check
        if (!emailSentModal || !displaySignupEmail) {
            // Fallback to old behavior if new UI elements are missing
            alert("Account created! Please check your email inbox (and spam folder) for a verification link before you can sign in.");
            closeModal();
            showTab('sign-in-form');
            return;
        }

        // 1. Store the user object for resend functionality
        lastSignedUpUser = user; 
        
        // 2. Update the email text display
        displaySignupEmail.textContent = email;
        
        // 3. Hide the sign-in/sign-up modal
        closeModal(); 

        // 4. Show the new pop-up
        emailSentModal.classList.remove('hidden');
    }
    
    function closeEmailSentPopup() {
        if(emailSentModal) {
            emailSentModal.classList.add('hidden');
        }
    }

    // --- Event Listeners for NEW POPUP (Added conditional checks here) ---
    if(goToLoginBtn) {
        goToLoginBtn.addEventListener('click', () => {
            closeEmailSentPopup();
            showModal('signin'); 
        });
    }
    
    if(resendEmailBtn) {
        resendEmailBtn.addEventListener('click', async () => {
            if (lastSignedUpUser) {
                resendEmailBtn.disabled = true;
                resendEmailBtn.textContent = 'Sending...';
                try {
                    await sendEmailVerificationLink(lastSignedUpUser); 
                    alert("Verification email has been resent successfully!");
                } catch (error) {
                    console.error("Resend failed:", error);
                    alert("Failed to resend email. Please try again.");
                } finally {
                    resendEmailBtn.textContent = 'Resend Email';
                    setTimeout(() => {
                        resendEmailBtn.disabled = false;
                    }, 15000);
                }
            } else {
                alert("Error: User session data lost.");
            }
        });
    }

    // ----------------------------------------------------------------------
    // --- 1. SIGN UP LOGIC (Modified to call showEmailSentPopup) ---
    // ----------------------------------------------------------------------
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Collect form data 
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
            
            // UI feedback
            const submitButton = signUpForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Creating...';

            try {
                // Call signUpUser which sends the initial verification email
                const user = await signUpUser(email, password, name, role, studentId);
                
                // *** CRITICAL CHANGE: Use the new, safer popup function ***
                showEmailSentPopup(email, user);

                signUpForm.reset();

            } catch (error) {
                console.error("Sign Up Failed:", error);
                let errorMessage = error.message;
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = "This email is already registered. Try signing in.";
                }
                alert(`Sign Up Failed: ${errorMessage}`);
                
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Create Account';
            }
        });
    }

    // ----------------------------------------------------------------------
    // --- 2. SIGN IN LOGIC (Block Unverified Users) ---
    // ----------------------------------------------------------------------
    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('signInUsername').value;
            const password = document.getElementById('signInPassword').value;

            try {
                const user = await signInUser(email, password);
                
                // CRITICAL: Block sign-in if email is not verified
                if (!user.emailVerified) {
                    await signOutUser();
                    throw new Error("Your email is not verified. Please check your inbox for the verification link and click it to activate your account.");
                }

                // If verified, proceed to fetch role and redirect
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                
                let targetPage = 'index.html'; // Default fallback
                let userName = 'User';

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const role = userData.role;
                    userName = userData.name || user.email;

                    switch (role) {
                        case 'admin':
                            targetPage = 'admin.html';
                            break;
                        case 'classrep':
                            targetPage = 'classrep.html';
                            break;
                        case 'student':
                            targetPage = 'student.html';
                            break;
                        default:
                            console.error("Sign In Failed: Unknown role.", role);
                            targetPage = 'index.html';
                            break;
                    }
                } else {
                    console.error("Sign In Failed: User profile incomplete. Contact support.");
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
                // Use the custom error message from the verification check if thrown
                
                alert(`Sign In Failed: ${errorMessage}`);
            }
        });
    }
});