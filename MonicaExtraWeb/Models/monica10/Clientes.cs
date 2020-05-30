using System;

namespace MonicaExtraWeb.Models.monica10
{
	public class clientes
	{
		public int cliente_id { get; set; }
		public string codigo_clte { get; set; }
		public string nombre_clte { get; set; }
		public string direccion1 { get; set; }
		public string direccion2 { get; set; }
		public string direccion3 { get; set; }
		public string ciudad { get; set; }
		public string Provincia { get; set; }
		public string pais { get; set; }
		public string Codigo_postal { get; set; }
		public string telefono1 { get; set; }
		public string telefono2 { get; set; }
		public string fax { get; set; }
		public string Contacto { get; set; }
		public string e_mail1 { get; set; }
		public string e_mail2 { get; set; }
		public int Categoria_Clte_id { get; set; }
		public int vendedor_id { get; set; }
		public decimal Balance { get; set; }
		public string clte_Activo { get; set; }
		public string registro_empresarial { get; set; }
		public string registro_tributario { get; set; }
		public string cuenta_cont_ventas { get; set; }
		public int giro_id { get; set; }
		public DateTime creado { get; set; }
		public decimal maximo_Credito { get; set; }
		public decimal Descuento { get; set; }
		public decimal interes_anual { get; set; }
		public int termino_id { get; set; }
		public string comentario { get; set; }
		public int facturar_con { get; set; }
		public string campo1 { get; set; }
		public string campo2 { get; set; }
		public string campo3 { get; set; }
		public bool imagen { get; set; }
		public string aplica_reten_impto { get; set; }
		public string reten_impto { get; set; }
		public string aplica_reten_ica { get; set; }
		public string reten_ica { get; set; }
		public string aplica_reten_fuente { get; set; }
		public string reten_fuente { get; set; }
		public string aplica_2do_impto { get; set; }
		public string segundo_impto { get; set; }
		public string aplica_impto { get; set; }
		public string impto { get; set; }
		public string primer_apellido { get; set; }
		public string segundo_apellido { get; set; }
		public string primer_nombre { get; set; }
		public string segundo_nombre { get; set; }
		public string tipo_empresa { get; set; }
		public string Impto_incluido { get; set; }
		public decimal monto_ult_transac { get; set; }
		public DateTime fecha_ult_transac { get; set; }
		public string descri_ult_transac { get; set; }
	}
}