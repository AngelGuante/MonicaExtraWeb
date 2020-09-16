using System.Text;

namespace MonicaExtraWeb.Utils.Querys.Control
{
    public class Modulos
    {
        public static string Select()
        {
            var query = new StringBuilder();

            query.Append($"SELECT * FROM {GlobalVariables.Control}dbo.Modulo ");

            return query.ToString();
        }
    }
}