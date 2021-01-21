using Dapper;
using MonicaExtraWeb.Models.DTO.Control;
using System.Linq;
using System.Text;
using static MonicaExtraWeb.Utils.GlobalVariables;

namespace MonicaExtraWeb.Utils.Querys.Control
{
    public class EmpresaEquiposRegistrados
    {
        public static string Select(EmpresasEquiposRegistrados EmpresasEquiposRegistrados = default)
        {
            var query = new StringBuilder();

            query.Append($"SELECT * ");
            query.Append($"FROM {GlobalVariables.Control}dbo.EmpresasEquiposRegistrados ");

            if (EmpresasEquiposRegistrados.identificador != string.Empty)
                query.Append($"WHERE identificador = '{EmpresasEquiposRegistrados.identificador}'");

            return query.ToString();
        }

        public static void Insert(EmpresasEquiposRegistrados EmpresasEquiposRegistrados, Usuario usuario)
        {
            var query = new StringBuilder();

            query.Append($"INSERT INTO {GlobalVariables.Control}dbo.EmpresasEquiposRegistrados ");
            query.Append("(idEmpresa, identificador) ");
            query.Append("VALUES ");
            query.Append("(@idEmpresa, ");
            query.Append("@identificador) ");
            query.Append("SELECT CAST(SCOPE_IDENTITY() AS INT) ");

            var rslt = Conn.Query<int>(query.ToString(), new
            {
                EmpresasEquiposRegistrados.idEmpresa,
                EmpresasEquiposRegistrados.identificador
            }).FirstOrDefault();

            if(rslt != default)
            {
                query.Clear();
                query.Append($"INSERT INTO {GlobalVariables.Control}dbo.EquiposAsignadosAUsuarios ");
                query.Append("(idUsuario, idEquipoRegistrado) ");
                query.Append("VALUES ");
                query.Append("(@idUsuario, ");
                query.Append("@idEquipoRegistrado) ");

                Conn.Query(query.ToString(), new
                {
                    idUsuario = usuario.IdUsuario,
                    idEquipoRegistrado = rslt
                });
            }
        }
    }
}