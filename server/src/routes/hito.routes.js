const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// controllers and middleware
const hitosCtrl = require('../controllers/hito.controller');
// Ajusta según cómo exportes auth: si exportas `module.exports = auth` usa require(...) sin destructuring
// si exportas `exports.auth = auth` usa const { auth } = require(...)
let auth;
try {
  // prueba ambas formas
  const maybe = require('../middleware/auth');
  auth = typeof maybe === 'function' ? maybe : maybe.auth || maybe.default;
} catch (e) {
  auth = null;
  console.warn('No se pudo require ../middleware/auth:', e.message);
}

// multer storage mínimo
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'hitos');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// debug: comprobar handlers
console.log('hitosCtrl keys:', Object.keys(hitosCtrl || {}));
console.log('auth type:', typeof auth);
['getHitosByStudent','getHitoById','createOrUploadHitoFile','updateHitoStatus'].forEach(fn => {
  console.log(`${fn} ->`, typeof (hitosCtrl && (hitosCtrl[fn] || hitosCtrl.default && hitosCtrl.default[fn])));
});

// Rutas (alineadas con frontend: /api/hitos/student/:id)
if (!auth) console.warn('WARNING: auth middleware is not a function. Routes will still be mounted but auth must be fixed.');

router.get('/student/:studentId', auth, hitosCtrl.getHitosByStudent);
router.get('/:id', auth, hitosCtrl.getHitoById);
router.post('/', auth, upload.single('file'), hitosCtrl.createOrUploadHitoFile);
router.put('/:id/status', auth, hitosCtrl.updateHitoStatus);
// Serve an uploaded file for a hito by index: /api/hitos/:id/file/:idx
router.get('/:id/file/:idx', auth, hitosCtrl.downloadHitoFile);

module.exports = router;
