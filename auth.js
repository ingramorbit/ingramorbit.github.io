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

    // ── Bootstrap: if no Firestore doc found, create it now ──
    const isOwner = firebaseUser.email === "johnkeif@gmail.com";
    const tier = isOwner ? "admin" : "free";
    const name = firebaseUser.displayName || (isOwner ? "John" : "");

    await setDoc(doc(db, "users", firebaseUser.uid), {
      name,
      email: firebaseUser.email,
      tier,
      createdAt: Date.now()
    });

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || "",
      name,
      tier,
      createdAt: Date.now()
    };

  } catch (err) {
    console.error("Could not load user document:", err);
    const isOwner = firebaseUser.email === "johnkeif@gmail.com";
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || "",
      name: firebaseUser.displayName || "",
      tier: isOwner ? "admin" : "free",
      createdAt: null
    };
  }
}
