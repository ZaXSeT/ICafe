# ICafe Customer - Flutter App

Aplikasi mobile untuk customer ICafe, dibuat dengan Flutter + Firebase.

## Fitur

- **Login / Register** - Email & Password atau Google Sign-In
- **Menu** - Browse menu dengan kategori, search, dan add to cart
- **Keranjang** - Kelola item, ubah quantity
- **Checkout** - Pilih meja, catatan, metode pembayaran
- **Pesanan** - Riwayat dan tracking status pesanan realtime
- **Reservasi** - Buat dan kelola reservasi meja
- **Profil** - Lihat dan edit profil

---

## Prasyarat

- [Flutter SDK](https://docs.flutter.dev/get-started/install) >= 3.2.0
- [Android Studio](https://developer.android.com/studio) dengan Android SDK
- Android Emulator atau device fisik (Android >= 5.0 / API 21)
- Akun Firebase

---

## Setup Firebase

### 1. Buat Firebase Project
1. Buka [Firebase Console](https://console.firebase.google.com)
2. Klik **Add project** > isi nama project
3. Enable Google Analytics (opsional)

### 2. Tambahkan Android App
1. Di Firebase Console > **Project Settings** > **Your apps** > klik ikon Android
2. **Package name:** `com.icafe.customer`
3. Download `google-services.json`
4. Ganti file `android/app/google-services.json` dengan file yang didownload

### 3. Update `lib/firebase_options.dart`
Ganti semua nilai `YOUR_*` dengan nilai dari Firebase Console:
- **Project Settings > General > Your apps > Android app**

Atau gunakan FlutterFire CLI (cara mudah):
```bash
npm install -g firebase-tools
dart pub global activate flutterfire_cli
flutterfire configure
```
Ini akan otomatis men-generate `lib/firebase_options.dart` yang benar.

### 4. Aktifkan Firebase Services
Di Firebase Console:
- **Authentication** > Sign-in method > aktifkan **Email/Password** dan **Google**
- **Firestore Database** > Create database > Start in test mode (untuk dev)
- **Storage** > Get started (opsional, untuk foto profil)

### 5. Firestore Security Rules (untuk production)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /menu/{menuId} {
      allow read: if true;
      allow write: if false; // hanya admin
    }
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    match /reservations/{reservationId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Cara Menjalankan di Android Studio

### 1. Buka Project
```bash
# Clone atau buka folder flutter-app di Android Studio
cd flutter-app
```

### 2. Install dependencies
```bash
flutter pub get
```

### 3. Buat Android Emulator
1. Android Studio > **Device Manager** > **Create Device**
2. Pilih device: Pixel 6 atau Pixel 7
3. System image: **API 34** (Android 14) - download jika belum ada
4. Klik **Finish**

### 4. Jalankan App
```bash
# Pastikan emulator sudah running
flutter run
```

Atau dari Android Studio: klik tombol **Run ▶** (Shift+F10)

---

## Cara Build APK (untuk testing)

### Debug APK (langsung bisa install)
```bash
flutter build apk --debug
# Output: build/app/outputs/flutter-apk/app-debug.apk
```

### Release APK
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Install ke emulator/device
```bash
flutter install
```

---

## Struktur Folder

```
flutter-app/
├── lib/
│   ├── main.dart                 # Entry point
│   ├── firebase_options.dart     # Firebase config (HARUS DIISI)
│   ├── router.dart               # Navigation/routing
│   ├── models/
│   │   ├── menu_item.dart
│   │   ├── cart_item.dart
│   │   ├── order.dart
│   │   ├── reservation.dart
│   │   └── user_profile.dart
│   ├── services/
│   │   ├── auth_service.dart
│   │   ├── menu_service.dart
│   │   ├── order_service.dart
│   │   └── reservation_service.dart
│   ├── providers/
│   │   ├── auth_provider.dart    # Auth state management
│   │   └── cart_provider.dart    # Cart state management
│   ├── screens/
│   │   ├── auth/
│   │   │   └── login_screen.dart # Login + Register
│   │   ├── home_screen.dart      # Main screen + bottom nav
│   │   ├── cart_screen.dart
│   │   ├── checkout_screen.dart
│   │   ├── orders_screen.dart
│   │   └── reservations_screen.dart
│   └── widgets/
│       ├── app_button.dart
│       ├── app_text_field.dart
│       └── menu_item_card.dart
├── android/
│   ├── app/
│   │   ├── build.gradle          # Firebase dependencies
│   │   ├── google-services.json  # HARUS DIGANTI dengan file asli
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── kotlin/com/icafe/customer/MainActivity.kt
│   ├── build.gradle
│   └── settings.gradle
└── pubspec.yaml                  # Flutter dependencies
```

---

## Demo / Testing

### Test tanpa Firebase (mode offline)
Untuk demo cepat tanpa setup Firebase, jalankan dengan mock data:
```bash
flutter run --dart-define=DEMO_MODE=true
```

### Akun test
Setelah setup Firebase, buat akun test lewat Firebase Console:
- Authentication > Users > Add user
- Email: `test@icafe.com` | Password: `icafe123`

### Seed data menu (dari project Next.js)
Jika sudah punya data di Firestore dari web app, data akan langsung muncul di mobile app karena menggunakan project Firebase yang sama.

---

## Troubleshooting

**Error: `google-services.json` tidak valid**
- Download ulang dari Firebase Console
- Pastikan package name `com.icafe.customer` sudah ditambahkan di Firebase

**Error: `PigeonUserDetails` atau Auth error**
- Pastikan Google Sign-In sudah diaktifkan di Firebase Console
- Tambahkan SHA-1 fingerprint ke Firebase (untuk Google Sign-In di release build)

**Firestore permission denied**
- Pastikan Security Rules sudah diset ke test mode atau sesuai rules di atas

**Flutter SDK tidak ditemukan**
- Pastikan Flutter ada di PATH: `flutter doctor`
- Di Android Studio: Settings > Languages > Flutter > Flutter SDK path
