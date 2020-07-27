using MonicaExtraWeb.Models.DTO.Reportes;
using System;
using System.Text;

namespace MonicaExtraWeb.Utils
{
    public class Reportes
    {
        #region REPORTES
        public static string IndividualClientQuery(FiltrosReportes filtro, string DbName = "")
        {
            var query = new StringBuilder();

            string TableSource = "";
            string TableSourceName = "";
            string TableSourceID = "";
            string TableSourceEntryId = "";
            string TableSourcePrecio = "";
            string TableDetilsSource = "";
            string TableSourceCodigo = "";

            switch (filtro.tipoReporte)
            {
                case "PorCobrar":
                    TableSource = "clientes TS";
                    TableDetilsSource = "docs_cc TDS";
                    TableSourceName = "nombre_clte";
                    TableSourceID = "cliente_id";
                    TableSourceEntryId = "nro_dcmto";
                    TableSourceCodigo = "codigo_clte";
                    break;
                case "porPagar":
                    TableSource = "proveedores TS";
                    TableDetilsSource = "docs_cp TDS";
                    TableSourceName = "nombre_proveedor";
                    TableSourceID = "proveedor_id";
                    TableSourceEntryId = "nro_dcmto";
                    TableSourcePrecio = "precio_devolucion_clte";
                    TableSourceCodigo = "codigo_proveedor";
                    break;
            }

            #region SELECT
            query.Append("  SELECT ");

            if (filtro.SUM)
            {
                query.Append("   SUM(TDS.monto_dcmto) sumatoriaMontos, ");
                query.Append("   SUM(TDS.balance) sumatoriaBalance, ");
                query.Append("   SUM(TDS.monto_dcmto - TDS.balance) sumatoriaPagosAcumulados ");
            }
            else
            {
                query.Append($" TS.{TableSourceName}, ");
                query.Append("  TDS.fecha_emision, ");
                query.Append("  TDS.monto_dcmto monto, ");
                query.Append("  TDS.balance, ");
                query.Append("  TDS.fecha_vcmto, ");
                query.Append("  TDS.descripcion_dcmto, ");
                query.Append("  (TDS.monto_dcmto - TDS.balance) pagosAcumulados ");

                if (filtro.tipoConsulta == "PorCobrar")
                    query.Append(", SUBSTRING(rtrim(TDS.ncf),1, 19) ncf ");
            }
            #endregion

            #region FROM
            query.Append($" FROM {DbName}{TableSource} ");
            query.Append($" JOIN {TableDetilsSource} ON TS.{TableSourceID} = TDS.{TableSourceID} ");
            #endregion

            #region WHERE
            query.Append("  WHERE TDS.Estado_registro = '0' ");
            query.Append("  AND TDS.balance > 0 ");
            query.Append("  AND TDS.tipo = 'D' ");

            if (!string.IsNullOrEmpty(filtro.minFecha_emision))
                query.Append($"AND TDS.fecha_emision >= '{filtro.minFecha_emision}' ");
            if (!string.IsNullOrEmpty(filtro.maxFecha_emision))
                query.Append($"AND TDS.fecha_emision <= '{filtro.maxFecha_emision}' ");
            if (!string.IsNullOrEmpty(filtro.code))
                query.Append($" AND TS.{TableSourceCodigo} = '{filtro.code}' ");
            else
                query.Append($" AND TS.{TableSourceID} = TDS.{TableSourceID} ");
            if (filtro.SoloDocsVencidos)
            {
                var dateNow = DateTime.Now;
                query.Append($" AND TDS.fecha_vcmto <= '{dateNow.Year}-{dateNow.Month}-{dateNow.Day}'  ");
            }

            switch (filtro.tipoConsulta)
            {
                case "RFA01":
                    if (!string.IsNullOrEmpty(filtro.desde))
                        query.Append($"AND SUBSTRING(STR(TDS.{TableSourceEntryId}), Patindex('%[^0 ]%', STR(TDS.{TableSourceEntryId}) + ' '), LEN(TDS.{TableSourceEntryId})) >= CAST('{filtro.desde}' AS FLOAT) ");
                    if (!string.IsNullOrEmpty(filtro.hasta))
                        query.Append($"AND SUBSTRING(STR(TDS.{TableSourceEntryId}), Patindex('%[^0 ]%', STR(TDS.{TableSourceEntryId}) + ' '), LEN(TDS.{TableSourceEntryId})) <= CAST('{filtro.hasta}' AS FLOAT) ");
                    break;
                case "RFA02":
                    if (!string.IsNullOrEmpty(filtro.desde))
                        query.Append($"AND TDS.Monto_dcmto >= '{filtro.desde}' ");
                    if (!string.IsNullOrEmpty(filtro.hasta))
                        query.Append($"AND TDS.Monto_dcmto <= '{filtro.hasta}' ");
                    break;
            }

            #endregion

            query.Replace("''", "'");
            query.Replace("\"", "'");
            return query.ToString();
        }

