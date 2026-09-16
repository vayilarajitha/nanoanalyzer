# NanoAnalyzer - Android WebView Application

This is the Android WebView wrapper for the **NanoAnalyzer** platform. It connects seamlessly to the deployed NanoAnalyzer web application while running as a native Android application in **Android Studio**.

---

## Features
- **JavaScript & DOM Storage**: Full support for interactive charts, dynamic forms, and frontend state.
- **PHP Session & Cookies**: Persistent authentication across app restarts (`CookieManager`).
- **File Uploads**: Native Android file picker for dataset CSV files and researcher avatar uploads (`WebChromeClient.onShowFileChooser`).
- **Back-Button Navigation**: Intuitive in-app navigation matching standard Android UX.
- **Loading Progress**: Sleek horizontal progress bar and initial launch loading screen.
- **Network Resilience**: Custom connection error screen with "Try Again" retry button and pull-to-refresh (`SwipeRefreshLayout`).
- **Responsive Viewport**: Configured for smartphones and tablets.

---

## How to Run in Android Studio

### 1. Open Project
1. Launch **Android Studio**.
2. Click **File -> Open...** (or **Open** from the welcome dialog).
3. Navigate to and select the directory:
   ```
   c:\xampp\htdocs\nanoanalyzer\android
   ```
4. Click **OK**.
5. Wait for Android Studio to index the files and sync Gradle dependencies automatically.

### 2. Configure Target URL (Optional)
The target web URL is configured in `app/src/main/res/values/strings.xml`:

```xml
<string name="web_url">https://nanoanalyzer.onrender.com/</string>
```

- **For Deployed Cloud URL**: Replace with your production domain (e.g. `https://nanoanalyzer.io` or `https://your-app.onrender.com`).
- **For Android Emulator (Local XAMPP)**: Keep `http://10.0.2.2/nanoanalyzer/` (10.0.2.2 maps directly to `localhost` on the host PC).
- **For Physical Phone via Wi-Fi**: Change to your computer's local IP address (e.g., `http://192.168.1.100/nanoanalyzer/`).

### 3. Run the App
1. In the top toolbar, select your connected physical device or create an Android Virtual Device (AVD, e.g., Pixel 7 running API 30+).
2. Click the green **Run 'app'** button (or press `Shift + F10`).
3. The app will build, install, and open on your device/emulator.

---

## Project Structure
```
android/
├── build.gradle                         # Root Gradle build script
├── settings.gradle                      # Project module settings
├── gradle.properties                    # JVM & AndroidX properties
├── gradle/wrapper/
│   └── gradle-wrapper.properties        # Gradle wrapper version
└── app/
    ├── build.gradle                     # App configuration (minSdk 24, targetSdk 34)
    ├── proguard-rules.pro               # ProGuard rules
    └── src/main/
        ├── AndroidManifest.xml          # Permissions & launcher activity
        ├── java/io/nanoanalyzer/app/
        │   └── MainActivity.java        # Core WebView activity
        └── res/
            ├── drawable/                # App icons, progress bar & error assets
            ├── layout/
            │   └── activity_main.xml    # UI layout
            ├── mipmap-anydpi-v26/       # Adaptive launcher icons
            ├── values/
            │   ├── colors.xml           # Color palette
            │   ├── strings.xml          # App strings & target web_url
            │   └── themes.xml           # Material NoActionBar theme
            └── xml/
                ├── network_security_config.xml # Traffic security
                ├── backup_rules.xml
                └── data_extraction_rules.xml
```
