const tintColorLight = '#2563eb';
const tintColorDark = '#60a5fa'; // Lighter blue for dark mode contrast

export default {
  light: {
    text: '#111827',
    background: '#f3f4f6', // Light gray background
    card: '#ffffff',       // White cards
    border: '#e5e7eb',
    tint: tintColorLight,
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
    navBar: tintColorLight,
    buttonPrimary: tintColorLight,
    iconSelected: tintColorLight,
  },
  dark: {
    text: '#f9fafb',
    background: '#030712', // Very dark gray/black
    card: '#1f2937',       // Dark gray cards
    border: '#374151',
    tint: tintColorDark,
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorDark,
    navBar: '#1f2937',     // Dark nav bar (instead of tint color which might be too bright or weird)
    buttonPrimary: '#780206',
    iconSelected: tintColorDark,
  },
};
