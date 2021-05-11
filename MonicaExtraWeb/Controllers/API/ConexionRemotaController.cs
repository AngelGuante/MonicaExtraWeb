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
using static MonicaExtraWeb.Utils.Querys.Control.Empresas;
using System.Collections.Generic;

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

                #region GUARDAR LOS DATOS DE LA EMPRESA EN MEMORIA
                var query = Select(new Empresa
                {
                    IdEmpresa = login.IdEmpresa
                }, new Models.DTO.QueryConfigDTO
                {
                    Select = "idEmpresa, ConnectionString, CantidadEmpresas, CantidadUsuariosPagados, Estatus, defaultPass, PermitirAlmonte, PermitirProgramador"
                });
                var empresas = Conn.Query<Empresa>(query.ToString()).FirstOrDefault();
                empresas.usuariosRegistrados = (int.Parse(empresas.usuariosRegistrados) - 1).ToString(); // RESTAR 1 POR EL USUARIO REMOTO.
                cache_empresas.Add(empresas);
                #endregion

                return Ok(true);
            }
            return Ok("Esta empresa ya tiene una conexion de servidor abierta, debe cerrar la existente para iniciar esta.");
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("CERRARSERVIDOR")]
        public IHttpActionResult CerrarServidor(LoginRequest login)
        {
            if (CompanyRemoteConnectionIP.ContainsKey(login.IdEmpresa.ToString()))
            {
                CompanyRemoteConnectionIP.Remove(login.IdEmpresa.ToString());

                #region QUITAR LA INFORMACION EN CACHE DE LA EMPRESA QUE SE ACABA DE DESCONECTAR
                cache_empresas.Remove(cache_empresas.Where(x => x.IdEmpresa == login.IdEmpresa).FirstOrDefault());
                #endregion

                foreach (var item in CompanyRemoteConnectionUsers.Where(x => x.Value.IdEmpresa.ToString() == login.IdEmpresa.ToString()).ToList())
                {
                    //CompanyRemoteConnectionUsersDisconected.Add(item.Key, item.Value.IdEmpresa.ToString());
                    CompanyRemoteConnectionUsers.Remove(item.Key);
                }
            }
            return Ok(true);
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("CAMBIARIP")]
        public IHttpActionResult CambiarIp(LoginRequest login)
        {
            if (CompanyRemoteConnectionIP.ContainsKey(login.IdEmpresa.ToString()))
                CompanyRemoteConnectionIP[login.IdEmpresa.ToString()] = HttpContext.Current.Request.UserHostAddress;
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
                //if (disconectedByAdmin)
                //    CompanyRemoteConnectionUsersDisconected.Add(
                //        idUsuarioADesconectar,
                //        CompanyRemoteConnectionUsers.Where(x => x.Key == idUsuarioADesconectar).FirstOrDefault().Value.IdEmpresa.ToString());

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

            var usuarios = new List<Usuario>();
            (CompanyRemoteConnectionUsers.Where(x => x.Value.IdEmpresa == long.Parse(json.empresaId))).ToList().ForEach(x =>
            {
                usuarios.Add(new Usuario
                {
                    IdUsuario = long.Parse(x.Key),
                    NombreUsuario = x.Value.NombreUsuario,
                    Nivel = x.Value.Nivel
                });
            });

            return Json(new { conexiones = usuarios });
        }
    }
}
