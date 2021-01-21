using Dapper;
using MonicaExtraWeb.Models.DTO;
using MonicaExtraWeb.Models.DTO.Control;
using Newtonsoft.Json;
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
        public IHttpActionResult Get(string usuario = default)
        {
            var usuarioDeserialized = usuario != default ? JsonConvert.DeserializeObject<Usuario>(usuario) : new Usuario();
            var query = Select(usuarioDeserialized, new QueryConfigDTO {Select = " U.Login, U.Remoto ", ExcluirUsuariosControl = true });
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
            // VALIDAR QUE EL NOMBRE DE USUARIO NO EXISTA.
            var usuarios = Conn.Query<Usuario>(Select(new Usuario { 
                IdEmpresa = param.usuario.IdEmpresa,
                NombreUsuario = param.usuario.Login
            }, new QueryConfigDTO { ExcluirUsuariosControl = true }).ToString()).ToList();
            if (usuarios.Count > 0)
                return Ok(false);

            Insert(param.usuario, param.modulos);

            return Ok(true);
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