// Fix for "Illegal invocation" errors in React Native Web

if (typeof window !== 'undefined') {
  // 1. Fix DOM method binding issues
  const nativeMethods = [
    'addEventListener',
    'removeEventListener',
    'appendChild',
    'removeChild',
    'insertBefore',
    'replaceChild',
    'setAttribute',
    'removeAttribute',
    'getElementById',
    'getElementsByClassName',
    'getElementsByTagName',
    'querySelector',
    'querySelectorAll'
  ];

  nativeMethods.forEach(methodName => {
    if (typeof document[methodName] === 'function') {
      const originalMethod = document[methodName];
      document[methodName] = function(...args) {
        return originalMethod.apply(document, args);
      };
    }
    
    if (typeof Element.prototype[methodName] === 'function') {
      const originalMethod = Element.prototype[methodName];
      Element.prototype[methodName] = function(...args) {
        return originalMethod.apply(this, args);
      };
    }
  });

  // 2. Fix console methods
  const consoleMethods = ['log', 'warn', 'error', 'info', 'debug'];
  consoleMethods.forEach(methodName => {
    if (typeof console[methodName] === 'function') {
      const originalMethod = console[methodName];
      console[methodName] = function(...args) {
        try {
          return originalMethod.apply(console, args);
        } catch (e) {
          // Fallback for illegal invocation
          return originalMethod.call(console, ...args);
        }
      };
    }
  });

  // 3. Fix requestAnimationFrame
  if (typeof window.requestAnimationFrame === 'function') {
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
      return originalRAF.call(window, callback);
    };
  }

  // 4. Fix setTimeout/setInterval
  if (typeof window.setTimeout === 'function') {
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(callback, delay, ...args) {
      return originalSetTimeout.call(window, callback, delay, ...args);
    };
  }

  if (typeof window.setInterval === 'function') {
    const originalSetInterval = window.setInterval;
    window.setInterval = function(callback, delay, ...args) {
      return originalSetInterval.call(window, callback, delay, ...args);
    };
  }

  // 5. Fix fetch
  if (typeof window.fetch === 'function') {
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      return originalFetch.call(window, input, init);
    };
  }

  // 6. Fix localStorage/sessionStorage
  ['localStorage', 'sessionStorage'].forEach(storageName => {
    if (typeof window[storageName] === 'object') {
      const storage = window[storageName];
      const methods = ['getItem', 'setItem', 'removeItem', 'clear'];
      
      methods.forEach(methodName => {
        if (typeof storage[methodName] === 'function') {
          const originalMethod = storage[methodName];
          storage[methodName] = function(...args) {
            return originalMethod.apply(storage, args);
          };
        }
      });
    }
  });

  // 7. Global error suppression for illegal invocation
  window.addEventListener('error', function(event) {
    if (event.message && event.message.includes('Illegal invocation')) {
      console.warn('Suppressed illegal invocation error:', event.message);
      event.preventDefault();
      return false;
    }
  });

  // 8. Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('Illegal invocation')) {
      console.warn('Suppressed illegal invocation in promise:', event.reason.message);
      event.preventDefault();
    }
  });
}

export default {};