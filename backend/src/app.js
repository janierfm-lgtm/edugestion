const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { register, metricsMiddleware } = require('./config/metrics');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const coursesRoutes = require('./routes/courses.routes');
const enrollmentsRoutes = require('./routes/enrollments.routes');
const gradesRoutes = require('./routes/grades.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const logsRoutes = require('./routes/logs.routes');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }
  app.use(metricsMiddleware);

  app.get('/health', (req, res) => res.json({ status: 'ok', service: 'edugestion-backend' }));

  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/courses', coursesRoutes);
  app.use('/api/enrollments', enrollmentsRoutes);
  app.use('/api/grades', gradesRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/logs', logsRoutes);

  app.use((req, res) => res.status(404).json({ error: 'Recurso no encontrado' }));
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
