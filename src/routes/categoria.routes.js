const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const controller = require('../controllers/categoria.controller');

router.post('/categoria', upload.single('imagen'), controller.crearCategoria);
router.get('/categorias', controller.obtenerCategorias);
router.get('/categoria/:id', controller.obtenerCategoriaPorId);
router.put('/categoria/:id', upload.single('imagen'), controller.actualizarCategoria);
router.delete('/categoria/:id', controller.eliminarCategoria);

module.exports = router;