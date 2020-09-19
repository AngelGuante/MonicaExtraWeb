using Dapper;
using MonicaExtraWeb.Models.DTO.Control;
using System.Linq;
using System.Text;
using static MonicaExtraWeb.Utils.GlobalVariables;

namespace MonicaExtraWeb.Utils.Querys.Control
{
    public class PermisosUsuarios
    {
        public static string Select(int idUsuario)
        {
            var query = new StringBuilder();

            query.Append($"SELECT IdModulo ");
            query.Append($"FROM {GlobalVariables.Control}dbo.PermisosUsuario ");
            query.Append($"WHERE IdUsuario = '{idUsuario}' ");

            return query.ToString();
        }

        public static int Insert(PermisosUsuario permisosUsuario)
        {
            var query = new StringBuilder();

            query.Append($"INSERT INTO {GlobalVariables.Control}dbo.PermisosUsuario ");
            query.Append("(IdEmpresa, IdUsuario, IdModulo) ");
            query.Append("VALUES ");
            query.Append("(@IdEmpresa, ");
            query.Append("@IdUsuario, ");
            query.Append("@IdModulo) ");
            query.Append("SELECT CAST(SCOPE_IDENTITY() AS INT) ");

            var rslt = Conn.Query<int>(query.ToString(), new
            {
                permisosUsuario.idEmpresa,
                permisosUsuario.idUsuario,
                permisosUsuario.idModulo,
            }).FirstOrDefault();

            return rslt;
        }

        public static void Delete_todoExepto(string permisosADejar, long IdUsuario)
        {
            var query = new StringBuilder();

            query.Append($"DELETE FROM {GlobalVariables.Control}dbo.PermisosUsuario ");
            query.Append($"WHERE IdModulo NOT IN ('{permisosADejar}') AND IdUsuario = '{IdUsuario}' ");

            Conn.Query<int>(query.ToString());
        }

    }
}