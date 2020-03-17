using MonicaExtraWeb.Models.monica10_global;
using MonicaExtraWeb.Models.monicaExtra;
using System.Linq;
using System.Net;
using System.Web.Http;

namespace MonicaExtraWeb.Controllers.API
{
    [RoutePrefix("API/ASPISAP")]
    public class APISAPController : ApiController
    {
        public empresa Empresa { get; set; } = null;

        /// <summary>
        /// Retorna todas las empresas almacenadas en la base de datos.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GetEmpresas")]
        public IHttpActionResult GetEmpresas()
        {
            using (var empresas = new monica10_globalEntities())
                return Json(new { Empresas = empresas.empresas.Select(e => new { e.empresa_id, e.Nombre_empresa }).ToList() });
        }

        /// <summary>
        /// Guardar los datos del id de la empresa seleccionada.
        /// </summary>
        /// <param name="idEmpresa"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("EmpresaSeleccionada")]
        public IHttpActionResult EmpresaSeleccionada(int idEmpresa)
        {
            using (var empresaSeleccionada = new monica10_globalEntities())
                Empresa = empresaSeleccionada.empresas.Where(e => e.empresa_id == idEmpresa)
                                                      .FirstOrDefault();
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
        public IHttpActionResult ObtenerListadoMovimientos()
        {
            using (var movimientos = new monica10Entities())
                return Json(new { movimientos = movimientos.movimientocajas.ToList().OrderByDescending(m => m.NumeroTransacion) });
        }
    }
}
