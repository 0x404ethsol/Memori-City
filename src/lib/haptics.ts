/**
 * Haptic feedback utility for Memori-City
 * Provides a tactile layer to the agentic experience.
 */
export const haptics = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(60);
    }
  },
  double: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 40, 20]);
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50, 100]);
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  }
};
