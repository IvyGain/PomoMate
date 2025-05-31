const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

const initSentry = (app) => {
  if (!process.env.SENTRY_DSN) {
    console.log('Sentry DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      // Enable profiling
      nodeProfilingIntegration(),
      // Prisma integration
      new Sentry.Integrations.Prisma({ client: require('../prisma') }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Release tracking
    release: process.env.RELEASE_VERSION || 'unknown',
    
    // Environment
    environment: process.env.NODE_ENV || 'development',
    
    // Filter out sensitive data
    beforeSend(event, hint) {
      // Filter out sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      
      // Filter out sensitive body data
      if (event.request?.data) {
        const sensitiveFields = ['password', 'token', 'secret', 'key'];
        sensitiveFields.forEach(field => {
          if (event.request.data[field]) {
            event.request.data[field] = '[FILTERED]';
          }
        });
      }
      
      return event;
    },
    
    // Ignore certain errors
    ignoreErrors: [
      'NetworkError',
      'Request aborted',
      'Non-Error promise rejection captured',
    ],
  });

  // Request handler creates a separate execution context
  app.use(Sentry.Handlers.requestHandler());
  
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
};

// Error handler must be after all other middleware
const errorHandler = Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capture all errors in production
    if (process.env.NODE_ENV === 'production') {
      return true;
    }
    // Only capture 500 errors in development
    return error.status >= 500;
  },
});

// Custom error tracking
const captureError = (error, context = {}) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Performance tracking
const startTransaction = (name, op = 'custom') => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

// User tracking
const setUser = (user) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
};

// Clear user on logout
const clearUser = () => {
  Sentry.setUser(null);
};

// Add custom breadcrumb
const addBreadcrumb = (message, category = 'custom', level = 'info', data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

module.exports = {
  initSentry,
  errorHandler,
  captureError,
  startTransaction,
  setUser,
  clearUser,
  addBreadcrumb,
};