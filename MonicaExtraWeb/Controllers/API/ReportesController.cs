using Dapper;
using MonicaExtraWeb.Models.DTO.Reportes;
using System.Text;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;

namespace MonicaExtraWeb.Controllers.API
{
    [RoutePrefix("API/Reportes")]
    public class ReportesController : ApiController
    {
        [HttpGet]
        [Route("GetIndividualClientStatus")]
        [Route("GetIndividualClientStatus/{clientCode}")]
        public IHttpActionResult GetIndividualClientStatus(string clientCode)
        {
            if (clientCode == null
                || clientCode == default)
                return StatusCode(System.Net.HttpStatusCode.BadRequest);

            var query = new StringBuilder();

            query.Append("  SELECT  D.fecha_emision, D.fecha_vcmto, D.ncf, D.descripcion_dcmto ");
            query.Append($" FROM {DbName}.dbo.clientes C ");
            query.Append("  JOIN docs_cc D ON C.cliente_id = D.cliente_id ");
            query.Append($" WHERE D.cliente_id = {clientCode} ");

            return Json(new
            {
                IndividualClientStatusDATA = Conn.Query<IndividualClientStatusDTO>(query.ToString())
            });
        }
    }
}
