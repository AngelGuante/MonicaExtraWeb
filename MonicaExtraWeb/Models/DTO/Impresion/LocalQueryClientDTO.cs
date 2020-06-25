using MonicaExtraWeb.Enums;
using MonicaExtraWeb.Models.DTO.Reportes;

namespace MonicaExtraWeb.Models.DTO.Impresion
{
    public class LocalQueryClientDTO
    {
        public ClientMessageStatusEnum status { get; set; }
        public FiltrosReportes filtro { get; set; }
    }
}