// File ini dibuat otomatis oleh FlutterFire CLI.
// Setelah setup Firebase project, jalankan:
//   flutterfire configure
// untuk men-generate file ini dengan nilai asli.
//
// Atau isi manual dari Firebase Console:
//   Project Settings > General > Your apps > Android app

import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnsupportedError(
        'DefaultFirebaseOptions have not been configured for web - '
        'you can reconfigure this by running the FlutterFire CLI again.',
      );
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  // TODO: Ganti nilai-nilai di bawah dengan config Firebase project kamu.
  // Ambil dari: Firebase Console > Project Settings > General > Your apps
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDWTRrHvqSDJeICnaYN5O8yHvSNXLTv7so',
    appId: '1:534641100622:android:179449c0c8b89d1831401f',
    messagingSenderId: '534641100622',
    projectId: 'icafe-add1f',
    storageBucket: 'icafe-add1f.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAl50PUxncpZd3FCKrxoSznr3bmQSBPtrk',
    appId: '1:534641100622:ios:0000000000000000000000',
    messagingSenderId: '534641100622',
    projectId: 'icafe-add1f',
    storageBucket: 'icafe-add1f.appspot.com',
    iosClientId: '534641100622-00000000000000000000000000000000.apps.googleusercontent.com',
    iosBundleId: 'com.icafe.customer',
  );
}
