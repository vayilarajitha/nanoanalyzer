# NanoAnalyzer Mobile (Expo Go)

Pure React Native mobile application for the **NanoAnalyzer Nanoparticle Uptake & Drug Delivery Simulation Platform**, built specifically for **Expo Go**.

---

## 🚀 Key Architecture & Zero-API Philosophy

- **100% Standalone & Offline**: Zero external REST APIs and **zero Capacitor / Cordova wrappers**. Everything executes natively, offline, and deterministically inside pure React Native components on your device.
- **Biophysical Simulation Engine 2.0**:
  - Size-dependent Gaussian endocytosis curve ($\mu = 45\,\text{nm}$, $\sigma = 18\,\text{nm}$)
  - Zeta potential electrostatic interaction scalar
  - Core material affinity matrix (Gold Au, Liposome, PLGA Polymer, Silica SiO2, Iron Oxide Fe3O4, Carbon Nanotube, Quantum Dot)
  - Target cell line receptor kinetics (HeLa, MDA-MB-231, Macrophage, HEK293, Endothelial)
  - Michaelis-Menten time-course saturation kinetics
- **Interactive Uptake Curve Visualizer**: Real-time 22-point diameter bar curve (10nm–120nm) highlighting the optimal endocytosis window (40–50nm).

---

## 📱 1:1 Web Feature Mapping

| Web Feature (`.php`) | Mobile Screen (`src/screens/`) | Description |
|:---|:---|:---|
| **Dashboard** (`dashboard.php`) | `DashboardScreen.js` | Platform metrics, kinetic curve preview, recent runs, and quick action launch suite. |
| **Simulation Studio** (`predict.php`) | `PredictScreen.js` | Full parameter controls (Size, Charge, Material, Cell Line, Time, Dose) with real-time uptake gauge, toxicity index, delivery score, mechanism, and curve. |
| **Results** (`results.php`) | `HistoryScreen.js` (Modal View) | Detailed simulation audit modal with biophysical recommendations and full parameter summary. |
| **Datasets Library** (`datasets.php`) | `DatasetsScreen.js` | Formulation library with live search, filter, add formulation modal, delete, and **CSV export/sharing**. |
| **Analytics** (`analytics.php`) | `AnalyticsScreen.js` | 4 visual charts: Uptake vs Size, Core Material Share, Mean Cytotoxicity by Material, and Mean Cell Line Internalisation. |
| **AI Assistant** (`chatbot.php`) | `ChatbotScreen.js` | **NanoBot AI Biomedical Specialist** with instant offline response resolver, suggestion chips, and message history. |
| **Protocols** (`experiments.php`) | `ExperimentsScreen.js` | Laboratory protocols tracker with tap-to-cycle statuses (`Planned` → `In Progress` → `Completed` → `On Hold`). |
| **Analysis History** (`history.php`) | `HistoryScreen.js` | Searchable past simulation execution history with deletion and detail view. |
| **Settings** (`settings.php`) | `SettingsScreen.js` | Biophysical formulas, offline guarantee, cache management, and factory reset. |

---

## 🛠️ How to Run in Expo Go

### 1. Install Expo Go
- **Android**: Install [Expo Go from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).
- **iOS**: Install [Expo Go from the App Store](https://apps.apple.com/app/expo-go/id982107779).

### 2. Start the Development Server
Open your terminal in the `mobile` directory and run:

```bash
cd mobile
npx expo start
```

### 3. Open on your Phone
- **Android**: Open the **Expo Go** app and scan the QR code displayed in the terminal.
- **iOS**: Open the native **Camera app** and scan the QR code, then tap the banner to open in Expo Go.
- **Web Preview**: Press `w` in the terminal to view in your browser.
