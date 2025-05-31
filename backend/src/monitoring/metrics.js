const prometheus = require('prom-client');

// Create a Registry
const register = new prometheus.Registry();

// Add default metrics
prometheus.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const activeConnections = new prometheus.Gauge({
  name: 'websocket_active_connections',
  help: 'Number of active WebSocket connections',
});

const sessionCreatedTotal = new prometheus.Counter({
  name: 'pomodoro_sessions_created_total',
  help: 'Total number of Pomodoro sessions created',
  labelNames: ['type'], // focus, shortBreak, longBreak
});

const sessionCompletedTotal = new prometheus.Counter({
  name: 'pomodoro_sessions_completed_total',
  help: 'Total number of Pomodoro sessions completed',
  labelNames: ['type'],
});

const userRegistrations = new prometheus.Counter({
  name: 'user_registrations_total',
  help: 'Total number of user registrations',
});

const userLogins = new prometheus.Counter({
  name: 'user_logins_total',
  help: 'Total number of user logins',
  labelNames: ['method'], // password, social, token
});

const databaseQueryDuration = new prometheus.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
});

const cacheHits = new prometheus.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_name'],
});

const cacheMisses = new prometheus.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_name'],
});

const queueSize = new prometheus.Gauge({
  name: 'queue_size',
  help: 'Current size of various queues',
  labelNames: ['queue_name'],
});

const rateLimitHits = new prometheus.Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['endpoint'],
});

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(sessionCreatedTotal);
register.registerMetric(sessionCompletedTotal);
register.registerMetric(userRegistrations);
register.registerMetric(userLogins);
register.registerMetric(databaseQueryDuration);
register.registerMetric(cacheHits);
register.registerMetric(cacheMisses);
register.registerMetric(queueSize);
register.registerMetric(rateLimitHits);

// Middleware to track HTTP metrics
const httpMetricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || 'unknown';
    const method = req.method;
    const statusCode = res.statusCode;
    
    httpRequestDuration
      .labels(method, route, statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(method, route, statusCode)
      .inc();
  });
  
  next();
};

// Database query tracking
const trackDatabaseQuery = (operation, table, duration) => {
  databaseQueryDuration
    .labels(operation, table)
    .observe(duration);
};

// Cache tracking
const trackCacheHit = (cacheName) => {
  cacheHits.labels(cacheName).inc();
};

const trackCacheMiss = (cacheName) => {
  cacheMisses.labels(cacheName).inc();
};

// Session tracking
const trackSessionCreated = (type) => {
  sessionCreatedTotal.labels(type).inc();
};

const trackSessionCompleted = (type) => {
  sessionCompletedTotal.labels(type).inc();
};

// User tracking
const trackUserRegistration = () => {
  userRegistrations.inc();
};

const trackUserLogin = (method = 'password') => {
  userLogins.labels(method).inc();
};

// WebSocket tracking
const incrementActiveConnections = () => {
  activeConnections.inc();
};

const decrementActiveConnections = () => {
  activeConnections.dec();
};

// Queue tracking
const updateQueueSize = (queueName, size) => {
  queueSize.labels(queueName).set(size);
};

// Rate limit tracking
const trackRateLimitHit = (endpoint) => {
  rateLimitHits.labels(endpoint).inc();
};

// Metrics endpoint handler
const metricsHandler = async (req, res) => {
  res.set('Content-Type', register.contentType);
  const metrics = await register.metrics();
  res.end(metrics);
};

module.exports = {
  register,
  httpMetricsMiddleware,
  metricsHandler,
  trackDatabaseQuery,
  trackCacheHit,
  trackCacheMiss,
  trackSessionCreated,
  trackSessionCompleted,
  trackUserRegistration,
  trackUserLogin,
  incrementActiveConnections,
  decrementActiveConnections,
  updateQueueSize,
  trackRateLimitHit,
};