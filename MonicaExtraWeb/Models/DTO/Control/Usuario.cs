namespace MonicaExtraWeb.Models.DTO.Control
{
    public class Usuario
    {
        public long? IdUsuario { get; set; } = null;
        public long IdEmpresa { get; set; }
        public string Login { get; set; }
        public string NombreUsuario { get; set; }
        public string Clave { get; set; }
        public int? Nivel { get; set; }
        public int? Estatus { get; set; } = null;
        public string idEmpresasM { get; set; } = null;
    }
}