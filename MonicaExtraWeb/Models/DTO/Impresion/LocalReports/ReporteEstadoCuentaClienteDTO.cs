using System;

namespace MonicaExtraWeb.Models.DTO.Impresion.LocalReports
{
    public class ReporteEstadoCuentaClienteDTO
    {
        public DateTime fecha_emision { get; set; }
        public DateTime fecha_vcmto { get; set; }
        public string ncf { get; set; }
        public string descripcion_dcmto { get; set; }
        public float monto { get; set; }
        public float pagosAcumulados { get; set; }
        public float balance { get; set; }
    }
}