using Dapper;
using MonicaExtraWeb.Models;
using MonicaExtraWeb.Models.DTO.Control;
using MonicaExtraWeb.Utils.Token;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Querys.Usuarios;

namespace MonicaExtraWeb.Controllers.API
{
    [AllowAnonymous]
    [RoutePrefix("API/Login")]
    public class LoginController : ApiController
    {
        [HttpPost]
        [Route("authenticate")]
        public IHttpActionResult Authenticate(LoginRequest login)
        {
            var initialPass = ConfigurationManager.AppSettings["ContraseniaInicialUsuario"];

            if (login == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var usuario = Conn.Query<Usuario>(Select(new Usuario
            {
                NombreUsuario = login.Username
            }, new Models.DTO.QueryConfigDTO { ExcluirUsuariosControl = false})).FirstOrDefault();

            if (usuario != default &&
                login.Password == usuario.Clave)
            {
                var token = TokenGenerator.GenerateTokenJwt(login.Username);
                return Json(new { token, usuario.NombreUsuario, usuario.Estatus, usuario.Nivel, usuario.IdUsuario, usuario.Estatus.Value, initialPass });
            }
            else
                return Unauthorized();
        }
    }
}