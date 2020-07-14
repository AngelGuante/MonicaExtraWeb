﻿using System;

namespace MonicaExtraWeb.Models.DTO.Reportes
{
    public class FiltrosReportes
    {
        private int _take;

        public bool SUM { get; set; } = false;
        public bool GROUP { get; set; } = false;

        //  **GetIndividualClientStatus**
        public string clientCode { get; set; }
        public bool SoloDocsVencidos { get; set; } = false;
        //public bool IncluirFirmas { get; set; } = false;
        //public bool IncluirMoras { get; set; } = false;

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

        //  PAGINACION
        public int skip { get; set; } = 0;
        public int take
        {
            get => _take > 0 ? _take : 20;
            set => _take = value;
        }
    }
}