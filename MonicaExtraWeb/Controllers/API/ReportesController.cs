using Dapper;
using MonicaExtraWeb.Models.DTO.Reportes;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Reportes;

namespace MonicaExtraWeb.Controllers.API
{
    [RoutePrefix("API/Reportes")]
    public class ReportesController : ApiController
    {
        [HttpGet]
        [Route("GetIndividualClientStatus")]
        public IHttpActionResult GetIndividualClientStatus([FromUri] Filtros filtro)
        {
            if (filtro.code == null
                || filtro.code == default)
                return StatusCode(System.Net.HttpStatusCode.BadRequest);

            var query = IndividualClientQuery(filtro, DbName);

            return Json(new
            {
                IndividualClientStatusDATA = Conn.Query<IndividualClientStatusDTO>(query.ToString())
            });
        }
    }
}
