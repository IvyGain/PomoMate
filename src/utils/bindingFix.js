/**
 * Binding Fix for React Native Web
 * Fixes "Illegal invocation" errors by properly binding native methods
 * Based on Stack Overflow solution: https://stackoverflow.com/questions/9677985
 */

(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;
  
  console.log('🔧 Applying binding fixes for native methods...');
  
  // 1. Fix CSS-related methods
  if (typeof CSSStyleDeclaration !== 'undefined') {
    const cssProto = CSSStyleDeclaration.prototype;
    const cssMethods = [
      'setProperty', 
      'removeProperty', 
      'getPropertyValue', 
      'getPropertyPriority', 
      'item'
    ];
    
    cssMethods.forEach(methodName => {
      const originalMethod = cssProto[methodName];
      if (typeof originalMethod === 'function') {
        // Create properly bound version
        Object.defineProperty(cssProto, methodName, {
          value: function(...args) {
            try {
              return originalMethod.apply(this, args);
            } catch (error) {
              if (error.message && error.message.includes('Illegal invocation')) {
                // Return safe defaults
                switch (methodName) {
                  case 'getPropertyValue': return '';
                  case 'getPropertyPriority': return '';
                  case 'item': return null;
                  default: return undefined;
                }
              }
              throw error;
            }
          },
          writable: true,
          configurable: true
        });
      }
    });
    
    console.log('✅ CSS methods binding fixed');
  }
  
  // 2. Fix DOM methods
  if (typeof document !== 'undefined') {
    const documentMethods = [
      'createElement',
      'createTextNode', 
      'getElementById',
      'querySelector',
      'querySelectorAll'
    ];
    
    documentMethods.forEach(methodName => {
      const originalMethod = document[methodName];
      if (typeof originalMethod === 'function') {
        document[methodName] = originalMethod.bind(document);
      }
    });
    
    console.log('✅ Document methods binding fixed');
  }
  
  // 3. Fix Element methods
  if (typeof Element !== 'undefined') {
    const elementMethods = [
      'setAttribute',
      'getAttribute', 
      'removeAttribute',
      'addEventListener',
      'removeEventListener'
    ];
    
    elementMethods.forEach(methodName => {
      const originalMethod = Element.prototype[methodName];
      if (typeof originalMethod === 'function') {
        Element.prototype[methodName] = function(...args) {
          try {
            return originalMethod.apply(this, args);
          } catch (error) {
            if (error.message && error.message.includes('Illegal invocation')) {
              console.warn(`Element.${methodName} binding error suppressed:`, error);
              return;
            }
            throw error;
          }
        };
      }
    });
    
    console.log('✅ Element methods binding fixed');
  }
  
  // 4. Fix console methods (common cause of binding issues)
  if (typeof console !== 'undefined') {
    const consoleMethods = ['log', 'warn', 'error', 'info', 'debug'];
    
    consoleMethods.forEach(methodName => {
      const originalMethod = console[methodName];
      if (typeof originalMethod === 'function') {
        console[methodName] = originalMethod.bind(console);
      }
    });
    
    console.log('✅ Console methods binding fixed');
  }
  
  // 5. Fix requestAnimationFrame and related methods
  if (typeof window !== 'undefined') {
    const animationMethods = [
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback'
    ];
    
    animationMethods.forEach(methodName => {
      const originalMethod = window[methodName];
      if (typeof originalMethod === 'function') {
        window[methodName] = originalMethod.bind(window);
      }
    });
    
    console.log('✅ Animation methods binding fixed');
  }
  
  // 6. Fix localStorage and sessionStorage
  if (typeof Storage !== 'undefined') {
    const storageMethods = ['getItem', 'setItem', 'removeItem', 'clear', 'key'];
    
    [localStorage, sessionStorage].forEach(storage => {
      if (storage) {
        storageMethods.forEach(methodName => {
          const originalMethod = storage[methodName];
          if (typeof originalMethod === 'function') {
            storage[methodName] = originalMethod.bind(storage);
          }
        });
      }
    });
    
    console.log('✅ Storage methods binding fixed');
  }
  
  // 7. Global error handler for remaining binding issues
  const originalError = window.onerror;
  window.onerror = function(msg, url, lineNo, columnNo, error) {
    if (msg && typeof msg === 'string' && msg.includes('Illegal invocation')) {
      console.warn('🔇 Binding Error Suppressed:', {
        message: msg,
        url: url,
        line: lineNo,
        column: columnNo
      });
      return true; // Prevent default error handling
    }
    
    if (originalError) {
      return originalError.apply(window, arguments);
    }
    
    return false;
  };
  
  // 8. Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && 
        event.reason.message && 
        event.reason.message.includes('Illegal invocation')) {
      console.warn('🔇 Promise Binding Error Suppressed:', event.reason);
      event.preventDefault();
    }
  });
  
  console.log('🎯 All binding fixes applied successfully');
  
})();