// Additional style fixes for React Native Web
// This file specifically handles the registration screen CSS error

if (typeof window !== 'undefined') {
  // Override the style setter to prevent indexed access
  const originalDefineProperty = Object.defineProperty;
  
  Object.defineProperty = function(obj, prop, descriptor) {
    // Intercept numeric property definitions on style objects
    if (obj && obj instanceof CSSStyleDeclaration && !isNaN(prop)) {
      console.warn(`Prevented defining numeric property ${prop} on CSSStyleDeclaration`);
      return obj;
    }
    
    // Special handling for style property
    if (prop === 'style' && descriptor && descriptor.set) {
      const originalSetter = descriptor.set;
      descriptor.set = function(value) {
        // If value is an array, convert to object
        if (Array.isArray(value)) {
          const styleObj = {};
          value.forEach((style) => {
            if (style && typeof style === 'object') {
              Object.assign(styleObj, style);
            }
          });
          return originalSetter.call(this, styleObj);
        }
        return originalSetter.call(this, value);
      };
    }
    
    return originalDefineProperty.call(this, obj, prop, descriptor);
  };
  
  // Fix for React Native Web StyleSheet
  if (window.StyleSheet) {
    const originalCreate = window.StyleSheet.create;
    window.StyleSheet.create = function(styles) {
      // Clean up any numeric keys
      const cleanedStyles = {};
      for (const key in styles) {
        if (!isNaN(key)) {
          console.warn(`Removed numeric key ${key} from StyleSheet`);
          continue;
        }
        cleanedStyles[key] = styles[key];
      }
      return originalCreate ? originalCreate.call(this, cleanedStyles) : cleanedStyles;
    };
  }
  
  // Patch HTMLElement style property
  try {
    const styleDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style');
    if (styleDescriptor) {
      Object.defineProperty(HTMLElement.prototype, 'style', {
        get: function() {
          const style = styleDescriptor.get.call(this);
          // Return a proxy that blocks numeric access
          return new Proxy(style, {
            set(target, prop, value) {
              if (!isNaN(parseInt(prop))) {
                console.warn('Blocked numeric style property:', prop);
                return true;
              }
              target[prop] = value;
              return true;
            },
            defineProperty(target, prop, descriptor) {
              if (!isNaN(parseInt(prop))) {
                console.warn('Blocked defineProperty for numeric index:', prop);
                return true;
              }
              return Object.defineProperty(target, prop, descriptor);
            },
          });
        },
        set: function(value) {
          styleDescriptor.set.call(this, value);
        },
      });
    }
  } catch (e) {
    console.warn('Could not patch HTMLElement.style:', e);
  }
}

export default {};