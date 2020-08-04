using MonicaExtraWeb.Models.DTO.Reportes;
using System.Text;

namespace MonicaExtraWeb.Utils.Querys
{
    public class ManejoDeData
    {
        public static string CerrarCotizacionQuery(Filtros filtro, string DbName = "")
        {
            var query = new StringBuilder();
            var setQuery = new StringBuilder();

            query.Append("UPDATE ");
            query.Append($"{DbName}dbo.estimado ");

            query.Append("SET ");
            if (!string.IsNullOrEmpty(filtro.NroFactura))
                setQuery.Append($"genero_factura1 = '{filtro.NroFactura}' ");
            if (!string.IsNullOrEmpty(filtro.notas))
            {
                if (setQuery.Length > 0)
                    setQuery.Append(",");
                setQuery.Append($"notas = notas + '{filtro.notas}' ");
            }

            query.Append(setQuery.ToString());

            if (!string.IsNullOrEmpty(filtro.NroCotizacion))
                query.Append($"WHERE nro_estimado = '{filtro.NroCotizacion}' ");

            return query.ToString();
        }

        public static string GetCotizacionQuery(Filtros filtro, string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  E.nro_estimado ");
            query.Append(", TRIM(E.genero_factura1) genero_factura1 ");
            query.Append(", TRIM(E.notas) notas ");
            query.Append(", C.nro_cotizacion ");

            query.Append("FROM ");
            query.Append($"{DbName}dbo.Cotizacion C ");
            query.Append($"LEFT JOIN {DbName}dbo.estimado E ON E.nro_estimado = C.nro_cotizacion ");

            if (!string.IsNullOrEmpty(filtro.NroCotizacion))
                query.Append($"WHERE nro_cotizacion = '{filtro.NroCotizacion}' ");

            return query.ToString();
        }

        public static string GetEstimadoQuery(Filtros filtro, string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT ");

            if (filtro.COUNT)
                query.Append("COUNT(*) count ");
            else
                query.Append("* ");

            query.Append("FROM ");
            query.Append($"{DbName}dbo.estimado E ");

            if (!string.IsNullOrEmpty(filtro.genero_factura1))
                query.Append($"WHERE genero_factura1 = '{filtro.genero_factura1}' ");

            return query.ToString();
        }
    }
}