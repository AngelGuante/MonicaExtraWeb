using System;

namespace MonicaExtraWeb.Models.monica10
{
	public class docs_cc
	{
		public int cc_id { get; set; }
		public string nro_dcmto { get; set; }
		public int cliente_id { get; set; }
		public string tipo { get; set; }
		public DateTime fecha_emision { get; set; }
		public string descripcion_dcmto { get; set; }
		public decimal Monto_dcmto { get; set; }
		public decimal Monto_parcial { get; set; }
		public string Moneda { get; set; }
		public DateTime fecha_vcmto { get; set; }
		public int nro_de_pagos { get; set; }
		public decimal Balance { get; set; }
		public string nro_dcmto_pagado { get; set; }
		public int id_pagado { get; set; }
		public string modulo_origen { get; set; }
		public int id_origen { get; set; }
		public string modulo_destino { get; set; }
		public int id_destino { get; set; }
		public string nombre_pc { get; set; }
		public TimeSpan hora { get; set; }
		public decimal Monto_mora { get; set; }
		public decimal interes_mora { get; set; }
		public int dias_gracia_mora { get; set; }
		public string instrumento_pago { get; set; }
		public decimal tipo_cambio { get; set; }
		public string nro_dcmto_cliente { get; set; }
		public string clase_registro { get; set; }
		public string Estado_registro { get; set; }
		public string motivo_anulacion { get; set; }
		public decimal impuesto_1 { get; set; }
		public decimal impuesto_2 { get; set; }
		public string impto_incluido { get; set; }
		public string Observaciones { get; set; }
		public string grupo_pago { get; set; }
		public int termino_idpv { get; set; }
		public int forma_pago_id { get; set; }
		public string nro_pago { get; set; }
		public string ref_pago { get; set; }
		public DateTime fecha_hora { get; set; }
		public int id_base { get; set; }
		public int id_cta_cte { get; set; }
		public string ncf { get; set; }
	}
}