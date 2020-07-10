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
                query.Append("   SUBSTRING(rtrim(ncf),1, 19) ncf ");
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

            //if (filtro.tipoReporte == "ventas" && string.IsNullOrEmpty(filtro.tipoConsulta))
            //{
            //    query.Append("SELECT ");

            //    if (filtro.SUM)
            //    {
            //        query.Append("  COUNT(*) count, ");
            //        query.Append("  SUM(factura.total - factura.impuesto_monto) SubTotalNeto, ");
            //        query.Append("  SUM(factura.impuesto_monto) impuesto_monto, ");
            //        query.Append("  SUM(factura.total) total ");
            //    }
            //    else
            //    {
            //        query.Append("  factura.nro_factura as nrodoc, ");
            //        query.Append("  factura.fecha_emision, ");
            //        query.Append("  vendedores.Nombre_vendedor, ");
            //        query.Append("  clientes.nombre_clte, ");
            //        query.Append("  factura.total - factura.impuesto_monto AS SubTotalNeto, ");
            //        query.Append("  factura.impuesto_monto AS impto, ");
            //        query.Append("  factura.total ");
            //    }

            //    query.Append($" FROM {DbName}dbo.factura, ");
            //    query.Append($"      {DbName}dbo.clientes, ");
            //    query.Append($"      {DbName}dbo.vendedores, ");
            //    query.Append($"      {DbName}dbo.Categorias_clte ");

            //    query.Append($" WHERE ");
            //    query.Append($"     factura.cliente_id = clientes.cliente_id ");
            //    query.Append("      AND factura.vendedor_id = vendedores.vendedor_id ");
            //    query.Append("      AND clientes.categoria_clte_id = REPLACE(Categorias_clte.categoria_clte_id, '\"', '') ");

            //    if (!string.IsNullOrEmpty(filtro.minFecha_emision))
            //        query.Append($"AND(factura.fecha_emision) >= '{filtro.minFecha_emision}' ");
            //    if (!string.IsNullOrEmpty(filtro.maxFecha_emision))
            //        query.Append($"AND(factura.fecha_emision) <= '{filtro.maxFecha_emision}' ");
            //    if (!string.IsNullOrEmpty(filtro.Codigo_vendedor))
            //        query.Append($"AND vendedores.Codigo_vendedor = '{filtro.Codigo_vendedor}' ");
            //    if (!string.IsNullOrEmpty(filtro.tipo_factura))
            //        query.Append($"AND factura.tipo_factura >= '{filtro.tipo_factura}' ");
            //    if (!string.IsNullOrEmpty(filtro.categoria_clte_id))
            //        query.Append($"AND Categorias_clte.categoria_clte_id = '{filtro.categoria_clte_id}' ");

            //    query.Append(" AND factura.anulada = 0 ");

            //    if (!filtro.SUM)
            //        query.Append(" ORDER BY Categorias_clte.categoria_clte_id, factura.fecha_emision ");
            //}
            //else if (filtro.tipoReporte == "devoluciones" && string.IsNullOrEmpty(filtro.tipoConsulta))
            //{
            //    query.Append(" SELECT ");

            //    if (filtro.SUM)
            //    {
            //        query.Append("  Sum(CAST(Replace(devolucion_clte.total, '\"', '') AS FLOAT) - CAST(Replace(devolucion_clte.impuesto_monto, '\"', '') AS FLOAT)) SubTotalNeto, ");
            //        query.Append("  Sum(CAST(Replace(devolucion_clte.impuesto_monto, '\"', '') AS FLOAT)) impuesto_monto, ");
            //        query.Append("  Sum(CAST(Replace(devolucion_clte.total, '\"', '') AS FLOAT)) total ");
            //    }
            //    else
            //    {
            //        query.Append("      devolucion_clte.nro_devolucion_clte as nrodoc, ");
            //        query.Append("      devolucion_clte.fecha_emision, ");
            //        query.Append("      vendedores.Nombre_vendedor, ");
            //        query.Append("      clientes.nombre_clte, ");
            //        query.Append("      (CAST(Replace(devolucion_clte.total, '\"', '') AS FLOAT) - CAST(Replace(devolucion_clte.impuesto_monto, '\"', '') AS FLOAT) ) SubTotalNeto, ");
            //        query.Append("      CAST(Replace(devolucion_clte.impuesto_monto, '\"', '') AS FLOAT) impto, ");
            //        query.Append("      CAST(Replace(devolucion_clte.total, '\"', '') AS FLOAT) total ");
            //    }
            //    query.Append($"FROM  {DbName}dbo.devolucion_clte, ");
            //    query.Append($"      {DbName}dbo.clientes, ");
            //    query.Append($"      {DbName}dbo.vendedores, ");
            //    query.Append($"      {DbName}dbo.Categorias_clte ");

            //    query.Append("WHERE ");
            //    query.Append(" Replace(devolucion_clte.cliente_id, '\"', '') = clientes.cliente_id ");
            //    query.Append(" AND clientes.categoria_clte_id = Replace(categorias_clte.categoria_clte_id, '\"', '') ");
            //    query.Append(" AND Replace(devolucion_clte.vendedor_id, '\"', '') = vendedores.vendedor_id  ");

            //    if (!string.IsNullOrEmpty(filtro.minFecha_emision))
            //        query.Append($" AND Replace(devolucion_clte.fecha_emision, '\"', '') >= '{ filtro.minFecha_emision}' ");
            //    if (!string.IsNullOrEmpty(filtro.maxFecha_emision))
            //        query.Append($" AND Replace(devolucion_clte.fecha_emision, '\"', '') <= '{ filtro.maxFecha_emision}' ");
            //    if (!string.IsNullOrEmpty(filtro.categoria_clte_id))
            //        query.Append($"AND Categorias_clte.categoria_clte_id = '{filtro.categoria_clte_id}' ");

            //    query.Append(" AND Replace(devolucion_clte.anulada, '\"', '') = '0'");

            //    if (!filtro.SUM)
            //        query.Append("ORDER BY devolucion_clte.ncf, devolucion_clte.fecha_emision ");
            //}

            string TableSource = "";
            string TableSourceID = "";
            string TableSourcePrecio = "";
            string TableDetilsSource = "";
            //string TableDetailSourceID = "";

            if (filtro.tipoReporte == "ventas" && !string.IsNullOrEmpty(filtro.tipoConsulta))
            {
                TableSource = "factura TS";
                TableDetilsSource = "factura_detalle TDS";
                TableSourceID = "factura_id";
                TableSourcePrecio = "precio_factura";
                //TableDetailSourceID = "detalle_id";
            }
            else if (filtro.tipoReporte == "devoluciones" && !string.IsNullOrEmpty(filtro.tipoConsulta))
            {
                TableSource = "devolucion_clte TS";
                TableDetilsSource = "devolucion_clte_detalle TDS";
                TableSourceID = "devolucion_clte_id";
                TableSourcePrecio = "precio_devolucion_clte";
                //TableDetailSourceID = "devolucion_clte_id";
            }

            #region SELECT
            query.Append(" SELECT ");

            if (filtro.SUM)
            {
                query.Append("   COUNT(*) count, ");
                query.Append("   SUM(TS.total) total ");

                if (!filtro.GROUP)
                {
                    query.Append(",   SUM(TS.dscto_monto) dscto_monto ");
                    //query.Append("  SUM(impto) impto, ");
                }
                else
                {
                    query.Append(",   SUM(TDS.cantidad) cantidad, ");
                    query.Append("   SUM(P.valor_inventario) valor_inventario, ");
                    query.Append("   SUM(TS.impuesto_monto) impuesto_monto ");
                }
            }
            else
            {
                query.Append($" TS.{TableSourceID} nrodoc, ");
                query.Append("  TS.fecha_emision, ");
                query.Append("  TS.clte_direccion1, ");
                query.Append("  TDS.impto_monto, ");
                query.Append("  (TDS.cantidad*TDS.precio_factura)+(TDS.impto_monto+TDS.impto2_monto-TDS.descto_monto) total ");

                if (!filtro.GROUP)
                {
                    query.Append(", TS.fecha_vcmto, ");
                    query.Append("  UPPER(V.Nombre_vendedor) Nombre_vendedor, ");
                    query.Append("  SUBSTRING(rtrim(ncf),1, 19) ncf, ");
                    query.Append("  UPPER(TP.Descripcion_termino) Descripcion_termino, ");
                    query.Append("  CASE TS.moneda ");
                    query.Append("      WHEN 0 THEN 'NACIONAL' ");
                    query.Append("      ELSE 'EXTRANJERA' ");
                    query.Append("      END moneda, ");
                    query.Append("  TS.dscto_monto ");

                    if (filtro.traerSubTotal)
                        query.Append(" , (TS.total - TS.impuesto_monto)  SubTotalNeto ");
                }
                else
                {
                    query.Append(", CP.categoria_id, ");
                    query.Append("  P.descrip_producto, ");
                    query.Append("  P.valor_inventario, ");
                    query.Append("  TDS.cantidad, ");
                    query.Append($" TDS.{TableSourcePrecio} ");

                }
            }
            #endregion

            #region FROM
            query.Append("FROM ");
            query.Append($" {DbName}{TableSource} ");
            query.Append($", {DbName}vendedores V ");

            if (!filtro.GROUP)
            {
                query.Append($",  {DbName}terminos_pago TP ");
            }

            if (!string.IsNullOrEmpty(filtro.tipoConsulta))
                switch (filtro.tipoConsulta)
                {
                    case "RFA04":
                        query.Append($", {DbName}clientes C ");
                        break;
                    case "RFA0":
                        query.Append($", {DbName}nombre_bodegas NB ");
                        break;
                    case "RFA06":
                        query.Append($", {DbName}{TableDetilsSource} ");
                        query.Append($", {DbName}productos P ");
                        break;
                    case "RFA08":
                        query.Append($", {DbName}productos P ");
                        query.Append($", {DbName}{TableDetilsSource} ");
                        query.Append($", {DbName}categoria_producto CP ");
                        //query.Append($", {DbName}sub_categoria_producto SCP ");
                        break;
                    case "RFA09":
                        query.Append($", {DbName}dbo.Categorias_clte CC ");
                        break;
                }
            #endregion

            #region WHERE
            query.Append("WHERE ");
            query.Append("  TS.anulada = 0 ");
            query.Append("  AND TS.vendedor_id = V.vendedor_id ");

            if (!filtro.GROUP)
                query.Append("  AND TP.termino_id = TS.termino_id ");

            if (!string.IsNullOrEmpty(filtro.tipoConsulta))
                switch (filtro.tipoConsulta)
                {
                    case "RFA04":
                        query.Append("  AND TS.cliente_id = C.cliente_id ");
                        break;
                    case "RFA06":
                        query.Append("  AND TDS.producto_id = P.producto_id ");
                        query.Append($" AND TS.{TableSourceID} = TDS.{TableSourceID} ");
                        break;
                    case "RFA08":
                        query.Append("  AND P.Categoria_id = CP.categoria_id ");
                        //query.Append("  AND CP.Categoria_id = SCP.Categoria_id ");
                        query.Append("  AND TDS.producto_id = P.producto_id ");
                        query.Append($" AND TS.{TableSourceID} = TDS.{TableSourceID} ");
                        break;
                }

            if (!string.IsNullOrEmpty(filtro.minFecha_emision))
                query.Append($"AND TS.fecha_emision >= '{filtro.minFecha_emision}' ");
            if (!string.IsNullOrEmpty(filtro.maxFecha_emision))
                query.Append($"AND TS.fecha_emision <= '{filtro.maxFecha_emision}' ");
            if (!string.IsNullOrEmpty(filtro.tipo_factura))
                query.Append($"AND TS.tipo_factura >= '{filtro.tipo_factura}' ");
            if (!string.IsNullOrEmpty(filtro.Codigo_vendedor))
                query.Append($"AND V.Codigo_vendedor = '{filtro.Codigo_vendedor}' ");
            if (!string.IsNullOrEmpty(filtro.categoria_clte_id))
                query.Append($" AND CC.categoria_clte_id = '{filtro.categoria_clte_id}' ");

            if (filtro.tipoConsulta != "RFA02")
            {
                if (!string.IsNullOrEmpty(filtro.desde))
                    query.Append($"AND SUBSTRING(STR(TS.{TableSourceID}), Patindex('%[^0 ]%', STR(TS.{TableSourceID}) + ' '), LEN(TS.{TableSourceID})) >= CAST('{filtro.desde}' AS FLOAT) ");
                if (!string.IsNullOrEmpty(filtro.hasta))
                    query.Append($"AND SUBSTRING(STR(TS.{TableSourceID}), Patindex('%[^0 ]%', STR(TS.{TableSourceID}) + ' '), LEN(TS.{TableSourceID})) <= CAST('{filtro.hasta}' AS FLOAT) ");
            }

            switch (filtro.tipoConsulta)
            {
                case "RFA02":
                    if (!string.IsNullOrEmpty(filtro.desde))
                        query.Append($"AND TS.total >= '{filtro.desde}' ");
                    if (!string.IsNullOrEmpty(filtro.hasta))
                        query.Append($"AND TS.total <= '{filtro.hasta}' ");
                    break;

                case "RFA03":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND TP.termino_id = '{filtro.valor}' ");
                    break;

                case "RFA04":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND C.nombre_clte LIKE '%{filtro.valor}%' ");
                    break;

                case "RFA05":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND TS.clte_direccion1 LIKE '%{filtro.valor}%' ");
                    break;

                case "RFA06":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND P.descrip_producto LIKE '%{filtro.valor}%' ");
                    break;

                case "RFA0":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND NB.bodega_id = '{filtro.valor}' ");
                    break;

                case "RFA08":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND CP.categoria_id = '{filtro.valor}' ");
                    break;
            }
            #endregion

            #region ORDER BY
            if (!filtro.SUM)
            {
                query.Append("ORDER BY ");
                switch (filtro.tipoConsulta)
                {
                    case "RFA02":
                        query.Append(" TS.total ");
                        break;
                    case "RFA03":
                        query.Append(" TP.Descripcion_termino ");
                        break;
                    case "RFA04":
                        query.Append(" C.nombre_clte ");
                        break;
                    case "RFA05":
                        query.Append(" TS.clte_direccion1 ");
                        break;
                    case "RFA06":
                        query.Append(" P.descrip_producto ");
                        break;
                    case "RFA0":
                        query.Append(" NB.bodega_id ");
                        break;
                    case "RFA08":
                        query.Append(" CP.categoria_id, ");
                        query.Append(" P.Categoria_id ");
                        break;
                    case "RFA09":
                        query.Append(" CC.categoria_clte_id ");
                        break;
                    default:
                        query.Append(" TS.fecha_emision ");
                        break;
                }
                query.Append($", TS.{TableSourceID} ");

                if (!filtro.GROUP)
                {
                    query.Append($"OFFSET {filtro.skip * filtro.take} ROWS ");
                    query.Append($"FETCH NEXT {filtro.take} ROWS ONLY ");
                }
            }
            #endregion

            #region GROUP BY
            if (filtro.SUM)
            {
                if (filtro.GROUP)
                {
                    query.Append("GROUP BY ");

                    switch (filtro.tipoConsulta)
                    {
                        case "RFA08":
                            query.Append(" TS.moneda ");
                            break;
                    }
                }
            }
            #endregion

            return query.ToString();

            //--------------------

            //if (filtro.tipoReporte == "ventas" && !string.IsNullOrEmpty(filtro.tipoConsulta))
            //{
            //    query.Append(" SELECT ");

            //    if (filtro.SUM)
            //    {
            //        query.Append("  COUNT(*) count, ");
            //        query.Append("  SUM(factura.dscto_monto) dscto_monto, ");
            //        //query.Append("  SUM(impto) impto, ");
            //        query.Append("  SUM(factura.total) total ");
            //    }
            //    else
            //    {
            //        query.Append("  factura.nro_factura nrodoc, ");
            //        query.Append("  factura.fecha_emision, ");
            //        query.Append("  factura.fecha_vcmto, ");
            //        query.Append("  factura.clte_direccion1, ");
            //        query.Append("  UPPER(vendedores.Nombre_vendedor) Nombre_vendedor, ");
            //        query.Append("  SUBSTRING(rtrim(ncf),1, 19) ncf, ");
            //        query.Append("  UPPER(terminos_pago.Descripcion_termino) Descripcion_termino, ");
            //        query.Append("  CASE factura.moneda ");
            //        query.Append("      WHEN 0 THEN 'NACIONAL' ");
            //        query.Append("      ELSE 'EXTRANJERA' ");
            //        query.Append("      END moneda, ");
            //        query.Append("  factura.dscto_monto, ");
            //        query.Append("  factura.impuesto_monto, ");
            //        query.Append("  factura.total ");

            //        if (filtro.traerSubTotal)
            //            query.Append(" , factura.total - factura.impuesto_monto AS SubTotalNeto ");
            //    }

            //    query.Append("FROM ");
            //    query.Append($" {DbName}factura, ");
            //    query.Append($" {DbName}vendedores, ");
            //    query.Append($" {DbName}terminos_pago ");

            //    if (!string.IsNullOrEmpty(filtro.tipoConsulta))
            //        switch (filtro.tipoConsulta)
            //        {
            //            case "RFA04":
            //                query.Append($", {DbName}clientes ");
            //                break;
            //            case "RFA0":
            //                query.Append($", {DbName}nombre_bodegas ");
            //                break;
            //            case "RFA06":
            //                query.Append($", {DbName}factura_detalle ");
            //                query.Append($", {DbName}productos ");
            //                break;
            //            case "RFA08":
            //                query.Append($", {DbName}categoria_producto ");
            //                query.Append($", {DbName}sub_categoria_producto ");
            //                break;
            //            case "RFA09":
            //                query.Append($", {DbName}dbo.Categorias_clte ");
            //                break;
            //        }

            //    query.Append("WHERE ");
            //    query.Append("  factura.vendedor_id = vendedores.vendedor_id ");
            //    query.Append("  AND terminos_pago.termino_id = factura.termino_id ");
            //    query.Append("  AND factura.anulada = 0 ");

            //    if (!string.IsNullOrEmpty(filtro.tipoConsulta))
            //        switch (filtro.tipoConsulta)
            //        {
            //            case "RFA04":
            //                query.Append("  AND factura.cliente_id = clientes.cliente_id ");
            //                break;
            //            case "RFA06":
            //                query.Append("  AND factura_detalle.producto_id = productos.producto_id ");
            //                query.Append("  AND factura.factura_id = factura_detalle.factura_id ");
            //                break;
            //            case "RFA08":
            //                query.Append("  AND productos.Categoria_id = categoria_producto.categoria_id ");
            //                query.Append("  AND categoria_producto.Categoria_id = sub_categoria_producto.Categoria_id ");
            //                query.Append("  AND factura_detalle.producto_id = productos.producto_id ");
            //                break;
            //        }

            //    if (!string.IsNullOrEmpty(filtro.minFecha_emision))
            //        query.Append($"AND factura.fecha_emision >= '{filtro.minFecha_emision}' ");
            //    if (!string.IsNullOrEmpty(filtro.maxFecha_emision))
            //        query.Append($"AND factura.fecha_emision <= '{filtro.maxFecha_emision}' ");
            //    if (!string.IsNullOrEmpty(filtro.tipo_factura))
            //        query.Append($"AND factura.tipo_factura >= '{filtro.tipo_factura}' ");
            //    if (!string.IsNullOrEmpty(filtro.Codigo_vendedor))
            //        query.Append($"AND vendedores.Codigo_vendedor = '{filtro.Codigo_vendedor}' ");
            //    if (!string.IsNullOrEmpty(filtro.categoria_clte_id))
            //        query.Append($" AND Categorias_clte.categoria_clte_id = '{filtro.categoria_clte_id}' ");

            //    if (filtro.tipoConsulta != "RFA02")
            //    {
            //        if (!string.IsNullOrEmpty(filtro.desde))
            //            query.Append($"AND SUBSTRING(STR(factura.nro_factura), Patindex('%[^0 ]%', STR(factura.nro_factura) + ' '), LEN(factura.nro_factura)) >= CAST('{filtro.desde}' AS FLOAT) ");
            //        if (!string.IsNullOrEmpty(filtro.hasta))
            //            query.Append($"AND SUBSTRING(STR(factura.nro_factura), Patindex('%[^0 ]%', STR(factura.nro_factura) + ' '), LEN(factura.nro_factura)) <= CAST('{filtro.hasta}' AS FLOAT) ");
            //    }

            //    switch (filtro.tipoConsulta)
            //    {
            //        case "RFA02":
            //            if (!string.IsNullOrEmpty(filtro.desde))
            //                query.Append($"AND factura.total >= '{filtro.desde}' ");
            //            if (!string.IsNullOrEmpty(filtro.hasta))
            //                query.Append($"AND factura.total <= '{filtro.hasta}' ");
            //            break;

            //        case "RFA03":
            //            if (!string.IsNullOrEmpty(filtro.valor))
            //                query.Append($"AND terminos_pago.termino_id = '{filtro.valor}' ");
            //            break;

            //        case "RFA04":
            //            if (!string.IsNullOrEmpty(filtro.valor))
            //                query.Append($"AND clientes.nombre_clte LIKE '%{filtro.valor}%' ");
            //            break;

            //        case "RFA05":
            //            if (!string.IsNullOrEmpty(filtro.valor))
            //                query.Append($"AND factura.clte_direccion1 LIKE '%{filtro.valor}%' ");
            //            break;

            //        case "RFA06":
            //            if (!string.IsNullOrEmpty(filtro.valor))
            //                query.Append($"AND productos.descrip_producto LIKE '%{filtro.valor}%' ");
            //            break;

            //        case "RFA0":
            //            if (!string.IsNullOrEmpty(filtro.valor))
            //                query.Append($"AND nombre_bodegas.bodega_id = '{filtro.valor}' ");
            //            break;

            //        case "RFA08":
            //            if (!string.IsNullOrEmpty(filtro.valor))
            //                query.Append($"AND categoria_producto.categoria_id = '{filtro.valor}' ");
            //            break;
            //    }

            //    if (!filtro.SUM)
            //    {
            //        query.Append("ORDER BY ");
            //        switch (filtro.tipoConsulta)
            //        {

            //            case "RFA02":
            //                query.Append(" factura.total ");
            //                break;
            //            case "RFA03":
            //                query.Append(" terminos_pago.Descripcion_termino ");
            //                break;
            //            case "RFA04":
            //                query.Append(" clientes.nombre_clte ");
            //                break;
            //            case "RFA05":
            //                query.Append(" factura.clte_direccion1 ");
            //                break;
            //            case "RFA06":
            //                query.Append(" productos.descrip_producto ");
            //                break;
            //            case "RFA0":
            //                query.Append(" nombre_bodegas.bodega_id ");
            //                break;
            //            case "RFA08":
            //                query.Append(" categoria_producto.categoria_id, productos.Categoria_id ");
            //                break;
            //            case "RFA09":
            //                query.Append(" Categorias_clte.categoria_clte_id ");
            //                break;
            //            default:
            //                query.Append(" Factura.fecha_emision ");
            //                break;
            //        }
            //        query.Append(",factura.nro_factura ");
            //    }
            //}
            //else if (filtro.tipoReporte == "devoluciones" && !string.IsNullOrEmpty(filtro.tipoConsulta))
            //{
            //    query.Append(" SELECT ");

            //    if (filtro.SUM)
            //    {
            //        query.Append("  COUNT(*) count, ");
            //        query.Append("  SUM(CAST(REPLACE(DC.dscto_monto, '\"', '') AS FLOAT)) dscto_monto, ");
            //        //query.Append("  SUM(impto) impto, ");
            //        query.Append("  SUM(CAST(REPLACE(DC.total, '\"', '') AS FLOAT)) total ");
            //    }
            //    else
            //    {
            //        query.Append("  DC.nro_devolucion_clte nrodoc, ");
            //        query.Append("  DC.fecha_emision, ");
            //        query.Append("  DC.fecha_vcmto, ");
            //        query.Append("  DC.clte_direccion1, ");
            //        query.Append("  UPPER(V.Nombre_vendedor) Nombre_vendedor, ");
            //        query.Append("  SUBSTRING(rtrim(ncf),1, 19) ncf, ");
            //        query.Append("  UPPER(TP.Descripcion_termino) Descripcion_termino, ");
            //        query.Append("  CASE REPLACE(DC.moneda, '\"', '') ");
            //        query.Append("      WHEN 0 THEN 'NACIONAL' ");
            //        query.Append("      ELSE 'EXTRANJERA' ");
            //        query.Append("      END moneda, ");
            //        query.Append("  DC.dscto_monto, ");
            //        query.Append("  DC.impuesto_monto, ");
            //        query.Append("  DC.total ");

            //        if (filtro.traerSubTotal)
            //            query.Append(" , CAST(REPLACE(DC.total, '\"', '') AS FLOAT)- CAST(REPLACE(DC.impuesto_monto, '\"', '') AS FLOAT) SubTotalNeto ");
            //    }

            //    query.Append(" FROM ");
            //    query.Append($" {DbName}devolucion_clte DC, ");
            //    query.Append($" {DbName}vendedores V, ");
            //    query.Append($" {DbName}terminos_pago TP ");

            //    if (!string.IsNullOrEmpty(filtro.tipoConsulta))
            //        switch (filtro.tipoConsulta)
            //        {
            //            case "RFA04":
            //                query.Append($", {DbName}clientes C ");
            //                break;
            //            case "RFA0":
            //                query.Append($", {DbName}nombre_bodegas ");
            //                break;
            //            case "RFA06":
            //                query.Append($", {DbName}devolucion_clte_detalle DCD ");
            //                query.Append($", {DbName}productos ");
            //                break;
            //            case "RFA08":
            //                //query.Append($", {DbName}devolucion_clte_detalle DCD ");
            //                //query.Append($", {DbName}productos ");
            //                query.Append($", {DbName}categoria_producto ");
            //                query.Append($", {DbName}sub_categoria_producto ");
            //                break;
            //            case "RFA09":
            //                query.Append($", {DbName}dbo.Categorias_clte ");
            //                break;
            //        }

            //    query.Append(" WHERE ");
            //    query.Append("  REPLACE(DC.vendedor_id, '\"', '') = V.vendedor_id ");
            //    query.Append("  AND REPLACE(DC.termino_id, '\"', '') = TP.termino_id ");
            //    query.Append("  AND REPLACE(DC.anulada, '\"', '') = 0 ");

            //    if (!string.IsNullOrEmpty(filtro.tipoConsulta))
            //        switch (filtro.tipoConsulta)
            //        {
            //            case "RFA04":
            //                query.Append("  AND REPLACE(DC.cliente_id, '\"', '') = C.cliente_id ");
            //                break;
            //            case "RFA06":
            //                query.Append("  AND DCD.producto_id = productos.producto_id ");
            //                query.Append("  AND Replace(DC.devolucion_clte_id, '\"', '') = DCD.devolucion_clte_id ");
            //                break;
            //            case "RFA08":
            //                query.Append("  AND productos.Categoria_id = categoria_producto.categoria_id ");
            //                query.Append("  AND categoria_producto.Categoria_id = sub_categoria_producto.Categoria_id ");
            //                query.Append("  AND DCD.producto_id = productos.producto_id ");
            //                query.Append("  AND DCD.devolucion_clte_id = Replace(DC.devolucion_clte_id, '\"', '') ");
            //                break;
            //        }

            //    if (!string.IsNullOrEmpty(filtro.minFecha_emision))
            //        query.Append($"AND REPLACE(DC.fecha_emision, '\"', '') >= '{ filtro.minFecha_emision}' ");
            //    if (!string.IsNullOrEmpty(filtro.maxFecha_emision))
            //        query.Append($"AND REPLACE(DC.fecha_emision, '\"', '') <= '{ filtro.maxFecha_emision}' ");
            //    if (!string.IsNullOrEmpty(filtro.Codigo_vendedor))
            //        query.Append($"AND REPLACE(DC.vendedor_id, '\"', '') = '{filtro.Codigo_vendedor}' ");
            //    if (!string.IsNullOrEmpty(filtro.categoria_clte_id))
            //        query.Append($" AND Categorias_clte.categoria_clte_id = '{filtro.categoria_clte_id}' ");

            //    if (filtro.tipoConsulta != "RFA02")
            //    {
            //        if (!string.IsNullOrEmpty(filtro.desde))
            //            query.Append($"AND SUBSTRING(STR(REPLACE(DC.nro_devolucion_clte, '\"', '')), Patindex(' %[^0] % ', STR(REPLACE(DC.nro_devolucion_clte, '\"', '')) + ' '), LEN(REPLACE(DC.nro_devolucion_clte, '\"', ''))) >= CAST('{filtro.desde}' AS FLOAT) ");
            //        if (!string.IsNullOrEmpty(filtro.hasta))
            //            query.Append($"AND SUBSTRING(STR(REPLACE(DC.nro_devolucion_clte, '\"', '')), Patindex(' %[^0] % ', STR(REPLACE(DC.nro_devolucion_clte, '\"', '')) + ' '), LEN(REPLACE(DC.nro_devolucion_clte, '\"', ''))) <= CAST('{filtro.hasta}' AS FLOAT) ");
            //    }

            //    switch (filtro.tipoConsulta)
            //    {
            //        case "RFA02":
            //            if (!string.IsNullOrEmpty(filtro.desde))
            //                query.Append($"AND REPLACE(DC.total, '\"', '') >= CAST('{filtro.desde}' AS FLOAT) ");
            //            if (!string.IsNullOrEmpty(filtro.hasta))
            //                query.Append($"AND REPLACE(DC.total, '\"', '') <= CAST('{filtro.hasta}' AS FLOAT) ");
            //            break;

            //        case "RFA03":
            //            if (!string.IsNullOrEmpty(filtro.valor))
            //                query.Append($"AND TP.termino_id = '{filtro.valor}' ");
            //            break;

            //        case "RFA04":
            //            if (!string.IsNullOrEmpty(filtro.valor))
            //                query.Append($"AND REPLACE(DC.clte_direccion1, '\"', '') LIKE '%{filtro.valor}%' ");
            //            break;

            //        case "RFA05":
            //            if (!string.IsNullOrEmpty(filtro.valor))
            //                query.Append($"AND DC.clte_direccion1 LIKE '%{filtro.valor}%' ");
            //            break;

            //        case "RFA06":
            //            if (!string.IsNullOrEmpty(filtro.valor))
            //                query.Append($"AND productos.descrip_producto LIKE '%{filtro.valor}%' ");
            //            break;

            //        case "RFA0":
            //            if (!string.IsNullOrEmpty(filtro.valor))
            //                query.Append($"AND nombre_bodegas.bodega_id = '{filtro.valor}' ");
            //            break;

            //        case "RFA08":
            //            if (!string.IsNullOrEmpty(filtro.valor))
            //                query.Append($"AND categoria_producto.categoria_id = '{filtro.valor}' ");
            //            break;
            //    }

            //    if (!filtro.SUM)
            //    {
            //        query.Append("ORDER BY ");
            //        switch (filtro.tipoConsulta)
            //        {
            //            case "RFA02":
            //                query.Append(" DC.total ");
            //                break;
            //            case "RFA03":
            //                query.Append(" TP.Descripcion_termino ");
            //                break;
            //            case "RFA04":
            //                query.Append(" C.nombre_clte ");
            //                break;
            //            case "RFA05":
            //                query.Append(" DC.clte_direccion1 ");
            //                break;
            //            case "RFA06":
            //                query.Append(" productos.descrip_producto ");
            //                break;
            //            case "RFA0":
            //                query.Append(" nombre_bodegas.Nombre_bodega ");
            //                break;
            //            case "RFA08":
            //                query.Append(" categoria_producto.categoria_id, categoria_producto.Descripcion_categ ");
            //                break;
            //            case "RFA09":
            //                query.Append(" Categorias_clte.categoria_clte_id ");
            //                break;

            //            default:
            //                query.Append(" DC.fecha_emision ");
            //                break;
            //        }

            //        query.Append(", DC.nro_devolucion_clte ");
            //    }
            //}
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