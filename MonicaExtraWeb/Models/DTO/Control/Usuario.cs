using System;

namespace MonicaExtraWeb.Models.DTO.Control
{
    public class Usuario
    {
#pragma warning disable CS8632 // The annotation for nullable reference types should only be used in code within a '#nullable' annotations context.
        public long? IdUsuario { get; set; } = null;
        public long IdEmpresa { get; set; }
        public string Login { get; set; }
        public string NombreUsuario { get; set; }
        public string Clave { get; set; }
        public int? Nivel { get; set; }
        public int? Estatus { get; set; } = null;
        public string? idEmpresasM { get; set; } = null;
        public string EmpresaRegistrada_idEmpresasM { get; set; } = null;
        public bool? Remoto { get; set; }

        //  VARIABLES DE EMPRESA
        public int empresaEstatus { get; set; }
        public DateTime? Vencimiento { get; set; }
        public string defaultPass { get; set; }

        // CONFIGURACIONES
        public bool desconectar { get; set; }
        public string connSeleccionada { get; set; }
        public int Intentos { get; set; }
        public DateTime? TiempoBloqueo { get; set; }
        public string? Token { get; set; }
#pragma warning restore CS8632 // The annotation for nullable reference types should only be used in code within a '#nullable' annotations context.
    }
}