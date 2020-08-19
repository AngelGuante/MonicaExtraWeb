namespace MonicaExtraWeb.Models.DTO.Reportes
{
    public class Filtros
    {
        private int _take;

        public bool SUM { get; set; } = false;
        public bool COUNT { get; set; } = false;
        public bool GROUP { get; set; } = false;

        //  **GetIndividualClientStatus**
        public string opcion { get; set; }
        public string code { get; set; }
        public string name { get; set; }
        public string agrupacionProductos { get; set; }
        public string subCategoriaProductos { get; set; }
        public string categoriaProductos { get; set; }
        public string bodega { get; set; }
        public string vendedorEspesifico { get; set; }
        public string tipoNCF { get; set; }
        public bool SoloDocsVencidos { get; set; } = false;
        public bool descripcionSimplificada { get; set; } = true;
        //public bool IncluirFirmas { get; set; } = false;
        //public bool IncluirMoras { get; set; } = false;

        //  **InventarioYLiquidaciones**
        public string soloPrroductosConExistencia { get; set; }
        public string agregarProductosInactivos { get; set; }

        //  **ClientesTProveedores**
        public string id_giro { get; set; }
        public string empresa { get; set; }
        public string categoriaP { get; set; }

        //  **VentasDevolucionesCategoriaYVendedor**
        public string tipoReporte { get; set; }
        public string tipoCorte { get; set; }
        public string minFecha_emision { get; set; }
        public string maxFecha_emision { get; set; }
        public string Codigo_vendedor { get; set; }
        public string categoria_clte_id { get; set; }
        public string tipo_factura { get; set; }
        public string tipoConsulta { get; set; }
        public string desde { get; set; }
        public string hasta { get; set; }
        public string valor { get; set; }
        public string colVendedor { get; set; }
        public string colComprobante { get; set; }
        public string colTermino { get; set; }
        public string colMoneda { get; set; }
        public string agruparPorMes { get; set; }
        public string comprobante { get; set; }
        public string soloNCFFormatoElectronico { get; set; }

        //  **CotizacionesYConduces**
        public string estatus { get; set; }

        //  MANEJO DE DATA COTIZACIONES
        public string NroCotizacion { get; set; }
        public string NroFactura { get; set; }
        public bool validarParaCierre { get; set; } = false;
        public string notas { get; set; }
        public string genero_factura1 { get; set; }
        public string genero_factura2 { get; set; }
        public string genero_factura3 { get; set; }

        //  PAGINACION
        public int skip { get; set; } = 0;
        public int take
        {
            get => _take > 0 ? _take : 20;
            set => _take = value;
        }
    }
}