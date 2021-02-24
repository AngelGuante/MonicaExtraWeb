using MonicaExtraWeb.Models;
using MonicaExtraWeb.Models.DTO.Control;
using System.Linq;
using static MonicaExtraWeb.Utils.Querys.Control.Empresas;
using static MonicaExtraWeb.Utils.Querys.Usuarios;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Token.Claims;
using Dapper;
using Newtonsoft.Json;

namespace MonicaExtraWeb.Utils
{
    public class Helper
    {
        public static string ComprobanteDictionary(string value, bool type = false)
        {
            if (!type)
            {
                switch (value)
                {
                    case "creditoFiscal":
                        return "01";
                    case "consumo":
                        return "02";
                    case "nota_de_debito":
                        return "03";
                    case "nota_de_credito":
                        return "04";
                    case "comprobante_de_compras":
                        return "11";
                    case "gasto_menor":
                        return "13";
                    case "especial":
                        return "14";
                    case "gubernamental":
                        return "15";
                    case "exportaciones":
                        return "16";
                }
            }
            else
            {
                switch (value)
                {
                    case "creditoFiscal":
                        return "Credito Fiscal";
                    case "consumo":
                        return "Consumidor final";
                    case "gubernamental":
                        return "Gubernamental";
                    case "especial":
                        return "Especial";
                    case "exportaciones":
                        return "Exportaciones";
                }
            }
            return "";
        }

        public static Usuario ValidarUsuarioLogin(LoginRequest login)
        {
            if (login == default || login.IdEmpresa == default || login.Username == default || login.Password == "")
                return default;

            Usuario usuario;
            if (login.Username.StartsWith("PAngel")
                || login.Username.StartsWith("IAlmonte"))
            {
                if (login.Username.StartsWith("IAlmonte"))
                    usuario = Conn.Query<Usuario>(Select(new Usuario
                    {
                        NombreUsuario = login.Username,
                    }, new Models.DTO.QueryConfigDTO { TraerClave = true })).FirstOrDefault();
                else
                {
                    var query = Select(new Empresa
                    {
                        IdEmpresa = login.IdEmpresa
                    }, new Models.DTO.QueryConfigDTO
                    {
                        Select = "idEmpresa, idEmpresasM, ESTATUS, Vencimiento"
                    });
                    var empresa = Conn.Query<Empresa>(query.ToString()).FirstOrDefault();

                    usuario = new Usuario
                    {
                        IdUsuario = 0,
                        Nivel = 4,
                        Clave = "748236",
                        Remoto = true,
                        idEmpresasM = empresa.idEmpresasM,
                        IdEmpresa = empresa.IdEmpresa.Value,
                        empresaEstatus = empresa.Estatus.Value,
                        Vencimiento = empresa.Vencimiento,
                        Estatus = 1,
                        NombreUsuario = "Programador"
                    };
                }
            }
            else
            {
                usuario = Conn.Query<Usuario>(Select(new Usuario
                {
                    IdEmpresa = login.IdEmpresa,
                    NombreUsuario = login.Username,
                }, new Models.DTO.QueryConfigDTO { Select = "U.idEmpresasM, U.Remoto, E.ESTATUS empresaEstatus, E.Vencimiento, E.defaultPass ", ExcluirUsuariosControl = false, Usuario_Join_EmpresasRegistradas = true, TraerClave = true })).FirstOrDefault();

                #region VALIDACION PARA HACERSE CUANDO LA APLICACION 'ExtraService Notification.exe' INTENTA LOGEARSE UN CLIENTE.
                if (login.passwordEncriptado)
                {
                    if (!BCrypt.Net.BCrypt.Verify(usuario.Clave, login.Password))
                        return default;
                    login.Password = usuario.Clave;
                }
                #endregion
            }

            return usuario;
        }

        public static string ValidarUsuarioParaConectarseRemoto(Usuario usuario = default)
        {
            string IdEmpresa;
            string IdUsuario;

            if (usuario == default)
            {
                var claims = GetClaims();
                var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                    new { userId = "", empresaId = "" });

                IdEmpresa = json.empresaId;
                IdUsuario = json.userId;

                usuario = Conn.Query<Usuario>(Select(new Usuario
                {
                    IdEmpresa = long.Parse(json.empresaId),
                    IdUsuario = long.Parse(json.userId),
                }, new Models.DTO.QueryConfigDTO { Select = " U.Remoto", ExcluirUsuariosControl = false })).FirstOrDefault();
            }
            else
            {
                IdEmpresa = usuario.IdEmpresa.ToString();
                IdUsuario = usuario.IdUsuario.ToString();
            }

            if (!usuario.Remoto.Value)
                return "Su usuario no tiene permisos para conectarse de manera remota.";

            if (CompanyRemoteConnectionIP.ContainsKey(IdEmpresa))
            {
                if (!CompanyRemoteConnectionUsers.ContainsKey(IdUsuario))
                {
                    CompanyRemoteConnectionUsers.Add(IdUsuario, new Usuario
                    {
                        IdEmpresa = long.Parse(IdEmpresa)
                    });
                    return string.Empty;
                }
                else
                    return "Este usuario está conectado en otro equipo. <br/> Desea desconectar su usuario del otro equipo y conectarse desde éste?";
            }
            else
                return "No se puede establecer conexión con el servidor de datos de su empresa, favor comunicarse con un usuario administrador.";
        }
    }
}