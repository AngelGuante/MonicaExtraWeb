using Dapper;
using System.Text;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;

namespace MonicaExtraWeb.Controllers.API
{
    [RoutePrefix("API/Clientes")]
    public class ClientesController : ApiController
    {
        [HttpGet]
        [Route("GetCodes")]
        public IHttpActionResult GetCodes()
        {
            var query = new StringBuilder();
            query.Append("  SELECT TRIM(codigo_clte) ");
            query.Append($" FROM {DbName}dbo.clientes ");

            return Json(new {
                codes = Conn.Query<string>(query.ToString())
            });
        }
    }
}
