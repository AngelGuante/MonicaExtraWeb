using Dapper;
using MonicaExtraWeb.Models.monica10;
using MonicaExtraWeb.Models.monica10_global;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Web.Http;

namespace MonicaExtraWeb.Controllers.API
{
    [RoutePrefix("API/ASPISAP")]
    public class APISAPController : ApiController
    {
        private string ConnectionString { get; } = ConfigurationManager.ConnectionStrings["monica10_global"].ConnectionString;
        public SqlConnection Conn { get; set; } = null;
        public Empresas Empresa { get; set; } = null;

        public APISAPController() =>
            Conn = Conn ?? new SqlConnection(ConnectionString);

        /// <summary>
        /// Retorna todas las empresas almacenadas en la base de datos.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetEmpresas")]
        public IHttpActionResult GetEmpresas() =>
             Json(new { Empresas = Conn.Query<Empresas>("SELECT empresa_id, Nombre_empresa FROM monica10_global.dbo.empresas").ToList() });

        /// <summary>
        /// Guardar los datos del id de la empresa seleccionada.
        /// </summary>
        /// <param name="idEmpresa"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("EmpresaSeleccionada")]
        public IHttpActionResult EmpresaSeleccionada(int idEmpresa)
        {
            Empresa = Conn.Query<Empresas>("SELECT * FROM monica10_global.dbo.empresas WHERE empresa_id = @idEmpresa", new { idEmpresa }).FirstOrDefault();

            if (Empresa == null)
                return Content(HttpStatusCode.NoContent, "Empresa no encontrada.");

            return Ok();
        }

        /// <summary>
        /// Obtener un listado de todos los movimientos hechos de manera decendente.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("ObtenerListadoMovimientos")]
        public IHttpActionResult ObtenerListadoMovimientos() =>
            Json(new { movimientos = Conn.Query<MovimientosCajas>("SELECT NumeroTransacion, Beneficiario, Concepto, Monto, Fecha FROM monica10.monicaextra.movimientocaja WHERE Estatus = 1 ORDER BY NumeroTransacion DESC") });

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                base.Dispose(disposing);
                Conn.Dispose();
            }
        }
    }
}