        /// <summary>
        /// Ventas y Devoluciones.
        /// Cotizaciones Y Conduces.
        /// </summary>
        /// <param name="filtro"></param>
        /// <param name="DbName"></param>
        /// <returns></returns>
        public static string VentasDevolucionesCategoriaYVendedor(FiltrosReportes filtro, string DbName = "")
        {
            var query = new StringBuilder();

            string TableSource = "";
            string TableSourceID = "";
            string TableSourceEntryId = "";
            string TableSourcePrecio = "";
            string TableDetilsSource = "";

            switch (filtro.tipoReporte)
            {
                case "ventas":
                    TableSource = "factura TS";
                    TableDetilsSource = "factura_detalle TDS";
                    TableSourceID = "factura_id";
                    TableSourceEntryId = "nro_factura";
                    TableSourcePrecio = "precio_factura";
                    break;
                case "devoluciones":
                    TableSource = "devolucion_clte TS";
                    TableDetilsSource = "devolucion_clte_detalle TDS";
                    TableSourceID = "devolucion_clte_id";
                    TableSourceEntryId = "nro_devolucion_clte";
                    TableSourcePrecio = "precio_devolucion_clte";
                    break;
                case "cotizaciones":
                    TableSource = "estimado TS";
                    TableDetilsSource = "estimado_detalle TDS";
                    TableSourceID = "estimado_id";
                    TableSourceEntryId = "nro_estimado";
                    TableSourcePrecio = "precio_estimado";
                    break;
                    //case "conduces":
                    //    TableSource = "devolucion_clte TS";
                    //    TableDetilsSource = "devolucion_clte_detalle TDS";
                    //    TableSourceID = "devolucion_clte_id";
                    //    TableSourceEntryId = "nro_devolucion_clte";
                    //    TableSourcePrecio = "precio_devolucion_clte";
                    //    break;
            }

            #region SELECT
            query.Append(" SELECT ");

            if (filtro.SUM)
            {
                query.Append("   COUNT(*) count, ");

                if (!filtro.GROUP)
                {
                    query.Append("  SUM(CAST(TS.total AS FLOAT)) total ");
                    query.Append(", SUM(CAST(TS.dscto_monto AS FLOAT)) dscto_monto ");
                    query.Append(", SUM(CAST(TS.total AS FLOAT) - CAST(TS.impuesto_monto AS FLOAT)) subtotal ");
                    query.Append(", SUM(CAST(TS.impuesto_monto AS FLOAT)) impuesto ");
                }
                else
                {
                    query.Append("  SUM(TDS.cantidad) cantidad, ");
                    query.Append($" SUM(TDS.cantidad * TDS.{TableSourcePrecio}) TPRECIO, ");
                    query.Append("  SUM(TDS.impto_monto) impto_monto, ");
                    query.Append($" SUM((TDS.cantidad * TDS.{TableSourcePrecio}) + (TDS.impto_monto + TDS.impto2_monto - TDS.descto_monto)) total ");

                    if (!string.IsNullOrEmpty(filtro.tipoCorte))
                        switch (filtro.tipoCorte)
                        {
                            case "porCategoria":
                                query.Append(", MAX(CP.Descripcion_categ) Descripcion_categ, ");
                                query.Append("  Max(CP.categoria_id) categoria_id ");
                                break;
                            case "porCliente":
                                query.Append(", C.nombre_clte ");
                                break;
                            case "porVendedor":
                                query.Append(", V.vendedor_id, ");
                                query.Append("  MAX(V.Nombre_vendedor) Nombre_vendedor ");
                                break;
                            case "porComprobante":
                                if (string.IsNullOrEmpty(filtro.colComprobante))
                                    if (filtro.tipoReporte == "ventas" || filtro.tipoReporte == "devoluciones")
                                        query.Append(", TS.ncf ");
                                    else if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "conduces")
                                        query.Append(", TS.tipo_documento ");
                                break;
                            case "porMoneda":
                                if (string.IsNullOrEmpty(filtro.colMoneda))
                                    query.Append(", TS.moneda ");
                                break;
                            case "porFecha_Emision":
                                if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                    query.Append(", CONCAT(MONTH(TS.fecha_emision), '/', YEAR(TS.fecha_emision)) fecha_emision ");
                                else
                                    query.Append(", TS.fecha_emision ");
                                break;
                            case "porFecha_Vencimiento":
                                if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                    query.Append(", CONCAT(MONTH(TS.fecha_emision), '/', YEAR(TS.fecha_emision)) fecha_vcmto ");
                                else
                                    query.Append(", TS.fecha_vcmto ");
                                break;
                            case "porTermino_de_Pago":
                                query.Append(", TS.termino_id ");
                                if (string.IsNullOrEmpty(filtro.colTermino))
                                    query.Append(", MAX(TP.Descripcion_termino) descripcion_termino ");
                                break;
                            case "porCategorias_de_Clientes":
                                query.Append(", C.Categoria_Clte_id, ");
                                query.Append("  MAX(CC.descripcion_categ) descripcion_categ ");
                                break;
                        }
                }
            }
            else
            {
                query.Append($" TS.{TableSourceEntryId} nrodoc, ");
                query.Append("  TS.fecha_emision ");

                if (!filtro.GROUP)
                {
                    query.Append(", TS.fecha_vcmto, ");
                    query.Append("  UPPER(V.Nombre_vendedor) Nombre_vendedor, ");
                    query.Append("  UPPER(TP.Descripcion_termino) Descripcion_termino, ");
                    query.Append("  CASE TS.moneda ");
                    query.Append("      WHEN 0 THEN 'NACIONAL' ");
                    query.Append("      ELSE 'EXTRANJERA' ");
                    query.Append("      END moneda, ");
                    query.Append("  TS.dscto_monto, ");
                    query.Append("  TS.impuesto_monto ITBIS, ");
                    query.Append("  TS.clte_direccion1, ");
                    query.Append("  TS.total, ");
                    query.Append("  (CAST(TS.total AS FLOAT) - CAST(TS.impuesto_monto AS FLOAT)) SubTotalNeto ");

                    if (filtro.tipoReporte == "ventas" || filtro.tipoReporte == "devoluciones")
                        query.Append(", SUBSTRING(rtrim(TS.ncf), 1, 19) ncf ");
                    else if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "conduces")
                    {
                        query.Append(", SUBSTRING(rtrim(TS.tipo_documento), 1, 19) tipo_documento ");

                        query.Append(", CASE ");
                        query.Append("  WHEN len(TS.genero_factura2) > 1 THEN 'Fact2#' + ltrim(str(genero_factura2)) ");
                        query.Append("  WHEN len(TS.genero_factura3) >  1 THEN 'Fact3#' + ltrim(str(genero_factura3)) ");
                        query.Append("  WHEN len(genero_factura1 + genero_factura2 + genero_factura3) = 1 THEN 'Cerrado S/F' ");
                        query.Append("  WHEN len(genero_factura1 + genero_factura2 + genero_factura3) =  0 THEN 'Abierto' ");
                        query.Append("  END  Estatus ");
                    }
                }
                else
                {
                    query.Append($", (TDS.cantidad * TDS.{TableSourcePrecio}) + (TDS.impto_monto+TDS.impto2_monto - TDS.descto_monto) total, ");
                    query.Append("   CP.categoria_id, ");
                    query.Append("   P.descrip_producto, ");
                    query.Append($"  TDS.cantidad*TDS.{TableSourcePrecio} TPRECIO, ");
                    query.Append("   TDS.cantidad, ");
                    query.Append($"  TDS.{TableSourcePrecio}, ");
                    query.Append("   C.nombre_clte, ");
                    query.Append("   TDS.impto_monto ITBIS ");

                    if (!string.IsNullOrEmpty(filtro.colVendedor))
                        query.Append($", V.Nombre_vendedor ");
                    if (!string.IsNullOrEmpty(filtro.colComprobante))
                        if (filtro.tipoReporte == "ventas" || filtro.tipoReporte == "devoluciones")
                            query.Append(", Substring(Rtrim(TS.ncf), 1, 19) ncf ");
                        else if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "conduces")
                            query.Append(", SUBSTRING(Rtrim(TS.tipo_documento), 1, 19) tipo_documento ");
                    if (!string.IsNullOrEmpty(filtro.colTermino))
                        query.Append($", TP.Descripcion_termino ");
                    if (!string.IsNullOrEmpty(filtro.colMoneda))
                        query.Append($", TS.moneda ");

