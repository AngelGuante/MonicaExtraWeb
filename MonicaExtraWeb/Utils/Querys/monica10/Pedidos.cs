using Dapper;
using MonicaExtraWeb.Models.monica10;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using static MonicaExtraWeb.Utils.GlobalVariables;

namespace MonicaExtraWeb.Utils.Querys.monica10
{
    public class Pedidos
    {
        public static int Insert(Estimado estimado, List<EstimadoDetalle> detalle)
        {
            try
            {
                var query = new StringBuilder();

                query.Append($"INSERT INTO {GlobalVariables.monica10}[dbo].[estimado] ");
                query.Append("( ");
                query.Append("[nro_estimado]");
                query.Append(",[cliente_id] ");
                query.Append(",[clte_direccion1]");
                query.Append(",[clte_direccion2]");
                query.Append(",[clte_direccion3]");
                query.Append(",[registro_tributario]");
                query.Append(",[vendedor_id]");
                query.Append(",[tipo_documento]");
                query.Append(",[fecha_emision]");
                query.Append(",[fecha_vcmto]");
                query.Append(",[refer_cliente]");
                query.Append(",[termino_id]");
                query.Append(",[impto_en_precio]");
                query.Append(",[comentario_Detalle]");
                query.Append(",[subtotal]");
                query.Append(",[dscto_monto]");
                query.Append(",[impuesto_monto]");
                query.Append(",[total]");
                query.Append(",[dscto_pciento]");
                query.Append(",[impuesto_pciento]");
                query.Append(",[tipo_envio]");
                query.Append(") ");
                query.Append("VALUES ");
                query.Append("( ");
                query.Append($"(SELECT TOP 1 CASE WHEN nro_estimado IS NULL OR nro_estimado < 1000000001 THEN 1000000001 ELSE nro_estimado + 1 END nro_estimado FROM {GlobalVariables.monica10}dbo.estimado ORDER BY estimado_id DESC) ");
                query.Append(",@cliente_id ");
                query.Append(",@clte_direccion1");
                query.Append(",@clte_direccion2");
                query.Append(",@clte_direccion3");
                query.Append(",@registro_tributario");
                query.Append(",@vendedor_id");
                query.Append(",@tipo_documento");
                query.Append(",@fecha_emision");
                query.Append(",@fecha_vcmto");
                query.Append(",@refer_cliente");
                query.Append(",@termino_id");
                query.Append(",@impto_en_precio");
                query.Append(",@comentario_Detalle");
                query.Append(",@subtotal");
                query.Append(",@dscto_monto");
                query.Append(",@impuesto_monto");
                query.Append(",@total");
                query.Append(",@dscto_pciento");
                query.Append(",@impuesto_pciento");
                query.Append(",@tipo_envio");
                query.Append(") ");
                query.Append("SELECT CAST(SCOPE_IDENTITY() AS INT) ");

                var rslt = Conn.Query<int>(query.ToString(), new
                {
                    estimado.cliente_id,
                    estimado.clte_direccion1,
                    estimado.clte_direccion2,
                    estimado.clte_direccion3,
                    estimado.registro_tributario,
                    estimado.vendedor_id,
                    estimado.tipo_documento,
                    estimado.fecha_emision,
                    estimado.fecha_vcmto,
                    estimado.refer_cliente,
                    estimado.termino_id,
                    estimado.impto_en_precio,
                    estimado.comentario_Detalle,
                    estimado.subtotal,
                    estimado.dscto_monto,
                    estimado.impuesto_monto,
                    estimado.total,
                    estimado.dscto_pciento,
                    estimado.impuesto_pciento,
                    tipo_envio = "P"
                }).FirstOrDefault();

                //  INSERTAR EL DETALLES 
                if (rslt != default && detalle.Count > 0)
                {
                    detalle.ForEach(prodcto =>
                    {
                        query.Clear();
                        query.Append($"INSERT INTO {GlobalVariables.monica10}dbo.estimado_detalle ");
                        query.Append("(");
                        query.Append("[estimado_id]");
                        query.Append(",[fecha_emision]");
                        query.Append(",[cliente_id]");
                        query.Append(",[producto_id]");
                        query.Append(",[cantidad]");
                        query.Append(",[precio_estimado]");
                        query.Append(",[impto_pciento]");
                        query.Append(",[impto_monto]");
                        query.Append(",[descto_pciento]");
                        query.Append(",[descto_monto]");
                        query.Append(",[comentario]");
                        query.Append(") ");
                        query.Append("VALUES ");
                        query.Append("( ");
                        query.Append("@estimado_id");
                        query.Append(",@fecha_emision");
                        query.Append(",@cliente_id");
                        query.Append(",@producto_id");
                        query.Append(",@cantidad");
                        query.Append(",@precio_estimado");
                        query.Append(",@impto_pciento");
                        query.Append(",@impto_monto");
                        query.Append(",@descto_pciento");
                        query.Append(",@descto_monto");
                        query.Append(",@comentario");
                        query.Append(") ");

                        Conn.Query(query.ToString(), new
                        {
                            estimado_id = rslt,
                            estimado.fecha_emision,
                            estimado.cliente_id,
                            prodcto.producto_id,
                            prodcto.cantidad,
                            prodcto.precio_estimado,
                            prodcto.impto_pciento,
                            prodcto.impto_monto,
                            prodcto.descto_pciento,
                            prodcto.descto_monto,
                            prodcto.comentario
                        });
                    });
                }
                else
                    throw new Exception();
                return rslt;
            }
            catch (Exception ex)
            {
                return -1;
            }
        }
    }
}