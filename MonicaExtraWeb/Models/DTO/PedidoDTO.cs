using MonicaExtraWeb.Models.monica10;
using System.Collections.Generic;

namespace MonicaExtraWeb.Models.DTO
{
    public class PedidoDTO
    {
        public Estimado estimado { get; set; }
        public List<EstimadoDetalle> detalle { get; set; }
    }
}