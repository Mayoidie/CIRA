// admin.js - Handles Admin dashboard logic and security.

import { auth, db, signOutUser } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


// --- Navigation Guard and User Details Setup ---

onAuthStateChanged(auth, async (user) => {
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    const welcomeUserName = document.getElementById('welcomeUserName');
    const expectedRole = 'admin';
    
    if (user) {
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                const role = userData.role;
                const name = userData.name || user.email;

                // --- ROLE-BASED SECURITY CHECK (CRITICAL) ---
                if (role !== expectedRole) {
                    console.warn(`Access denied. User role is ${role}. Redirecting.`);
                    const targetPage = (role === 'student') ? 'student.html' : (role === 'classrep' ? 'classrep.html' : 'index.html');
                    window.location.href = targetPage;
                    return;
                }
                
                // 🚀 FIX: Defensive UI Update
                if (userNameDisplay) {
                    userNameDisplay.textContent = name;
                }
                if (userRoleDisplay) {
                    userRoleDisplay.textContent = 'Administrator'; 
                }
                if (welcomeUserName) {
                    welcomeUserName.textContent = name.split(' ')[0] || 'Admin';
                }
                
            } else {
                console.error("User data not found in Firestore. Logging out.");
                await signOutUser();
                window.location.href = 'index.html';
            }
        } catch (error) {
            // Error handling block
            console.error("RAW FIREBASE ERROR CODE:", error.code);
            console.error("RAW FIREBASE ERROR MESSAGE:", error.message);
            console.error("FULL ERROR OBJECT:", error); 
            
            alert("Failed to load user details. Please try logging in again.");
            await signOutUser();
            window.location.href = 'index.html';
        }
        
    } else {
        // User is signed out. Redirect to login page.
        console.log("No user signed in. Redirecting to index.html");
        window.location.href = 'index.html';
    }
});


// --- Logout Functionality ---

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOutUser();
            } catch (error) {
                console.error("Error during logout:", error);
                alert("Logout failed. Please try again.");
            }
        });
    }
});