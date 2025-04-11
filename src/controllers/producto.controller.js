const db = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.crearProducto = (req, res) => {
  const { codigoProducto, nombreProducto, precio, categoria, stockActual, imagenExistente } = req.body;
  const imagen = req.file ? req.file.filename : imagenExistente || null;

  const sql = 'INSERT INTO producto (codigoProducto, nombreProducto, precio, categoria, stockActual, imagen) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [codigoProducto, nombreProducto, parseInt(precio), categoria, parseInt(stockActual), imagen], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ message: 'Producto creado', id: result.insertId });
  });
};

exports.obtenerProductos = (req, res) => {
  db.query('SELECT * FROM producto', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

exports.obtenerProductoPorId = (req, res) => {
  db.query('SELECT * FROM producto WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(result[0]);
  });
};

exports.actualizarProducto = (req, res) => {
  const { codigoProducto, nombreProducto, precio, categoria, stockActual, imagenExistente } = req.body;
  const nuevaImagen = req.file ? req.file.filename : imagenExistente;

  db.query('SELECT imagen FROM producto WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });

    const imagenAntigua = result[0].imagen;

    const sql = 'UPDATE producto SET codigoProducto = ?, nombreProducto = ?, precio = ?, categoria = ?, stockActual = ?, imagen = ? WHERE id = ?';
    db.query(sql, [codigoProducto, nombreProducto, parseInt(precio), categoria, parseInt(stockActual), nuevaImagen, req.params.id], (err) => {
      if (err) return res.status(500).send(err);

      if (req.file && imagenAntigua && imagenAntigua !== nuevaImagen) {
        const ruta = path.join(__dirname, '../../uploads', imagenAntigua);
        fs.unlink(ruta, () => {});
      }

      res.json({ message: 'Producto actualizado' });
    });
  });
};

exports.eliminarProducto = (req, res) => {
  db.query('SELECT imagen FROM producto WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });

    const imagen = result[0].imagen;

    db.query('DELETE FROM producto WHERE id = ?', [req.params.id], (err) => {
      if (err) return res.status(500).send(err);

      if (imagen) {
        const ruta = path.join(__dirname, '../../uploads', imagen);
        fs.unlink(ruta, () => {});
      }

      res.json({ message: 'Producto eliminado' });
    });
  });
};