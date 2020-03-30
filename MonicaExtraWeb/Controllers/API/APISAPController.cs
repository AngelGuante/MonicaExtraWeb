using Dapper;
using MonicaExtraWeb.Models.DTO;
using MonicaExtraWeb.Models.monica10;
using MonicaExtraWeb.Models.monica10_global;
using Newtonsoft.Json;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Text;
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
                return Content(HttpStatusCode.NoContent, "");

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

        /// <summary>
        /// Para la ventana que contiene el CRUD de los movimientos.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("ModuleMovimientosCajaCRUD")]
        public IHttpActionResult ModuleMovimientosCajaCRUD() =>
            Json(new
            {
                usuarios = Conn.Query<Usuarios>("SELECT * FROM monica10.dbo.usuarios WHERE activo = 1").ToList(),
                tiposMovimientos = Conn.Query<ClasificacionMovimientoCaja>("SELECT * FROM monica10.monicaextra.clasificacionmovicaja WHERE visible = 1 ORDER BY Tipo, Descripcion").ToList(),
                clasificacionFiscal = Conn.Query<ClasificacionFiscal>("SELECT * FROM monica10.monicaextra.clasificacionfiscal ORDER BY Descripcion")
            });

        /// <summary>
        /// Guarda un movimiento.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("GuardarMovimiento")]
        public IHttpActionResult GuardarMovimiento(string movimiento)
        {
            var obj = JsonConvert.DeserializeObject<GuardarMovimientoDTO>(movimiento);

            StringBuilder query = new StringBuilder();
            query.Append("INSERT INTO monica10.monicaextra.movimientocaja(Soporte, NumeroCaja, TipoMoneda, TasaCambio, Estatus, NumeroTransacion, Beneficiario, Concepto, TipoMovimiento, Monto, Fecha, NumeroCierre, RNC, NCF, Itebis, Neto, EntradaSalida, Clasificancf) ");
            query.Append("VALUES ('C', 1, 'P', 0.0000, 1, ");
            query.Append("(SELECT MAX(NumeroTransacion) +1 FROM monica10.monicaextra.movimientocaja), ");
            query.Append("@Beneficiario, @Concepto, @TipoMovimiento, @Monto, @Fecha, ");
            query.Append("(SELECT MAX(NumeroCierre) +1 FROM monica10.monicaextra.cierrecaja), ");
            query.Append("@RNC, @NCF, @Itebis, @Neto, ");
            query.Append("(SELECT EntradaSalida FROM monica10.monicaextra.movimientocaja WHERE NumeroTransacion = @TipoMovimiento), @Clasificancf) ");

            var RegistroGuardadoCant = Conn.Execute(query.ToString(), new
            {
                Beneficiario = obj.CargadoA,
                obj.Concepto,
                obj.TipoMovimiento,
                obj.Monto,
                Fecha = obj.FechaEmicion,
                obj.RNC,
                obj.NCF,
                Clasificancf = obj.ClasificacionFiscal,
                Itebis = obj.ITBsFacturado,
                Neto = obj.ValorSinITBIs
            });

            if (RegistroGuardadoCant != 1) return Content(HttpStatusCode.BadRequest, "");
            return Ok();
        }

        /// <summary>
        /// Bucar un movimiento.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("ObtenerMovimiento")]
        public IHttpActionResult ObtenerMovimiento(int id) =>
            Json(new { movimiento = Conn.Query<MovimientosCajas>("SELECT * FROM monica10.monicaextra.movimientocaja WHERE NumeroTransacion = @id", new { id }).FirstOrDefault() });

        /// <summary>
        /// Bucar un movimiento.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("BuscarMovimientos")]
        public IHttpActionResult BuscarMovimientos(string parametros)
        {
            var obj = JsonConvert.DeserializeObject<BuscarMovimientosDTO>(parametros);
            StringBuilder query = new StringBuilder();
            query.Append("SELECT * FROM monica10.monicaextra.movimientocaja WHERE Fecha >= @FechaDesde AND Fecha <= @FechaHasta AND Estatus = 1 ");

            if (obj.opcion != "todo")
            {
                query.Append("AND ");
                switch (obj.opcion)
                {
                    case "tmovimiento":
                        query.Append("TipoMovimiento ");
                        break;
                    case "es":
                        query.Append("EntradaSalida ");
                        break;
                    case "cfiscal":
                        query.Append("Clasificancf ");
                        break;
                }
                query.Append("= @valor ");
            }

            var movimientos = Conn.Query<MovimientosCajas>(query.ToString(), new
            {
                FechaDesde = obj.fechaDesde,
                FechaHasta = obj.fechaHasta,
                obj.valor
            });

            return Json(new { movimientos });
        }

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
