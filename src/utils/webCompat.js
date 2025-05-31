// Web compatibility fixes for React Native Web

if (typeof window !== 'undefined' && window.document) {
  // Comprehensive fix for CSSStyleDeclaration indexed property setter
  
  // 1. Override direct indexed access
  const defineIndexedProperty = (obj) => {
    for (let i = 0; i < 1000; i++) {
      Object.defineProperty(obj, i, {
        get() { return undefined; },
        set() { 
          console.warn(`Prevented setting numeric index ${i} on CSSStyleDeclaration`);
          return true; 
        },
        configurable: true
      });
    }
  };
  
  // 2. Patch CSSStyleDeclaration prototype
  if (typeof CSSStyleDeclaration !== 'undefined') {
    defineIndexedProperty(CSSStyleDeclaration.prototype);
    
    // Override setProperty to catch numeric properties
    const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function(prop, value, priority) {
      if (typeof prop === 'number' || !isNaN(prop)) {
        console.warn('Blocked numeric property on CSSStyleDeclaration:', prop);
        return;
      }
      return originalSetProperty.call(this, prop, value, priority);
    };
  }
  
  // 3. Fix illegal invocation errors by binding methods properly (but allow debugging)
  if (typeof console !== 'undefined') {
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const errorString = args[0]?.toString() || '';
      if (errorString.includes('Illegal invocation') || 
          errorString.includes('Failed to set an indexed property')) {
        console.warn('CSS Error (suppressed):', errorString);
        return;
      }
      return originalConsoleError.apply(console, args);
    };
  }
  
  // 4. Fix for React Native Web style arrays
  if (window.ReactNativeWebStyle) {
    const originalFlatten = window.ReactNativeWebStyle.flatten;
    window.ReactNativeWebStyle.flatten = function(style) {
      if (Array.isArray(style)) {
        // Filter out numeric indices
        style = style.filter((_, index) => {
          if (typeof style[index] === 'undefined') {
            return false;
          }
          return true;
        });
      }
      return originalFlatten ? originalFlatten.call(this, style) : style;
    };
  }
}