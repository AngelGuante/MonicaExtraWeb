using System.Net;
using System.Text;

namespace MonicaExtraWeb.Utils.Querys.Control
{
    public class Concurrencias
    {
        public static string Select_Count(string idEmpresa, string idUsuario)
        {
            var query = new StringBuilder();
            
            #region SELECT
            query.Append("SELECT ");
            query.Append("COUNT(*) ");
            #endregion

            #region FROM
            query.Append($"FROM {GlobalVariables.Control}dbo.Concurrencia ");
            #endregion

            query.Append("WHERE ");
            query.Append($"idEmpresa = '{idEmpresa}' ");
            query.Append($"AND ");
            query.Append($"IdUsuario = '{idUsuario}' ");

            return query.ToString();
        }

        public static string Delete(string idEmpresa, string idUsuario)
        {
            var query = new StringBuilder();
            query.Append($"DELETE FROM {GlobalVariables.Control}dbo.Concurrencia ");
            query.Append($"WHERE idEmpresa = {idEmpresa} AND IdUsuario = {idUsuario} ");

            return query.ToString();
        }
    }
}