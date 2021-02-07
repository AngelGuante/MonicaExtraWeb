using System.Collections.Generic;
using MonicaExtraWeb.Models.DTO.Control;

namespace MonicaExtraWeb.Models.DTO
{
    public static class DataCacheada
    {
        public static List<Empresa> cache_empresas { get; } = new List<Empresa>();
    }
}