using Dapper;
using MonicaExtraWeb.Models;
using MonicaExtraWeb.Models.DTO.Control;
using MonicaExtraWeb.Utils.Token;
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
            if (login == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            var usuario = Conn.Query<Usuario>(Select(new Usuario
            {
                NombreUsuario = login.Username
            })).FirstOrDefault();

            if (usuario != default &&
                login.Password == usuario.Clave)
            {
                var token = TokenGenerator.GenerateTokenJwt(login.Username);
                return Json(new { token, usuario.NombreUsuario, usuario.Estatus });
            }
            else
                return Unauthorized();
        }
    }
}