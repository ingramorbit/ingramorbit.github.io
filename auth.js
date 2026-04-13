// ===== AssistKingOnline Shared Auth / Tier System =====

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== Firebase Config =====
const firebaseConfig = {
  apiKey: "AIzaSyBuvWaUtyIlL629pDHt9TgLe7Fe6iw6THQ",
  authDomain: "assistkingonline.firebaseapp.com",
  projectId: "assistkingonline",
  storageBucket: "assistkingonline.firebasestorage.app",
  messagingSenderId: "924118312557",
  appId: "1:924118312557:web:f7835e7f336e8886354164",
  measurementId: "G-MZJG2MV47C"
};

// ===== Firebase Init =====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===== Global State =====
window.AKOUser = null;
window.AKOReady = false;

// ===== DOM Lookups =====
const authModal = document.getElementById("authModal");
const openAuthBtn = document.getElementById("openAuth");
const welcomeUser = document.getElementById("welcomeUser");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const showPasswordToggle = document.getElementById("showPasswordToggle");

const signupForm = document.getElementById("signupForm");
const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");

const plansBtn = document.getElementById("plansBtn");

// ===== Helpers =====
function closeAuthModal() {
  if (!authModal) return;
  authModal.classList.remove("show");
  authModal.setAttribute("aria-hidden", "true");
}

function resetLoginPasswordVisibility() {
  if (showPasswordToggle) showPasswordToggle.checked = false;
  if (loginPassword) loginPassword.type = "password";
}

function applyTierUI(user) {
  if (!plansBtn) return;

  if (!user) {
    plansBtn.textContent = "View Plans";
    plansBtn.href = "plans.html";
    return;
  }

  if (user.tier === "free") {
    plansBtn.textContent = "Upgrade to Gold";
    plansBtn.href = "plans.html";
    return;
  }

  if (user.tier === "gold") {
    plansBtn.textContent = "Gold Member";
    plansBtn.href = "plans.html";
    return;
  }

  if (user.tier === "admin") {
    plansBtn.textContent = "Admin Panel";
    plansBtn.href = "plans.html";
    return;
  }

  plansBtn.textContent = "View Plans";
  plansBtn.href = "plans.html";
}

async function loadUserDoc(firebaseUser) {
  if (!firebaseUser) return null;

  try {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        name: data.name || firebaseUser.displayName || "",
        tier: data.tier || "free",
        createdAt: data.createdAt || null
      };
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || "",
      name: firebaseUser.displayName || "",
      tier: "free",
      createdAt: null
    };
  } catch (err) {
    console.error("Could not load user document:", err);

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || "",
      name: firebaseUser.displayName || "",
      tier: "free",
      createdAt: null
    };
  }
}

// ===== Public Helpers =====
window.AKOIsLoggedIn = function () {
  return !!window.AKOUser;
};

window.AKOIsFree = function () {
  return !!window.AKOUser && window.AKOUser.tier === "free";
};

window.AKOIsGold = function () {
  return !!window.AKOUser && window.AKOUser.tier === "gold";
};

window.AKOIsAdmin = function () {
  return !!window.AKOUser && window.AKOUser.tier === "admin";
};

// ===== Show Password =====
if (showPasswordToggle && loginPassword) {
  showPasswordToggle.addEventListener("change", () => {
    loginPassword.type = showPasswordToggle.checked ? "text" : "password";
  });
}

// ===== Login =====
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = (loginEmail?.value || "").trim();
    const password = loginPassword?.value || "";

    if (!email || !password) {
      alert("Enter your email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      alert(
        "Login failed:\n" +
        "code: " + err.code + "\n" +
        "message: " + err.message
      );
    }
  });
}

// ===== Forgot Password =====
if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", async () => {
    const email = (loginEmail?.value || "").trim();

    if (!email) {
      alert("Enter your email address first, then tap Forgot password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your inbox.");
    } catch (err) {
      console.error(err);
      alert(
        "Could not send password reset:\n" +
        "code: " + err.code + "\n" +
        "message: " + err.message
      );
    }
  });
}

// ===== Sign Up =====
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (signupName?.value || "").trim();
    const email = (signupEmail?.value || "").trim();
    const password = signupPassword?.value || "";

    if (!name || !email || !password) {
      alert("Enter your name, email, and password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });

        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: name,
          email: email,
          tier: "free",
          createdAt: Date.now()
        });
      }

      signupForm.reset();
      alert("Account created successfully.");
    } catch (err) {
      console.error(err);
      alert(
        "Could not create account:\n" +
        "code: " + err.code + "\n" +
        "message: " + err.message
      );
    }
  });
}

// ===== Top Left Login / Logout Button =====
if (openAuthBtn) {
  openAuthBtn.addEventListener("click", async () => {
    if (auth.currentUser) {
      try {
        await signOut(auth);
        alert("You have been logged out.");
      } catch (err) {
        console.error(err);
        alert(
          "Logout failed:\n" +
          "code: " + err.code + "\n" +
          "message: " + err.message
        );
      }
    }
  });
}

// ===== Auth State Listener =====
onAuthStateChanged(auth, async (firebaseUser) => {
  if (openAuthBtn) {
    openAuthBtn.textContent = firebaseUser ? "Log Out" : "Log In / Sign Up";
  }

  if (!firebaseUser) {
    window.AKOUser = null;
    window.AKOReady = true;
    resetLoginPasswordVisibility();
    applyTierUI(null);

    if (welcomeUser) {
      welcomeUser.textContent = "";
    }

    document.dispatchEvent(
      new CustomEvent("ako-auth-ready", {
        detail: { user: null }
      })
    );

    return;
  }

  const userData = await loadUserDoc(firebaseUser);

  window.AKOUser = userData;
  window.AKOReady = true;

  if (welcomeUser) {
    const name = userData.name || firebaseUser.displayName || "";
    const firstName = name.trim().split(" ")[0] || "User";
    welcomeUser.textContent = "Hi, " + firstName;
  }

  console.log("AKO user loaded:", window.AKOUser);

  closeAuthModal();
  applyTierUI(userData);

  document.dispatchEvent(
    new CustomEvent("ako-auth-ready", {
      detail: { user: userData }
    })
  );
});
