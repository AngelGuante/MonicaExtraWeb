using MonicaExtraWeb.Models.DTO.Control;
using System.Text;
using static MonicaExtraWeb.Utils.Helper;

namespace MonicaExtraWeb.Utils.Querys
{
    public class Usuarios
    {
        public static string Select(Usuario user = default)
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

                if (queryWhere.Length > 6)
                    query.Append(queryWhere.ToString());
            }

            return query.ToString();
        }
    }
}