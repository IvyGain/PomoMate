import React from 'react';
import { TextInput as RNTextInput, TextInputProps, Platform } from 'react-native';

/**
 * SafeTextInput - A wrapper around TextInput that prevents "Illegal invocation" errors on web
 */
export const SafeTextInput = React.forwardRef<RNTextInput, TextInputProps>((props, ref) => {
  // On web, wrap with error boundary
  if (Platform.OS === 'web') {
    return (
      <div 
        style={{ width: '100%' }}
        onClick={(e) => e.stopPropagation()}
        onFocus={(e) => e.stopPropagation()}
      >
        <RNTextInput
          {...props}
          ref={ref}
          // Force web-specific props to prevent CSS errors
          style={[
            props.style,
            {
              // @ts-ignore - Web-specific style
              outline: 'none',
              boxSizing: 'border-box',
            }
          ]}
        />
      </div>
    );
  }

  return <RNTextInput {...props} ref={ref} />;
});

SafeTextInput.displayName = 'SafeTextInput';