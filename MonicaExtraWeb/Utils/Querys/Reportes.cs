using MonicaExtraWeb.Models.DTO.Reportes;
using Newtonsoft.Json;
using System;
using System.Configuration;
using System.Linq;
using System.Text;
using static MonicaExtraWeb.Utils.Helper;
using static MonicaExtraWeb.Utils.Token.Claims;
using static MonicaExtraWeb.Utils.GlobalVariables;

namespace MonicaExtraWeb.Utils
{
    public class Reportes
    {
        #region REPORTES
        public static string IndividualClientQuery(Filtros filtro)
        {
            var query = new StringBuilder();

            string TableSource = "";
            string TableSourceName = "";
            string TableSourceID = "";
            string TableSourceEntryId = "";
            string TableDetilsSource = "";
            string TableSourceCodigo = "";
            string TableSourceDocumentoId = "";
            string TableDetailsNro_fiscal = "";
            string TablaTipoFactua = "";
            string TablaTipoFacturaCampoRef = "";
            string TablaSourceProveedorVendedor = "";
            string TableClienteProveedorId = "";
            string TableCategoriaClienteProveedor = "";
            string TableCategoriaClienteProveedorDescripcion = "";

            switch (filtro.tipoReporte)
            {
                case "porCobrar":
                    TableSource = "clientes TS";
                    TableDetilsSource = "docs_cc TDS";
                    TableSourceName = "nombre_clte nombre";
                    TableSourceID = "cliente_id";
                    TableSourceEntryId = "cc_id";
                    TableSourceCodigo = "codigo_clte";
                    TableSourceDocumentoId = "docs_cc_id";
                    TableDetailsNro_fiscal = "ncf";
                    TablaTipoFactua = "factura";
                    TablaTipoFacturaCampoRef = "nro_factura";
                    TablaSourceProveedorVendedor = "vendedor_id";
                    TableCategoriaClienteProveedor = "Categorias_clte";
                    TableClienteProveedorId = "categoria_clte_id";
                    TableCategoriaClienteProveedorDescripcion = "descripcion_categ";
                    break;
                case "porPagar":
                    TableSource = "proveedores TS";
                    TableDetilsSource = "docs_cp TDS";
                    TableSourceName = "nombre_proveedor nombre";
                    TableSourceID = "proveedor_id";
                    TableSourceEntryId = "cp_id";
                    TableSourceCodigo = "codigo_proveedor";
                    TableSourceDocumentoId = "docs_cp_id";
                    TableDetailsNro_fiscal = "ref_pago";
                    TablaTipoFactua = "orden_compra";
                    TablaTipoFacturaCampoRef = "nro_compra";
                    TablaSourceProveedorVendedor = "proveedor_id";
                    TableCategoriaClienteProveedor = "categorias_pv";
                    TableClienteProveedorId = "Categoria_idpv";
                    TableCategoriaClienteProveedorDescripcion = "descripcion_categpv";
                    break;
            }

            #region SELECT
            query.Append(" SELECT ");

            if (filtro.SUM)
            {
                query.Append(" SUM(TDS.monto_dcmto) sumatoriaMontos, ");
                query.Append(" SUM(TDS.balance) sumatoriaBalance, ");
                query.Append(" SUM(TDS.monto_dcmto - TDS.balance) sumatoriaPagosAcumulados ");

                if (filtro.tipoConsulta == "analisis_Grafico")
                {
                    switch (filtro.tipoCorte)
                    {
                        case "porFecha_Emision":
                            if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                query.Append(", CONCAT(MONTH(TDS.fecha_emision), '/', YEAR(TDS.fecha_emision)) fecha_emision ");
                            else
                                query.Append(", TDS.fecha_emision ");
                            break;
                        case "porFecha_Vencimiento":
                            if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                query.Append(", CONCAT(MONTH(TDS.fecha_emision), '/', YEAR(TDS.fecha_emision)) fecha_vcmto ");
                            else
                                query.Append(", TDS.fecha_vcmto ");
                            break;
                        case "porCliente":
                            query.Append($", TRIM(MAX(TS.nombre_clte)) nombre ");
                            break;
                        case "porVendedor":
                            query.Append($", TRIM(MAX(V.Nombre_vendedor)) Nombre_vendedor ");
                            break;
                        case "porCategorias_de_Clientes":
                            query.Append($", TRIM(CCP.{TableCategoriaClienteProveedorDescripcion}) CCPDescripcion ");
                            break;
                    }
                }
            }
            else
            {
                query.Append("  TDS.fecha_emision ");
                query.Append(",  TDS.monto_dcmto monto ");
                query.Append(",  TDS.balance ");
                query.Append(",  TDS.fecha_vcmto ");
                query.Append(",  TDS.balance ");
                query.Append(",  (TDS.monto_dcmto - TDS.balance) pagosAcumulados ");

                if (filtro.tipoReporte == "porCobrar")
                    query.Append(",  TRIM(V.Nombre_vendedor) Nombre_vendedor ");
                else if (filtro.tipoReporte == "porPagar")
                    query.Append(",  TS.vendedor Nombre_vendedor ");

                if (filtro.descripcionSimplificada)
                    query.Append($", REPLACE(REPLACE(TDS.descripcion_dcmto, ' - Cuota unica', ''), ' - CUOTA DIFERIDA', '') descripcion_dcmto ");
                else
                    query.Append(", TDS.descripcion_dcmto ");
                if (!string.IsNullOrEmpty(filtro.colComprobante))
                    query.Append($", SUBSTRING(rtrim(TDS.{TableDetailsNro_fiscal}),1, 19) ncf ");
                if (!string.IsNullOrEmpty(filtro.incluirNumero))
                    query.Append(", TDS.nro_dcmto ");
                if (!string.IsNullOrEmpty(filtro.incluirTipo))
                    query.Append(",  TDS.tipo ");
                if (!string.IsNullOrEmpty(filtro.incluirCodCliente))
                    query.Append($", TS.{TableSourceCodigo} ");
                if (!string.IsNullOrEmpty(filtro.incluirNombre))
                    query.Append($", TRIM(TS.{TableSourceName.Replace(" nombre", "")}) nombre ");

                if (filtro.tipoConsulta == "analisis_Grafico")
                {
                    switch (filtro.tipoCorte)
                    {
                        case "porFecha_Emision":
                            if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                query.Append(", CONCAT(MONTH(TDS.fecha_emision), '/', YEAR(TDS.fecha_emision)) fecha_emision ");
                            else
                                query.Append(", TDS.fecha_emision ");
                            break;
                        case "porFecha_Vencimiento":
                            if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                query.Append(", CONCAT(MONTH(TDS.fecha_emision), '/', YEAR(TDS.fecha_emision)) fecha_vcmto ");
                            else
                                query.Append(", TDS.fecha_vcmto ");
                            break;
                        case "porCategorias_de_Clientes":
                            query.Append($", TRIM(CCP.{TableCategoriaClienteProveedorDescripcion}) CCPDescripcion ");
                            break;
                    }
                }
            }
            #endregion

            #region FROM
            query.Append($" FROM {filtro.conn}.dbo.{TableSource} ");
            query.Append($" JOIN {filtro.conn}.dbo.{TableDetilsSource} ON TS.{TableSourceID} = TDS.{TableSourceID} ");

            if (filtro.tipoReporte == "porCobrar")
                query.Append($" JOIN {filtro.conn}.dbo.vendedores V ON V.vendedor_id = TS.{TablaSourceProveedorVendedor} ");

            if (!string.IsNullOrEmpty(filtro.tipoConsulta))
            {
                switch (filtro.tipoConsulta)
                {
                    case "RFA01":
                        if (!string.IsNullOrEmpty(filtro.opcion))
                            query.Append($" JOIN {filtro.conn}.dbo.{TablaTipoFactua} F ON TDS.{TableSourceEntryId} = F.{TableSourceDocumentoId} ");
                        break;
                    case "RFA03":
                        query.Append($" JOIN {filtro.conn}.dbo.terminos_pago TP ON TDS.termino_idpv = TP.termino_id ");
                        break;
                    case "analisis_Grafico":
                        switch (filtro.tipoCorte)
                        {
                            case "porCategorias_de_Clientes":
                                query.Append($" JOIN {filtro.conn}.dbo.{TableCategoriaClienteProveedor} CCP ON TS.{TableClienteProveedorId} = REPLACE(CCP.{TableClienteProveedorId}, '\"', '') ");
                                break;
                        }
                        break;
                }
            }
            #endregion

            #region WHERE
            query.Append("  WHERE TDS.Estado_registro = '0' ");
            query.Append("  AND TDS.balance > 0 ");

            if (filtro.tipoReporte == "porCobrar")
                query.Append("  AND TDS.tipo = 'D' ");
            if (filtro.tipoReporte == "porPagar")
                query.Append("  AND TDS.tipo = 'C' ");

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
                    if (!string.IsNullOrEmpty(filtro.opcion))
                    {
                        switch (filtro.opcion)
                        {
                            case "documento":
                                if (!string.IsNullOrEmpty(filtro.desde))
                                    query.Append($"AND SUBSTRING(STR(TDS.nro_dcmto), Patindex('%[^0 ]%', STR(TDS.nro_dcmto) + ' '), LEN(TDS.nro_dcmto)) >= CAST('{filtro.desde}' AS FLOAT) ");
                                if (!string.IsNullOrEmpty(filtro.hasta))
                                    query.Append($"AND SUBSTRING(STR(TDS.nro_dcmto), Patindex('%[^0 ]%', STR(TDS.nro_dcmto) + ' '), LEN(TDS.nro_dcmto)) <= CAST('{filtro.hasta}' AS FLOAT) ");
                                break;
                            case "factura":
                                if (!string.IsNullOrEmpty(filtro.desde))
                                    query.Append($"AND F.{TablaTipoFacturaCampoRef} >= '{filtro.desde}' ");
                                if (!string.IsNullOrEmpty(filtro.hasta))
                                    query.Append($"AND F.{TablaTipoFacturaCampoRef} <= '{filtro.hasta}' ");
                                break;
                        }
                    }
                    break;
                case "RFA02":
                    if (!string.IsNullOrEmpty(filtro.desde))
                        query.Append($"AND TDS.Monto_dcmto >= '{filtro.desde}' ");
                    if (!string.IsNullOrEmpty(filtro.hasta))
                        query.Append($"AND TDS.Monto_dcmto <= '{filtro.hasta}' ");
                    break;
                case "RFA03":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND TP.termino_id = '{filtro.valor}' ");
                    break;
                case "RFA09":
                    if (!string.IsNullOrEmpty(filtro.comprobante))
                    {
                        if (filtro.soloNCFFormatoElectronico == null
                            || string.IsNullOrEmpty(filtro.soloNCFFormatoElectronico))
                        {
                            query.Append($"AND SUBSTRING(TRIM(TDS.{TableDetailsNro_fiscal}), 1, 3) = 'B{ComprobanteDictionary(filtro.comprobante)}' ");
                            query.Append($"OR SUBSTRING(TRIM(TDS.{TableDetailsNro_fiscal}), 1, 1) + SUBSTRING(TRIM(TDS.{TableDetailsNro_fiscal}), 10, 2) = 'A{ComprobanteDictionary(filtro.comprobante)}' ");
                        }
                        if (!string.IsNullOrEmpty(filtro.tipoReporte))
                            if (filtro.tipoReporte == "porPagar")
                                query.Append($" OR SUBSTRING(TRIM(TDS.{TableDetailsNro_fiscal}), 1, 1) + SUBSTRING(TRIM(TDS.{TableDetailsNro_fiscal}), 10, 2) = 'E{ComprobanteDictionary(filtro.comprobante)}' ");
                    }
                    break;
                case "analisis_Grafico":
                    switch (filtro.tipoCorte)
                    {
                        case "porCliente":
                            if (!string.IsNullOrEmpty(filtro.valor))
                                query.Append($"AND TS.{TableSourceName.Replace(" nombre", "")} LIKE '%{filtro.valor}%' ");
                            break;
                        case "porVendedor":
                            if (!string.IsNullOrEmpty(filtro.valor))
                                query.Append($"AND V.Nombre_vendedor LIKE '%{filtro.valor}%' ");
                            break;
                        case "porCategorias_de_Clientes":
                            if (!string.IsNullOrEmpty(filtro.valor))
                                query.Append($"AND CCP.categoria_clte_id = '%{filtro.valor}%' ");
                            break;
                    }

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
                        query.Append(" TDS.Monto_dcmto ");
                        break;
                    case "RFA03":
                        query.Append(" TP.Descripcion_termino ");
                        break;
                    case "estadoCuentaIndividual":
                        query.Append($" TS.{TableSourceName.Replace(" nombre", "")} ");
                        break;
                    default:
                        query.Append(" TDS.fecha_emision DESC ");
                        break;
                }
                query.Append($", TDS.{TableSourceEntryId} DESC ");
            }
            #endregion

