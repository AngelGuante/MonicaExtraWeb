using System.Text;
using static MonicaExtraWeb.Utils.GlobalVariables;

namespace MonicaExtraWeb.Utils.Querys
{
    public class Data
    {
        public static string MovimientoCaja()
        {
            var query = new StringBuilder();

            query.Append("SELECT CF.Descripcion DescripcionClasfFiscal, TM.Descripcion DescripcionMovimiento, U.nombre_completo, * ");
            query.Append($"FROM {DbName}monicaextra.movimientocaja M ");
            query.Append($"LEFT JOIN {DbName}dbo.usuarios U ");
            query.Append("ON M.Beneficiario = CAST(U.id_usuario as VARCHAR) ");
            query.Append($"LEFT JOIN {DbName}monicaextra.clasificacionmovicaja TM ");
            query.Append("ON M.TipoMovimiento = TM.NumeroTransacion ");
            query.Append($"LEFT JOIN {DbName}monicaextra.clasificacionfiscal CF ");
            query.Append("ON M.Clasificancf = CF.NumeroTransacion ");
            query.Append("WHERE M.NumeroTransacion = @id");

            return query.ToString();
        }

        public static string ObtenerMovimientosDeCierre(string idCierre = "")
        {
            var query = new StringBuilder();

            query.Append($"SELECT M.NumeroTransacion, U.nombre_completo, Concepto, Monto, Fecha ");
            query.Append($"FROM {DbName}monicaextra.movimientocaja M ");
            query.Append($"LEFT JOIN {DbName}dbo.usuarios U ");
            query.Append("	ON M.Beneficiario = CAST(U.id_usuario as VARCHAR) ");
            query.Append("WHERE NumeroCierre = ");

            if (idCierre == string.Empty)
            {
                query.Append("( ");
                query.Append($"SELECT MAX(NumeroCierre) +1 Cierre ");
                query.Append($"FROM {DbName}monicaextra.cierrecaja ");
                query.Append(") ");
            }
            else
                query.Append($"{idCierre} ");

            query.Append("ORDER BY NumeroTransacion DESC ");

            return query.ToString();
        }
    }
}