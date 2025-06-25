const db = require('../config/db');
const { cloudinary } = require('../config/cloudinary');

exports.crearProducto = (req, res) => {
  const { nombreProducto, precio, idCategoria, stockActual } = req.body;

  if (!req.file) return res.status(400).json({ message: 'Imagen requerida' });

  const imagenUrl = req.file.path;
  const publicId = req.file.filename;

  const sql = 'INSERT INTO producto (nombreProducto, precio, idCategoria, stockActual) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombreProducto, parseFloat(precio), idCategoria, parseInt(stockActual)], (err, result) => {
    if (err) return res.status(500).send(err);

    const idProducto = result.insertId;
    const sqlImg = 'INSERT INTO imagen (entidadId, tipoEntidad, url, idPublico, nombreImagen, tipoArchivo) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sqlImg, [idProducto, 'producto', imagenUrl, publicId, req.file.originalname, req.file.mimetype], (errImg) => {
      if (errImg) return res.status(500).send(errImg);
      res.status(201).json({ message: 'Producto creado con imagen', id: idProducto });
    });
  });
};

exports.obtenerProductos = (req, res) => {
  const sql = `
    SELECT 
      p.id,
      p.nombreProducto,
      p.precio,
      p.stockActual,
      c.nombre AS categoria,
      i.url AS imagenUrl
    FROM producto p
    LEFT JOIN categoria c ON p.idCategoria = c.id
    LEFT JOIN imagen i ON i.entidadId = p.id AND i.tipoEntidad = 'producto'
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

exports.obtenerProductoPorId = (req, res) => {
  const sql = `
    SELECT 
      p.id,
      p.nombreProducto,
      p.precio,
      p.stockActual,
      c.nombre AS categoria,
      i.url AS imagenUrl
    FROM producto p
    LEFT JOIN categoria c ON p.idCategoria = c.id
    LEFT JOIN imagen i ON i.entidadId = p.id AND i.tipoEntidad = 'producto'
    WHERE p.id = ?
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(result[0]);
  });
};

exports.actualizarProducto = (req, res) => {
  const { nombreProducto, precio, idCategoria, stockActual } = req.body;

  db.query('SELECT * FROM imagen WHERE entidadId = ? AND tipoEntidad = "producto"', [req.params.id], (err, resultadoImg) => {
    if (err) return res.status(500).send(err);

    const imagenActual = resultadoImg[0];

    const actualizarProducto = () => {
      const sql = 'UPDATE producto SET nombreProducto = ?, precio = ?, idCategoria = ?, stockActual = ? WHERE id = ?';
      db.query(sql, [nombreProducto, parseFloat(precio), idCategoria, parseInt(stockActual), req.params.id], (err2) => {
        if (err2) return res.status(500).send(err2);
        res.json({ message: 'Producto actualizado' });
      });
    };

    if (req.file) {
      const nuevaUrl = req.file.path;
      const nuevoPublicId = req.file.filename;

      if (imagenActual) {
        cloudinary.uploader.destroy(imagenActual.idPublico);
        const sqlUpd = 'UPDATE imagen SET url = ?, idPublico = ?, nombreImagen = ?, tipoArchivo = ? WHERE entidadId = ? AND tipoEntidad = "producto"';
        db.query(sqlUpd, [nuevaUrl, nuevoPublicId, req.file.originalname, req.file.mimetype, req.params.id], (err3) => {
          if (err3) return res.status(500).send(err3);
          actualizarProducto();
        });
      } else {
        const sqlIns = 'INSERT INTO imagen (entidadId, tipoEntidad, url, idPublico, nombreImagen, tipoArchivo) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(sqlIns, [req.params.id, 'producto', nuevaUrl, nuevoPublicId, req.file.originalname, req.file.mimetype], (err4) => {
          if (err4) return res.status(500).send(err4);
          actualizarProducto();
        });
      }
    } else {
      actualizarProducto();
    }
  });
};

exports.eliminarProducto = (req, res) => {
  db.query('SELECT * FROM imagen WHERE entidadId = ? AND tipoEntidad = "producto"', [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);

    const imagen = result[0];

    const eliminarProductoImagen = () => {
      db.query('DELETE FROM imagen WHERE entidadId = ? AND tipoEntidad = "producto"', [req.params.id], (errImgDel) => {
        if (errImgDel) return res.status(500).send(errImgDel);

        db.query('DELETE FROM producto WHERE id = ?', [req.params.id], (err2) => {
          if (err2) return res.status(500).send(err2);
          res.json({ message: 'Producto e imagen eliminados correctamente' });
        });
      });
    };

    if (imagen) {
      cloudinary.uploader.destroy(imagen.idPublico, (error) => {
        if (error) {
          console.error('Error eliminando imagen en Cloudinary:', error);
          return res.status(500).send({ message: 'Error eliminando imagen en Cloudinary' });
        }
        eliminarProductoImagen();
      });
    } else {
      eliminarProductoImagen();
    }
  });
};