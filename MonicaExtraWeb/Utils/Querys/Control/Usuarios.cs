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
            var queryWhere = new StringBuilder();
            queryWhere.Append("WHERE ");

            #region SELECT
            query.Append($"SELECT ");
            query.Append($" IdUsuario ");
            query.Append($",NombreUsuario ");
            query.Append($",U.Estatus ");
            query.Append($",Clave ");
            query.Append($",Nivel ");

            if (!string.IsNullOrEmpty(config.Select))
                query.Append($",{config.Select} ");

            if (config.Usuario_Join_EmpresasRegistradas)
                query.Append($", E.idEmpresasM EmpresaRegistrada_idEmpresasM ");
            #endregion

            #region FROM
            query.Append($"FROM {GlobalVariables.Control}dbo.Usuario U ");

            if (config.Usuario_Join_EmpresasRegistradas)
                query.Append($"JOIN Control.dbo.EmpresaRegistrada E ON U.idEmpresa = E.idEmpresa ");
            #endregion

            #region WHERE
            if (user.IdEmpresa != default)
                queryWhere.Append($"U.IdEmpresa = '{user.IdEmpresa}'");
            if (user.IdUsuario != default)
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($"idUsuario = '{user.IdUsuario}' ");
            }
            if (user.NombreUsuario != default)
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($"Login = '{user.NombreUsuario}' ");
            }
            if (user.Estatus != default)
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($"U.Estatus = '{user.Estatus}' ");
            }
            if (config != null
                && config.ExcluirUsuariosControl)
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($"Nivel != '0' ");
            }

            if (config.Where_In != default && config.Where_In != "")
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($"idUsuario IN ({config.Where_In})");
            }

            if (queryWhere.Length > 6)
                query.Append(queryWhere.ToString());
            #endregion

            return query.ToString();
        }

        public static bool Insert(Usuario user, string[] modulos)
        {
            var query = new StringBuilder();

            query.Append($"INSERT INTO {GlobalVariables.Control}dbo.Usuario ");
            query.Append("(idEmpresa, Login, Nivel, NombreUsuario, idEmpresasM, Remoto) ");
            query.Append("VALUES ");
            query.Append("(@idEmpresa, ");
            query.Append("@Login, ");
            query.Append("@Nivel, ");
            query.Append("@NombreUsuario, ");
            query.Append("@idEmpresasM, ");
            query.Append("@Remoto) ");
            query.Append("SELECT CAST(SCOPE_IDENTITY() AS INT) ");

            var rslt = Conn.Query<int>(query.ToString(), new
            {
                user.IdEmpresa,
                user.Login,
                user.Nivel,
                user.NombreUsuario,
                user.idEmpresasM,
                user.Remoto,
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
            var queryAnd = new StringBuilder();
            var initialPass = ConfigurationManager.AppSettings["ContraseniaInicialUsuario"];

            query.Append($"UPDATE dbo.Usuario SET  ");

            if (user.idEmpresasM != null)
                queryAnd.Append($"idEmpresasM = '{user.idEmpresasM}' ");
            if (user.Remoto.HasValue)
            {
                if (queryAnd.Length > 0)
                    queryAnd.Append($", ");
                queryAnd.Append($"Remoto = {(user.Remoto.Value ? "1" : "0")} ");
            }
            if (user.Estatus != default)
            {
                if (queryAnd.Length > 0)
                    queryAnd.Append($", ");
                queryAnd.Append($"Estatus = '{user.Estatus}' ");
            }
            if (user.Clave != default)
            {
                if (queryAnd.Length > 0)
                    queryAnd.Append($", ");
                if (user.Clave == "default")
                    queryAnd.Append($"Clave = '{initialPass}' ");
                else
                    queryAnd.Append($"Clave = '{user.Clave}' ");
            }
            else if (user.Nivel != default)
            {
                if (queryAnd.Length > 0)
                    queryAnd.Append($", ");
                queryAnd.Append($"Nivel = '{user.Nivel}' ");
            }
            query.Append(queryAnd.ToString());
            query.Append($"WHERE IdUsuario = {user.IdUsuario} ");

            if (user.desconectar)
                CompanyRemoteConnectionUsers.Remove(user.IdUsuario.ToString());

            return query.ToString();
        }
    }
}