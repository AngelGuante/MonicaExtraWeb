using Dapper;
using MonicaExtraWeb.Models.monica10;
using System.Linq;
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
            query.Append($" FROM {DbName}.dbo.clientes ");

            return Json(new
            {
                codes = Conn.Query<string>(query.ToString())
            });
        }

        [Route("GetDetails")]
        [Route("GetDetails/{code}")]
        public IHttpActionResult GetDetails(string code)
        {
            if (code == null
                || code.Trim() == default)
                return StatusCode(System.Net.HttpStatusCode.BadRequest);

            var query = new StringBuilder();
            query.Append("  SELECT * ");
            query.Append($" FROM {DbName}.dbo.clientes ");
            query.Append($" WHERE codigo_clte = '{code}' ");

            return Json(new
            {
                details = Conn.Query<clientes>(query.ToString()).FirstOrDefault()
            });
        }
    }
}
