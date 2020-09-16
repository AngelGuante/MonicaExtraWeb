using Dapper;
using MonicaExtraWeb.Models;
using MonicaExtraWeb.Models.DTO.Control;
using System.Linq;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Querys.Usuarios;

namespace MonicaExtraWeb.Controllers.API
{
    [Authorize]
    [RoutePrefix("API/USUARIOS")]
    public class UsuariosController : ApiController
    {
        [HttpGet]
        [Route("GET")]
        public IHttpActionResult Get(/*Usuario user = default*/)
        {
            //var query = Select(user);           
            var query = Select(new Usuario());
            var usuarios = Conn.Query<Usuario>(query.ToString()).ToList();

            return Json(new
            {
                usuarios
            });
        }
    }
}
