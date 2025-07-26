/**
 * Application Constants
 * Centralized configuration and magic numbers
 */

// API Configuration
export const API_CONFIG = {
  OKX_BASE_URL: 'https://www.okx.com/api/v5',
  DEFAULT_LIMIT: 100,
  DEFAULT_INTERVAL: '1D',
  REQUEST_TIMEOUT: 30000,
};

// Calendar Configuration
export const CALENDAR_CONFIG = {
  DAYS_PER_WEEK: 7,
  DEFAULT_ZOOM_LEVEL: 1,
  MIN_ZOOM_LEVEL: 0.5,
  MAX_ZOOM_LEVEL: 2,
  DEFAULT_DAYS_RANGE: 30,
};

// Color Configuration
export const COLOR_THEMES = {
  DEFAULT: 'default',
  CONTRAST: 'contrast',
  COLORBLIND: 'colorblind',
};

// View Modes
export const VIEW_MODES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

// Data Formatting
export const FORMAT_CONFIG = {
  DECIMAL_PLACES: 2,
  PERCENTAGE_DECIMAL_PLACES: 1,
  LARGE_NUMBER_THRESHOLD: 1000000,
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  MOBILE: 'sm',
  TABLET: 'md',
  DESKTOP: 'lg',
};

// Performance Thresholds
export const PERFORMANCE_CONFIG = {
  POSITIVE_THRESHOLD: 0,
  HIGH_VOLATILITY_THRESHOLD: 10,
  HIGH_VOLUME_THRESHOLD: 1000000,
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
};
