# Cochin Traders App (Expo React Native)

This is the mobile client for Cochin Traders, built with Expo React Native. It reads company, party, stock, and batch data from Firebase Realtime Database (RTDB) and submits orders and punch-in records to a Vercel backend (cochin-express).

## Overview

- Mobile client: Expo React Native app with typed routing and splash-gate onboarding.
- Data source: Firebase Realtime Database for company data, ledgers, stocks, parties, and batch information.
- External API: Vercel backend (cochin-express) for order submissions and punch-in record keeping.
- Data: Companies, parties, stocks, batches, and trader activities are managed through Firebase and external services.

## Architecture

- Frontend (this repo)
  - Expo Router screens and components
  - AsyncStorage-based employee name gate with a splash overlay
  - Location + geocoding (primary `react-native-geocoder`, fallback OpenStreetMap, then Expo Location)
  - UI elements for shop selection, cart, receivables, stocks
- Backend Services
  - **Firebase Realtime Database**: Stores company details, ledgers, stocks, parties, and batch data
  - **Vercel Backend (cochin-express)**: Handles order submissions and punch-in activity logging

### API Functions (see [lib/api.ts](lib/api.ts))

**Read Operations:**

- `getCompanyNames()` - List all companies with last synced timestamps
- `getCompany(companyName)` - Fetch specific company details
- `getCompanyLedgers(companyName)` - Get ledger entries for a company
- `getCompanyStocks(companyName)` - Get stock items for a company
- `getCompanyParties(companyName)` - Get parties (customers/vendors) for a company
- `getStocksWithBatches(companyName)` - Get stocks with batch information and closing balances
- `getBatches(companyName, stockItem)` - Get batch details for a specific stock item

**Write Operations:**

- `addBatches(payload)` - Add or update batch information for a stock item
- `submitOrder(companyName, shopName, items)` - Place an order, update batch quantities, send order email via Vercel
- `submitPunchIn(payload)` - Submit punch-in record with employee and activity details

Key integration points:

- Firebase configuration is loaded from environment variables (apiKey, authDomain, databaseURL, etc.). See [lib/api.ts](lib/api.ts).
- All Firebase operations use the Realtime Database with company key resolution via `resolveRTDBCompanyKey()`.
- Splash-gate behavior and employee storage logic are in [app/\_layout.tsx](app/_layout.tsx) and [components/AnimatedSplash.tsx](components/AnimatedSplash.tsx).
- Punch-in submission uses `submitPunchIn()` from [lib/api.ts](lib/api.ts) and is triggered in [app/(tabs)/dashboard.tsx](<app/(tabs)/dashboard.tsx>).
- Order submission uses `submitOrder()` from [lib/api.ts](lib/api.ts) and is called from the cart module.

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm i -g expo-cli`) or use `npx expo`
- Firebase project with Realtime Database configured
- Android Studio or Xcode if building for devices/emulators

## Setup

1. Create a Firebase project and set up a Realtime Database. Obtain your Firebase configuration.
2. In this repo, create a `.env` file with your Firebase credentials:

   ```
   apiKey=<your-firebase-api-key>
   authDomain=<your-firebase-auth-domain>
   databaseURL=https://<your-project>.firebaseio.com
   projectId=<your-firebase-project-id>
   storageBucket=<your-storage-bucket>
   messagingSenderId=<your-messaging-sender-id>
   appId=<your-firebase-app-id>
   measurementId=<your-measurement-id>
   ```

3. Install dependencies and run the app:

   ```bash
   npm install
   npm run start
   ```

4. Launch on your target:
   - Android: `npm run android`
   - iOS: `npm run ios`
   - Web: `npm run web`

## Installation Instructions

### Local Development Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd cochin-traders-app
   ```

2. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy the `.env` file template or create one with your Firebase credentials (see [Prerequisites](#prerequisites) and [Environment Variables](#environment-variables) sections)

4. **Start the development server:**

   ```bash
   npm run start
   ```

5. **Run on device/emulator:**
   - **Android Emulator/Device:** `npm run android`
   - **iOS Simulator/Device:** `npm run ios` (macOS only)
   - **Web Browser:** `npm run web`

### Production APK Build

To create a production APK file for Android distribution:

#### Prerequisites for APK Build:

- Android SDK installed (via Android Studio)
- Java Development Kit (JDK) 11 or higher
- EAS CLI: `npm install -g eas-cli`
- Expo account (create at https://expo.dev)

#### Steps to Build APK:

1. **Authenticate with Expo:**

   ```bash
   eas login
   ```

2. **Build the APK:**

   ```bash
   eas build --platform android --local
   ```

   Or for cloud build (recommended):

   ```bash
   eas build --platform android
   ```

3. **Select build type when prompted:**
   - Choose `apk` for APK file
   - Choose `aab` for Google Play App Bundle (recommended for Play Store)

4. **Wait for build completion:**
   - The build process will take 5-15 minutes depending on your internet speed and selected platform
   - You'll receive a download link once the build is complete

5. **Download the APK:**
   - Download the generated APK file from the provided link
   - Save it securely for distribution or testing

#### Installing the APK on Android Device/Emulator:

```bash
adb install -r path/to/app-release.apk
```

Or manually:

1. Transfer the APK file to your Android device
2. Use a file manager to navigate to the APK
3. Tap to install and allow prompts from unknown sources if needed

#### For App Store Distribution:

- Use `eas build --platform ios` to build for iOS
- Follow Apple's App Store submission guidelines
- Use Xcode to manage provisioning profiles and code signing

## Environment Variables

- `apiKey`: Firebase API key (required)
- `authDomain`: Firebase authentication domain (required)
- `databaseURL`: Firebase Realtime Database URL (required)
- `projectId`: Firebase project ID (required)
- `storageBucket`: Firebase storage bucket (required)
- `messagingSenderId`: Firebase messaging sender ID (required)
- `appId`: Firebase app ID (required)
- `measurementId`: Firebase measurement ID (optional)

Note: `.env` files are ignored by `.gitignore` and should not be committed.

## Important Flows

- Employee gate and splash:
  - On app open, a splash runs for ~3 seconds. If an employee name does not exist in local storage, the app keeps the splash and shows a blurred input overlay. Logic: [app/\_layout.tsx](app/_layout.tsx), [components/AnimatedSplash.tsx](components/AnimatedSplash.tsx).
- Company and data fetching:
  - All company data, ledgers, stocks, and parties are fetched from Firebase Realtime Database via [lib/api.ts](lib/api.ts).
- Shop name suggestions:
  - Absolute-positioned dropdown with z-index for visibility, limit to 5 items; shared input component: [components/trader/ShopInput.tsx](components/trader/ShopInput.tsx).
- Outstanding page:
  - Shows Address, Parent, and Cr/Dr based on closing balance: [app/(tabs)/outstanding.tsx](<app/(tabs)/outstanding.tsx>).
- Order submission:
  - Calls `submitOrder()` from [lib/api.ts](lib/api.ts), updates batch quantities in Firebase, and sends order email via Vercel backend.
- Punch-in flow:
  - Sends employee name, shop name, amount, date, and time to Vercel backend via `submitPunchIn()` from [lib/api.ts](lib/api.ts), triggered in [app/(tabs)/dashboard.tsx](<app/(tabs)/dashboard.tsx>).

## Development Workflow

- Ensure Firebase configuration is properly set in `.env`.
- The app automatically syncs data from Firebase Realtime Database on startup.
- Use Expo's dev tools to run on device/emulator and debug UI/layout.
- Orders and punch-ins are submitted to the Vercel backend (cochin-express).

## Security and Git Hygiene

- `.env` and `.env*.local` are ignored by Git; do not commit secrets.
- Firebase API keys should be protected; consider using Firebase Security Rules to restrict database access.
- Private keys, keystores, and native build outputs are ignored.
- Additional ignores for logs, coverage, caches, and editor metadata are configured in [.gitignore](.gitignore).

## Troubleshooting

- Firebase connection issues:
  - Verify your Firebase credentials in `.env` are correct.
  - Check Firebase Security Rules allow read/write access for your app.
- Order or punch-in submission failure:
  - Confirm the Vercel backend (cochin-express) is accessible and running.
  - Check network connectivity and that the API endpoint URL is correct in [lib/api.ts](lib/api.ts).
- Location/address issues:
  - Ensure location permissions are granted.
  - Geocoding falls back to OpenStreetMap and Expo Location if native lookup fails.

## Scripts

See [package.json](package.json) for available scripts:

- `start`: Expo dev server
- `android` / `ios` / `web`: Platform-specific launchers
