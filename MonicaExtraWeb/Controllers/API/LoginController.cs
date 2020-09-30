using Dapper;
using MonicaExtraWeb.Models;
using MonicaExtraWeb.Models.DTO.Control;
using MonicaExtraWeb.Utils.Token;
using System.Configuration;
using System.Linq;
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

            if (login == default || login.IdEmpresa == default || login.Username == default || login.Password == default)
                return Unauthorized();

            var usuario = Conn.Query<Usuario>(Select(new Usuario
            {
                IdEmpresa = login.IdEmpresa,
                NombreUsuario = login.Username,
            }, new Models.DTO.QueryConfigDTO { ExcluirUsuariosControl = false, Usuario_Join_IdEmpresaM = true })).FirstOrDefault();

            if (usuario != default &&
                login.Password == usuario.Clave)
            {
                var token = TokenGenerator.GenerateTokenJwt(login.Username);
                return Json(new { token, usuario.NombreUsuario, usuario.Estatus, usuario.Nivel, usuario.IdUsuario, /*usuario.Estatus.Value,*/ initialPass, usuario.idEmpresasM });
            }
            else
                return Unauthorized();
        }
    }
}