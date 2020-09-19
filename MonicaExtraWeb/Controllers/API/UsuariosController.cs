using Dapper;
using MonicaExtraWeb.Models.DTO;
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
        public IHttpActionResult Get()
        {
            var query = Select(new Usuario(), new QueryConfigDTO { ExcluirUsuariosControl = true });
            var usuarios = Conn.Query<Usuario>(query.ToString()).ToList();

            return Json(new
            {
                usuarios
            });
        }

        [HttpPost]
        [Route("POST")]
        public IHttpActionResult Post(NuevoUsuario param)
        {
            Insert(param.usuario, param.modulos);

            return Ok();
        }

        [HttpPut]
        [Route("PUT")]
        public IHttpActionResult PUT(Usuario usuario)
        {
            var query = Update(usuario);
            Conn.Execute(query.ToString());

            return Ok();
        }
    }
}