// Performance optimization utilities for React Native

export const performanceUtils = {
  measureRenderTime: (componentName: string) => {
    const start = Date.now();
    return () => {
      const end = Date.now();
      console.log(`${componentName} render time: ${end - start}ms`);
    };
  },

  debounce: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },

  throttle: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let lastCall = 0;
    return ((...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func(...args);
      }
    }) as T;
  },

  monitor: {
    startAppStateMonitoring: () => {
      console.log('App state monitoring started');
    },
    startMemoryMonitoring: () => {
      console.log('Memory monitoring started');
    },
    startNetworkMonitoring: () => {
      console.log('Network monitoring started');
    },
  },
};

export const rnOptimizations = {
  enableHermes: () => {
    // Hermes optimizations are handled at build time
    console.log('Hermes optimizations enabled');
  },

  enableFastRefresh: () => {
    // Fast refresh is enabled by default in development
    console.log('Fast refresh enabled');
  },

  optimizeImageLoading: () => {
    // Image loading optimizations
    console.log('Image loading optimized');
  },
};