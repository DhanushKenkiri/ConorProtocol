// Polyfills for browser compatibility
import { Buffer } from 'buffer';

// Add Buffer to window scope to avoid externalization errors
window.Buffer = Buffer;

// Add process if needed
if (typeof window.process === 'undefined') {
  window.process = {
    env: {},
    version: '',
    nextTick: function(fn) { setTimeout(fn, 0); },
  };
}

// Add util if needed
if (typeof window.util === 'undefined') {
  window.util = {
    inspect: {
      custom: Symbol.for('nodejs.util.inspect.custom'),
    },
  };
}

export const setupPolyfills = () => {
  console.log('Browser polyfills initialized');
};

export default {
  Buffer,
  setupPolyfills,
};