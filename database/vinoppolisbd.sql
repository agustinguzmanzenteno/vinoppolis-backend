CREATE DATABASE IF NOT EXISTS vinoppolisbd;
USE vinoppolisbd;
CREATE TABLE producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
 	codigoProducto INT NOT NULL UNIQUE,
  	nombreProducto VARCHAR(255) NOT NULL,
 	precio DOUBLE NOT NULL,
 	categoria VARCHAR(255),
 	stockActual INT DEFAULT 0
);
CREATE TABLE imagen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idProducto INT NOT NULL,
    nombreImagen VARCHAR(255),         
    url TEXT NOT NULL,                   
    tipoArchivo VARCHAR(255),           
    idPublico VARCHAR(255),             
    descripcion TEXT,                                    
    fechaCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProducto) REFERENCES producto(id) ON DELETE CASCADE
);