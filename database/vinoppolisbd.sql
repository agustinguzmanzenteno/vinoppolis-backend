CREATE DATABASE IF NOT EXISTS vinoppolisbd;
USE vinoppolisbd;
CREATE TABLE producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
 	codigoProducto INT NOT NULL UNIQUE,
  	nombreProducto VARCHAR(250) NOT NULL,
 	precio DOUBLE NOT NULL,
 	categoria VARCHAR(250),
 	stockActual INT DEFAULT 0,
 	imagen VARCHAR(250) 
);