using Dapper;
using MonicaExtraWeb.Models;
using MonicaExtraWeb.Models.DTO.Control;
using MonicaExtraWeb.Utils.Token;
using System.Configuration;
using System.Linq;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Helper;
using static MonicaExtraWeb.Utils.Querys.Control.EmpresaEquiposRegistrados;
using static MonicaExtraWeb.Utils.Querys.Control.EquiposAsignadosAUsuario;
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
            var usuario = ValidarUsuarioLogin(login);

            if (usuario == default)
                return Unauthorized();

            if (usuario != default &&
               login.Password == usuario.Clave)
            {
                // SI LA EMPRESA SE ENCUENTRA INHABILITADA.
                if (usuario.empresaEstatus == 0)
                    return Json(new { message = "ESTE USUARIO NO PUEDE ACCEDER YA QUE LA EMPRESA A LA QUE PERTENECE, ESTA INHABILITADA." });

                //  SI EL USUARIO SE ENCUENTRA INHABILITADO.
                if (usuario.Estatus == 0)
                    return Json(new { message = "SU CUENTA ESTA INHABILITADA, NO PUEDE ACCEDER AL SISTEMA." });

                #region VALIDAR SI ES UN USUARIO SERVIDOR REMOTO AGREGAR LA MAC CON LA QUE SE REGISTRA
                if (login.Username == "Remoto" && login.mac != string.Empty)
                {
                    #region VALIDAR LA MAC Y EL USUARIO SEAN VALIDOS PARA CONTINUAR
                    var EmpresasEquiposRegistrados = Conn.Query<EmpresasEquiposRegistrados>(
                        Select(new EmpresasEquiposRegistrados
                        {
                            identificador = login.mac
                        }).ToString())
                        .FirstOrDefault();

                    var EquipoAsignadoAUsuario = Conn.Query<EquiposAsignadosAUsuarios>(
                        Select(new EquiposAsignadosAUsuarios
                        {
                            idUsuario = usuario.IdUsuario.Value
                        }).ToString())
                        .FirstOrDefault();

                    if (EmpresasEquiposRegistrados != default
                        && EquipoAsignadoAUsuario != default)
                    {
                        if (EmpresasEquiposRegistrados.id != EquipoAsignadoAUsuario.idEquipoRegistrado)
                            return Unauthorized();
                        else
                            return Ok();
                    }
                    if (EquipoAsignadoAUsuario == default
                        && EmpresasEquiposRegistrados != default)
                        return Unauthorized();
                    #endregion

                    Insert(new EmpresasEquiposRegistrados
                    {
                        idEmpresa = login.IdEmpresa,
                        identificador = login.mac
                    }, usuario);
                    return Ok();
                }
                #endregion
                else if (login.Username != "Remoto" && usuario.Nivel != 0)
                {
                    usuario.IdEmpresa = login.IdEmpresa;
                    var validacionRemoto = ValidarUsuarioParaConectarseRemoto(usuario);
                    if (validacionRemoto != string.Empty)
                        return Json(new { message = validacionRemoto });
                }
                var token = TokenGenerator.GenerateTokenJwt(usuario.IdUsuario.ToString(), login.IdEmpresa.ToString());
                return Json(new { token, usuario.NombreUsuario, /*usuario.Estatus,*/ usuario.Nivel, usuario.IdUsuario, /*usuario.Estatus.Value,*/ initialPass, usuario.idEmpresasM });
            }
            else
                return Unauthorized();
        }


        [HttpGet]
        [Route("ClientAppLogin")]
        public IHttpActionResult ClientAppLogin(string pass)
        {
            if (pass == "2468@!.55")
                return Ok(true);
            else
                return Ok(false);
        }
    }
}