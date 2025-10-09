// firebase-config.js - FIXED VERSION

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


// 1. Your Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBJJX2CpYt-xJ3omGaIdhRZGi4sYpHHwpQ",
    authDomain: "cira-website-5db19.firebaseapp.com",
    projectId: "cira-website-5db19",
    storageBucket: "cira-website-5db19.firebasestorage.app",
    messagingSenderId: "354131184251",
    appId: "1:354131184251:web:6f1cc6758c4aae057db0de",
    measurementId: "G-Q6K810D897"
};

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 3. Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);


// 4. Core Authentication Functions
// NOTE: Removed 'export' from function definitions here.

async function signUpUser(email, password, name, role, studentId = 'N/A') {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role,
        studentId: studentId,
        createdAt: new Date()
    });

    return user;
}

async function signInUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

async function signOutUser() {
    await signOut(auth); 
}

// 5. Consolidated Export List (FIX)
// Export all three custom functions at the end to prevent module conflicts.
export { signUpUser, signInUser, signOutUser };