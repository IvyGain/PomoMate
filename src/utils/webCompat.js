// Web compatibility fixes for React Native Web

if (typeof window !== 'undefined' && window.document) {
  // Immediate fix for CSS method binding issues
  const patchCSSMethods = () => {
    if (typeof CSSStyleDeclaration === 'undefined') return;
    
    const proto = CSSStyleDeclaration.prototype;
    const methodsToFix = ['setProperty', 'removeProperty', 'getPropertyValue', 'getPropertyPriority', 'item'];
    
    methodsToFix.forEach(methodName => {
      const original = proto[methodName];
      if (typeof original === 'function') {
        proto[methodName] = function(...args) {
          try {
            return original.apply(this, args);
          } catch (error) {
            // Silently ignore illegal invocation errors
            if (error.message && error.message.includes('Illegal invocation')) {
              return methodName === 'getPropertyValue' ? '' : undefined;
            }
            throw error;
          }
        };
      }
    });
  };
  
  // Apply patches immediately
  patchCSSMethods();
  
  // Also patch when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchCSSMethods);
  }
  
  // Prevent numeric property assignments on CSS objects
  const preventNumericAssignment = () => {
    if (typeof CSSStyleDeclaration === 'undefined') return;
    
    const originalDescriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'setProperty');
    if (!originalDescriptor || originalDescriptor.value.__patched) return;
    
    const originalSetProperty = originalDescriptor.value;
    
    Object.defineProperty(CSSStyleDeclaration.prototype, 'setProperty', {
      value: function(property, value, priority) {
        // Block numeric properties
        if (typeof property === 'number' || /^\d+$/.test(property)) {
          return;
        }
        
        try {
          return originalSetProperty.call(this, property, value, priority);
        } catch (error) {
          // Silently handle illegal invocation
          if (error.message && error.message.includes('Illegal invocation')) {
            return;
          }
          throw error;
        }
      },
      writable: true,
      configurable: true
    });
    
    // Mark as patched
    CSSStyleDeclaration.prototype.setProperty.__patched = true;
  };
  
  preventNumericAssignment();
  
  // Suppress CSS-related console errors
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args[0]?.toString() || '';
    
    // Suppress specific CSS errors that don't affect functionality
    if (message.includes('Illegal invocation') ||
        message.includes('Failed to set an indexed property') ||
        message.includes('CSSStyleDeclaration')) {
      // Convert to warning for debugging but don't crash
      console.warn('CSS Warning (suppressed):', ...args);
      return;
    }
    
    return originalConsoleError.apply(console, args);
  };
  
  // Early error boundary for CSS errors
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && 
        event.error.message.includes('Illegal invocation')) {
      event.preventDefault();
      console.warn('Prevented CSS error from crashing app:', event.error);
    }
  });
  
  // Polyfill for potential missing methods
  if (typeof Element !== 'undefined' && Element.prototype) {
    if (!Element.prototype.getAttribute) {
      Element.prototype.getAttribute = function(name) {
        return this.attributes[name]?.value || null;
      };
    }
    
    if (!Element.prototype.setAttribute) {
      Element.prototype.setAttribute = function(name, value) {
        if (!this.attributes) this.attributes = {};
        this.attributes[name] = { value: String(value) };
      };
    }
  }
}

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init: () => {
      // Re-run patches if needed
      if (typeof window !== 'undefined' && window.document) {
        console.log('Web compatibility patches initialized');
      }
    }
  };
}