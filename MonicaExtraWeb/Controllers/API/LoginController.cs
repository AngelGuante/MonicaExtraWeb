using Dapper;
using MonicaExtraWeb.Models;
using MonicaExtraWeb.Models.DTO.Control;
using MonicaExtraWeb.Utils.Token;
//using System;
using System.Configuration;
using System.Linq;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
//using static MonicaExtraWeb.Utils.Querys.Control.Concurrencias;
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
            }, new Models.DTO.QueryConfigDTO { Select = "E.ESTATUS empresaEstatus", ExcluirUsuariosControl = false, Usuario_Join_IdEmpresaM = true })).FirstOrDefault();

             if (usuario != default &&
                login.Password == usuario.Clave)
            {
                //  CONCURRENCIA
                //var usuarioConcurrencia = Convert.ToInt32(Conn.ExecuteScalar(Select_Count(login.IdEmpresa.ToString(), usuario.IdUsuario.Value.ToString())));

                //if (usuarioConcurrencia == default)
                if (true)
                {
                    // SI LA EMPRESA SE ENCUENTRA INHABILITADA.
                    if (usuario.empresaEstatus == 0)
                        return Json(new { message = "ESTE USUARIO NO PUEDE ACCEDER YA QUE LA EMPRESA A LA QUE PERTENECE, ESTA INHABILITADA." });

                    //  SI EL USUARIO SE ENCUENTRA INHABILITADO.
                    if (usuario.Estatus == 0)
                        return Json(new { message = "SU CUENTA ESTA INHABILITADA, NO PUEDE ACCEDER AL SISTEMA." });

                    //Conn.Query($"INSERT INTO {Control}dbo.Concurrencia (idEmpresa, IdUsuario) VALUES ({login.IdEmpresa}, {usuario.IdUsuario})");

                    var token = TokenGenerator.GenerateTokenJwt(usuario.IdUsuario.ToString(), login.IdEmpresa.ToString());
                    return Json(new { token, usuario.NombreUsuario, /*usuario.Estatus,*/ usuario.Nivel, usuario.IdUsuario, /*usuario.Estatus.Value,*/ initialPass, usuario.idEmpresasM });
                }
                //else
                //    return Json(new { message = "ESTE USUARIO YA SE ENCUENTRA LOGUEADO." });
            }
            else
                return Unauthorized();
        }
    }
}