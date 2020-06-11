using MonicaExtraWeb.Models.DTO.Reportes;
using System;
using System.Text;

namespace MonicaExtraWeb.Utils
{
    public class Querys
    {
        public static string IndividualClientQuery(FiltroGetIndividualClientStatus filtro, string DbName)
        {
            var query = new StringBuilder();

            query.Append("  SELECT ");
            query.Append("      D.fecha_emision, ");
            query.Append("      D.fecha_vcmto, ");
            query.Append("      D.descripcion_dcmto, ");
            query.Append("      (D.monto_dcmto - D.balance) pagosAcumulados, ");
            query.Append("      D.ncf ");
            query.Append($" FROM {DbName}dbo.clientes C ");
            query.Append("  JOIN docs_cc D ON C.cliente_id = D.cliente_id ");
            query.Append($" WHERE C.codigo_clte = '{filtro.clientCode}' ");

            if (filtro.SoloDocsVencidos)
            {
                var dateNow = DateTime.Now;
                query.Append($" AND fecha_vcmto < '{dateNow.Year}-{dateNow.Month}-{dateNow.Day}'  ");
            }

            return query.ToString();
        }
    }
}