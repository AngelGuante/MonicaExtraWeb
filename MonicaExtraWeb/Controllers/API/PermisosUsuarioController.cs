using Dapper;
using MonicaExtraWeb.Models.DTO;
using MonicaExtraWeb.Models.DTO.Control;
using MonicaExtraWeb.Utils.Querys.Control;
using System.Linq;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Querys.Control.PermisosUsuarios;

namespace MonicaExtraWeb.Controllers.API
{
    [Authorize]
    [RoutePrefix("API/PERMISOSUSUARIO")]
    public class PermisosUsuarioController : ApiController
    {
        [HttpGet]
        [Route("GET/{id}")]
        public IHttpActionResult Get(int id)
        {
            var query = Select(id);
            var permisosUsuario = Conn.Query<string>(query.ToString()).ToList();

            return Json(new
            {
                permisosUsuario
            });
        }

        [HttpPut]
        [Route("PUT")]
        public IHttpActionResult PUT(NuevoUsuario param)
        {
            for (int i = 0; i < param.modulos.Length; i++)
                Insert(new PermisosUsuario
                {
                    idEmpresa = 2,
                    idUsuario = param.usuario.IdUsuario.Value,
                    idModulo = param.modulos[i]
                });

            Delete_todoExepto(string.Join("', '", param.modulos), param.usuario.IdUsuario.Value);

            return Ok();
        }
    }
}
