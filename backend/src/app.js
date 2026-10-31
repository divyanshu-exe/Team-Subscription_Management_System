// OWNER: BE-1
// PURPOSE: Create express app, global middleware, mount all module routers under /api

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const errorMiddleware = require('./middlewares/error.middleware');
const { ok } = require('./utils/apiResponse');

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  return ok(res, { status: 'healthy', timestamp: new Date().toISOString() }, 'System healthy');
});

// Safe router loader helper
function loadRouter(routerPath) {
  try {
    const mod = require(routerPath);
    if (typeof mod === 'function' || (mod && typeof mod.use === 'function')) {
      return mod;
    }
  } catch (err) {
    // Fallback if file has syntax error or isn't ready
  }
  const fallback = express.Router();
  fallback.all('*', (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Module not implemented yet',
    });
  });
  return fallback;
}

// Mount all module routes under /api
app.use('/api/auth', loadRouter('./modules/auth/auth.routes'));
app.use('/api/users', loadRouter('./modules/users/users.routes'));
app.use('/api/customers', loadRouter('./modules/customers/customers.routes'));
app.use('/api/products', loadRouter('./modules/products/products.routes'));
app.use('/api/taxes', loadRouter('./modules/taxes/taxes.routes'));
app.use('/api/plans', loadRouter('./modules/plans/plans.routes'));
app.use('/api/discounts', loadRouter('./modules/discounts/discounts.routes'));
app.use('/api/quotation-templates', loadRouter('./modules/quotation-templates/quotation-templates.routes'));
app.use('/api/subscriptions', loadRouter('./modules/subscriptions/subscriptions.routes'));
app.use('/api/invoices', loadRouter('./modules/invoices/invoices.routes'));
app.use('/api/billing', loadRouter('./modules/billing/billing.routes'));
app.use('/api/payments', loadRouter('./modules/payments/payments.routes'));
app.use('/api/dashboard', loadRouter('./modules/dashboard/dashboard.routes'));
app.use('/api/portal', loadRouter('./modules/portal/portal.routes'));

// Global error handler
app.use(errorMiddleware);

module.exports = app;