using Dapper;
using MonicaExtraWeb.Models.DTO;
using MonicaExtraWeb.Models.DTO.Control;
using MonicaExtraWeb.Utils.Querys.Control;
using System.Configuration;
using System.Linq;
using System.Text;
using static MonicaExtraWeb.Utils.GlobalVariables;

namespace MonicaExtraWeb.Utils.Querys
{
    public class Usuarios
    {
        public static string Select(Usuario user = default, QueryConfigDTO config = default)
        {
            var query = new StringBuilder();

            #region SELECT
            query.Append($"SELECT ");
            query.Append($" IdUsuario ");
            query.Append($",NombreUsuario ");
            query.Append($",U.Estatus ");
            query.Append($",Clave ");
            query.Append($",Nivel ");

            if (!string.IsNullOrEmpty(config.Select))
                query.Append($",{config.Select}");

            if (config.Usuario_Join_IdEmpresaM)
                query.Append($",idEmpresasM ");
            #endregion

            #region FROM
            query.Append($"FROM {GlobalVariables.Control}dbo.Usuario U ");

            if (config.Usuario_Join_IdEmpresaM)
                query.Append($"JOIN Control.dbo.EmpresaRegistrada E ON U.idEmpresa = E.idEmpresa ");
            #endregion

            query.Append("WHERE ");
            query.Append($"U.IdEmpresa = '{user.IdEmpresa}'");

            if (user.IdUsuario != default)
                query.Append($"idUsuario = '{user.IdUsuario}' ");
            if (user.NombreUsuario != default)
                query.Append($"AND Login = '{user.NombreUsuario}' ");
            if (user.IdEmpresa != default)
                query.Append($"AND U.IdEmpresa = '{user.IdEmpresa}' ");
            if (user.Estatus != default)
                query.Append($"AND U.Estatus = '{user.Estatus}' ");
            if (config != null
                && config.ExcluirUsuariosControl)
                query.Append($"AND Nivel != '0' ");

            return query.ToString();
        }

        public static bool Insert(Usuario user, string[] modulos)
        {
            var query = new StringBuilder();

            query.Append($"INSERT INTO {GlobalVariables.Control}dbo.Usuario ");
            query.Append("(idEmpresa, Login, Nivel, NombreUsuario) ");
            query.Append("VALUES ");
            query.Append("(@idEmpresa, ");
            query.Append("@Login, ");
            query.Append("@Nivel, ");
            query.Append("@NombreUsuario) ");
            query.Append("SELECT CAST(SCOPE_IDENTITY() AS INT) ");

            var rslt = Conn.Query<int>(query.ToString(), new
            {
                user.IdEmpresa,
                user.Login,
                user.Nivel,
                user.NombreUsuario,
            }).FirstOrDefault();

            if (rslt != default)
                for (int i = 0; i < modulos.Length; i++)
                    PermisosUsuarios.Insert(new PermisosUsuario
                    {
                        idEmpresa = user.IdUsuario,
                        idUsuario = rslt,
                        idModulo = modulos[i]
                    });
            else
                return false;

            return true;
        }

        public static string Update(Usuario user)
        {
            var query = new StringBuilder();
            var querySet = new StringBuilder();
            var initialPass = ConfigurationManager.AppSettings["ContraseniaInicialUsuario"];

            query.Append($"UPDATE dbo.Usuario SET  ");

            if (user.Estatus != default)
                querySet.Append($"Estatus = '{user.Estatus}' ");
            else if (user.Clave != default)
            {
                if (user.Clave == "default")
                    querySet.Append($"Clave = '{initialPass}' ");
                else
                    querySet.Append($"Clave = '{user.Clave}' ");
            }
            else if (user.Nivel != default)
                querySet.Append($"Nivel = '{user.Nivel}' ");

            query.Append(querySet.ToString());
            query.Append($"WHERE IdUsuario = {user.IdUsuario} ");

            return query.ToString();
        }
    }
}