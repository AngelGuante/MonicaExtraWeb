﻿/// <summary>
/// METODO PARA TENER CONTROL SOBRE LOS QUERYS.
/// </summary>
namespace MonicaExtraWeb.Models.DTO
{
    public class QueryConfigDTO
    {
        public string Select { get; set; }
        public string Where_In { get; set; }
        public bool ExcluirUsuariosControl { get; set; }
        public bool Usuario_Join_IdEmpresaM { get; set; }
    }
}