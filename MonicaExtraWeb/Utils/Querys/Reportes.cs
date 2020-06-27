using MonicaExtraWeb.Models.DTO.Reportes;
using System;
using System.Text;

namespace MonicaExtraWeb.Utils
{
    public class Reportes
    {
        public static string IndividualClientQuery(FiltrosReportes filtro, string DbName)
        {
            var query = new StringBuilder();

            query.Append("  SELECT ");

            if (filtro.SUM)
            {
                query.Append("      SUM(D.monto_dcmto) sumatoriaMontos, ");
                query.Append("      SUM(D.balance) sumatoriaBalance, ");
                query.Append("      SUM(D.monto_dcmto - D.balance) sumatoriaPagosAcumulados ");
            }
            else
            {
                query.Append("      D.fecha_emision, ");
                query.Append("      D.monto_dcmto monto, ");
                query.Append("      D.balance, ");
                query.Append("      D.fecha_vcmto, ");
                query.Append("      D.descripcion_dcmto, ");
                query.Append("      (D.monto_dcmto - D.balance) pagosAcumulados, ");
                query.Append("      D.ncf ");
            }

            query.Append($" FROM {DbName}dbo.clientes C ");
            query.Append("  JOIN docs_cc D ON C.cliente_id = D.cliente_id ");
            query.Append($" WHERE C.codigo_clte = '{filtro.clientCode}' ");
            query.Append("  AND D.Estado_registro = '0' ");
            query.Append("  AND D.balance > 0 ");
            query.Append("  AND D.tipo = 'D' ");

            if (filtro.SoloDocsVencidos)
            {
                var dateNow = DateTime.Now;
                query.Append($" AND fecha_vcmto <= '{dateNow.Year}-{dateNow.Month}-{dateNow.Day}'  ");
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
                query.Append("SELECT ");

                if (filtro.SUM)
                {
                    query.Append("  SUM(factura.total - factura.impuesto_monto) SubTotalNeto, ");
                    query.Append("  SUM(factura.impuesto_monto) impuesto_monto, ");
                    query.Append("  SUM(factura.total) total ");
                }
                else
                {
                    query.Append("  factura.nro_factura as nrodoc, ");
                    query.Append("  factura.fecha_emision, ");
                    query.Append("  vendedores.Nombre_vendedor, ");
                    query.Append("  clientes.nombre_clte, ");
                    query.Append("  factura.total - factura.impuesto_monto AS SubTotalNeto, ");
                    query.Append("  factura.impuesto_monto AS impto, ");
                    query.Append("  factura.total ");
                    //query.Append("  factura.ncf, ");
                    //query.Append("  clientes.registro_tributario, ");
                    //query.Append("  clientes.categoria_clte_id, ");
                    //query.Append("  vendedores.Codigo_vendedor, ");
                    //query.Append("  Categorias_clte.categoria_clte_id, ");
                    //query.Append("  Categorias_clte.descripcion_categ ");
                }

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
                if (!string.IsNullOrEmpty(filtro.categoria_clte_id))
                    query.Append($"AND Categorias_clte.categoria_clte_id = '{filtro.categoria_clte_id}' ");

                query.Append(" AND factura.anulada = 0 ");

                if (!filtro.SUM)
                    query.Append(" ORDER BY Categorias_clte.categoria_clte_id, factura.fecha_emision ");
            }
            else if (filtro.tipoReporte == "devoluciones")
            {
                query.Append(" SELECT ");

                if (filtro.SUM)
                {
                    query.Append("  SUM(factura.total - factura.impuesto_monto) SubTotalNeto, ");
                    query.Append("  SUM(factura.impuesto_monto) impuesto_monto, ");
                    query.Append("  SUM(factura.total) total ");
                }
                else
                {
                    query.Append("      devolucion_clte.nro_devolucion_clte as nrodoc, ");
                    query.Append("      devolucion_clte.fecha_emision, ");
                    query.Append("      vendedores.Nombre_vendedor, ");
                    query.Append("      clientes.nombre_clte, ");
                    query.Append("      -(devolucion_clte.total-devolucion_clte.impuesto_monto) AS SubTotalNeto, ");
                    query.Append("      -devolucion_clte.impuesto_monto AS impto, ");
                    query.Append("      -devolucion_clte.total AS Total, ");
                    //query.Append("      devolucion_clte.ncf, ");
                    //query.Append("      clientes.registro_tributario, ");
                    //query.Append("      clientes.categoria_clte_id, ");
                    //query.Append("      vendedores.Codigo_vendedor, ");
                    //query.Append("      Categorias_clte.categoria_clte_id, ");
                    //query.Append("      Categorias_clte.descripcion_categ ");
                }
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

                if (!string.IsNullOrEmpty(filtro.categoria_clte_id))
                    query.Append($"AND Categorias_clte.categoria_clte_id = '{filtro.categoria_clte_id}' ");

                query.Append("AND devolucion_clte.anulada = 0 ");

                if (!filtro.SUM)
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

        public static string EmpresaInformacionQuery(string DbName)
        {
            var query = new StringBuilder();

            query.Append("SELECT * ");
            query.Append($"FROM {DbName}dbo.empresas ");

            return query.ToString();
        }

        public static string CategoriasClientesQuery(string DbName)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  categoria_clte_id, ");
            query.Append("  descripcion_categ ");
            query.Append($"FROM {DbName}dbo.Categorias_clte ");
            query.Append("ORDER BY descripcion_categ ");

            return query.ToString();
        }

        public static string ClienteQuery(FiltrosReportes filtro, string DbName)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  UPPER(nombre_clte) nombre_clte, ");
            query.Append("  codigo_clte, ");
            query.Append("  telefono1, ");
            query.Append("  fax, ");
            query.Append("  UPPER(e_mail1) e_mail1, ");
            query.Append("  UPPER(direccion1) direccion1, ");
            query.Append("  Contacto ");
            query.Append($"FROM {DbName}dbo.clientes ");
            query.Append($"WHERE codigo_clte  = {filtro.clientCode}");

            return query.ToString();
        }
    }
}