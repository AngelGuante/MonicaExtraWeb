using Dapper;
using MonicaExtraWeb.Models;
using MonicaExtraWeb.Models.DTO.Control;
using Newtonsoft.Json;
using System.Linq;
using System.Web;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Querys.Usuarios;
using static MonicaExtraWeb.Utils.Token.Claims;
using static MonicaExtraWeb.Utils.Helper;

namespace MonicaExtraWeb.Controllers.API
{
    [RoutePrefix("API/CONEXIONREMOTA")]
    public class ConexionRemotaController : ApiController
    {
        [AllowAnonymous]
        [HttpPost]
        [Route("ESTABLECERSERVIDOR")]
        public IHttpActionResult EstablecerServidor(LoginRequest login)
        {
            if (ValidarUsuarioLogin(login) == default)
                return Unauthorized();

            if (!CompanyRemoteConnectionIP.ContainsKey(login.IdEmpresa.ToString()))
            {
                CompanyRemoteConnectionIP.Add(login.IdEmpresa.ToString(), HttpContext.Current.Request.UserHostAddress);
                return Ok(true);
            }
            return Ok("Esta empresa ya tiene una conexion de servidor abierta, debe cerrar la existente para iniciar esta.");
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("CERRARSERVIDOR")]
        public IHttpActionResult CerrarServidor(LoginRequest login)
        {
            if (ValidarUsuarioLogin(login) == default)
                return Unauthorized();

            if (CompanyRemoteConnectionIP.ContainsKey(login.IdEmpresa.ToString()))
            {
                CompanyRemoteConnectionIP.Remove(login.IdEmpresa.ToString());

                foreach (var item in CompanyRemoteConnectionUsers.Where(x => x.Value == login.IdEmpresa.ToString()).ToList())
                {
                    CompanyRemoteConnectionUsersDisconected.Add(item.Key, item.Value);
                    CompanyRemoteConnectionUsers.Remove(item.Key);
                }
            }
            return Ok(true);
        }

        [Authorize]
        [HttpGet]
        [Route("ESTABLECER")]
        public IHttpActionResult Establecer()
        {
            var validacionRemoto = ValidarUsuarioParaConectarseRemoto();
            if (validacionRemoto != string.Empty)
                return Json(new { message = validacionRemoto });
            return Json(new { });
        }

        [Authorize]
        [HttpGet]
        [Route("CERRAR")]
        public IHttpActionResult Cerrar(string idUsuarioADesconectar = default, bool quitarPermiso = false, bool disconectedByAdmin = false)
        {
            if (idUsuarioADesconectar == default)
            {
                var claims = GetClaims();

                var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                    new { userId = "", empresaId = "" });

                if (CompanyRemoteConnectionIP.ContainsKey(json.empresaId) && CompanyRemoteConnectionUsers.ContainsKey(json.userId))
                {
                    CompanyRemoteConnectionUsers.Remove(json.userId);
                    return Json(new { });
                }
                return Json(new { });
            }
            else
            {
                if (disconectedByAdmin)
                    CompanyRemoteConnectionUsersDisconected.Add(
                        idUsuarioADesconectar,
                        CompanyRemoteConnectionUsers.Where(x => x.Key == idUsuarioADesconectar).FirstOrDefault().Value);

                CompanyRemoteConnectionUsers.Remove(idUsuarioADesconectar);

                if (quitarPermiso)
                    Conn.Execute($"UPDATE dbo.Usuario SET Remoto = 0 WHERE IdUsuario = {idUsuarioADesconectar}");

                return Json(new { });
            }
        }

        [HttpGet]
        [Route("OBTENERCOEXIONES")]
        public IHttpActionResult ObtenerConexiones()
        {
            var claims = GetClaims();
            var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                new { userId = "", empresaId = "" });
            var conexiones = string.Join(", ", CompanyRemoteConnectionUsers.Where(x => x.Value == json.empresaId).Select(x => x.Key).ToList());

            if (conexiones == "")
                return Json(new { });

            var usuarios = Conn.Query<Usuario>(Select(new Usuario
            { }, new Models.DTO.QueryConfigDTO { Where_In = conexiones, ExcluirUsuariosControl = false })).ToList();

            //usuarios.Remove(json.userId);

            return Json(new { conexiones = usuarios });
        }
    }
}
