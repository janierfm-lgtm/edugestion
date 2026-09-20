const mongoose = require('mongoose');

// Evita que cualquier consulta (incluidas las hechas antes de conectar, o
// mientras Mongo está caído) se quede "en buffer" hasta 10s por defecto:
// con esto, fallan de inmediato con un error claro en vez de colgar la petición.
mongoose.set('bufferCommands', false);

async function connectMongo() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/edugestion_logs';
  try {
    // bufferCommands: false evita que las consultas se queden "en espera" hasta
    // 10s (el valor por defecto de Mongoose) cuando Mongo no está disponible;
    // en su lugar, fallan de inmediato para que la API responda rápido.
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000, bufferCommands: false });
    // eslint-disable-next-line no-console
    console.log('Conectado a MongoDB (bitácora de actividad)');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('No se pudo conectar a MongoDB (la API sigue funcionando sin bitácora):', err.message);
  }
}

const activityLogSchema = new mongoose.Schema({
  userId: { type: Number, required: false },
  userEmail: { type: String, required: false },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.Mixed },
  method: { type: String },
  path: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = { connectMongo, ActivityLog };
