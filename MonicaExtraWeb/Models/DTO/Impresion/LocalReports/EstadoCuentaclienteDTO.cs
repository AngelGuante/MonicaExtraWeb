using MonicaExtraWeb.Models.monica10;
using System.Collections.Generic;

namespace MonicaExtraWeb.Models.DTO.Impresion.LocalReports
{
    public class EstadoCuentaclienteDTO
    {
        public List<ReporteEstadoCuentaClienteDTO> Reportes { get; set; }
        public clientes Client { get; set; }
    }
}