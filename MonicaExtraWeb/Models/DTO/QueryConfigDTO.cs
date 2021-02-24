/// <summary>
/// METODO PARA TENER CONTROL SOBRE LOS QUERYS.
/// </summary>
namespace MonicaExtraWeb.Models.DTO
{
    public class QueryConfigDTO
    {
        public string Select { get; set; }
        public string Where_In { get; set; }
        public bool ExcluirUsuariosControl { get; set; }
        public bool ExcluirUsuariosRemotos { get; set; }
        public bool TraerClave { get; set; }
        public bool Usuario_Join_EmpresasRegistradas { get; set; }
        public int? VencimientoEmpresa { get; set; }  // 0 : vencidas; 1 : No vencidas; 
    }
}