                    switch (filtro.tipoCorte)
                    {
                        case "porCategoria":
                            query.Append(", UPPER(CP.Descripcion_categ) Descripcion_categ ");
                            break;
                        case "porVendedor":
                            query.Append(", V.vendedor_id, ");
                            query.Append("  V.Nombre_vendedor ");
                            break;
                        case "porMoneda":
                            query.Append(", TS.moneda ");
                            break;
                        case "porComprobante":
                            if (filtro.tipoReporte == "ventas" || filtro.tipoReporte == "devoluciones")
                                query.Append(", TS.ncf ");
                            else if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "conduces")
                                query.Append(", TS.tipo_documento ");
                            break;
                        case "porFecha_Emision":
                            if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                query.Append(", CONCAT(MONTH(TS.fecha_emision), '/', YEAR(TS.fecha_emision)) fecha_emision ");
                            break;
                        case "porFecha_Vencimiento":
                            if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                query.Append(", CONCAT(MONTH(TS.fecha_emision), '/', YEAR(TS.fecha_emision)) fecha_vcmto ");
                            else
                                query.Append(", TS.fecha_vcmto ");
                            break;
                        case "porTermino_de_Pago":
                            query.Append(", TS.termino_id ");

                            if (string.IsNullOrEmpty(filtro.colTermino))
                                query.Append(", TP.Descripcion_termino ");
                            break;
                        case "porCategorias_de_Clientes":
                            query.Append(", C.Categoria_Clte_id, ");
                            query.Append("  CC.descripcion_categ ");
                            break;
                    }
                }
            }
            #endregion

            #region FROM
            query.Append("FROM ");
            query.Append($" {DbName}{TableSource} ");
            query.Append($", {DbName}vendedores V ");
            query.Append($", {DbName}clientes C ");

            if (!filtro.GROUP
                || !string.IsNullOrEmpty(filtro.colTermino)
                || filtro.tipoCorte == "porTermino_de_Pago")
                query.Append($",  {DbName}terminos_pago TP ");

            if (!string.IsNullOrEmpty(filtro.tipoConsulta))
                switch (filtro.tipoConsulta)
                {
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

                        if (!string.IsNullOrEmpty(filtro.tipoCorte))
                            switch (filtro.tipoCorte)
                            {
                                case "porCategorias_de_Clientes":
                                    query.Append($", {DbName}dbo.Categorias_clte CC ");
                                    break;
                            }
                        break;
                }
            #endregion

            #region WHERE
            query.Append("WHERE ");
            query.Append(" TS.vendedor_id = V.vendedor_id ");
            query.Append(" AND TS.cliente_id = C.cliente_id ");

            if (!string.IsNullOrEmpty(filtro.minFecha_emision))
                query.Append($"AND TS.fecha_emision >= '{filtro.minFecha_emision}' ");
            if (!string.IsNullOrEmpty(filtro.maxFecha_emision))
                query.Append($"AND TS.fecha_emision <= '{filtro.maxFecha_emision}' ");
            if (!string.IsNullOrEmpty(filtro.categoria_clte_id))
                query.Append($" AND C.Categoria_Clte_id = '{filtro.categoria_clte_id}' ");

            if (filtro.tipoReporte == "ventas" || filtro.tipoReporte == "devoluciones")
            {
                query.Append(" AND TS.anulada = 0 ");

                if (!string.IsNullOrEmpty(filtro.tipo_factura))
                    query.Append($"AND TS.tipo_factura >= '{filtro.tipo_factura}' ");
                if (!string.IsNullOrEmpty(filtro.Codigo_vendedor))
                    query.Append($"AND V.Codigo_vendedor = '{filtro.Codigo_vendedor}' ");
            }
            else if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "conduces")
            {
                if (!string.IsNullOrEmpty(filtro.estatus))
                    switch (filtro.estatus)
                    {
                        case "abierto":
                            query.Append($"AND len(genero_factura1 + genero_factura2 + genero_factura3) = 0 ");
                            break;
                        case "cerrado":
                            query.Append($"AND len(genero_factura1 + genero_factura2 + genero_factura3) >  1 ");
                            break;
                        case "cerradoSinFactura":
                            query.Append($"AND len(genero_factura1 + genero_factura2 + genero_factura3) =  1");
                            break;
                    }
            }

            switch (filtro.tipoConsulta)
            {
                case "RFA01":
                    if (!string.IsNullOrEmpty(filtro.desde))
                        query.Append($"AND SUBSTRING(STR(TS.{TableSourceEntryId}), Patindex('%[^0 ]%', STR(TS.{TableSourceEntryId}) + ' '), LEN(TS.{TableSourceEntryId})) >= CAST('{filtro.desde}' AS FLOAT) ");
                    if (!string.IsNullOrEmpty(filtro.hasta))
                        query.Append($"AND SUBSTRING(STR(TS.{TableSourceEntryId}), Patindex('%[^0 ]%', STR(TS.{TableSourceEntryId}) + ' '), LEN(TS.{TableSourceEntryId})) <= CAST('{filtro.hasta}' AS FLOAT) ");
                    break;
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
                    query.Append($" AND TS.{TableSourceID} = TDS.{TableSourceID} ");
                    query.Append("  AND TDS.producto_id = P.producto_id ");
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND P.descrip_producto LIKE '%{filtro.valor}%' ");
                    break;
                case "RFA0":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND NB.bodega_id = '{filtro.valor}' ");
                    break;
                case "RFA09":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        if (filtro.tipoReporte == "ventas" || filtro.tipoReporte == "devoluciones")
                            query.Append($"AND TS.ncf LIKE '%{filtro.valor}%' ");
                        else if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "conduces")
                            query.Append($"AND TS.tipo_documento LIKE '%{filtro.valor}%' ");
                    break;

                case "RFA08":
                    query.Append($" AND TS.{TableSourceID} = TDS.{TableSourceID} ");
                    query.Append("  AND TDS.producto_id = P.producto_id ");
                    query.Append("  AND P.Categoria_id = CP.categoria_id ");

                    if (!string.IsNullOrEmpty(filtro.valor))
                        switch (filtro.tipoCorte)
                        {
                            case "porCategoria":
                                query.Append($"AND CP.categoria_id = '{filtro.valor}' ");
                                break;
                            case "porCliente":
                                query.Append($"AND C.nombre_clte LIKE '%{filtro.valor}%' ");
                                break;
                            case "porVendedor":
                                query.Append($"AND V.Nombre_vendedor LIKE '%{filtro.valor}%' ");
                                break;
                            case "porMoneda":
                                query.Append($"AND TS.moneda = '%{filtro.valor}%' ");
                                break;
                            case "porComprobante":
                                if (filtro.tipoReporte == "ventas" || filtro.tipoReporte == "devoluciones")
                                    query.Append($"AND TS.ncf LIKE '%{filtro.valor}%' ");
                                else if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "conduces")
                                    query.Append($"AND TS.tipo_documento LIKE '%{filtro.valor}%' ");
                                break;
                            case "porTermino_de_Pago":
                                query.Append($"AND TS.termino_id = '%{filtro.valor}%' ");
                                break;
                            case "porCategorias_de_Clientes":
                                query.Append($"AND CC.categoria_clte_id = '%{filtro.valor}%' ");
                                break;
                        }
                    break;
            }

            if (!filtro.GROUP || !string.IsNullOrEmpty(filtro.colTermino) || filtro.tipoCorte == "porTermino_de_Pago")
                query.Append("AND TS.termino_id = TP.termino_id ");
            #endregion

            #region GROUP BY
            if (filtro.SUM && filtro.GROUP)
            {
                query.Append("GROUP BY ");

                switch (filtro.tipoConsulta)
                {
                    case "RFA08":
                        if (!string.IsNullOrEmpty(filtro.tipoCorte))
                            switch (filtro.tipoCorte)
                            {
                                case "porCategoria":
                                    query.Append(" TS.moneda ");
                                    break;
                                case "porCliente":
                                    query.Append(" C.nombre_clte ");
                                    break;
                                case "porVendedor":
                                    query.Append(" V.vendedor_id ");
                                    break;
                                case "porMoneda":
                                    query.Append(" TS.moneda ");
                                    break;
                                case "porComprobante":
                                    if (filtro.tipoReporte == "ventas" || filtro.tipoReporte == "devoluciones")
                                        query.Append(" TS.ncf ");
                                    else if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "conduces")
                                        query.Append(" TS.tipo_documento ");
                                    break;
                                case "porFecha_Emision":
                                    if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                        query.Append(" YEAR(TS.fecha_emision), MONTH(TS.fecha_emision) ");
                                    else
                                        query.Append(" TS.fecha_emision ");
                                    break;
                                case "porFecha_Vencimiento":
                                    if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                        query.Append(" YEAR(TS.fecha_emision), MONTH(TS.fecha_emision) ");
                                    else
                                        query.Append(" TS.fecha_vcmto ");
                                    break;
                                case "porTermino_de_Pago":
                                    query.Append(" TS.termino_id ");
                                    break;
                                case "porCategorias_de_Clientes":
                                    query.Append(" C.Categoria_Clte_id ");
                                    break;
                            }
                        break;
                }
            }
            else
            {
                switch (filtro.tipoConsulta)
                {
                    case "RFA06":
                        query.Append("GROUP BY ");
                        query.Append($" TS.{TableSourceEntryId}, ");
                        query.Append(" TS.fecha_emision, ");
                        query.Append(" TS.fecha_vcmto, ");
                        query.Append(" V.Nombre_vendedor, ");
                        query.Append(" Descripcion_termino, ");
                        query.Append(" TS.moneda, ");
                        query.Append(" TS.impuesto_monto, ");
                        query.Append(" TS.clte_direccion1, ");
                        query.Append(" TS.total, ");
                        query.Append(" TS.dscto_monto, ");
                        query.Append($" TS.{TableSourceID} ");

                        if (filtro.tipoReporte == "ventas" || filtro.tipoReporte == "devoluciones")
                            query.Append(", TS.ncf ");
                        else if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "conduces")
                            query.Append(", TS.tipo_documento ");

                        break;
                }
            }
            #endregion

            #region ORDER BY
            if (!filtro.SUM)
            {
                query.Append("ORDER BY ");
                switch (filtro.tipoConsulta)
                {
                    case "RFA02":
                        query.Append(" TS.total DESC ");
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
                    case "RFA0":
                        query.Append(" NB.Nombre_bodega ");
                        break;
                    case "RFA08":
                        if (!string.IsNullOrEmpty(filtro.tipoCorte))
                            switch (filtro.tipoCorte)
                            {
                                case "porCategoria":
                                    query.Append(" CP.Descripcion_categ ");
                                    break;
                                case "porCliente":
                                    query.Append(" C.nombre_clte ");
                                    break;
                                case "porVendedor":
                                    query.Append(" V.Nombre_vendedor ");
                                    break;
                                case "porMoneda":
                                    query.Append(" TS.moneda ");
                                    break;
                                case "porComprobante":
                                    if (filtro.tipoReporte == "ventas" || filtro.tipoReporte == "devoluciones")
                                        query.Append(" TS.ncf ");
                                    else if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "conduces")
                                        query.Append(" TS.tipo_documento ");
                                    break;
                                case "porFecha_Emision":
                                    if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                    {
                                        query.Append(" Year(TS.fecha_emision) DESC,  ");
                                        query.Append(" Month(TS.fecha_emision) DESC  ");
                                    }
                                    else
                                        query.Append(" TS.fecha_emision ");
                                    break;
                                case "porFecha_Vencimiento":
                                    if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                    {
                                        query.Append(" Year(TS.fecha_emision) DESC,  ");
                                        query.Append(" Month(TS.fecha_emision) DESC  ");
                                    }
                                    else
                                        query.Append(" TS.fecha_vcmto ");
                                    break;
                                case "porTermino_de_Pago":
                                    query.Append(" TP.Descripcion_termino ");
                                    break;
                                case "porCategorias_de_Clientes":
                                    query.Append(" CC.descripcion_categ ");
                                    break;
                            }
                        break;
                    case "RFA09":
                        query.Append(" C.cliente_id DESC ");
                        break;
                    default:
                        query.Append(" TS.fecha_emision DESC ");
                        break;
                }
                query.Append($", TS.{TableSourceEntryId} DESC ");

                if (!filtro.GROUP)
                {
                    query.Append($"OFFSET {filtro.skip * filtro.take} ROWS ");
                    query.Append($"FETCH NEXT {filtro.take} ROWS ONLY ");
                }
            }
            #endregion

            #region SUMAR DATOS AGRUPADOS
            if (filtro.SUM && !filtro.GROUP)
            {
                switch (filtro.tipoConsulta)
                {
                    case "RFA06":
                        var tmpQuery = query.ToString();
                        var demoSelect = new StringBuilder();
                        demoSelect.Append("SELECT ");
                        demoSelect.Append("TS.dscto_monto, ");
                        demoSelect.Append("TS.impuesto_monto ITBIS, ");
                        demoSelect.Append("TS.total, ");
                        demoSelect.Append("( TS.total - TS.impuesto_monto ) SubTotalNeto ");
                        int fromIndex = tmpQuery.IndexOf("FROM");
                        query.Clear();

                        tmpQuery = $"{demoSelect} {tmpQuery.Substring(fromIndex)}";

                        query.Append("SELECT ");
                        query.Append("COUNT(*) count, ");
                        query.Append("SUM(total) total, ");
                        query.Append("SUM(dscto_monto) dscto_monto, ");
                        query.Append("SUM(SubTotalNeto) subtotal, ");
                        query.Append("SUM(ITBIS) impuesto ");

                        query.Append("FROM (");
                        query.Append(tmpQuery);
                        query.Append(") resultset ");
                        break;
                }
            }
            #endregion

            return query.ToString();
        }
        #endregion

        #region DATA SUELTA
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

        public static string VendedoresInformacionQuery(string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  TRIM(Nombre_vendedor) Nombre_vendedor, ");
            query.Append("  TRIM(Codigo_vendedor) Codigo_vendedor ");
            query.Append($"FROM {DbName}dbo.vendedores ");
            query.Append($"ORDER BY Nombre_vendedor ");

            return query.ToString();
        }

        public static string ClienteQuery(FiltrosReportes filtro, string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT ");

            if (filtro.SUM)
                query.Append("COUNT(*) count ");
            else
            {
                query.Append("  TRIM(nombre_clte) nombre, ");
                query.Append("  codigo_clte codigo ");
            }

            query.Append($"FROM {DbName}dbo.clientes ");

            if (!string.IsNullOrEmpty(filtro.code))
                query.Append($"WHERE codigo_clte = '{filtro.code}'");
            if (!string.IsNullOrEmpty(filtro.name))
                query.Append($"WHERE nombre_clte LIKE '%{filtro.name}%'");

            if (!filtro.SUM)
            {
                query.Append($" ORDER BY nombre_clte ");
                query.Append($" OFFSET {filtro.skip * filtro.take} ROWS ");
                query.Append($" FETCH NEXT {filtro.take} ROWS ONLY ");
            }

            return query.ToString();
        }

        public static string ProveedoresQuery(FiltrosReportes filtro, string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT ");

            if (filtro.SUM)
                query.Append("COUNT(*) count ");
            else
            {
                query.Append("  TRIM(nombre_proveedor) nombre, ");
                query.Append("  codigo_proveedor codigo ");
            }

            query.Append($"FROM {DbName}dbo.proveedores ");

            if (!string.IsNullOrEmpty(filtro.code))
                query.Append($"WHERE codigo_proveedor = '{filtro.code}'");
            if (!string.IsNullOrEmpty(filtro.name))
                query.Append($"WHERE nombre_proveedor LIKE '%{filtro.name}%'");

            if (!filtro.SUM)
            {
                query.Append($" ORDER BY nombre_proveedor ");
                query.Append($" OFFSET {filtro.skip * filtro.take} ROWS ");
                query.Append($" FETCH NEXT {filtro.take} ROWS ONLY ");
            }

            return query.ToString();
        }

        public static string TerminosPagosQuery(string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  termino_id, ");
            query.Append("  TRIM(UPPER(Descripcion_termino)) Descripcion_termino ");
            query.Append($"FROM {DbName}dbo.terminos_pago ");
            query.Append("ORDER BY Descripcion_termino ");

            return query.ToString();
        }

        public static string BodegasQuery(string DbName = "")
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  bodega_id, ");
            query.Append("  TRIM(UPPER(Nombre_bodega)) Nombre_bodega ");
            query.Append($"FROM {DbName}dbo.nombre_bodegas ");
            query.Append("ORDER BY Nombre_bodega ");

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
        #endregion
    }
}