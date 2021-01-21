CREATE TABLE EmpresaRegistradaEstatus(
	Id INT NOT NULL UNIQUE,
	Descripcion VARCHAR(30) NOT NULL
);
INSERT INTO EmpresaRegistradaEstatus
VALUES
(0, 'Inactivo por el mismo cliente'),
(1, 'Activo'),
(2, 'Suspendido por falta de pago'),
(3, 'Inactivo')

CREATE TABLE EmpresaRegistrada(
	idEmpresa BIGINT IDENTITY PRIMARY KEY,
	NombreEmpresa VARCHAR(60) NOT NULL,
	Contacto VARCHAR(60),
	Telefono VARCHAR(20),
	Correo VARCHAR(40) NOT NULL,
	CantidadEmpresas INT DEFAULT 1,
	CantidadUsuariosPagados INT DEFAULT 1,
	FechaInicio DATETIME DEFAULT GETDATE(),
	Vencimiento DATETIME NOT NULL,
	FechaSuspencion DATETIME,
	ConexionServidor VARCHAR(100),
	--idEmpresaM,
	--IdCiudadEstado,
	--IdToken
	ESTATUS INT FOREIGN KEY REFERENCES EmpresaRegistradaEstatus(Id) DEFAULT 1
)
INSERT INTO EmpresaRegistrada(NombreEmpresa, Correo, CantidadEmpresas, CantidadUsuariosPagados, Vencimiento)
VALUES
('Almonte_MoniExtra', 'almonte@computadorasengrande.com', 1, 1, GETDATE()),
('Empresa Demo', 'demo@domain.com', 1, 1, GETDATE())


CREATE TABLE Usuario(
	IdUsuario BIGINT IDENTITY PRIMARY KEY,
	IdEmpresa BIGINT FOREIGN KEY REFERENCES EmpresaRegistrada(idEmpresa),
	[Login] VARCHAR(15) NOT NULL,
	NombreUsuario VARCHAR(40) NOT NULL,
	Clave VARCHAR(10) DEFAULT '123456abc!',
	--IdToken
	--DispositivosRegistrados
	Estatus SMALLINT DEFAULT 1,
	Nivel SMALLINT DEFAULT 2,
	--LoginMonica VARCHAR(15)
	--EnlaceMonica VARCHAR(15)
	Remoto SMALLINT DEFAULT 0
	--ConexionServidor VARCHAR(60)
	--CampoCompuesto VARCHAR(60)
)
INSERT INTO Usuario(IdEmpresa, Login, NombreUsuario, Nivel, Clave)
VALUES
('1', 'Admin', 'Administrador', 0, 'Adm@5452!'),
('2', 'Administrador', 'Usuario Administrador', 1, '123456@!')

CREATE TABLE Modulo(
	IdModulo VARCHAR(4) NOT NULL UNIQUE,
	Descripcion VARCHAR(45) UNIQUE
)
INSERT INTO Modulo
VALUES
('FAC', 'Facturación'),
('DVC', 'Devoluciones de Clientes'),
('CXC', 'Cuentas por Cobrar'),
('CXP', 'Cuentas por Pagar'),
('INV', 'Inventario'),
('CLI', 'Clientes'),
('PRO', 'Proveedores'),
('COM', 'Compras'),
('DVP', 'Devoluciones a Proveedores'),
('COP', 'Cotizaciones a Proveedores'),
('COC', 'Cotizaciones (Estimado)'),
('COD', 'Conduces (Consignaciones)'),
('BAC', 'Banco'),
('CON', 'Contabilidad'),
('CCH', 'Caja Chica'),
('EXT', 'Acceso a ISO Modulos de MoniExtra'),
('FULL', 'Accesso Todos los Módulos')

CREATE TABLE DetallesModuloDiccionario(
	Id SMALLINT PRIMARY KEY,
	Descripcion VARCHAR(45) NOT NULL UNIQUE
)
INSERT INTO DetallesModuloDiccionario
VALUES
(0, 'Consulta Básica'),
(1, 'Consulta Avanzada'),
(2, 'Análisis Estadistico'),
(3, 'Crear Entrada y Salida de Caja'),
(4, 'Modificar'),
(5, 'Imprimir')

CREATE TABLE DetallesModulo(
	IdDetalle INT IDENTITY PRIMARY KEY,
	IdModulo VARCHAR(4) FOREIGN KEY REFERENCES Modulo(IdModulo),
	IdDetalleModuloDiccionario SMALLINT FOREIGN KEY REFERENCES DetallesModuloDiccionario(Id)
)

CREATE TABLE PermisosUsuario(
	IdPermiso INT IDENTITY PRIMARY KEY,
	IdEmpresa BIGINT FOREIGN KEY REFERENCES EmpresaRegistrada(IdEmpresa),
	--IdEmpresaM
	IdUsuario BIGINT FOREIGN KEY REFERENCES Usuario(IdUsuario),
	IdModulo VARCHAR(4) FOREIGN KEY REFERENCES Modulo(IdModulo)
)

CREATE TABLE Concurrencia(
	id BIGINT PRIMARY KEY IDENTITY,
	idEmpresa BIGINT FOREIGN KEY REFERENCES EmpresaRegistrada(idEmpresa),
	IdUsuario BIGINT FOREIGN KEY REFERENCES Usuario(IdUsuario)
)

CREATE TABLE EmpresasEquiposRegistrados(
	id INT PRIMARY KEY IDENTITY(1, 1),
	idEmpresa BIGINT FOREIGN KEY REFERENCES EmpresaRegistrada(idEmpresa),
	identificador VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE EquiposAsignadosAUsuarios(
	id INT PRIMARY KEY IDENTITY(1, 1),
	idUsuario BIGINT FOREIGN KEY REFERENCES Usuario(IdUsuario),
	idEquipoRegistrado INT FOREIGN KEY REFERENCES EmpresasEquiposRegistrados(id)
)