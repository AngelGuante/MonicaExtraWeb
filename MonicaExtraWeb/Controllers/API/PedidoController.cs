using MonicaExtraWeb.Models.DTO;
using System.Web.Http;
using static MonicaExtraWeb.Utils.Querys.monica10.Pedidos;

namespace MonicaExtraWeb.Controllers.API
{
    [RoutePrefix("API/PEDIDO")]
    public class PedidoController : ApiController
    {
        [Authorize]
        [HttpPost]
        [Route("POST")]
        public IHttpActionResult Post(PedidoDTO pedido) =>
            Json(new { rst = Insert(pedido.estimado, pedido.detalle) });
    }
}