            #region GROUP BY
            if (filtro.SUM && filtro.GROUP)
            {
                query.Append("GROUP BY ");

                switch (filtro.tipoCorte)
                {
                    case "porFecha_Emision":
                        if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                            query.Append(" YEAR(TDS.fecha_emision), MONTH(TDS.fecha_emision) ");
                        else
                            query.Append(" TDS.fecha_emision ");
                        break;
                    case "porFecha_Vencimiento":
                        if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                            query.Append(" YEAR(TDS.fecha_emision), MONTH(TDS.fecha_emision) ");
                        else
                            query.Append(" TDS.fecha_vcmto ");
                        break;
                    case "porCliente":
                        query.Append("TS.cliente_id ");
                        break;
                    case "porVendedor":
                        query.Append("V.Nombre_vendedor ");
                        break;
                    case "porCategorias_de_Clientes":
                        query.Append($"CCP.{TableCategoriaClienteProveedorDescripcion} ");
                        break;
                }
            }
            #endregion

            return query.ToString();
        }

        public static string VentasDevolucionesCategoriaYVendedor(Filtros filtro)
        {
            var query = new StringBuilder();

            string TableSource = "";
            string TableSourceID = "";
            string TableSourceEntryNro = "";
            string TableSourcePrecio = "";
            string TableDetilsSource = "";
            string TableSourceComprobante = "";

            switch (filtro.tipoReporte)
            {
                case "ventas":
                    TableSource = "factura TS";
                    TableDetilsSource = "factura_detalle TDS";
                    TableSourceID = "factura_id";
                    TableSourceEntryNro = "nro_factura";
                    TableSourcePrecio = "precio_factura";
                    TableSourceComprobante = "ncf";
                    break;
                case "devoluciones":
                    TableSource = "devolucion_clte TS";
                    TableDetilsSource = "devolucion_clte_detalle TDS";
                    TableSourceID = "devolucion_clte_id";
                    TableSourceEntryNro = "nro_devolucion_clte";
                    TableSourcePrecio = "precio_devolucion_clte";
                    TableSourceComprobante = "ncf";
                    break;
                case "cotizaciones":
                case "pedidos":
                    TableSource = "estimado TS";
                    TableDetilsSource = "estimado_detalle TDS";
                    TableSourceID = "estimado_id";
                    TableSourceEntryNro = "nro_estimado";
                    TableSourcePrecio = "precio_estimado";
                    TableSourceComprobante = "tipo_documento";
                    break;
                case "conduces":
                    TableSource = "consignacion TS";
                    TableDetilsSource = "consignacion_detalle TDS";
                    TableSourceID = "consignacion_id";
                    TableSourceEntryNro = "nro_consignacion";
                    TableSourcePrecio = "precio_consignacion";
                    TableSourceComprobante = "tipo_documento";
                    break;
            }

            #region SELECT
            query.Append(" SELECT ");

            if (filtro.SUM)
            {
                query.Append(" COUNT(*) count, ");

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

                    if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "conduces")
                        query.Append($", SUM(TDS.{TableSourcePrecio}) precio_estimado ");

                    if (!string.IsNullOrEmpty(filtro.tipoCorte))
                        switch (filtro.tipoCorte)
                        {
                            case "porCategoria":
                                query.Append(", MAX(CP.Descripcion_categ) Descripcion_categ, ");
                                query.Append("  MAX(CP.categoria_id) categoria_id ");
                                break;
                            case "porCliente":
                                query.Append(", TS.clte_direccion1 ");
                                break;
                            case "porVendedor":
                                query.Append(", V.vendedor_id, ");
                                query.Append("  MAX(V.Nombre_vendedor) Nombre_vendedor ");
                                break;
                            case "porComprobante":
                                query.Append($", Substring(Trim(TS.{TableSourceComprobante}), 1, 3) ncf ");
                                //query.Append($", Substring(Trim(TS.{TableSourceComprobante}), 1, 1) + Substring(Trim(TS.{TableSourceComprobante}), 10, 2) ncf ");
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
                query.Append($" TS.{TableSourceEntryNro} nrodoc, ");
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
                        query.Append("  WHEN len(genero_factura1 + genero_factura2 + genero_factura3) > 1 THEN 'Cerrado' ");
                        query.Append("  WHEN len(genero_factura1 + genero_factura2 + genero_factura3) =  0 THEN 'Abierto' ");
                        query.Append("  END  Estatus ");

                        if (filtro.estatus != "abierto")
                        {
                            query.Append(", CASE ");
                            query.Append("  WHEN len(TS.genero_factura1) >  1 THEN 'Fact1#'+ltrim(str(genero_factura1)) ");
                            query.Append("  WHEN len(TS.genero_factura2) >  1 THEN 'Fact2#'+ltrim(str(genero_factura2)) ");
                            query.Append("  WHEN len(TS.genero_factura3) >  1 THEN 'Fact3#'+ltrim(str(genero_factura3)) ");
                            query.Append("  END  FacturaGenerda ");
                        }
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
                    query.Append("   TS.clte_direccion1, ");
                    query.Append("   TDS.impto_monto ITBIS ");

                    if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "conduces")
                    {
                        query.Append(", SUBSTRING(rtrim(TS.tipo_documento), 1, 19) tipo_documento ");

                        query.Append(", CASE ");
                        query.Append("  WHEN len(TS.genero_factura2) > 1 THEN 'Fact2#' + ltrim(str(genero_factura2)) ");
                        query.Append("  WHEN len(TS.genero_factura3) >  1 THEN 'Fact3#' + ltrim(str(genero_factura3)) ");
                        query.Append("  WHEN len(genero_factura1 + genero_factura2 + genero_factura3) = 1 THEN 'Cerrado S/F' ");
                        query.Append("  WHEN len(genero_factura1 + genero_factura2 + genero_factura3) > 1 THEN 'Cerrado' ");
                        query.Append("  WHEN len(genero_factura1 + genero_factura2 + genero_factura3) =  0 THEN 'Abierto' ");
                        query.Append("  END  Estatus ");
                    }

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
                            query.Append($", Substring(Trim(TS.{TableSourceComprobante}), 1, 3) ncf ");
                            //query.Append($", Substring(Trim(ts.{TableSourceComprobante}), 1, 1) + Substring(Trim(ts.{TableSourceComprobante}), 10, 2) ncf ");
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
            query.Append($" {filtro.conn}.dbo.{TableSource} ");
            //query.Append($", {filtro.conn}.dbo.vendedores V ");
            //query.Append($", {filtro.conn}.dbo.clientes C ");
            query.Append($" INNER JOIN {filtro.conn}.dbo.vendedores V ON TS.vendedor_id = V.vendedor_id ");
            query.Append($" INNER JOIN {filtro.conn}.dbo.clientes C ON TS.cliente_id = C.cliente_id  ");

            if (!string.IsNullOrEmpty(filtro.tipoConsulta))
            {
                switch (filtro.tipoConsulta)
                {
                    case "RFA0":
                        query.Append($", {filtro.conn}.dbo.nombre_bodegas NB ");
                        break;
                    case "RFA06":
                        //query.Append($", {filtro.conn}.dbo.{TableDetilsSource} ");
                        //query.Append($", {filtro.conn}.dbo.productos P ");
                        query.Append($" INNER JOIN {filtro.conn}.dbo.{TableDetilsSource} ON TS.{TableSourceID} = TDS.{TableSourceID} ");
                        query.Append($" INNER JOIN {filtro.conn}.dbo.productos P ON TDS.producto_id = P.producto_id ");
                        break;
                    case "RFA08":
                        //query.Append($", {filtro.conn}.dbo.productos P ");
                        //query.Append($", {filtro.conn}.dbo.{TableDetilsSource} ");
                        //query.Append($", {filtro.conn}.dbo.categoria_producto CP ");
                        query.Append($" INNER JOIN {filtro.conn}.dbo.{TableDetilsSource} ON TS.{TableSourceID} = TDS.{TableSourceID} ");
                        query.Append($" INNER JOIN {filtro.conn}.dbo.productos P ON TDS.producto_id = P.producto_id ");
                        query.Append($" LEFT JOIN {filtro.conn}.dbo.categoria_producto CP ON CP.categoria_id = P.categoria_id ");

                        if (!string.IsNullOrEmpty(filtro.tipoCorte))
                            switch (filtro.tipoCorte)
                            {
                                case "porCategorias_de_Clientes":
                                    query.Append($", {filtro.conn}.dbo.Categorias_clte CC ");
                                    break;
                            }
                        break;
                }
            }
            if (!filtro.GROUP
                || !string.IsNullOrEmpty(filtro.colTermino)
                || filtro.tipoCorte == "porTermino_de_Pago")
                query.Append($",  {filtro.conn}.dbo.terminos_pago TP ");
            #endregion

            #region WHERE
            query.Append("WHERE ");
            //query.Append(" TS.vendedor_id = V.vendedor_id ");
            //query.Append(" AND TS.cliente_id = C.cliente_id ");

            //if (!string.IsNullOrEmpty(filtro.minFecha_emision))
            //    query.Append($"AND TS.fecha_emision >= '{filtro.minFecha_emision}' ");
            query.Append($" TS.fecha_emision >= '{filtro.minFecha_emision}' ");
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
            else if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "pedidos" || filtro.tipoReporte == "conduces")
            {
                if (filtro.tipoReporte == "cotizaciones")
                    query.Append(" AND tipo_envio <> 'P' ");
                else if (filtro.tipoReporte == "pedidos")
                    query.Append(" AND tipo_envio = 'P' ");

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
                        query.Append($"AND SUBSTRING(STR(TS.{TableSourceEntryNro}), Patindex('%[^0 ]%', STR(TS.{TableSourceEntryNro}) + ' '), LEN(TS.{TableSourceEntryNro})) >= CAST('{filtro.desde}' AS FLOAT) ");
                    if (!string.IsNullOrEmpty(filtro.hasta))
                        query.Append($"AND SUBSTRING(STR(TS.{TableSourceEntryNro}), Patindex('%[^0 ]%', STR(TS.{TableSourceEntryNro}) + ' '), LEN(TS.{TableSourceEntryNro})) <= CAST('{filtro.hasta}' AS FLOAT) ");
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
                    //query.Append($" AND TS.{TableSourceID} = TDS.{TableSourceID} ");
                    //query.Append("  AND TDS.producto_id = P.producto_id ");
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND P.descrip_producto LIKE '%{filtro.valor}%' ");
                    break;
                case "RFA0":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND NB.bodega_id = '{filtro.valor}' ");
                    break;
                case "RFA09":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND TS.{TableSourceComprobante} LIKE '%{filtro.valor}%' ");
                    break;

                case "RFA08":
                    //query.Append($" AND TS.{TableSourceID} = TDS.{TableSourceID} ");
                    //query.Append("  AND TDS.producto_id = P.producto_id ");
                    //query.Append(" AND P.Categoria_id = CP.categoria_id ");

                    if (!string.IsNullOrEmpty(filtro.valor))
                        switch (filtro.tipoCorte)
                        {
                            case "porCategoria":
                                query.Append($"AND CP.categoria_id = '{filtro.valor}' ");
                                break;
                            case "porCliente":
                                query.Append($"AND TS.clte_direccion1 LIKE '%{filtro.valor}%' ");
                                break;
                            case "porVendedor":
                                query.Append($"AND V.Nombre_vendedor LIKE '%{filtro.valor}%' ");
                                break;
                            case "porMoneda":
                                query.Append($"AND TS.moneda = '%{filtro.valor}%' ");
                                break;
                            case "porComprobante":
                                if (!string.IsNullOrEmpty(filtro.valor))
                                    query.Append($"AND TS.{TableSourceComprobante} LIKE '%{filtro.valor}%' ");
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

            #region AGREGANDO CONTENIDO EXTRA AL WHERE SEGUN ALGUNA CONDICION
            switch (filtro.tipoConsulta)
            {
                case "RFA09":
                    if (!string.IsNullOrEmpty(filtro.comprobante))
                    {
                        if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "pedidos" || filtro.tipoReporte == "conduces")
                            query.Append($"AND TS.tipo_documento = '{ComprobanteDictionary(filtro.comprobante, true)}' ");
                        else
                        {
                            query.Append($"AND ts.{TableSourceEntryNro} IN ( ");
                            query.Append($"SELECT {TableSourceEntryNro} ");
                            query.Append($"FROM {filtro.conn}.dbo.{TableSource} ");
                            query.Append($"WHERE SUBSTRING(TRIM(TS.{TableSourceComprobante}), 1, 3) = 'B{ComprobanteDictionary(filtro.comprobante)}' ");
                            query.Append($"OR SUBSTRING(TRIM(TS.{TableSourceComprobante}), 1, 1) + SUBSTRING(TRIM(TS.{TableSourceComprobante}), 10, 2) = 'A{ComprobanteDictionary(filtro.comprobante)}') ");
                        }
                    }
                    break;
            }
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
                                    query.Append(" P.Categoria_id ");
                                    break;
                                case "porCliente":
                                    query.Append(" TS.clte_direccion1 ");
                                    break;
                                case "porVendedor":
                                    query.Append(" V.vendedor_id ");
                                    break;
                                case "porMoneda":
                                    query.Append(" TS.moneda ");
                                    break;
                                case "porComprobante":
                                    query.Append($" Substring(Trim(TS.{TableSourceComprobante}), 1, 3) ");
                                    //query.Append($" Substring(Trim(TS.{TableSourceComprobante}), 1, 1) + Substring(Trim(TS.{TableSourceComprobante}), 10, 2) ");
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
                if (filtro.tipoReporte == "ventas" || filtro.tipoReporte == "devoluciones")
                {
                    switch (filtro.tipoConsulta)
                    {
                        case "RFA06":
                            query.Append("GROUP BY ");
                            query.Append($" TS.{TableSourceEntryNro}, ");
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
                            query.Append(", TS.ncf ");
                            break;
                    }
                }
                else if (filtro.tipoReporte == "cotizaciones" || filtro.tipoReporte == "pedidos" || filtro.tipoReporte == "conduces")
                {
                    switch (filtro.tipoConsulta)
                    {
                        case "RFA06":
                            query.Append("GROUP BY ");
                            query.Append($" TS.{TableSourceEntryNro}, ");
                            query.Append(" TS.fecha_emision, ");
                            query.Append(" TS.fecha_vcmto, ");
                            query.Append(" V.Nombre_vendedor, ");
                            query.Append(" Descripcion_termino, ");
                            query.Append(" TS.moneda, ");
                            query.Append(" TS.dscto_monto, ");
                            query.Append(" TS.impuesto_monto, ");
                            query.Append(" TS.clte_direccion1, ");
                            query.Append(" TS.total, ");
                            query.Append(" TS.tipo_documento, ");
                            query.Append(" TS.genero_factura1, ");
                            query.Append(" TS.genero_factura2, ");
                            query.Append(" TS.genero_factura3 ");
                            break;
                    }
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
                                    query.Append(" TS.clte_direccion1 ");
                                    break;
                                case "porVendedor":
                                    query.Append(" V.Nombre_vendedor ");
                                    break;
                                case "porMoneda":
                                    query.Append(" TS.moneda ");
                                    break;
                                case "porComprobante":
                                    query.Append($" TS.{TableSourceComprobante} ");
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
                query.Append($", TS.{TableSourceEntryNro} DESC ");

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

        public static string InventarioYLiquidacion(Filtros filtro)
        {
            var query = new StringBuilder();
            var whereQuery = new StringBuilder();

            #region SELECT
            query.Append("  SELECT ");

            if (filtro.SUM)
            {
                query.Append("  COUNT(*) count ");
                query.Append(", SUM(P.precio1) precio1 ");
                query.Append(", SUM(P.precio2) precio2 ");
                query.Append(", SUM(P.precio3) precio3 ");
                query.Append(", SUM(P.precio4) precio4 ");

                if (filtro.tipoConsulta == "RFA08")
                {
                    query.Append(", TRIM(MAX(codigo_producto)) codigo_producto ");
                    switch (filtro.tipoCorte)
                    {
                        case "porLos_Mas_Vendidos":
                        case "porLos_Menos_Vendidos":
                            query.Append(", MAX(TS.totalCantidadMonto) totalCantidadMonto ");
                            query.Append(", TRIM(descrip_producto) descrip_producto ");
                            break;
                        case "porCategoria":
                            query.Append(", TRIM(MAX(CP.descripcion_categ)) descripcion_categ ");
                            break;
                    }
                }
            }
            else
            {
                query.Append("  P.codigo_producto ");
                query.Append(", P.producto_fisico ");
                query.Append(", P.situacion_producto ");
                query.Append(", P.Sub_categoria_id ");
                query.Append(", P.descrip_producto ");
                query.Append(", P.precio1 ");
                query.Append(", P.precio2 ");
                query.Append(", P.precio3 ");
                query.Append(", P.precio4 ");
                query.Append(", NB.Nombre_bodega ");
                query.Append(", P.cant_total ");
                query.Append(", P.ultima_venta ");
                query.Append(", UN.descripcion_unidad ");
                query.Append(", TRIM(CP.descripcion_categ) descripcion_categ ");
                query.Append(", SCP.descripcion_sub_categ ");

                if (filtro.tipoCorte == "porLos_Mas_Vendidos"
                    || filtro.tipoCorte == "porLos_Menos_Vendidos")
                    query.Append(", TS.totalCantidadMonto ");
            }
            #endregion

            #region FROM
            query.Append($" FROM ");

            if (filtro.tipoCorte == "porLos_Mas_Vendidos"
                   || filtro.tipoCorte == "porLos_Menos_Vendidos")
            {
                var ordern = filtro.tipoCorte == "porLos_Mas_Vendidos" ? "DESC" : "";
                var unidadesOMontos = filtro.agrupacionProductos == "unidades" ? "SUM(cantidad)" : "SUM(cantidad * precio_factura)";

                switch (filtro.agrupacionProductos)
                {
                    case "unidades":
                    case "montos":
                        query.Append("( ");
                        query.Append(" SELECT ");
                        query.Append($" TOP {filtro.take} producto_id ");
                        query.Append($", {unidadesOMontos} totalCantidadMonto ");
                        query.Append(" FROM ");
                        query.Append($"{filtro.conn}.dbo.factura_detalle ");

                        if (!string.IsNullOrEmpty(filtro.minFecha_emision)
                            && !string.IsNullOrEmpty(filtro.maxFecha_emision))
                        {
                            query.Append(" WHERE ");
                            query.Append($"fecha_emision >= '{filtro.minFecha_emision}' ");
                            query.Append($" AND fecha_emision <= '{filtro.maxFecha_emision}' ");
                        }

                        query.Append(" GROUP BY producto_id ");
                        query.Append($" ORDER BY {unidadesOMontos} {ordern} ");
                        query.Append(" ) TS ");

                        query.Append($" JOIN {filtro.conn}.dbo.productos P ON TS.producto_id = P.producto_id ");

                        break;
                }
            }
            else
                query.Append($" {filtro.conn}.dbo.productos P ");

            query.Append($" JOIN {filtro.conn}.dbo.categoria_producto CP ON P.Categoria_id = CP.categoria_id ");
            query.Append($" JOIN {filtro.conn}.dbo.nombre_bodegas NB ON P.bodega_id = NB.bodega_id ");
            query.Append($" JOIN {filtro.conn}.dbo.sub_categoria_producto SCP ON p.Categoria_id = scp.categoria_id ");
            query.Append($" JOIN {filtro.conn}.dbo.unidades UN ON UN.unidad_id = P.unidad_en_venta ");
            #endregion

            #region WHERE
            whereQuery.Append("WHERE ");

            if (!string.IsNullOrEmpty(filtro.estatus))
                whereQuery.Append($" P.producto_fisico = '{filtro.estatus}' ");
            if (!string.IsNullOrEmpty(filtro.subCategoriaProductos))
            {
                if (whereQuery.Length > 6)
                    whereQuery.Append("AND ");
                whereQuery.Append($" P.Sub_categoria_id = '{filtro.subCategoriaProductos}' ");
            }
            if (!string.IsNullOrEmpty(filtro.categoriaProductos))
            {
                if (whereQuery.Length > 6)
                    whereQuery.Append("AND ");
                whereQuery.Append($" CP.categoria_id = '{filtro.categoriaProductos}' ");
            }
            if (!string.IsNullOrEmpty(filtro.bodega))
            {
                if (whereQuery.Length > 6)
                    whereQuery.Append("AND ");
                whereQuery.Append($" P.bodega_id = '{filtro.bodega}' ");
            }
            if (!string.IsNullOrEmpty(filtro.soloPrroductosConExistencia))
            {
                if (whereQuery.Length > 6)
                    whereQuery.Append("AND ");
                whereQuery.Append($" P.cant_total > 0 ");
            }
            if (string.IsNullOrEmpty(filtro.agregarProductosInactivos))
            {
                if (whereQuery.Length > 6)
                    whereQuery.Append("AND ");
                whereQuery.Append($" P.situacion_producto = 1 ");
            }

            switch (filtro.tipoConsulta)
            {
                case "porCodigo":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (whereQuery.Length > 6)
                            whereQuery.Append("AND ");
                        whereQuery.Append($" P.codigo_producto LIKE '%{filtro.valor}%' ");
                    }
                    break;
                case "porDescripcion":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (whereQuery.Length > 6)
                            whereQuery.Append("AND ");
                        whereQuery.Append($" P.descrip_producto LIKE '%{filtro.valor}%' ");
                    }
                    break;
                case "porPrecio":
                    if (!string.IsNullOrEmpty(filtro.desde))
                    {
                        if (whereQuery.Length > 6)
                            whereQuery.Append("AND ");
                        whereQuery.Append($" P.precio1 >= '{filtro.desde}' ");
                    }
                    if (!string.IsNullOrEmpty(filtro.hasta))
                    {
                        if (whereQuery.Length > 6)
                            whereQuery.Append("AND ");
                        whereQuery.Append($" P.precio1 <= '{filtro.hasta}' ");
                    }
                    break;
                case "porCantidad_En_Almacen":
                    if (!string.IsNullOrEmpty(filtro.desde))
                    {
                        if (whereQuery.Length > 6)
                            whereQuery.Append("AND ");
                        whereQuery.Append($" P.cant_total >= '{filtro.desde}' ");
                    }
                    if (!string.IsNullOrEmpty(filtro.hasta))
                    {
                        if (whereQuery.Length > 6)
                            whereQuery.Append("AND ");
                        whereQuery.Append($" P.cant_total <= '{filtro.hasta}' ");
                    }
                    break;
                case "porProveedor":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (whereQuery.Length > 6)
                            whereQuery.Append("AND ");
                        whereQuery.Append($" P.Sub_categoria_id = '{filtro.valor}' ");
                    }
                    break;
                case "RFA08":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        switch (filtro.tipoCorte)
                        {
                            case "porCategoria":
                                if (whereQuery.Length > 6)
                                    whereQuery.Append("AND ");

                                whereQuery.Append($" P.Sub_categoria_id = '{filtro.valor}' ");
                                break;
                        }
                    break;
            }

            if (whereQuery.Length > 6)
                query.Append(whereQuery.ToString());
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
                                case "porLos_Mas_Vendidos":
                                case "porLos_Menos_Vendidos":
                                    query.Append(" P.descrip_producto ");
                                    break;
                                case "porCategoria":
                                    query.Append(" CP.Descripcion_categ ");
                                    break;
                            }
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
                    case "porCodigo":
                        query.Append(" P.codigo_producto ");
                        break;
                    case "porDescripcion":
                        query.Append(" P.descrip_producto ");
                        break;
                    case "porPrecio":
                        query.Append(" P.precio1 DESC ");
                        break;
                    case "porCantidad_En_Almacen":
                        query.Append(" P.cant_total ");
                        break;
                    case "porCategoria_Y_Sub_Categoria":
                        query.Append(" SCP.descripcion_sub_categ ");
                        break;
                    case "RFA08":
                        if (!string.IsNullOrEmpty(filtro.tipoCorte))
                            switch (filtro.tipoCorte)
                            {
                                case "porLos_Mas_Vendidos":
                                case "porLos_Menos_Vendidos":
                                    query.Append(" TS.totalCantidadMonto DESC ");
                                    query.Append(", P.descrip_producto ");
                                    break;
                                case "porCategoria":
                                    query.Append(" P.descrip_producto ");
                                    break;
                            }
                        break;
                }

                if (!filtro.GROUP)
                {
                    query.Append($"OFFSET {filtro.skip * filtro.take} ROWS ");
                    query.Append($"FETCH NEXT {filtro.take} ROWS ONLY ");
                }
            }
            #endregion

            return query.ToString();
        }

        public static string ComprasDevolucionesCotizaciones(Filtros filtro)
        {
            var query = new StringBuilder();

            var TableSource = "";
            var TableSourceId = "";
            var TableSourceDetails = "";

            var ColumnNro = "";

            switch (filtro.tipoReporte)
            {
                case "cotizaciones":
                    TableSource = "Cotizacion";
                    TableSourceId = "cotizacion_id";
                    TableSourceDetails = "coti_detalle";
                    ColumnNro = "nro_cotizacion";
                    break;
                case "devoluciones":
                    TableSource = "devoluciones";
                    TableSourceId = "devolucion_id";
                    TableSourceDetails = "devolucion_Detalle";
                    ColumnNro = "nro_devolucion";
                    break;
                case "compras":
                    TableSource = "orden_compra";
                    TableSourceId = "compra_id";
                    TableSourceDetails = "compras_detalle";
                    ColumnNro = "nro_compra";
                    break;
            }

            #region SELECT
            query.Append(" SELECT ");

            if (filtro.SUM)
            {
                query.Append("  SUM(CAST(TS.subtotal AS INT)) subtotal ");
                query.Append(", SUM(TS.impuesto_monto) impuesto_monto ");
                query.Append(", SUM(TS.total) total");

                if (!string.IsNullOrEmpty(filtro.tipoCorte))
                {
                    switch (filtro.tipoCorte)
                    {
                        case "porCategoria":
                            query.Append($", MAX(TS.{ColumnNro}) nro ");
                            query.Append(", CP.Descripcion_categ ");
                            break;
                        case "porVendedor":
                            query.Append(", MAX(V.vendedor_id) vendedor_id ");
                            query.Append(", V.Nombre_vendedor ");
                            break;
                        case "porMoneda":
                            query.Append($", MAX(TS.{ColumnNro}) nro ");
                            query.Append(",  TS.moneda ");
                            break;
                        case "porFecha_Emision":
                            query.Append($", MAX(TS.{ColumnNro}) nro ");
                            if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                query.Append(", CONCAT(MONTH(TS.fecha), '/', YEAR(TS.fecha)) fecha ");
                            else
                                query.Append(", TS.fecha ");
                            break;
                    }
                }
            }
            else
            {
                query.Append($" vendedor Nombre_vendedor ");
                query.Append($",TS.{ColumnNro} nro ");
                query.Append(", TS.moneda ");
                query.Append(", TS.subtotal ");
                query.Append(", TS.impuesto_monto ");
                query.Append(", TS.total ");

                if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                    query.Append($", CONCAT(MONTH(TS.fecha), '/', YEAR(TS.fecha)) fecha ");
                else
                    query.Append($", TS.fecha ");

                if (!string.IsNullOrEmpty(filtro.tipoCorte))
                {
                    switch (filtro.tipoCorte)
                    {
                        case "porVendedor":
                            query.Append(", V.vendedor_id ");
                            break;
                    }
                }

                switch (filtro.tipoReporte)
                {
                    case "cotizaciones":
                        query.Append($", TS.nro_compra estatus ");
                        break;
                    case "devoluciones":
                        query.Append($", TS.fecha_vcmto ");
                        query.Append($", SUBSTRING(Rtrim(TS.comentario_detalle), 1, 19) ncf ");
                        query.Append($", TS.pago ");
                        break;
                    case "compras":
                        query.Append($", TS.fecha_vcmto ");
                        query.Append($", CASE WHEN LEN(TS.ncf) > 10 THEN SUBSTRING(rtrim(TS.ncf), 1, 19) ELSE '' END ncf ");
                        query.Append($", TS.recibida ");
                        break;
                }

                query.Append($", TS.dscto_monto ");
                query.Append(",  TP.Descripcion_terminopv ");

            }
            #endregion

            #region FROM
            query.Append($" FROM ");

            query.Append($" {filtro.conn}.dbo.{TableSource} TS ");
            query.Append($" JOIN {filtro.conn}.dbo.{TableSourceDetails} TDS ON TS.{TableSourceId} = TDS.{TableSourceId} ");
            query.Append($" JOIN {filtro.conn}.dbo.terminos_pagopv TP ON TS.terminos_id = TP.termino_idpv ");

            switch (filtro.tipoConsulta)
            {
                case "RFA06":
                    query.Append($" JOIN {filtro.conn}.dbo.productos P ON TDS.producto_id = P.producto_id ");
                    break;
                case "RFA0":
                    query.Append($" JOIN {filtro.conn}.dbo.nombre_bodegas NB ON TDS.bodega_id = NB.bodega_id ");
                    break;
                case "RFA08":
                    switch (filtro.tipoCorte)
                    {
                        case "porCategoria":
                            query.Append($" JOIN {filtro.conn}.dbo.productos P ON TDS.producto_id = P.producto_id ");
                            query.Append($" JOIN {filtro.conn}.dbo.categoria_producto CP ON P.Categoria_id = CP.categoria_id ");
                            break;
                    }
                    break;
            }
            #endregion

            #region WHERE
            query.Append("WHERE ");

            if (!string.IsNullOrEmpty(filtro.minFecha_emision))
                query.Append($"TS.fecha >= '{filtro.minFecha_emision}' ");
            if (!string.IsNullOrEmpty(filtro.maxFecha_emision))
                query.Append($"AND TS.fecha <= '{filtro.maxFecha_emision}' ");
            if (!string.IsNullOrEmpty(filtro.vendedorEspesifico))
                query.Append($"AND TS.Nombre_vendedor LIKE '%{filtro.vendedorEspesifico}%' ");

            if (!string.IsNullOrEmpty(filtro.estatus))
            {
                switch (filtro.tipoReporte)
                {
                    case "cotizaciones":
                        switch (filtro.estatus)
                        {
                            case "abierto":
                                query.Append($"AND TS.nro_compra = '0' ");
                                break;
                            case "cerrado":
                                query.Append($"AND LEN(TS.nro_compra) > '0' ");
                                break;
                            case "cerradoSinFactura":
                                query.Append($"AND LEN(TS.nro_compra) = '0' ");
                                break;
                        }
                        break;
                    case "devoluciones":
                        switch (filtro.estatus)
                        {
                            case "aplicada":
                                query.Append($"AND TS.pago = TS.total ");
                                break;
                            case "sinAplicar":
                                query.Append($"AND TS.pago = '0' ");
                                break;
                            case "aplicadaParcial":
                                query.Append($"AND TS.pago < TS.total ");
                                break;
                        }
                        break;
                    case "compras":
                        switch (filtro.estatus)
                        {
                            case "T":
                                query.Append($"AND TS.recibida = 'T' ");
                                break;
                            case "S":
                                query.Append($"AND TS.recibida = 'S' ");
                                break;
                            case "P":
                                query.Append($"AND TS.recibida = 'P' ");
                                break;
                        }
                        break;
                }
            }

            if (!string.IsNullOrEmpty(filtro.tipoNCF))
            {
                switch (filtro.tipoReporte)
                {
                    case "devoluciones":
                        switch (filtro.tipoNCF)
                        {
                            case "normal":
                                query.Append($"AND (LEN(TS.comentario_Detalle) = '11' OR LEN(TS.comentario_Detalle) = '19') ");
                                break;
                            case "electronico":
                                query.Append($"AND LEN(TS.comentario_Detalle) = '13' ");
                                break;
                        }
                        break;
                }
            }

            switch (filtro.tipoConsulta)
            {
                case "RFA01":
                    if (!string.IsNullOrEmpty(filtro.desde))
                        query.Append($"AND TS.{ColumnNro} >= '{filtro.desde}' ");
                    if (!string.IsNullOrEmpty(filtro.hasta))
                        query.Append($"AND TS.{ColumnNro} <= '{filtro.hasta}' ");
                    break;
                case "RFA02":
                    if (!string.IsNullOrEmpty(filtro.desde))
                        query.Append($"AND TS.total >= '{filtro.desde}' ");
                    if (!string.IsNullOrEmpty(filtro.hasta))
                        query.Append($"AND TS.total <= '{filtro.hasta}' ");
                    break;
                case "RFA03":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND TP.termino_idpv = '{filtro.valor}' ");
                    break;
                case "RFA06":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND P.descrip_producto = '{filtro.valor}' ");
                    break;
                case "RFA0":
                    if (!string.IsNullOrEmpty(filtro.valor))
                        query.Append($"AND NB.bodega_id = '{filtro.valor}' ");
                    break;
                case "RFA08":
                    switch (filtro.tipoCorte)
                    {
                        case "porCategoria":
                            if (!string.IsNullOrEmpty(filtro.valor))
                                query.Append($"AND P.Categoria_id = '{filtro.valor}' ");
                            break;
                        case "porVendedor":
                            if (!string.IsNullOrEmpty(filtro.valor))
                                query.Append($"AND V.vendedor_id = '{filtro.valor}' ");
                            break;
                        case "porMoneda":
                            if (!string.IsNullOrEmpty(filtro.valor))
                                query.Append($"AND TS.moneda = '{filtro.valor}' ");
                            break;
                        case "porFecha_Emision":
                            if (!string.IsNullOrEmpty(filtro.desde))
                                if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                    query.Append($", CONCAT(MONTH(TS.fecha), '/', YEAR(TS.fecha)) fecha ");
                                else
                                    query.Append($"AND TS.fecha = '{filtro.desde}' ");
                            break;
                    }
                    break;
            }
            #endregion

            if (!filtro.SUM && !filtro.GROUP)
            {
                query.Append("GROUP BY ");

                query.Append("vendedor,");
                query.Append("TS.nro_compra,");
                query.Append("TS.moneda,");
                query.Append("TS.subtotal,");
                query.Append("TS.impuesto_monto,");
                query.Append("TS.total,");
                query.Append("TS.fecha,");
                query.Append("TS.fecha_vcmto,");
                query.Append("TS.ncf,");
                query.Append("TS.recibida,");
                query.Append("TS.dscto_monto,");
                query.Append("TP.Descripcion_terminopv ");
            }

            #region ORDER BY
            if (!filtro.SUM)
            {
                query.Append("ORDER BY ");

                switch (filtro.tipoConsulta)
                {
                    case "RFA01":
                        query.Append($" TS.{ColumnNro} DESC ");
                        break;
                    case "RFA02":
                        query.Append($" TS.total DESC ");
                        break;
                    case "RFA03":
                        query.Append(" TP.descripcion_terminopv DESC ");
                        break;
                    case "RFA06":
                        query.Append(" P.descrip_producto DESC ");
                        break;
                    case "RFA0":
                        query.Append(" NB.Nombre_bodega DESC ");
                        break;
                    case "RFA08":
                        switch (filtro.tipoCorte)
                        {
                            case "porCategoria":
                                query.Append($" TS.{ColumnNro} DESC ");
                                break;
                            case "porVendedor":
                                query.Append(" V.Nombre_vendedor ");
                                break;
                            case "porMoneda":
                                query.Append(" TS.moneda ");
                                break;
                            case "porFecha_Emision":
                                if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                    query.Append($" CONCAT(MONTH(TS.fecha), '/', YEAR(TS.fecha)) ");
                                else
                                    query.Append(" TS.fecha ");
                                break;
                        }
                        break;
                }
            }
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
                                    query.Append(" CP.Descripcion_categ ");
                                    break;
                                case "porVendedor":
                                    query.Append(" V.Nombre_vendedor ");
                                    break;
                                case "porMoneda":
                                    query.Append(" TS.moneda ");
                                    break;
                                case "porFecha_Emision":
                                    if (!string.IsNullOrEmpty(filtro.agruparPorMes))
                                        query.Append($" CONCAT(MONTH(TS.fecha), '/', YEAR(TS.fecha)) ");
                                    else
                                        query.Append(" TS.fecha ");
                                    break;
                            }
                        break;
                }
            }
            #endregion

            if (!filtro.SUM && !filtro.GROUP)
            {
                query.Append($"OFFSET {filtro.skip * filtro.take} ROWS ");
                query.Append($"FETCH NEXT {filtro.take} ROWS ONLY ");
            }

            return query.ToString();
        }

        public static string ClientesProveedores(Filtros filtro)
        {
            var query = new StringBuilder();
            var queryWhere = new StringBuilder();

            string TableSource = "";
            string TableSourceColCodigo = "";
            string TableSourceColNombre = "";
            string TableSourceColVendedor = "";
            string TableSourceCategoria = "";
            string TableSourceCategoriaId = "";
            string TableSourceCategoriaColDescripcion = "";
            string TableSourceNegocio = "";
            string TableSourceNegocioColId = "";
            string TableSourceNegocioColDesc = "";
            string TableSourceTermino = "";
            string TableSourceColActivo = "";

            switch (filtro.tipoReporte)
            {
                case "clientes":
                    TableSource = "clientes";
                    TableSourceColCodigo = "codigo_clte";
                    TableSourceColNombre = "nombre_clte";
                    TableSourceColVendedor = "vendedor_id";
                    TableSourceCategoria = "Categorias_clte";
                    TableSourceCategoriaId = "Categoria_Clte_id";
                    TableSourceCategoriaColDescripcion = "descripcion_categ";
                    TableSourceNegocio = "giro_negocios";
                    TableSourceNegocioColId = "giro_id";
                    TableSourceNegocioColDesc = "giro_negocio";
                    TableSourceTermino = "termino_id";
                    TableSourceColActivo = "clte_Activo";
                    break;
                case "proveedores":
                    TableSource = "proveedores";
                    TableSourceColCodigo = "codigo_proveedor";
                    TableSourceColNombre = "nombre_proveedor";
                    TableSourceColVendedor = "vendedor";
                    TableSourceCategoria = "categorias_pv";
                    TableSourceCategoriaId = "Categoria_idpv";
                    TableSourceCategoriaColDescripcion = "descripcion_categpv";
                    TableSourceNegocio = "giro_negociospv";
                    TableSourceNegocioColId = "giro_idpv";
                    TableSourceNegocioColDesc = "giro_negociopv";
                    TableSourceTermino = "termino_idpv";
                    TableSourceColActivo = "proveedor_Activo";
                    break;
            }

            #region SELECT
            query.Append("  SELECT ");

            if (filtro.SUM)
            { }
            else
            {
                query.Append($"  TS.{TableSourceColCodigo} codigo ");
                query.Append($", TS.{TableSourceColNombre} nombre ");
                query.Append($", TS.contacto ");
                query.Append($", TS.telefono1 ");
                query.Append($", TS.registro_tributario rnc ");
                query.Append($", TS.tipo_empresa ");
                query.Append($", TS.fecha_ult_transac ");
                query.Append($", TS.ciudad ");
                query.Append($", TS.Provincia ");
                query.Append($", TSC.{TableSourceCategoriaColDescripcion} categoriaDesc ");
                query.Append($", TSN.{TableSourceNegocioColDesc} giroDesc ");

                if (filtro.tipoReporte == "clientes")
                    query.Append($", V.Nombre_vendedor ");
                else if (filtro.tipoReporte == "proveedores")
                    query.Append($", TS.vendedor Nombre_vendedor");
            }
            #endregion

            #region FROM
            query.Append($" FROM {filtro.conn}.dbo.{TableSource} TS ");
            query.Append($" JOIN {filtro.conn}.dbo.{TableSourceCategoria} TSC ON TS.{TableSourceCategoriaId} = REPLACE(TSC.{TableSourceCategoriaId}, '\"', '') ");
            query.Append($" JOIN {filtro.conn}.dbo.{TableSourceNegocio} TSN ON TS.{TableSourceNegocioColId} = TSN.{TableSourceNegocioColId} ");

            if (filtro.tipoReporte == "clientes")
                query.Append($" JOIN {filtro.conn}.dbo.vendedores V ON TS.{TableSourceColVendedor} = V.vendedor_id ");
            #endregion

            #region WHERE
            queryWhere.Append("WHERE ");

            if (!string.IsNullOrEmpty(filtro.id_giro))
                queryWhere.Append($" TS.{TableSourceNegocioColId} = '{filtro.id_giro}' ");
            if (!string.IsNullOrEmpty(filtro.empresa))
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($" TS.tipo_empresa = '{filtro.empresa}' ");
            }
            if (!string.IsNullOrEmpty(filtro.Codigo_vendedor))
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($" TS.{TableSourceColVendedor} = '{filtro.Codigo_vendedor}' ");
            }
            if (!string.IsNullOrEmpty(filtro.categoriaP))
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($" TS.{TableSourceCategoriaId} = '{filtro.categoriaP}' ");
            }
            if (!string.IsNullOrEmpty(filtro.activo))
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($" TS.{TableSourceColActivo} = 'A' ");
            }
            if (!string.IsNullOrEmpty(filtro.conBalance))
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($" TS.Balance > 0 ");
            }
            if (!string.IsNullOrEmpty(filtro.sinImpt))
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($" TS.aplica_impto > 'SI' ");
            }
            if (!string.IsNullOrEmpty(filtro.sinRnc))
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($" TS.registro_tributario = '' ");
            }

            switch (filtro.tipoConsulta)
            {
                case "porCodigo":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($" TS.{TableSourceColCodigo} = '{filtro.valor}' ");
                    }
                    break;
                case "porNombre":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($" TS.{TableSourceColNombre} LIKE '%{filtro.valor}%' ");
                    }
                    break;
                case "porRegistro_Tributario":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($" TS.registro_tributario = '{filtro.valor}' ");
                    }
                    break;
                case "porTelefono":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($" TS.telefono1 LIKE '%{filtro.valor}%' ");
                    }
                    break;
                case "porContacto":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($" TS.Contacto LIKE '%{filtro.valor}%' ");
                    }
                    break;
                case "porDireccion":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($"( ");
                        queryWhere.Append($"   TS.direccion1 LIKE '%{filtro.valor}%' ");
                        queryWhere.Append($"OR TS.direccion2 LIKE '%{filtro.valor}%' ");
                        queryWhere.Append($"OR TS.direccion3 LIKE '%{filtro.valor}%' ");
                        queryWhere.Append($") ");
                    }
                    break;
                case "porTermino":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($" TS.{TableSourceTermino} = '{filtro.valor}' ");
                    }
                    break;
                case "porPais":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($" TS.pais LIKE '%{filtro.valor}%' ");
                    }
                    break;
                case "porCiudad":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($" TS.ciudad LIKE '%{filtro.valor}%' ");
                    }
                    break;
                case "porProvincia":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($" TS.Provincia LIKE '%{filtro.valor}%' ");
                    }
                    break;
                case "porTipo_de_Impuesto":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($" TS.impto = '{filtro.valor}' ");
                    }
                    break;
                case "porMaximo_Credito":
                    if (!string.IsNullOrEmpty(filtro.valor))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($" TS.maximo_Credito = '{filtro.valor}' ");
                    }
                    break;
                case "RFA08":
                    switch (filtro.tipoCorte)
                    {
                        case "Sin_Actividad":
                            if (!string.IsNullOrEmpty(filtro.desde) && !string.IsNullOrEmpty(filtro.hasta))
                            {
                                if (queryWhere.Length > 6)
                                    queryWhere.Append("AND ");
                                queryWhere.Append($" TS.fecha_ult_transac NOT BETWEEN '{filtro.desde}' AND '{filtro.hasta}'");
                            }
                            break;
                        case "Por_Categoria":
                            if (!string.IsNullOrEmpty(filtro.valor))
                            {
                                if (queryWhere.Length > 6)
                                    queryWhere.Append("AND ");
                                queryWhere.Append($" TSC.{TableSourceCategoriaColDescripcion} = '{filtro.valor}'");
                            }
                            break;
                            //case "Por_Vendedor":
                            //    if (!string.IsNullOrEmpty(filtro.valor))
                            //    {
                            //        if (queryWhere.Length > 6)
                            //            queryWhere.Append("AND ");
                            //        queryWhere.Append($" V.vendedor_id = '{filtro.valor}'");
                            //    }
                            //    break;
                            //case "Por_Tipo":
                            //    if (!string.IsNullOrEmpty(filtro.valor))
                            //    {
                            //        if (queryWhere.Length > 6)
                            //            queryWhere.Append("AND ");
                            //        queryWhere.Append($" V.tipo_empresa = '{filtro.valor}'");
                            //    }
                            //    break;
                    }
                    break;
            }
            if (queryWhere.Length > 6)
                query.Append(queryWhere.ToString());
            #endregion

            #region GROUP BY
            //if (filtro.SUM && filtro.GROUP)
            //{
            //    query.Append("GROUP BY ");

            //    switch (filtro.tipoCorte)
            //    {
            //        case "porFecha_Emision":
            //            if (!string.IsNullOrEmpty(filtro.agruparPorMes))
            //                query.Append(" YEAR(TDS.fecha_emision), MONTH(TDS.fecha_emision) ");
            //            else
            //                query.Append(" TDS.fecha_emision ");
            //            break;
            //        case "porFecha_Vencimiento":
            //            if (!string.IsNullOrEmpty(filtro.agruparPorMes))
            //                query.Append(" YEAR(TDS.fecha_emision), MONTH(TDS.fecha_emision) ");
            //            else
            //                query.Append(" TDS.fecha_vcmto ");
            //            break;
            //        case "porCliente":
            //            query.Append("TS.cliente_id ");
            //            break;
            //        case "porVendedor":
            //            query.Append("V.Nombre_vendedor ");
            //            break;
            //        case "porCategorias_de_Clientes":
            //            query.Append($"CCP.{TableCategoriaClienteProveedorDescripcion} ");
            //            break;
            //    }
            //}
            #endregion

            #region ORDER BY
            if (!filtro.SUM)
            {
                query.Append("ORDER BY ");
                switch (filtro.tipoConsulta)
                {
                    case "porCodigo":
                        query.Append($" TS.{TableSourceColCodigo} ");
                        break;
                    case "porNombre":
                        query.Append($" TS.{TableSourceColNombre} ");
                        break;
                    case "porRegistro_Tributario":
                        query.Append($" TS.registro_tributario ");
                        break;
                    case "porTelefono":
                        query.Append($" TS.telefono1 ");
                        break;
                    case "porContacto":
                        query.Append($" TS.Contacto ");
                        break;
                    case "porDireccion":
                        query.Append($"  TS.direccion1 ");
                        query.Append($", TS.direccion2 ");
                        query.Append($", TS.direccion3 ");
                        break;
                    case "porTermino":
                        query.Append($" TS.{TableSourceTermino} ");
                        break;
                    case "porPais":
                        query.Append($" TS.pais ");
                        break;
                    case "porCiudad":
                        query.Append($" TS.ciudad ");
                        break;
                    case "porProvincia":
                        query.Append($" TS.Provincia ");
                        break;
                    case "porTipo_de_Impuesto":
                        query.Append($" TS.impto ");
                        break;
                    case "porMaximo_Credito":
                        query.Append($" TS.maximo_Credito DESC ");
                        break;
                    case "RFA08":
                        switch (filtro.tipoCorte)
                        {
                            case "porLos_Mas_Recientes":
                                query.Append($" TS.creado DESC ");
                                break;
                            case "porLos_Mas_Antiguos":
                                query.Append($" TS.creado ");
                                break;
                            case "Sin_Actividad":
                                query.Append($" TS.fecha_ult_transac DESC ");
                                break;
                            case "Por_Categoria":
                                query.Append($" TSC.{TableSourceCategoriaColDescripcion} ");
                                break;
                            case "Por_Giro":
                                query.Append($" TSN.{TableSourceNegocioColDesc} ");
                                break;
                            case "Por_Vendedor":
                                query.Append($" V.nombre_vendedor ");
                                break;
                            case "Por_Tipo":
                                query.Append($" TS.tipo_empresa ");
                                break;
                        }
                        break;
                }
            }
            #endregion

            if (filtro.GROUP
                && filtro.tipoCorte != "Por_Categori"
                && filtro.tipoCorte != "Por_Giro"
                && filtro.tipoCorte != "Por_Vendedor"
                && filtro.tipoCorte != "Por_Tipo")
            {
                query.Append($"OFFSET {filtro.skip * filtro.take} ROWS ");
                query.Append($"FETCH NEXT {filtro.take} ROWS ONLY ");
            }

            return query.ToString();
        }

        public static string ContabilidadBanco(Filtros filtro)
        {
            var query = new StringBuilder();
            var queryWhere = new StringBuilder();

            switch (filtro.tipoConsulta)
            {
                case "Plan_de_Cuentas":
                    #region SELECT
                    query.Append("  SELECT ");
                    query.Append($"  TS.cuenta_contable ");
                    query.Append($", TS.nivel_cuenta ");
                    query.Append($", CASE TS.nombre_cuenta WHEN 'S' THEN TS.nombre_cuenta ELSE CONCAT(' ', TS.nombre_cuenta) END AS nombre_cuenta ");
                    query.Append($", TS.balance ");
                    query.Append($", TS.tipo_cuenta ");
                    query.Append($", TS.centro_costos ");
                    query.Append($", TS.ultima_transac ");
                    #endregion

                    #region FROM
                    query.Append($" FROM {filtro.conn}.dbo.cuentas TS ");
                    #endregion

                    #region WHERE
                    queryWhere.Append("WHERE ");

                    if (!string.IsNullOrEmpty(filtro.code))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($"TS.cuenta_contable = '{filtro.code}' ");
                    }
                    if (!string.IsNullOrEmpty(filtro.descripcion))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($"TS.nombre_cuenta LIKE '%{filtro.descripcion}%' ");
                    }
                    if (!string.IsNullOrEmpty(filtro.clasificacion))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($"TS.tipo_cuenta = '{filtro.clasificacion}' ");
                    }
                    if (!string.IsNullOrEmpty(filtro.conBalance))
                    {
                        if (queryWhere.Length > 6)
                            queryWhere.Append("AND ");
                        queryWhere.Append($"TS.Balance > 0 ");
                    }

                    if (queryWhere.Length > 6)
                        query.Append(queryWhere.ToString());
                    #endregion

                    #region ORDER BY
                    query.Append("ORDER BY ");
                    query.Append($" TS.cuenta_contable ");
                    #endregion

                    if (!filtro.omitirPaginacion)
                    {
                        query.Append($"OFFSET {filtro.skip * filtro.take} ROWS ");
                        query.Append($"FETCH NEXT {filtro.take} ROWS ONLY ");
                    }
                    break;
                case "Informe_608":
                    #region SELECT
                    query.Append("  SELECT ");
                    query.Append($"  SUBSTRING(TRIM(TS.ncf), 1, 19) ncf ");
                    query.Append($", REPLACE(TS.fecha_emision, '-', '') fecha_emision ");
                    query.Append($", TS.causa_anulacion ");
                    #endregion

                    #region FROM
                    query.Append($" FROM {filtro.conn}.dbo.factura TS ");
                    #endregion

                    #region WHERE
                    query.Append("WHERE ");
                    query.Append($"TS.anulada = 1 ");

                    if (!string.IsNullOrEmpty(filtro.anio))
                        query.Append($"AND YEAR(TS.fecha_emision) = '{filtro.anio}' ");
                    if (!string.IsNullOrEmpty(filtro.mes))
                        query.Append($"AND Month(TS.fecha_emision) = '{filtro.mes}' ");
                    #endregion

                    #region ORDER BY
                    query.Append("ORDER BY ");
                    query.Append($" TS.fecha_emision ");
                    #endregion
                    break;
                case "Informe_607":
                case "Informe_606":
                    #region SELECT
                    query.Append("  SELECT ");
                    query.Append($" TS.registro_tributario ");
                    query.Append($",LEN(TS.registro_tributario) LENTipoIdentificacion ");
                    query.Append($",'1' TipoIngreso ");
                    query.Append($",Substring(RTRIM(TS.ncf), 1, 19) ncf ");
                    query.Append($",'' ncfModificado ");
                    query.Append($",fecha_emision ");
                    query.Append($",TS.reteiva_monto  ");
                    query.Append($",(CAST(TS.total AS INT) - CAST(TS.impuesto_monto AS INT) - CAST(TS.impuesto2_monto AS INT)) MontoFacturado");
                    query.Append($",TS.impuesto_monto ");
                    query.Append($",TS.impuesto2_monto MontoPropina");
                    query.Append($",SUBSTRING(LTRIM(TP.codigo_termino), 1, 1) LENcodigo_termino ");
                    #endregion

                    #region FROM
                    query.Append($" FROM {filtro.conn}.dbo.factura TS ");
                    query.Append($" JOIN {filtro.conn}.dbo.terminos_pago TP ON TS.termino_id = TP.termino_id  ");
                    query.Append($" AND TS.anulada = 0 ");

                    if (!string.IsNullOrEmpty(filtro.anio))
                        query.Append($"AND YEAR(TS.fecha_emision) = '{filtro.anio}' ");
                    if (!string.IsNullOrEmpty(filtro.mes))
                        query.Append($"AND Month(TS.fecha_emision) = '{filtro.mes}' ");
                    #endregion

                    #region WHERE
                    if (!filtro.incluirMenores250000)
                    {
                        query.Append($"WHERE ");
                        query.Append($"SUBSTRING(RTRIM(TS.ncf), 2, 2) = 02 ");
                        query.Append($"AND TS.total >= 250000 ");
                        //query.Append($"AND (CAST(TS.total AS INT) - CAST(TS.impuesto_monto AS INT) - CAST(TS.impuesto2_monto AS INT)) >= 250000 ");
                        query.Append($"OR SUBSTRING(RTRIM(TS.ncf), 2, 2) <> 02 ");
                    }
                    #endregion

                    //query.Append("UNION ");
                    //#region SELECT
                    //query.Append("  SELECT ");
                    //query.Append($" TS.registro_tributario ");
                    //query.Append($",LEN(TS.registro_tributario) LENTipoIdentificacion ");
                    //query.Append($",'1' TipoIngreso ");
                    //query.Append($",Substring(RTRIM(TS.ncf), 1, 19) ncf ");
                    //query.Append($",SUBSTRING(rtrim(TSD.ncf), 1, 19) ncfModificado ");
                    //query.Append($",TS.fecha_emision ");
                    //query.Append($",TS.reteiva_monto  ");
                    //query.Append($",TS.total MontoFacturado");
                    //query.Append($",TS.impuesto_monto ");
                    //query.Append($",TS.impuesto2_monto MontoPropina");
                    //query.Append($",SUBSTRING(LTRIM(TP.codigo_termino), 1, 1) LENcodigo_termino ");
                    //#endregion

                    //#region FROM
                    //query.Append($" FROM {filtro.conn}.dbo.devolucion_clte TS ");
                    //query.Append($" JOIN {filtro.conn}.dbo.terminos_pago TP ON REPLACE(TS.termino_id, '\"', '') = TP.termino_id  ");
                    //query.Append($", {filtro.conn}.dbo.factura TSD  ");
                    //#endregion

                    //#region WHERE
                    //query.Append($"WHERE SUBSTRING(rtrim(TS.Campo3), 4, 12) = TSD.nro_factura ");
                    //query.Append($" AND REPLACE(TS.anulada, '\"', '') = 0 ");

                    //if (!string.IsNullOrEmpty(filtro.anio))
                    //    query.Append($"AND Year(REPLACE(TS.fecha_emision, '\"', '')) = '{ filtro.anio}' ");
                    //if (!string.IsNullOrEmpty(filtro.mes))
                    //    query.Append($"AND Month(REPLACE(TS.fecha_emision, '\"', '')) = '{ filtro.mes}' ");

                    ////if (!filtro.incluirMenores250000)
                    ////{
                    ////    query.Append($"AND SUBSTRING(RTRIM(TS.ncf), 2, 2) = 02 ");
                    ////    query.Append($"AND (CAST(TS.total AS INT) - CAST(TS.impuesto_monto AS INT) - CAST(TS.impuesto2_monto AS INT)) >= 250000 ");
                    ////    query.Append($"OR SUBSTRING(RTRIM(TS.ncf), 2, 2) <> 02 ");
                    ////}
                    //#endregion

                    //if (filtro.incluirNotasDeCreditoDesdeCXC)
                    //{
                    //    query.Append("UNION ");
                    //    #region SELECT
                    //    query.Append(" SELECT ");
                    //    query.Append($" CL.registro_tributario ");
                    //    query.Append($",LEN(CL.registro_tributario) LENTipoIdentificacion ");
                    //    query.Append($",'1' TipoIngreso ");
                    //    query.Append($",Substring(RTRIM(TS.ncf), 1, 19) ncf ");
                    //    query.Append($",Substring(RTRIM(docs_cc.ncf), 1, 19) ncfModificado ");
                    //    query.Append($",REPLACE(TS.fecha_emision, '-', '') fecha_emision ");
                    //    query.Append($",'' reteiva_monto ");
                    //    query.Append($",(TS.Monto_dcmto - TS.impuesto_1 - TS.impuesto_2) MontoFacturado");
                    //    query.Append($",TS.impuesto_1 impuesto_monto ");
                    //    query.Append($",TS.impuesto_2 MontoPropina");
                    //    query.Append($",SUBSTRING(LTRIM(TP.codigo_termino), 1, 1) LENcodigo_termino ");
                    //    #endregion

                    //    #region FROM
                    //    query.Append($" FROM {filtro.conn}.dbo.docs_cc TS ");
                    //    query.Append($" JOIN {filtro.conn}.dbo.clientes CL ON TS.cliente_id = CL.cliente_id  ");
                    //    query.Append($" LEFT JOIN {filtro.conn}.dbo.terminos_pago TP ON TS.termino_idpv = TP.termino_id  ");
                    //    query.Append($" JOIN {filtro.conn}.dbo.docs_cc ON TS.nro_dcmto = docs_cc.nro_dcmto_pagado ");
                    //    #endregion

                    //    #region WHERE
                    //    query.Append($"WHERE ");
                    //    query.Append($"TS.modulo_origen = 'CC' ");
                    //    query.Append($"AND LEN(RTRIM(TS.ncf)) > 10 ");
                    //    query.Append($"AND TS.Estado_registro = 0 ");
                    //    if (!string.IsNullOrEmpty(filtro.anio))
                    //        query.Append($"AND YEAR(TS.fecha_emision) = '{filtro.anio}' ");
                    //    if (!string.IsNullOrEmpty(filtro.mes))
                    //        query.Append($"AND Month(TS.fecha_emision) = '{filtro.mes}' ");
                    //    #endregion
                    //}

                    query.Append($"ORDER BY fecha_emision DESC ");
                    break;
            }

            return query.ToString();
        }
        #endregion

        #region DATA SUELTA
        public static string EmpresaInformacionQuery(Filtros filter)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            if (!string.IsNullOrEmpty(filter.SELECT))
                query.Append($"{filter.SELECT} ");
            else
                query.Append("empresa_id, Nombre_empresa, base_de_datos ");
            //query.Append("empresa_id, TRIM(Nombre_empresa) Nombre_empresa, TRIM(base_de_datos) base_de_datos ");

            query.Append($"FROM {getConnectionString()}.dbo.empresas ");

            query.Append($"WHERE ");
            query.Append($"Condicion = 1 ");

            if (!string.IsNullOrEmpty(filter?.WHRER_IN))
                query.Append($"AND empresa_id IN ({filter.WHRER_IN}) ");

            return query.ToString();
        }

        public static string CategoriasClientesQuery(Filtros filter)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  categoria_clte_id, ");
            query.Append("  descripcion_categ ");
            query.Append($"FROM {filter.conn}.dbo.Categorias_clte ");
            query.Append("ORDER BY descripcion_categ ");

            return query.ToString();
        }

        public static string CategoriasProveedoresQuery(Filtros filter)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  Categoria_idpv, ");
            query.Append("  descripcion_categpv ");
            query.Append($"FROM {filter.conn}.dbo.categorias_pv ");
            query.Append("ORDER BY descripcion_categpv ");

            return query.ToString();
        }

        public static string VendedoresInformacionQuery(Filtros filter)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  vendedor_id, ");
            query.Append("  TRIM(Nombre_vendedor) Nombre_vendedor, ");
            query.Append("  TRIM(Codigo_vendedor) Codigo_vendedor ");
            query.Append($"FROM {filter.conn}.dbo.vendedores ");
            query.Append($"ORDER BY Nombre_vendedor ");

            return query.ToString();
        }

        public static string ClienteQuery(Filtros filtro)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");

            if (filtro.SUM)
                query.Append("COUNT(*) count ");
            else
            {
                query.Append("  cliente_id id, ");
                query.Append("  TRIM(nombre_clte) nombre, ");
                query.Append("  codigo_clte codigo ");

                if (!string.IsNullOrEmpty(filtro.SELECT))
                    query.Append(filtro.SELECT);
            }

            query.Append($"FROM {filtro.conn}.dbo.clientes C ");

            if (!string.IsNullOrEmpty(filtro.JOIN))
                if (filtro.JOIN.Contains("impuestos"))
                    query.Append($"JOIN {filtro.conn}.dbo.impuestos I ON I.Abreviatura = C.impto ");

            #region WHERE
            query.Append($"WHERE C.clte_Activo = 'A' ");

            if (!string.IsNullOrEmpty(filtro.code))
                query.Append($"AND codigo_clte = '{filtro.code}'");
            if (!string.IsNullOrEmpty(filtro.name))
                query.Append($"AND nombre_clte LIKE '%{filtro.name}%'");
            #endregion

            if (!filtro.SUM)
            {
                query.Append($" ORDER BY nombre_clte ");
                query.Append($" OFFSET {filtro.skip * filtro.take} ROWS ");
                query.Append($" FETCH NEXT {filtro.take} ROWS ONLY ");
            }

            return query.ToString();
        }

        public static string ProveedoresQuery(Filtros filtro)
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

            query.Append($"FROM {filtro.conn}.dbo.proveedores ");

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

        public static string VendedoresQuery(Filtros filtro)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");

            if (filtro.SUM)
                query.Append("COUNT(*) count ");
            else
            {
                query.Append(" TRIM(Nombre_vendedor) nombre, ");
                query.Append(" vendedor_id codigo ");
            }

            query.Append($"FROM {filtro.conn}.dbo.vendedores ");

            if (!string.IsNullOrEmpty(filtro.code))
                query.Append($"WHERE vendedor_id = '{filtro.code}'");
            if (!string.IsNullOrEmpty(filtro.name))
                query.Append($"WHERE Nombre_vendedor LIKE '%{filtro.name}%'");

            if (!filtro.SUM)
            {
                query.Append($" ORDER BY Nombre_vendedor ");
                query.Append($" OFFSET {filtro.skip * filtro.take} ROWS ");
                query.Append($" FETCH NEXT {filtro.take} ROWS ONLY ");
            }

            return query.ToString();
        }

        public static string TerminosPagosQuery(Filtros filter)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  termino_id, ");
            query.Append("  TRIM(UPPER(Descripcion_termino)) Descripcion_termino ");
            query.Append($"FROM {filter.conn}.dbo.terminos_pago ");
            query.Append("ORDER BY Descripcion_termino ");

            return query.ToString();
        }

        public static string TerminosPagosPvQuery(Filtros filter)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  termino_idpv, ");
            query.Append("  TRIM(UPPER(Descripcion_terminopv)) Descripcion_terminopv ");
            query.Append($"FROM {filter.conn}.dbo.terminos_pagopv ");
            query.Append("ORDER BY Descripcion_terminopv ");

            return query.ToString();
        }

        public static string BodegasQuery(Filtros filter)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  bodega_id, ");
            query.Append("  TRIM(UPPER(Nombre_bodega)) Nombre_bodega ");
            query.Append($"FROM {filter.conn}.dbo.nombre_bodegas ");
            query.Append("ORDER BY Nombre_bodega ");

            return query.ToString();
        }

        public static string CategoriasProductosQuery(Filtros filter)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  categoria_id, ");
            query.Append("  TRIM(UPPER(Descripcion_categ)) Descripcion_categ ");
            query.Append($"FROM {filter.conn}.dbo.categoria_producto ");

            return query.ToString();
        }

        public static string SubCategoriasProductosQuery(Filtros filter)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  sub_categoria_id, ");
            query.Append("  TRIM(descripcion_sub_categ) descripcion_sub_categ ");
            query.Append($"FROM {filter.conn}.dbo.sub_categoria_producto ");

            return query.ToString();
        }

        public static string GiroNegociosQuery(Filtros filter)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  giro_id, ");
            query.Append("  TRIM(giro_negocio) giro_negocio ");
            query.Append($"FROM {filter.conn}.dbo.giro_negocios ");

            return query.ToString();
        }

        public static string GiroNegociosPvQuery(Filtros filter)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  giro_idpv, ");
            query.Append("  TRIM(giro_negociopv) giro_negociopv ");
            query.Append($"FROM {filter.conn}.dbo.giro_negociospv ");

            return query.ToString();
        }

        public static string GetEstimadoQuery(Filtros filtro)
        {
            var query = new StringBuilder();
            var queryWhere = new StringBuilder();

            query.Append("SELECT ");
            query.Append("COUNT(*) count ");

            query.Append("FROM ");
            query.Append($"{filtro.conn}.dbo.estimado E ");

            #region WHERE
            queryWhere.Append("WHERE ");
            if (filtro.validarParaCierre)
            {
                queryWhere.Append($"genero_factura1 = '{filtro.genero_factura1}' ");
                queryWhere.Append($"OR genero_factura2 = '{filtro.genero_factura2}' ");
                queryWhere.Append($"OR genero_factura3 = '{filtro.genero_factura3}' ");
            }

            if (!string.IsNullOrEmpty(filtro.NroCotizacion))
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append($"AND ");
                queryWhere.Append($"ltrim(str(nro_estimado)) = '{filtro.NroCotizacion}' ");
            }

            if (queryWhere.Length > 6)
                query.Append(queryWhere.ToString());
            #endregion

            return query.ToString();
        }

        public static string ImpuestosQuery(Filtros filter)
        {
            var query = new StringBuilder();

            query.Append("SELECT ");
            query.Append("  impuesto_id, ");
            query.Append("  TRIM(Descripcion_impto) Descripcion_impto ");
            query.Append($"FROM {filter.conn}.dbo.impuestos ");

            return query.ToString();
        }

        public static string Productos(Filtros filtro)
        {
            var query = new StringBuilder();
            var queryWhere = new StringBuilder("WHERE ");

            query.Append("SELECT ");
            query.Append("  codigo_producto, ");
            query.Append("  descrip_producto ");

            if (!string.IsNullOrEmpty(filtro.SELECT))
                query.Append(filtro.SELECT);

            query.Append($"FROM {filtro.conn}.dbo.productos P ");

            if (!string.IsNullOrEmpty(filtro.JOIN))
                if (filtro.JOIN.Contains("impuestos"))
                    query.Append($"JOIN {filtro.conn}.dbo.impuestos I ON P.impuesto1_id = I.impuesto_id ");

            if (!string.IsNullOrEmpty(filtro.code))
                queryWhere.Append($"codigo_producto = '{filtro.code.Trim()}' ");
            if (filtro.parametro_P_BUSQPRDFAB_ESTIMADO)
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("OR ");
                queryWhere.Append($"codigo_fabricante = '{filtro.code}' ");
            }
            if (!string.IsNullOrEmpty(filtro.descripcion))
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($"descrip_producto LIKE '%{filtro.descripcion}%' ");
            }
            if (!string.IsNullOrEmpty(filtro.estatus))
            {
                if (queryWhere.Length > 6)
                    queryWhere.Append("AND ");
                queryWhere.Append($"situacion_producto {filtro.estatus} ");
            }
            if (queryWhere.Length > 6)
                query.Append(queryWhere.ToString());

            query.Append("ORDER BY codigo_producto ");

            query.Append($" OFFSET {filtro.skip * filtro.take} ROWS ");
            query.Append($" FETCH NEXT {filtro.take} ROWS ONLY ");

            return query.ToString();
        }

        public static string Dolar()
        {
            var query = new StringBuilder();

            query.Append("SELECT TOP 1 CAST(dolar_venta AS VARCHAR) dolar_venta ");
            query.Append($"FROM {getConnectionString()}.dbo.cambio_dolar ");
            query.Append(" ORDER BY fecha_cambio DESC ");

            return query.ToString();
        }

        public static string Parametro(Filtros filtro)
        {
            var query = new StringBuilder();

            query.Append("SELECT parametro, valor_caracter, valor_numerico  ");
            query.Append($"FROM {filtro.conn}.dbo.parametros_genericos ");
            query.Append($"WHERE parametro IN ({filtro.WHRER_IN}) ");

            return query.ToString();
        }

        // ---------

        public static string CerrarCotizacionQuery(Filtros filtro)
        {
            var query = new StringBuilder();
            var setQuery = new StringBuilder();

            query.Append("UPDATE ");
            query.Append($"{filtro.conn}.dbo.estimado ");

            query.Append("SET ");
            if (!string.IsNullOrEmpty(filtro.NroFactura))
                setQuery.Append($"genero_factura1 = '{filtro.NroFactura}' ");
            else
                setQuery.Append($"genero_factura1 = '0' ");
            if (!string.IsNullOrEmpty(filtro.notas))
            {
                if (setQuery.Length > 0)
                    setQuery.Append(",");
                setQuery.Append($"notas = notas + '{filtro.notas}' ");
            }

            query.Append(setQuery.ToString());

            if (!string.IsNullOrEmpty(filtro.NroCotizacion))
                query.Append($"WHERE ltrim(str(nro_estimado)) = '{filtro.NroCotizacion}' ");

            return query.ToString();
        }

        // ---------
        public static string InsertarPedido(Filtros filtro)
        {
            var query = new StringBuilder();

            query.Append($"INSERT INTO {filtro.conn}.dbo.estimado ");
            query.Append("( ");
            query.Append("nro_estimado");
            query.Append(",cliente_id ");
            query.Append(",clte_direccion1");
            query.Append(",clte_direccion2");
            query.Append(",clte_direccion3");
            query.Append(",registro_tributario");
            query.Append(",vendedor_id");
            query.Append(",tipo_documento");
            query.Append(",fecha_emision");
            query.Append(",fecha_vcmto");
            query.Append(",refer_cliente");
            query.Append(",termino_id");
            query.Append(",impto_en_precio");
            query.Append(",comentario_Detalle");
            query.Append(",subtotal");
            query.Append(",dscto_monto");
            query.Append(",impuesto_monto");
            query.Append(",total");
            query.Append(",dscto_pciento");
            query.Append(",impuesto_pciento");
            query.Append(",tipo_cambio");
            query.Append(",tipo_envio");
            query.Append(",hora");
            query.Append(",actualizado");
            query.Append(",moneda");
            query.Append(",monto_base");
            query.Append(") ");
            query.Append("VALUES ");
            query.Append("( ");
            query.Append($"(SELECT TOP 1 CASE WHEN nro_estimado IS NULL OR nro_estimado < 1000000001 THEN 1000000001 ELSE nro_estimado + 1 END nro_estimado FROM {filtro.conn}.dbo.estimado ORDER BY estimado_id DESC) ");
            query.Append($",'{filtro.Estimado.cliente_id}'");
            query.Append($",'{filtro.Estimado.clte_direccion1}'");
            query.Append($",'{filtro.Estimado.clte_direccion2}'");
            query.Append($",'{filtro.Estimado.clte_direccion3}'");
            query.Append($",'{filtro.Estimado.registro_tributario}'");
            query.Append($",'{filtro.Estimado.vendedor_id}'");
            query.Append($",'{filtro.Estimado.tipo_documento}'");
            query.Append($",'{filtro.Estimado.fecha_emision}'");
            query.Append($",'{filtro.Estimado.fecha_vcmto}'");
            query.Append($",'{filtro.Estimado.refer_cliente}'");
            query.Append($",'{filtro.Estimado.termino_id}'");
            query.Append($",'{filtro.Estimado.impto_en_precio}'");
            query.Append($",'{filtro.Estimado.comentario_Detalle}'");
            query.Append($",'{filtro.Estimado.subtotal}'");
            query.Append($",'{filtro.Estimado.dscto_monto}'");
            query.Append($",'{filtro.Estimado.impuesto_monto}'");
            query.Append($",'{filtro.Estimado.total}'");

            if (filtro.Estimado.impuesto_monto > 0 && filtro.Estimado.dscto_monto > 0)
            {
                query.Append($",'{filtro.Estimado.dscto_pciento}'");
                query.Append($",'{filtro.Estimado.impuesto_pciento}'");
            }
            else
            {
                query.Append($",'0'");
                query.Append($",'0'");
            }

            query.Append($",'{filtro.Estimado.tipo_cambio}'");
            query.Append(",'P'");
            query.Append($",'{DateTime.Now:hh:mm:ss}'");
            query.Append($",'{DateTime.Now:yyyy-MM-dd hh:mm:ss}'");
            query.Append($",'1'");
            query.Append($",'{filtro.Estimado.total - filtro.Estimado.impuesto_monto}'");
            query.Append(") ");
            query.Append("SELECT CAST(SCOPE_IDENTITY() AS INT) pedidoId ");

            return query.ToString();
        }

        public static string InsertarDetallesPedido(Filtros filtro)
        {
            if (filtro.EstimadoDetalles.Count == 0)
                return "";

            var query = new StringBuilder();
            var queryProductos = new StringBuilder();

            query.Append($"INSERT INTO {filtro.conn}.dbo.estimado_detalle ");
            query.Append("(");
            query.Append("estimado_id");
            query.Append(",fecha_emision");
            query.Append(",cliente_id");
            query.Append(",producto_id");
            query.Append(",cantidad");
            query.Append(",precio_estimado");
            query.Append(",impto_pciento");
            query.Append(",impto_monto");
            query.Append(",descto_pciento");
            query.Append(",descto_monto");
            query.Append(",comentario");
            query.Append(",bodega_id");
            query.Append(") ");
            query.Append("VALUES ");

            filtro.EstimadoDetalles.ForEach(prodcto =>
            {
                if (queryProductos.Length > 0)
                    queryProductos.Append(",");

                queryProductos.Append("( ");
                queryProductos.Append($"'{filtro.Estimado.estimado_id}'");
                queryProductos.Append($",'{filtro.Estimado.fecha_emision}'");
                queryProductos.Append($",'{filtro.Estimado.cliente_id}'");
                queryProductos.Append($",'{prodcto.producto_id}'");
                queryProductos.Append($",'{prodcto.cantidad}'");
                queryProductos.Append($",'{prodcto.precio_estimado}'");
                queryProductos.Append($",'{prodcto.impto_pciento}'");
                queryProductos.Append($",'{prodcto.impto_monto}'");
                queryProductos.Append($",'{prodcto.descto_pciento}'");
                queryProductos.Append($",'{prodcto.descto_monto}'");
                queryProductos.Append($",'{prodcto.comentario}'");
                queryProductos.Append($",'{prodcto.bodega_id}'");
                queryProductos.Append(") ");
            });
            query.Append(queryProductos.ToString());

            return query.ToString();
        }
        #endregion

        //  HELPER
        private static string getConnectionString()
        {
            var claims = GetClaims();
            var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                new { userId = "", empresaId = "" });

            var connectionString = cache_empresas.FirstOrDefault(x => x.IdEmpresa == long.Parse(json.empresaId)).ConnectionString ?? "";
            return ConfigurationManager.AppSettings[$"{connectionString}_DataBase"];
        }
    }
}