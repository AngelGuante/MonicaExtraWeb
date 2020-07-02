using MonicaExtraWeb.Models.DTO.Reportes;
using System;
using System.Text;

namespace MonicaExtraWeb.Utils
{
    public class Reportes
    {
        public static string IndividualClientQuery(FiltrosReportes filtro, string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("  SELECT ");

            if (filtro.SUM)
            {
                query.Append("   SUM(D.monto_dcmto) sumatoriaMontos, ");
                query.Append("   SUM(D.balance) sumatoriaBalance, ");
                query.Append("   SUM(D.monto_dcmto - D.balance) sumatoriaPagosAcumulados ");
            }
            else
            {
                query.Append("   D.fecha_emision, ");
                query.Append("   D.monto_dcmto monto, ");
                query.Append("   D.balance, ");
                query.Append("   D.fecha_vcmto, ");
                query.Append("   D.descripcion_dcmto, ");
                query.Append("   (D.monto_dcmto - D.balance) pagosAcumulados, ");
                query.Append("   D.ncf ");
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

        public static string VentasDevolucionesCategoriaYVendedor(FiltrosReportes filtro, string DbName = "")
        {
            var query = new StringBuilder();

            if (filtro.tipoReporte == "ventas" && string.IsNullOrEmpty(filtro.tipoConsulta))
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
            else if (filtro.tipoReporte == "devoluciones" && string.IsNullOrEmpty(filtro.tipoConsulta))
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
                    query.Append("      -devolucion_clte.total AS Total ");
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
            else if (!string.IsNullOrEmpty(filtro.tipoConsulta))
            {
                query.Append(" SELECT ");

                if (filtro.SUM)
                {
                    query.Append("  SUM(factura.dscto_monto) dscto_monto, ");
                    //query.Append("  SUM(impto) impto, ");
                    query.Append("  SUM(factura.total) total ");
                }
                else
                {
                    query.Append("  ltrim(str(factura.nro_factura)) nrodoc, ");
                    query.Append("  factura.fecha_emision, ");
                    query.Append("  factura.fecha_vcmto, ");
                    query.Append("  factura.clte_direccion1, ");
                    query.Append("  vendedores.Nombre_vendedor, ");
                    query.Append("  ncf, ");
                    query.Append("  factura.total - factura.impuesto_monto AS SubTotalNeto, ");
                    query.Append("  factura.moneda, ");
                    query.Append("  factura.dscto_monto, ");
                    query.Append("  impto, ");
                    query.Append("  factura.total ");
                    //query.Append("  productos.Categoria_id, ");
                    //query.Append("  categoria_producto.codigo_categoria, ");
                    //query.Append("  categoria_producto.Descripcion_categ, ");
                    //query.Append("  sub_categoria_producto.sub_categoria_id, ");
                    //query.Append("  sub_categoria_producto.codigo_sub_categ, ");
                    //query.Append("  sub_categoria_producto.Descripcion_sub_categ, ");
                    //query.Append("  clientes.registro_tributario, ");
                    //query.Append("  clientes.codigo_clte, ");
                    //query.Append("  clientes.nombre_clte, ");
                    //query.Append("  factura_detalle.impto_monto AS ITBIS, ");
                    //query.Append("  clientes.categoria_clte_id, ");
                    //query.Append("  productos.descrip_producto , ");
                    //query.Append("  factura_detalle.cantidad, ");
                    //query.Append("  factura_detalle.precio_factura AS precio, ");
                    //query.Append("  factura_detalle.cantidad* factura_detalle.precio_factura AS TPRECIO, ");
                    //query.Append("  factura_detalle.cantidad* factura_detalle.costo_producto AS Tcosto, ");
                    //query.Append("  (factura_detalle.cantidad * factura_detalle.precio_factura) + (factura_detalle.impto_monto + factura_detalle.impto2_monto - factura_detalle.descto_monto) AS TotalPPRo, ");
                    //query.Append("  vendedores.vendedor_id, ");
                    //query.Append("  vendedores.Codigo_vendedor, ");
                }

                query.Append("FROM ");
                query.Append($" {DbName}factura, ");
                query.Append($" {DbName}clientes, ");
                query.Append($" {DbName}vendedores ");

                if (!string.IsNullOrEmpty(filtro.tipoConsulta))
                    switch (filtro.tipoConsulta)
                    {
                        case "RFA02":
                            query.Append($", {DbName}factura_detalle ");
                            break;
                        case "RFA03":
                            query.Append($", {DbName}terminos_pago ");
                            break;
                        case "RFA0":
                            query.Append($", {DbName}nombre_bodegas ");
                            break;
                        case "RFA06":
                        case "RFA08":
                            query.Append($", {DbName}categoria_producto ");
                            query.Append($", {DbName}productos ");
                            query.Append($", {DbName}sub_categoria_producto ");
                            query.Append($", {DbName}factura_detalle ");
                            break;
                    }

                query.Append("WHERE ");
                query.Append("  factura.cliente_id = clientes.cliente_id ");
                query.Append("  AND factura.vendedor_id = vendedores.vendedor_id ");
                query.Append("  AND factura.anulada = 0 ");

                if (!string.IsNullOrEmpty(filtro.tipoConsulta))
                    switch (filtro.tipoConsulta)
                    {
                        case "RFA06":
                        case "RFA08":
                            query.Append("  AND productos.Categoria_id = categoria_producto.categoria_id ");
                            query.Append("  AND categoria_producto.Categoria_id = sub_categoria_producto.Categoria_id ");
                            query.Append("  AND factura.factura_id = factura_detalle.factura_id ");
                            query.Append("  AND factura_detalle.producto_id = productos.producto_id ");
                            break;
                    }

                if (!string.IsNullOrEmpty(filtro.minFecha_emision))
                    query.Append($"AND (factura.fecha_emision) >= '{filtro.minFecha_emision}' ");
                if (!string.IsNullOrEmpty(filtro.maxFecha_emision))
                    query.Append($"AND (factura.fecha_emision) <= '{filtro.maxFecha_emision}' ");
                if (!string.IsNullOrEmpty(filtro.tipo_factura))
                    query.Append($"AND factura.tipo_factura >= '{filtro.tipo_factura}' ");
                if (!string.IsNullOrEmpty(filtro.Codigo_vendedor))
                    query.Append($"AND vendedores.Codigo_vendedor = '{filtro.Codigo_vendedor}' ");

                switch (filtro.tipoConsulta)
                {
                    case "RFA01":
                        if (!string.IsNullOrEmpty(filtro.desde))
                            query.Append($"AND factura.nro_factura >= '{filtro.desde}' ");
                        if (!string.IsNullOrEmpty(filtro.hasta))
                            query.Append($"AND factura.nro_factura <= '{filtro.hasta}' ");
                        break;

                    case "RFA02":
                        if (!string.IsNullOrEmpty(filtro.desde))
                            query.Append($"AND (factura_detalle.cantidad*factura_detalle.precio_factura)+(factura_detalle.impto_monto+factura_detalle.impto2_monto-factura_detalle.descto_monto) >= '{filtro.desde}' ");
                        if (!string.IsNullOrEmpty(filtro.hasta))
                            query.Append($"AND (factura_detalle.cantidad*factura_detalle.precio_factura)+(factura_detalle.impto_monto+factura_detalle.impto2_monto-factura_detalle.descto_monto) <= '{filtro.hasta}' ");
                        break;

                    case "RFA03":
                        if (!string.IsNullOrEmpty(filtro.valor))
                            query.Append($"AND terminos_pago.termino_id = '{filtro.valor}' ");
                        break;

                    case "RFA04":
                        if (!string.IsNullOrEmpty(filtro.valor))
                            query.Append($"AND clientes.nombre_clte LIKE '%{filtro.valor}%' ");
                        break;

                    case "RFA05":
                        if (!string.IsNullOrEmpty(filtro.valor))
                            query.Append($"AND factura.clte_direccion1 LIKE '%{filtro.valor}%' ");
                        break;

                    case "RFA06":
                        if (!string.IsNullOrEmpty(filtro.valor))
                            query.Append($"AND productos.descrip_producto LIKE '%{filtro.valor}%' ");
                        break;

                    case "RFA0":
                        if (!string.IsNullOrEmpty(filtro.valor))
                            query.Append($"AND nombre_bodegas.bodega_id = '{filtro.valor}' ");
                        break;

                    case "RFA08":
                        if (!string.IsNullOrEmpty(filtro.valor))
                            query.Append($"AND categoria_producto.categoria_id = '{filtro.valor}' ");
                        break;
                }

                if (!string.IsNullOrEmpty(filtro.tipoConsulta))
                    switch (filtro.tipoConsulta)
                    {
                        case "RFA02":
                            query.Append("GROUP BY ");
                            query.Append(" ltrim(str(factura.nro_factura)), ");
                            query.Append(" factura.fecha_emision, ");
                            query.Append(" factura.fecha_vcmto, ");
                            query.Append(" factura.clte_direccion1, ");
                            query.Append(" vendedores.Nombre_vendedor, ");
                            query.Append(" ncf, ");
                            query.Append(" factura.total - factura.impuesto_monto, ");
                            query.Append(" factura.moneda, ");
                            query.Append(" factura.dscto_monto, ");
                            query.Append(" clientes.impto, ");
                            query.Append(" factura.total ");
                            break;
                    }

                if (!filtro.SUM)
                    query.Append("ORDER BY Factura.fecha_emision ");
            }

            query.Replace("''", "'");
            query.Replace("\"", "'");

            return query.ToString();
        }

        public static string VendedoresInformacionQuery(string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  TRIM(Nombre_vendedor) Nombre_vendedor, ");
            query.Append("  TRIM(Codigo_vendedor) Codigo_vendedor ");
            query.Append($"FROM {DbName}dbo.vendedores ");

            return query.ToString();
        }

        public static string EmpresaInformacionQuery(string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT * ");
            query.Append($"FROM {DbName}dbo.empresas ");

            return query.ToString();
        }

        public static string CategoriasClientesQuery(string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  categoria_clte_id, ");
            query.Append("  descripcion_categ ");
            query.Append($"FROM {DbName}dbo.Categorias_clte ");
            query.Append("ORDER BY descripcion_categ ");

            return query.ToString();
        }

        public static string ClienteQuery(FiltrosReportes filtro, string DbName = "")
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
            query.Append($"WHERE codigo_clte = '{filtro.clientCode}'");

            return query.ToString();
        }

        public static string TerminosPagosQuery(string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  termino_id, ");
            query.Append("  TRIM(UPPER(Descripcion_termino)) Descripcion_termino ");
            query.Append($"FROM {DbName}dbo.terminos_pago ");

            return query.ToString();
        }

        public static string BodegasQuery(string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  bodega_id, ");
            query.Append("  TRIM(UPPER(Nombre_bodega)) Nombre_bodega ");
            query.Append($"FROM {DbName}dbo.nombre_bodegas ");

            return query.ToString();
        }

        public static string CategoriasProductosQuery(string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  categoria_id, ");
            query.Append("  TRIM(UPPER(Descripcion_categ)) Descripcion_categ ");
            query.Append($"FROM {DbName}dbo.categoria_producto ");

            return query.ToString();
        }
    }
}