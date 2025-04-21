CREATE DATABASE IF NOT EXISTS vinoppolisbd;
USE vinoppolisbd;
CREATE TABLE categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE
);
CREATE TABLE producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
 	codigoProducto INT NOT NULL UNIQUE,
  	nombreProducto VARCHAR(255) NOT NULL,
 	precio DOUBLE NOT NULL,
 	idCategoria INT,
 	stockActual INT DEFAULT 0,
    FOREIGN KEY (idCategoria) REFERENCES categoria(id) ON DELETE SET NULL
);
CREATE TABLE imagen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entidadId INT NOT NULL,
    tipoEntidad ENUM('producto', 'categoria') NOT NULL, 
    nombreImagen VARCHAR(255),         
    url TEXT NOT NULL,                   
    tipoArchivo VARCHAR(255),           
    idPublico VARCHAR(255),             
    descripcion TEXT,                                    
    fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);