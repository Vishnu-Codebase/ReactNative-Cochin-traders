# Splash Screen & Sign-In Flow Implementation

## Overview
Implemented a complete splash screen and authentication flow with improved UI design, dark/light mode support, and proper employee sign-in functionality.

## Key Features

### 1. **Splash Screen (3 seconds)**
- Displays "Cochin Traders" with company logo
- Auto-hides after 3 seconds
- If employee exists in localStorage → redirects to dashboard
- If no employee → transitions to sign-in screen

### 2. **Sign-In Page**
- **Input Fields:**
  - Employee Name (text input)
  - Phone Number (phone number format, 10 digits)
- **Validation:**
  - Ensures both fields are filled
  - Validates 10-digit phone number format
  - Shows error messages for validation failures
- **Submission:**
  - Authenticates with API via `employeeSignIn()`
  - Saves employee data to localStorage
  - Redirects to dashboard on successful sign-in
  - Stays on sign-in page with error message on failure

### 3. **Design Features**
- **Linear Gradient Background:**
  - Light mode: White → Light Gray → Extra light gray gradient
  - Dark mode: Very dark → Dark gray → Very dark gradient
  - Same background design for both modes
- **Typography:**
  - Company name: 26px, Bold (sign-in), 28px (splash)
  - Section title: 14px, Semi-bold
  - Input text: 16px regular
- **Colors:**
  - Uses theme context for dynamic dark/light mode colors
  - Button color matches primary tint color
  - Input fields use card background with border
  - Error messages in red (#ef4444)
- **Animations:**
  - Fade-in opacity animation (500ms)
  - Scale spring animation for smooth appearance
  - Loading state disables inputs and shows "Signing In..."

### 4. **Responsive Layout**
- Max width of 320px for sign-in form (centered)
- Keyboard avoiding behavior for mobile
- Touch-friendly button sizes (44px+ height)
- Proper padding and spacing

## Files Modified

### 1. **components/AnimatedSplash.tsx** (Complete Rewrite)
- Replaced simple input overlay with complete flow
- Added `SplashState` type ('splash' | 'signin' | 'done')
- Implemented proper employee check on mount
- Added form validation and error handling
- Theme-aware styling with dark/light mode support
- LinearGradient background for both screens
- Proper animation timing (3 seconds splash, then signin)

### 2. **app/_layout.tsx** (Simplified)
- Removed complex timer logic from RootLayoutNav
- AnimatedSplash component now handles all splash/signin logic internally
- Cleaner initialization flow
- Maintained CompanyProvider and CartProvider setup

## Technical Details

### Storage Keys Used
- `employee_phone` - Phone number from sign-in
- `employee_name` - Employee name from API response
- `employee_token` - Authentication token

### API Integration
- Uses `employeeSignIn(phone)` from `/lib/api.ts`
- Handles various response formats (token, employee object, etc.)
- Displays appropriate error messages on API failure

### Theme Support
- Uses `useTheme()` hook from ThemeContext
- Dynamic colors from `Colors` constant
- Supports system preference and user toggle

## User Flow

```
App Launch
    ↓
Show Splash Screen (3 seconds)
    ↓
Check if Employee Exists
    ├─ YES → Hide Splash → Go to Dashboard
    └─ NO → Show Sign-In Screen
         ↓
    Enter Name & Phone
         ↓
    Click Submit
         ↓
    Validate Input
         ├─ Invalid → Show Error → Stay on Sign-In
         └─ Valid → Call API
              ├─ Success → Save Data → Go to Dashboard
              └─ Failure → Show Error → Stay on Sign-In
```

## Testing Checklist

- [ ] Splash screen displays for exactly 3 seconds with company logo and "Cochin Traders"
- [ ] After splash, if no employee data → redirects to sign-in
- [ ] Sign-in page has proper gradient background (dark/light mode)
- [ ] Employee name field required validation
- [ ] Phone number field validates 10 digits
- [ ] Submit button disabled while loading
- [ ] Error messages display correctly
- [ ] Successful sign-in saves data and redirects to dashboard
- [ ] Theme toggle works correctly (background gradient stays consistent)
- [ ] Keyboard avoids input fields on mobile
- [ ] Animation smooth on both screens

## Dependencies
- `expo-linear-gradient` - Already installed, used for gradient backgrounds
- `react-native-async-storage` - For localStorage operations
- Theme context and Colors constants - For dark/light mode

## Notes
- Background gradient is intentionally the same for dark/light mode (as requested)
- Linear gradient uses 3 colors for smooth transitions
- All colors derive from the Colors constant for consistency
- Component is fully responsive and works on web, iOS, and Android
