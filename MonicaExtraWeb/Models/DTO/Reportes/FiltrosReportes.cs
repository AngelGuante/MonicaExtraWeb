namespace MonicaExtraWeb.Models.DTO.Reportes
{
    public class FiltrosReportes
    {
        //  **GetIndividualClientStatus**
        public string clientCode { get; set; }
        //public bool MostrarRNC { get; set; } = false;
        public bool SoloDocsVencidos { get; set; } = false;
        //public bool IncluirFirmas { get; set; } = false;
        //public bool IncluirMoras { get; set; } = false;

        //  **VentasDevolucionesCategoriaYVendedor**
        public string tipoReporte { get; set; }
        public string minFecha_emision { get; set; }
        public string maxFecha_emision { get; set; }
        public string Codigo_vendedor { get; set; }
        public string tipo_factura { get; set; }
    }
}