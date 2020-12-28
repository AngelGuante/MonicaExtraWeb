using Dapper;
using MonicaExtraWeb.Models.DTO.Control;
using Newtonsoft.Json;
using System.Linq;
using System.Web;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Querys.Usuarios;
using static MonicaExtraWeb.Utils.Token.Claims;

namespace MonicaExtraWeb.Controllers.API
{
    [Authorize]
    [RoutePrefix("API/CONEXIONREMOTA")]
    public class ConexionRemotaController : ApiController
    {
        [HttpGet]
        [Route("ESTABLECER")]
        public IHttpActionResult Establecer()
        {
            var claims = GetClaims();

            var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                new { userId = "", empresaId = "" });

            var usuario = Conn.Query<Usuario>(Select(new Usuario
            {
                IdEmpresa = long.Parse(json.empresaId),
                IdUsuario = long.Parse(json.userId),
            }, new Models.DTO.QueryConfigDTO { Select = "U.Nivel, U.Remoto", ExcluirUsuariosControl = false, Usuario_Join_IdEmpresaM = false })).FirstOrDefault();

            if (usuario.Nivel == 1)
            {
                if (!CompanyRemoteConnectionIP.ContainsKey(json.empresaId))
                {
                    CompanyRemoteConnectionIP.Add(json.empresaId, HttpContext.Current.Request.UserHostAddress);
                    return Json(new { });
                }
                else
                    return Json(new { message = "ESTA EMPRESA YA TIENE UNA CONEXION A DISTANCIA ABIERTA." });
            }
            else if (usuario.Nivel == 2)
            {
                if (!usuario.Remoto)
                    return Json(new { message = "SU USUARIO NO TIENE PERMISOS PARA REALIZAR ESTA ACCION." });

                if (CompanyRemoteConnectionIP.ContainsKey(json.empresaId))
                {
                    if (!CompanyRemoteConnectionUsers.ContainsKey(json.userId))
                    {
                        CompanyRemoteConnectionUsers.Add(json.userId, json.empresaId);
                        return Json(new { });
                    }
                    else
                        return Json(new { message = "ESTE USUARIO YA ESTA CONECTADO." });
                }
                else
                    return Json(new
                    {
                        message = "NO SE PUEDE CONECTAR DE MANERA A DISTANCIA POR EL MOMENTO, NO EXISTE NINGUNA CONEXION ABIERTA." +
                        "\nCOMUNICASRSE CON EL ADMINISTRADOR PARA REALIZAR ESTA CONEXION."
                    });
            }

            return Json(new { message = "HA OCURRIDO UN ERROR." }); ;
        }

        [HttpGet]
        [Route("CERRAR")]
        public IHttpActionResult Cerrar(string idUsuarioADesconectar = default, bool quitarPermiso = false)
        {
            if (idUsuarioADesconectar == default)
            {
                var claims = GetClaims();

                var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                    new { userId = "", empresaId = "" });

                var usuario = Conn.Query<Usuario>(Select(new Usuario
                {
                    IdEmpresa = long.Parse(json.empresaId),
                    IdUsuario = long.Parse(json.userId),
                }, new Models.DTO.QueryConfigDTO { Select = "U.Nivel", ExcluirUsuariosControl = false, Usuario_Join_IdEmpresaM = false })).FirstOrDefault();

                if (usuario.Nivel == 1)
                {
                    if (CompanyRemoteConnectionIP.ContainsKey(json.empresaId))
                    {
                        CompanyRemoteConnectionIP.Remove(json.empresaId);

                        foreach (var item in CompanyRemoteConnectionUsers.Where(x => x.Value == json.empresaId).ToList())
                            CompanyRemoteConnectionUsers.Remove(item.Key);

                        return Json(new { });
                    }
                    else
                        return Json(new { message = "NINGUNA CONEXION DE ESTA EMPRESA ENCONTRADA." });
                }
                else if (usuario.Nivel == 2)
                {
                    if (CompanyRemoteConnectionIP.ContainsKey(json.empresaId) && CompanyRemoteConnectionUsers.ContainsKey(json.userId))
                    {
                        CompanyRemoteConnectionUsers.Remove(json.userId);
                        return Json(new { });
                    }
                    else
                        return Json(new { message = "NINGUNA CONEXION DE ESTA EMPRESA ENCONTRADA." });
                }
            }
            else
            {
                CompanyRemoteConnectionUsers.Remove(idUsuarioADesconectar);

                if (quitarPermiso)
                    Conn.Execute($"UPDATE dbo.Usuario SET Remoto = 0 WHERE IdUsuario = {idUsuarioADesconectar}");

                return Json(new { });
            }

            return Json(new { message = "HA OCURRIDO UN ERROR." }); ;
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
            { }, new Models.DTO.QueryConfigDTO { Where_In = conexiones, ExcluirUsuariosControl = false, Usuario_Join_IdEmpresaM = false })).ToList();

            return Json(new { conexiones = usuarios });
        }
    }
}
