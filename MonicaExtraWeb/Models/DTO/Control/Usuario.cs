namespace MonicaExtraWeb.Models.DTO.Control
{
    public class Usuario
    {
        public long IdUsuario { get; set; }
        public long IdEmpresa { get; set; }
        public string Login { get; set; }
        public string NombreUsuario { get; set; }
        public string Clave { get; set; }
        public int Estatus { get; set; }
    }
}