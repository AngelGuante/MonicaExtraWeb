using Dapper;
using MonicaExtraWeb.Models.DTO;
using MonicaExtraWeb.Models.DTO.Control;
using MonicaExtraWeb.Utils.Querys.Control;
using System.Configuration;
using System.Linq;
using System.Text;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Helper;

namespace MonicaExtraWeb.Utils.Querys
{
    public class Usuarios
    {
        public static string Select(Usuario user = default, QueryConfigDTO config = default)
        {
            var query = new StringBuilder();
            var queryWhere = new StringBuilder();

            query.Append($"SELECT * FROM {GlobalVariables.Control}dbo.Usuario ");

            if (user != default &&
                AlgunaPropiedadConValor(user))
            {
                queryWhere.Append("WHERE ");

                if (user.IdUsuario != default)
                    queryWhere.Append($"idUsuario = '{user.IdUsuario}' ");
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
                    queryWhere.Append($"Estatus = '{user.Estatus}' ");
                }
            }
            if (config != null
                && config.ExcluirUsuariosControl)
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($"Nivel != '0' ");
            }

            if (queryWhere.Length > 6)
                query.Append(queryWhere.ToString());

            return query.ToString();
        }

        public static bool Insert(Usuario user, string[] modulos)
        {
            var idEmpresa = 2;
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
                idEmpresa,
                user.Login,
                user.Nivel,
                user.NombreUsuario,
            }).FirstOrDefault();

            if (rslt != default)
                for (int i = 0; i < modulos.Length; i++)
                    PermisosUsuarios.Insert(new PermisosUsuario
                    {
                        idEmpresa = idEmpresa,
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

            query.Append($"UPDATE dbo.Usuario Set  ");

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