using Dapper;
using MonicaExtraWeb.Models.DTO.Control;
using System.Linq;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Querys.Control.Modulos;

namespace MonicaExtraWeb.Controllers.API
{
    [Authorize]
    [RoutePrefix("API/MODULOS")]
    public class ModulosController : ApiController
    {
        [HttpGet]
        [Route("GET")]
        public IHttpActionResult Get()
        {
            var query = Select();
            var modulos = Conn.Query<Modulos>(query.ToString()).ToList();

            return Json(new
            {
                modulos
            });
        }
    }
}
