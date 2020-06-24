namespace MonicaExtraWeb.Models.monica10
{
    public class MovimientosCajas
    {
        public int NumeroTransacion { set; get; }
        public string Beneficiario { set; get; } = "";
        public string nombre_completo { set; get; } = "";
        public string Concepto { set; get; } = "";
        public string Rnc { set; get; } = "";
        public string Ncf { set; get; } = "";
        public int TipoMovimiento { set; get; }
        public string DescripcionMovimiento { set; get; } = "";
        public double Monto { set; get; }
        public string Itebis { set; get; } = "";
        public string Neto { set; get; } = "";
        public string Soporte { set; get; } = "";
        public string Fecha { set; get; } = "";
        public int Saldo { set; get; }
        public string EntradaSalida { set; get; } = "";
        public string CodigoCajero { set; get; } = "";
        public int NumeroCaja { set; get; }
        public string TipoMoneda { set; get; } = "";
        public double TasaCambio { set; get; }
        public string Estatus { set; get; } = "";
        public string Clasificancf { set; get; } = "";
        public string DescripcionClasfFiscal { set; get; } = "";
        public string NumeroCierre { set; get; } = "";
    }
}