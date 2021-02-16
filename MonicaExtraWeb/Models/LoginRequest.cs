namespace MonicaExtraWeb.Models
{
    public class LoginRequest
    {
        public long IdEmpresa { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string mac { get; set; } = string.Empty;
        public bool passwordEncriptado { get; set; } = false;
        public bool desconectar { get; set; }
    }
}