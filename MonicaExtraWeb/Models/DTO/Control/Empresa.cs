using System;

namespace MonicaExtraWeb.Models.DTO.Control
{
    public class Empresa
    {
        public long? IdEmpresa { get; set; }
        public string NombreEmpresa { get; set; }
        public string  Contacto { get; set; }
        public string  Telefono { get; set; }
        public string  Correo { get; set; }
        public string  CantidadEmpresas { get; set; }
        public string  CantidadUsuariosPagados { get; set; }
        public DateTime? FechaInicio { get; set; }
        public DateTime? Vencimiento { get; set; }
        public DateTime? FechaSuspencion { get; set; }
        public string ConexionServidor { get; set; }
        public int? Estatus { get; set; }
        public string idEmpresasM { get; set; }
        public string ConnectionString { get; set; }

        //  EXTRAS
        public string? usuariosRegistrados { get; set; }
    }
}