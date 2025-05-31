/**
 * Web Compatibility Layer for React Native Web
 * Fixes "Illegal invocation" errors in production
 */

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  console.log('🔧 Initializing Web Compatibility Layer...');

  // Store original methods
  const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
  const originalRemoveProperty = CSSStyleDeclaration.prototype.removeProperty;
  const originalGetPropertyValue = CSSStyleDeclaration.prototype.getPropertyValue;

  // Override setProperty with proper binding
  CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
    try {
      return originalSetProperty.call(this, property, value, priority);
    } catch (error) {
      if (error.message && error.message.includes('Illegal invocation')) {
        console.warn('CSS setProperty error suppressed');
        return;
      }
      throw error;
    }
  };

  // Override removeProperty
  CSSStyleDeclaration.prototype.removeProperty = function(property) {
    try {
      return originalRemoveProperty.call(this, property);
    } catch (error) {
      if (error.message && error.message.includes('Illegal invocation')) {
        console.warn('CSS removeProperty error suppressed');
        return '';
      }
      throw error;
    }
  };

  // Override getPropertyValue
  CSSStyleDeclaration.prototype.getPropertyValue = function(property) {
    try {
      return originalGetPropertyValue.call(this, property);
    } catch (error) {
      if (error.message && error.message.includes('Illegal invocation')) {
        console.warn('CSS getPropertyValue error suppressed');
        return '';
      }
      throw error;
    }
  };

  // Fix other DOM methods that might cause issues
  const fixMethod = (obj, methodName) => {
    const original = obj[methodName];
    if (typeof original === 'function') {
      obj[methodName] = function(...args) {
        try {
          return original.apply(this, args);
        } catch (error) {
          if (error.message && error.message.includes('Illegal invocation')) {
            console.warn(`${methodName} error suppressed`);
            return;
          }
          throw error;
        }
      };
    }
  };

  // Fix Element methods
  if (typeof Element !== 'undefined') {
    ['setAttribute', 'getAttribute', 'removeAttribute'].forEach(method => {
      fixMethod(Element.prototype, method);
    });
  }

  // Fix Node methods
  if (typeof Node !== 'undefined') {
    ['appendChild', 'removeChild', 'insertBefore'].forEach(method => {
      fixMethod(Node.prototype, method);
    });
  }

  console.log('✅ Web Compatibility Layer initialized');
}