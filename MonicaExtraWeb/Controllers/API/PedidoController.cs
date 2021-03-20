using MonicaExtraWeb.Models.DTO;
using System.Threading.Tasks;
using System.Web.Http;
using static MonicaExtraWeb.Utils.Querys.monica10.Pedidos;
using static MonicaExtraWeb.Utils.LocalRequestQuery;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace MonicaExtraWeb.Controllers.API
{
    [RoutePrefix("API/PEDIDO")]
    public class PedidoController : ApiController
    {
        [Authorize]
        [HttpPost]
        [Route("POST")]
        public async Task<IHttpActionResult> Post(PedidoDTO pedido)
        {
            string resultset = default;
            try
            {
                var context = HttpContext.Current;

                //Task.Run(async () =>
                //{
                #region PRIMERO SE GUARDA EL PEDIDO
                await SendQueryToClient(Enums.ClientMessageStatusEnum.InsertPedido, new Models.DTO.Reportes.Filtros { Estimado = pedido.estimado }, context);
                //while (resultset == default)
                //{
                //    RequestClientData(out resultset, context);
                //}
                //#endregion

                //        //#region LUEGO SE GUARDA EL DETALLE DEL PEDIDO
                //        //var regex = new System.Text.RegularExpressions.Regex(@":\d+}");
                //        //var matches = regex.Matches(resultset);
                //        //if (matches.Count > 0)
                //        //{
                //        //    var estimado_id = (matches[0].ToString()).Replace(":", "").Replace("}", "");
                //        //    resultset = estimado_id;

                //        //    pedido.estimado.estimado_id = float.Parse(estimado_id);
                //        //    if (pedido.detalle.Count > 0)
                //        //    {
                //        //        _ = SendQueryToClient(Enums.ClientMessageStatusEnum.InsertDetallePedido, new Models.DTO.Reportes.Filtros { Estimado = pedido.estimado, EstimadoDetalles = pedido.detalle }, context);
                //        //    }
                //        //}
                #endregion
                //});
            }
            catch (System.Exception e)
            {
                resultset = e.Message;
            }
            return Json(new { rest = resultset });
        }
    }
}
