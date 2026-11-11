// Design tokens: single source of truth. Never hardcode hex in components;
// use theme palette keys (e.g. color="primary.main") or import from here.
// Text/background pairs below meet WCAG AA (4.5:1) for body text.

export const brand = {
  primary: {50: '#EAF2FB', 100: '#D3E4F6', 500: '#1565C0', 600: '#0F55A5', 700: '#0B4488', 900: '#072B57'},
  accent: {50: '#E3F4F1', 500: '#00897B', 700: '#00675B'}, // teal: secondary actions, "verified"
};

export const neutral = {
  0: '#FFFFFF', 25: '#F7F8FA', 50: '#F1F3F6', 100: '#E4E8ED', 200: '#D2D8DF',
  400: '#8A95A3', 600: '#52606D', 800: '#27323F', 900: '#17202A',
};

// Semantic status colors map to the roster workflow states.
export const status = {
  success: {main: '#2E7D32', bg: '#E8F5E9'}, // Approved / live
  warning: {main: '#9A5B00', bg: '#FFF4E0'}, // Needs review / conflict
  error: {main: '#C62828', bg: '#FDECEA'},   // Rejected / failed validation
  info: {main: '#0F55A5', bg: '#EAF2FB'},    // Submitted / in progress
  pending: {main: '#52606D', bg: '#F1F3F6'}, // Draft / awaiting payer
};

// Categorical palette for charts (colour-blind-safe ordering).
export const dataviz = ['#1565C0', '#00897B', '#EF6C00', '#7B1FA2', '#C2185B', '#5D4037'];
