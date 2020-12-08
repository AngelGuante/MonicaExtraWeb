namespace MonicaExtraWeb.Models.monica10
{
    public class EstimadoDetalle
    {
        public int detalle_id { get; set; }
        public int estimado_id { get; set; }
        public string fecha_emision { get; set; }
        public int cliente_id { get; set; }
        public int producto_id { get; set; }
        public int bodega_id { get; set; }
        public int cantidad { get; set; }
        public int recibido { get; set; }
        public int unidad_id { get; set; }
        public float precio_estimado { get; set; }
        public float impto_pciento { get; set; }
        public float impto_monto { get; set; }
        public float descto_pciento { get; set; }
        public float descto_monto { get; set; }
        public float impto2_pciento { get; set; }
        public float impto2_monto { get; set; }
        public string comentario { get; set; }
        public string tipo_cambio { get; set; }
        public string moneda { get; set; }
    }
}