using Dapper;
using MonicaExtraWeb.Models;
using MonicaExtraWeb.Models.DTO.Control;
using MonicaExtraWeb.Utils.Token;
using System;
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
            var empresaMaster = ConfigurationManager.AppSettings["idEMpresaMaster"];
            var usuario = ValidarUsuarioLogin(login);

            if (usuario == default)
                return Unauthorized();

            var idUsuarioBloqueado = loginFailsUsers.FirstOrDefault(x => x.Key == usuario.IdUsuario.ToString()).Key;
            if (idUsuarioBloqueado != default)
                if (loginFailsUsers[idUsuarioBloqueado].Intentos >= 2)
                {
                    var usuarioBloqueado = loginFailsUsers[idUsuarioBloqueado];
                    if (!usuarioBloqueado.TiempoBloqueo.HasValue)
                        usuarioBloqueado.TiempoBloqueo = DateTime.Now.AddMinutes(30);
                    else if (DateTime.Compare(usuarioBloqueado.TiempoBloqueo.Value, DateTime.Now) >= 0)
                        return Json(new { message = $"El usuario alcanzó el maximo de intentos. Usuario bloqueado temporalmente. <br/> <center>Desbloque en: {loginFailsUsers[idUsuarioBloqueado].TiempoBloqueo.Value}</center>" });
                    else
                        loginFailsUsers.Remove(idUsuarioBloqueado);
                }

            if (usuario != default &&
               login.Password == usuario.Clave)
            {
                //  SI ES LA EMPRESA MASTER, NO HACE LAS VALIDACIONES
                if (login.IdEmpresa == long.Parse(empresaMaster))
                    return Json(new { token = TokenGenerator.GenerateTokenJwt(usuario.IdUsuario.ToString(), login.IdEmpresa.ToString(), usuario.Nivel.ToString()), usuario.NombreUsuario, usuario.Nivel, usuario.IdUsuario, initialPass, idEmpresasM = "" });

                // SI LA EMPRESA SE ENCUENTRA INHABILITADA.
                if (usuario.empresaEstatus == 0)
                    return Json(new { message = "ESTE USUARIO NO PUEDE ACCEDER YA QUE LA EMPRESA A LA QUE PERTENECE, ESTA INHABILITADA." });

                //  SI EL PLAN DE LA EMPRESA EXPIRO.
                if (DateTime.Compare(usuario.Vencimiento.Value, DateTime.Now) < 0)
                    return Json(new { message = "EL PLAN DE SU EMPRESA HA EXPIRADO." });

                //  SI EL USUARIO SE ENCUENTRA INHABILITADO.
                if (usuario.Estatus == 0)
                    return Json(new { message = "SU CUENTA ESTA INHABILITADA, NO PUEDE ACCEDER AL SISTEMA." });

                #region VALIDAR SI ES UN USUARIO SERVIDOR REMOTO AGREGAR LA MAC CON LA QUE SE REGISTRA
                if (login.Username.StartsWith("Remoto") && login.mac != string.Empty)
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

                #region VALIDAR LAS EMPRESAS DISPONIBLES QUE TENGA EL USUARIO Y LAS QUE ESTAN SELECCIONADAS POR EL ADMINISTRADOR
                var idEmpresasM = "";
                if (usuario.Nivel != 0)
                    if (usuario.idEmpresasM != null && usuario.idEmpresasM != string.Empty)
                        foreach (var item in usuario.idEmpresasM.Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries).ToList())
                            if (usuario.EmpresaRegistrada_idEmpresasM.Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries).ToList().FirstOrDefault(x => x == item) != default)
                            {
                                if (idEmpresasM.Length != 0)
                                    idEmpresasM += ",";
                                idEmpresasM += item;
                            }
                #endregion

                var token = TokenGenerator.GenerateTokenJwt(usuario.IdUsuario.ToString(), login.IdEmpresa.ToString(), usuario.Nivel.ToString());
                return Json(new { token, usuario.NombreUsuario, usuario.Nivel, usuario.IdUsuario, initialPass, idEmpresasM });
            }
            else
            {
                if (loginFailsUsers.ContainsKey(usuario.IdUsuario.ToString()))
                    loginFailsUsers[idUsuarioBloqueado].Intentos = loginFailsUsers[idUsuarioBloqueado].Intentos + 1;
                else
                    loginFailsUsers.Add(usuario.IdUsuario.ToString(), new Usuario { Intentos = 1 });
                return Json(new { message = $"Contraseña incorrecta, total de intentos: {loginFailsUsers[loginFailsUsers.FirstOrDefault(x => x.Key == usuario.IdUsuario.ToString()).Key].Intentos}/4." });
            }
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