﻿namespace MonicaExtraWeb.Models.DTO.Reportes
{
    public class FiltroGetIndividualClientStatus
    {
        public string clientCode { get; set; }
        //public bool MostrarRNC { get; set; } = false;
        public bool SoloDocsVencidos { get; set; } = false;
        //public bool IncluirFirmas { get; set; } = false;
        //public bool IncluirMoras { get; set; } = false;
    }
}