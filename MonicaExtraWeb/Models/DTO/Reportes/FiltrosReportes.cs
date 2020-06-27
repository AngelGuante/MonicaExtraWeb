namespace MonicaExtraWeb.Models.DTO.Reportes
{
    public class FiltrosReportes
    {
        public bool SUM { get; set; } = false;

        //  **GetIndividualClientStatus**
        public string clientCode { get; set; }
        public bool SoloDocsVencidos { get; set; } = false;
        //public bool IncluirFirmas { get; set; } = false;
        //public bool IncluirMoras { get; set; } = false;

        //  **VentasDevolucionesCategoriaYVendedor**
        public string tipoReporte { get; set; }
        public string minFecha_emision { get; set; }
        public string maxFecha_emision { get; set; }
        public string Codigo_vendedor { get; set; }
        public string categoria_clte_id { get; set; }
        public string tipo_factura { get; set; }
    }
}