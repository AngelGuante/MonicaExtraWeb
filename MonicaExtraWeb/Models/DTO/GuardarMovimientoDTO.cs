namespace MonicaExtraWeb.Models.DTO
{
    public class GuardarMovimientoDTO
    {
            public string Fecha{ set; get; }
            public string Beneficiario{ set; get; }
            public decimal Monto{ set; get; }
            public int TipoMovimiento{ set; get; }
            public string Concepto{ set; get; }
            public string RNC{ set; get; }
            public string NCF{ set; get; }
            public string Clasificancf{ set; get; }
            public string Neto{ set; get; }
            public string Itebis{ set; get; }
    }
}