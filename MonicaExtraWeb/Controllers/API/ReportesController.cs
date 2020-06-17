using Dapper;
using MonicaExtraWeb.Models.DTO.Reportes;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.QuerysReportes;

namespace MonicaExtraWeb.Controllers.API
{
    [RoutePrefix("API/Reportes")]
    public class ReportesController : ApiController
    {
        [HttpGet]
        [Route("GetIndividualClientStatus")]
        public IHttpActionResult GetIndividualClientStatus([FromUri] FiltrosReportes filtro)
        {
            if (filtro.clientCode == null
                || filtro.clientCode == default)
                return StatusCode(System.Net.HttpStatusCode.BadRequest);

            var query = IndividualClientQuery(filtro, DbName);

            return Json(new
            {
                IndividualClientStatusDATA = Conn.Query<IndividualClientStatusDTO>(query.ToString())
            });
        }
    }
}
