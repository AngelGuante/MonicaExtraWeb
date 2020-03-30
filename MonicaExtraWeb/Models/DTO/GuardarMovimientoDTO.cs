namespace MonicaExtraWeb.Models.DTO
{
    public class GuardarMovimientoDTO
    {
            public string FechaEmicion{ set; get; }
            public string CargadoA{ set; get; }
            public string Monto{ set; get; }
            public string TipoMovimiento{ set; get; }
            public string Concepto{ set; get; }
            public string RNC{ set; get; }
            public string NCF{ set; get; }
            public string ClasificacionFiscal{ set; get; }
            public string ValorSinITBIs{ set; get; }
            public string ITBsFacturado{ set; get; }
    }
}