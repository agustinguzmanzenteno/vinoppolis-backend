const db = require('../config/db');
const { cloudinary } = require('../config/cloudinary');

exports.crearCategoria = (req, res) => {
    const { nombre } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Imagen requerida' });
  
    const imagenUrl = req.file.path;
    const publicId = req.file.filename;
  
    const sql = 'INSERT INTO categoria (nombre) VALUES (?)';
    db.query(sql, [nombre], (err, result) => {
      if (err) return res.status(500).send(err);
  
      const idCategoria = result.insertId;
      const sqlImg = 'INSERT INTO imagen (entidadId, tipoEntidad, url, idPublico, nombreImagen, tipoArchivo) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(sqlImg, [idCategoria, 'categoria', imagenUrl, publicId, req.file.originalname, req.file.mimetype], (errImg) => {
        if (errImg) return res.status(500).send(errImg);
        res.status(201).json({ message: 'Categoría creada con imagen', id: idCategoria });
      });
    });
  };
  
  exports.obtenerCategorias = (req, res) => {
    const sql = `
      SELECT c.*, i.url AS imagenUrl
      FROM categoria c
      LEFT JOIN imagen i ON i.entidadId = c.id AND i.tipoEntidad = 'categoria'
    `;
    db.query(sql, (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    });
  };
  
  exports.obtenerCategoriaPorId = (req, res) => {
    const sql = `
      SELECT c.*, i.url AS imagenUrl
      FROM categoria c
      LEFT JOIN imagen i ON i.entidadId = c.id AND i.tipoEntidad = 'categoria'
      WHERE c.id = ?
    `;
    db.query(sql, [req.params.id], (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.length === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
      res.json(result[0]);
    });
  };
  
  exports.actualizarCategoria = (req, res) => {
    const { nombre } = req.body;
  
    db.query('SELECT * FROM imagen WHERE entidadId = ? AND tipoEntidad = "categoria"', [req.params.id], (err, resultadoImg) => {
      if (err) return res.status(500).send(err);
  
      const imagenActual = resultadoImg[0];
  
      const actualizarCategoria = () => {
        const sql = 'UPDATE categoria SET nombre = ? WHERE id = ?';
        db.query(sql, [nombre, req.params.id], (err2) => {
          if (err2) return res.status(500).send(err2);
          res.json({ message: 'Categoría actualizada' });
        });
      };
  
      if (req.file) {
        const nuevaUrl = req.file.path;
        const nuevoPublicId = req.file.filename;
  
        if (imagenActual) {
          cloudinary.uploader.destroy(imagenActual.idPublico);
          const sqlUpd = 'UPDATE imagen SET url = ?, idPublico = ?, nombreImagen = ?, tipoArchivo = ? WHERE entidadId = ? AND tipoEntidad = "categoria"';
          db.query(sqlUpd, [nuevaUrl, nuevoPublicId, req.file.originalname, req.file.mimetype, req.params.id], (err3) => {
            if (err3) return res.status(500).send(err3);
            actualizarCategoria();
          });
        } else {
          const sqlIns = 'INSERT INTO imagen (entidadId, tipoEntidad, url, idPublico, nombreImagen, tipoArchivo) VALUES (?, ?, ?, ?, ?, ?)';
          db.query(sqlIns, [req.params.id, 'categoria', nuevaUrl, nuevoPublicId, req.file.originalname, req.file.mimetype], (err4) => {
            if (err4) return res.status(500).send(err4);
            actualizarCategoria();
          });
        }
      } else {
        actualizarCategoria();
      }
    });
  };
  
  exports.eliminarCategoria = (req, res) => {
    db.query('SELECT * FROM imagen WHERE entidadId = ? AND tipoEntidad = "categoria"', [req.params.id], (err, result) => {
      if (err) return res.status(500).send(err);
  
      const imagen = result[0];
      if (imagen) {
        cloudinary.uploader.destroy(imagen.idPublico);
      }
  
      db.query('DELETE FROM categoria WHERE id = ?', [req.params.id], (err2) => {
        if (err2) return res.status(500).send(err2);
        res.json({ message: 'Categoría eliminada con su imagen' });
      });
    });
  };