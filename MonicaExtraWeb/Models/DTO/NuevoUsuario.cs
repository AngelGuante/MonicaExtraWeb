using MonicaExtraWeb.Models.DTO.Control;

namespace MonicaExtraWeb.Models.DTO
{
    public class NuevoUsuario
    {
        public Usuario usuario { get; set; }
        public string[] modulos { get; set; }
    }
}