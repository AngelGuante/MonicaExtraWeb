using MonicaExtraWeb.Models.DTO.Reportes;
using System;
using System.Text;

namespace MonicaExtraWeb.Utils
{
    public class QuerysReportes
    {
        public static string IndividualClientQuery(FiltrosReportes filtro, string DbName)
        {
            var query = new StringBuilder();

            query.Append("  SELECT ");
            query.Append("      D.fecha_emision, ");
            query.Append("      D.monto_dcmto monto, ");
            query.Append("      D.balance, ");
            query.Append("      D.fecha_vcmto, ");
            query.Append("      D.descripcion_dcmto, ");
            query.Append("      (D.monto_dcmto - D.balance) pagosAcumulados, ");
            query.Append("      D.ncf ");
            query.Append($" FROM {DbName}dbo.clientes C ");
            query.Append("  JOIN docs_cc D ON C.cliente_id = D.cliente_id ");
            query.Append($" WHERE C.codigo_clte = '{filtro.clientCode}' ");
            query.Append("  AND D.Estado_registro = '0' ");
            query.Append("  AND D.balance > 0 ");
            query.Append("  AND D.tipo = 'D' ");

            if (filtro.SoloDocsVencidos)
            {
                var dateNow = DateTime.Now;
                query.Append($" AND fecha_emision <= '{dateNow.Year}-{dateNow.Month}-{dateNow.Day}'  ");
            }

            query.Replace("''", "'");
            query.Replace("\"", "'");
            return query.ToString();
        }

        public static string VentasDevolucionesCategoriaYVendedor(FiltrosReportes filtro, string DbName)
        {
            var query = new StringBuilder();

            if (filtro.tipoReporte == "ventas")
            {
                query.Append("  SELECT factura.nro_factura as nrodoc, factura.fecha_emision, factura.ncf, clientes.registro_tributario, clientes.nombre_clte, factura.impuesto_monto AS impto, factura.total-factura.impuesto_monto AS SubTotalNeto, factura.total, clientes.categoria_clte_id, vendedores.Codigo_vendedor, vendedores.Nombre_vendedor, Categorias_clte.categoria_clte_id, Categorias_clte.descripcion_categ ");
                query.Append($" FROM {DbName}dbo.factura, ");
                query.Append($"      {DbName}dbo.clientes, ");
                query.Append($"      {DbName}dbo.vendedores, ");
                query.Append($"      {DbName}dbo.Categorias_clte ");
                query.Append($"WHERE factura.cliente_id = clientes.cliente_id ");
                query.Append(" AND factura.vendedor_id = vendedores.vendedor_id ");
                query.Append(" AND clientes.categoria_clte_id = Categorias_clte.categoria_clte_id ");

                if (!string.IsNullOrEmpty(filtro.minFecha_emision))
                    query.Append($"AND(factura.fecha_emision) >= '{filtro.minFecha_emision}' ");
                if (!string.IsNullOrEmpty(filtro.maxFecha_emision))
                    query.Append($"AND(factura.fecha_emision) <= '{filtro.maxFecha_emision}' ");
                if (!string.IsNullOrEmpty(filtro.Codigo_vendedor))
                    query.Append($"AND vendedores.Codigo_vendedor = '{filtro.Codigo_vendedor}' ");
                if (!string.IsNullOrEmpty(filtro.tipo_factura))
                    query.Append($"AND factura.tipo_factura >= '{filtro.tipo_factura}' ");

                query.Append(" AND factura.anulada = 0 ");
                query.Append(" ORDER BY Categorias_clte.categoria_clte_id, factura.fecha_emision ");
            }
            else if (filtro.tipoReporte == "devoluciones")
            {
                query.Append("  SELECT devolucion_clte.nro_devolucion_clte as nrodoc, devolucion_clte.fecha_emision, devolucion_clte.ncf, clientes.registro_tributario, clientes.nombre_clte, -(devolucion_clte.total-devolucion_clte.impuesto_monto) AS SubTotalNeto, -devolucion_clte.impuesto_monto AS impto, -devolucion_clte.total AS Total, clientes.categoria_clte_id, vendedores.Codigo_vendedor, vendedores.Nombre_vendedor, Categorias_clte.categoria_clte_id, Categorias_clte.descripcion_categ ");
                query.Append($"FROM  {DbName}dbo.devolucion_clte, ");
                query.Append($"      {DbName}dbo.clientes, ");
                query.Append($"      {DbName}dbo.vendedores, ");
                query.Append($"      {DbName}dbo.Categorias_clte ");
                query.Append("WHERE devolucion_clte.cliente_id = clientes.cliente_id ");
                query.Append("AND clientes.categoria_clte_id = Categorias_clte.categoria_clte_id ");
                query.Append("AND devolucion_clte.vendedor_id = vendedores.vendedor_id ");

                if (!string.IsNullOrEmpty(filtro.minFecha_emision))
                    query.Append($"AND(devolucion_clte.fecha_emision) >= '{filtro.minFecha_emision}' ");
                if (!string.IsNullOrEmpty(filtro.maxFecha_emision))
                    query.Append($"AND(devolucion_clte.fecha_emision) <= '{filtro.maxFecha_emision}' ");

                query.Append("AND devolucion_clte.anulada = 0 ");
                query.Append("ORDER BY devolucion_clte.ncf, devolucion_clte.fecha_emision ");
            }

            query.Replace("''", "'");
            query.Replace("\"", "'");

            return query.ToString();
            //return "SELECT '2020-06-17' fecha_emision, '123456' nro_dcmto, 'demo_vendedor' Nombre_vendedor, 'demo_cliente' refer_cliente, '1000' subtotal, '5000' total";
        }

        public static string VendedoresInformacionQuery(string DbName)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  Nombre_vendedor, ");
            query.Append("  Codigo_vendedor ");
            query.Append($"FROM {DbName}dbo.vendedores ");

            return query.ToString();
        }
    }
}