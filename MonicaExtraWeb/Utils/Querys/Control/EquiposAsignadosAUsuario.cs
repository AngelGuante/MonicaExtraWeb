using MonicaExtraWeb.Models.DTO.Control;
using System.Text;

namespace MonicaExtraWeb.Utils.Querys.Control
{
    public class EquiposAsignadosAUsuario
    {
        public static string Select(EquiposAsignadosAUsuarios equiposAsignadosAUsuarios = default)
        {
            var query = new StringBuilder();

            query.Append($"SELECT * ");
            query.Append($"FROM {GlobalVariables.Control}dbo.EquiposAsignadosAUsuarios ");

            if (equiposAsignadosAUsuarios.idUsuario != default)
                query.Append($"WHERE idUsuario = '{equiposAsignadosAUsuarios.idUsuario}'");

            return query.ToString();
        }
    }
}