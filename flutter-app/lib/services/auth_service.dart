import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/user_profile.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  // Stream untuk listen perubahan auth state
  Stream<User?> get authStateChanges => _auth.authStateChanges();

  User? get currentUser => _auth.currentUser;

  // Register dengan email & password
  Future<UserProfile> registerWithEmail({
    required String email,
    required String password,
    required String displayName,
    String? phone,
  }) async {
    final cred = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    await cred.user!.updateDisplayName(displayName);

    final profile = UserProfile(
      uid: cred.user!.uid,
      email: email,
      displayName: displayName,
      phone: phone,
      role: 'customer',
      createdAt: DateTime.now(),
    );

    await _db
        .collection('users')
        .doc(cred.user!.uid)
        .set(profile.toMap());

    return profile;
  }

  // Login dengan email & password
  Future<UserProfile?> signInWithEmail({
    required String email,
    required String password,
  }) async {
    final cred = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    return _getUserProfile(cred.user!.uid);
  }

  // Login dengan Google
  Future<UserProfile?> signInWithGoogle() async {
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) return null;

    final googleAuth = await googleUser.authentication;
    final credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    final cred = await _auth.signInWithCredential(credential);
    final user = cred.user!;

    // Buat/update profile di Firestore
    final existing = await _getUserProfile(user.uid);
    if (existing == null) {
      final profile = UserProfile(
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? '',
        photoUrl: user.photoURL,
        role: 'customer',
        createdAt: DateTime.now(),
      );
      await _db.collection('users').doc(user.uid).set(profile.toMap());
      return profile;
    }
    return existing;
  }

  // Sign out
  Future<void> signOut() async {
    await Future.wait([
      _auth.signOut(),
      _googleSignIn.signOut(),
    ]);
  }

  // Reset password
  Future<void> sendPasswordResetEmail(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  // Get user profile dari Firestore
  Future<UserProfile?> _getUserProfile(String uid) async {
    final doc = await _db.collection('users').doc(uid).get();
    if (!doc.exists) return null;
    return UserProfile.fromFirestore(doc);
  }

  // Stream user profile
  Stream<UserProfile?> userProfileStream(String uid) {
    return _db
        .collection('users')
        .doc(uid)
        .snapshots()
        .map((doc) => doc.exists ? UserProfile.fromFirestore(doc) : null);
  }

  // Update profile
  Future<void> updateProfile({
    required String uid,
    String? displayName,
    String? phone,
  }) async {
    final updates = <String, dynamic>{};
    if (displayName != null) updates['displayName'] = displayName;
    if (phone != null) updates['phone'] = phone;
    if (updates.isNotEmpty) {
      await _db.collection('users').doc(uid).update(updates);
      if (displayName != null) {
        await _auth.currentUser?.updateDisplayName(displayName);
      }
    }
  }
}
