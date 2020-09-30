using Dapper;
using MonicaExtraWeb.Models.DTO;
using MonicaExtraWeb.Models.monica10;
using MonicaExtraWeb.Models.monica10_global;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Querys.Data;

namespace MonicaExtraWeb.Controllers.API
{
    [Authorize]
    [RoutePrefix("API/ASPISAP")]
    public class APISAPController : ApiController
    {
        public Empresas Empresa { get; set; } = null;

        //  VARIABLES CARGADAS EN MEMORIA
        private static StringBuilder _queryBasicoMovimientosCaja = null;

        #region EMPRESAS
        /// <summary>
        /// Retorna todas las empresas almacenadas en la base de datos.
        /// </summary>
        /// <returns></returns>
        //[HttpGet]
        //[Route("GetEmpresas")]
        //public IHttpActionResult GetEmpresas() =>
        //     Json(new { Empresas = Conn.Query<Empresas>($"SELECT empresa_id, Nombre_empresa FROM {DbName}dbo.empresas").ToList() });

        /// <summary>
        /// Guardar los datos del id de la empresa seleccionada.
        /// </summary>
        /// <param name="idEmpresa"></param>
        /// <returns></returns>
        //[HttpGet]
        //[Route("EmpresaSeleccionada")]
        //public IHttpActionResult EmpresaSeleccionada(int idEmpresa)
        //{
        //    Empresa = Conn.Query<Empresas>($"SELECT * FROM {monica10_global}dbo.empresas WHERE empresa_id = '{idEmpresa}'").FirstOrDefault();

        //    if (Empresa == null)
        //        return Content(HttpStatusCode.NoContent, "");

        //    return Json(new { Empresa });
        //}
        #endregion

        #region MOVIMIENTOS
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

            query.Append($"INSERT INTO {DbName}monicaextra.movimientocaja(Soporte, NumeroCaja, TipoMoneda, TasaCambio, Estatus, NumeroTransacion, Beneficiario, Concepto, TipoMovimiento, Monto, Fecha, NumeroCierre, RNC, NCF, Itebis, Neto, EntradaSalida, Clasificancf) ");
            query.Append("VALUES ('C', 1, 'P', 0.0000, 1, ");
            query.Append($"(SELECT MAX(NumeroTransacion) +1 FROM {DbName}monicaextra.movimientocaja), ");
            query.Append("@Beneficiario, @Concepto, @TipoMovimiento, @Monto, @Fecha, ");
            query.Append($"(SELECT MAX(NumeroCierre) +1 FROM {DbName}monicaextra.cierrecaja), ");
            query.Append("@RNC, @NCF, @Itebis, @Neto, ");
            query.Append($"(SELECT Tipo FROM {DbName}monicaextra.clasificacionmovicaja WHERE NumeroTransacion = @TipoMovimiento), @Clasificancf ) ");

            var RegistroGuardadoCant = Conn.Execute(query.ToString(), new
            {
                obj.Beneficiario,
                obj.Concepto,
                obj.TipoMovimiento,
                obj.Monto,
                obj.Fecha,
                obj.RNC,
                obj.NCF,
                obj.Itebis,
                Neto = obj.Neto == "" ? 0 : Convert.ToInt32(obj.Neto),
                obj.Clasificancf
            });

            if (RegistroGuardadoCant != 1) return Content(HttpStatusCode.BadRequest, "");
            return Json(new { id = RegistroGuardadoCant });
        }

        /// <summary>
        /// Bucar un movimiento.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("ObtenerMovimiento")]
        public IHttpActionResult ObtenerMovimiento(int id) =>
            Json(new
            {
                movimiento = Conn.Query<MovimientosCajas>(MovimientoCaja(), new { id }).FirstOrDefault()
            });

        /// <summary>
        /// Buscar movimientos por un parametros
        /// </summary>
        /// <param name="parametros"></param>
        /// <param name="flag"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("DatosMovimientosCrud")]
        public IHttpActionResult DatosMovimientosCrud(string parametros = "", string flag = "", bool conFecha = false)
        {
            //  VARIABLES PARA BUSCAR MOVIMIENTOS
            var query = new StringBuilder();
            var obj = parametros == string.Empty ?
                new BuscarMovimientosDTO { opcion = "abiertas" } :
                JsonConvert.DeserializeObject<BuscarMovimientosDTO>(parametros);
            IEnumerable<MovimientosCajas> movimientos;

            //  VARIABLES PARA BUSCAR DATOS GENERALES PARA LA VENTANA
            IEnumerable<Usuarios> usuarios = null;
            IEnumerable<ClasificacionMovimientoCaja> tiposMovimientos = null;
            IEnumerable<ClasificacionFiscal> clasificacionFiscal = null;

            #region BUSCAR LOS DETALLES DE LA VENTANA.
            if (flag == "todo")
            {
                usuarios = GetUsuarios();
                tiposMovimientos = GetTiposMovimientos();
                clasificacionFiscal = GetClasificacionFiscals();
            }
            #endregion

            #region BUSCAR LOS MOVIMIENTOS.
            query.Append(Singuelton_QueryBasicoMovimientos().ToString());

            if (conFecha)
            {
                query.Append("  AND Fecha >= @FechaDesde ");
                query.Append("  AND Fecha <= @FechaHasta AND Estatus = 1 ");
            }

            if (obj.opcion == "abiertas")
            {
                query.Append("AND ");
                query.Append(" NumeroCierre = ");
                query.Append($"      (SELECT MAX(NumeroCierre) + 1 FROM {DbName}monicaextra.cierrecaja) ");
            }

            else if (obj.opcion == "busquedaEsp")
            {
                query.Append("AND ");
                query.Append("Concepto LIKE ");
                query.Append($" '%{obj.valor}%' ");
            }

            else if (obj.opcion != "todo")
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
                    case "nroMov":
                        query.Append("NumeroTransacion ");
                        break;
                    case "CargadoA":
                        query.Append("Beneficiario ");
                        break;
                    case "rnc":
                        query.Append("Rnc ");
                        break;
                    case "ncf":
                        query.Append("Ncf ");
                        break;
                    case "NroCierre":
                        query.Append("NumeroCierre ");
                        break;
                }
                query.Append(" = @valor ");
            }

            query.Append(" ORDER BY NumeroTransacion DESC");

            movimientos = Conn.Query<MovimientosCajas>(query.ToString(), new
            {
                FechaDesde = obj.fechaDesde,
                FechaHasta = obj.fechaHasta,
                obj.valor
            });
            #endregion

            return Json(new { movimientos, usuarios, tiposMovimientos, clasificacionFiscal });
        }

        /// <summary>
        /// Modificar un movimiento.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("ModificarMovimiento")]
        public IHttpActionResult ModificarMovimiento(string id, string movimiento)
        {
            var obj = JsonConvert.DeserializeObject<MovimientosCajas>(movimiento);
            var EntradaSalida = Conn.ExecuteScalar($"SELECT Tipo FROM {DbName}monicaextra.clasificacionmovicaja WHERE NumeroTransacion = @TipoMovimiento",
                new { obj.TipoMovimiento });

            if (EntradaSalida == default)
                return StatusCode(HttpStatusCode.NotFound);

            var query = new StringBuilder();
            query.Append($"UPDATE {DbName}monicaextra.movimientocaja ");
            query.Append("SET ");
            query.Append("Fecha = @Fecha, ");
            query.Append("Monto = @Monto, ");
            query.Append("Beneficiario = @Beneficiario, ");
            query.Append("TipoMovimiento = @TipoMovimiento, ");
            query.Append("EntradaSalida = @EntradaSalida, ");
            query.Append("Concepto = @Concepto, ");
            query.Append("Rnc = @Rnc, ");
            query.Append("Ncf = @Ncf, ");
            query.Append("Clasificancf = @Clasificancf, ");
            query.Append("Neto = @Neto, ");
            query.Append("Itebis = @Itebis ");
            query.Append("WHERE NumeroTransacion = @id ");

            var completed = Conn.Execute(query.ToString(),
                new
                {
                    obj.Fecha,
                    obj.Monto,
                    obj.Beneficiario,
                    obj.TipoMovimiento,
                    EntradaSalida,
                    obj.Concepto,
                    obj.Rnc,
                    obj.Ncf,
                    obj.Clasificancf,
                    obj.Neto,
                    obj.Itebis,
                    id
                });

            if (completed == 1)
                return StatusCode(HttpStatusCode.OK);
            else if (completed == 0)
                return StatusCode(HttpStatusCode.NotModified);
            else
                return StatusCode(HttpStatusCode.InternalServerError);
        }
        #endregion

        #region CIERRESCAJA
        /// <summary>
        /// OBTIENE TODOS LOS CIERRES DE CAJA.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("ObtenerCierresCaja")]
        public IHttpActionResult ObtenerCierresCaja(string fechaInicial, string fechaFinal, int index = 1, int take = 10)
        {
            int Total = 0;
            IEnumerable<CierresCaja> Cierres;
            var query = new StringBuilder();

            query.Append($"SELECT * ");
            query.Append($"FROM {DbName}monicaextra.cierrecaja ");

            if ((fechaInicial != fechaFinal) && (fechaInicial != default || fechaFinal != default))
            {
                query.Append("WHERE ");

                if (fechaInicial != default)
                    query.Append($"FechaInicial >= '{fechaInicial}' ");

                query.Append(fechaInicial != default ? "AND " : "");

                if (fechaFinal != default)
                    query.Append($"FechaFinal <= '{fechaFinal}' ");
            }

            //  OBTENER EL TOTAL DE REGISTROS.
            Total = Conn.Query<CierresCaja>(query.ToString()).Count();

            query.Append("ORDER BY NumeroCierre DESC ");

            query.Append($"OFFSET {(index - 1) * take} ROWS FETCH NEXT {take} ROWS ONLY ");

            Cierres = Conn.Query<CierresCaja>(query.ToString());
            return Json(new { Cierres, Total });
        }

        /// <summary>
        /// RETORNA LOS DETALLES DE LOS MOVIMIENTOS PARA EL CIERRE DE CAJA.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("ObtnerDatosMovimientosParaCierres")]
        public IHttpActionResult ObtnerDatosMovimientosParaCierres()
        {
            string FechaUltimoCierre;
            var query = new StringBuilder();

            //  FECHA DEL ULTIMO CIERRE
            query.Append($"SELECT MAX(FechaFinal) ");
            query.Append($"FROM {DbName}monicaextra.cierrecaja ");

            FechaUltimoCierre = (string)Conn.ExecuteScalar($"{query.ToString()}");

            //  TOTAL DE MOVIMIENTOS Y SUMATORIA DE LOS MONTOS
            query.Clear();
            query.Append($"SELECT CAST(SUM(Monto) AS VARCHAR) Monto, CAST(COUNT(*) AS VARCHAR) Total, MAX(Fecha) FechaUltimoMovimiento ");
            query.Append($"FROM {DbName}monicaextra.movimientocaja ");
            query.Append($"WHERE NumeroCierre = ( ");
            query.Append($"SELECT MAX(NumeroCierre) +1 Cierre ");
            query.Append($"FROM {DbName}monicaextra.cierrecaja ");
            query.Append($") ");

            var result = Conn.Query<DetallesMovimientosParaCierreDTO>(query.ToString()).FirstOrDefault();

            return Json(new { result.Monto, result.Total, result.FechaUltimoMovimiento, FechaUltimoCierre });
        }

        /// <summary>
        /// -------------------------------
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("FechaUltimoCierre")]
        public IHttpActionResult FechaUltimoCierre()
        {
            string FechaUltimoCierre;
            var query = new StringBuilder();

            query.Append($"SELECT MAX(FechaFinal) ");
            query.Append($"FROM {DbName}monicaextra.cierrecaja ");

            FechaUltimoCierre = (string)Conn.ExecuteScalar($"{query.ToString()}");

            return Json(new { FechaUltimoCierre });
        }

        /// <summary>
        /// -------------------------------
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("UltimoCierre")]
        public IHttpActionResult UltimoCierre()
        {
            var query = new StringBuilder();
            query.Append($"SELECT MAX(NumeroCierre) ");
            query.Append($"FROM {DbName}monicaextra.cierrecaja ");

            string UltimoCierre = Conn.ExecuteScalar(query.ToString()).ToString();

            return Json(new { UltimoCierre });
        }

        /// <summary>
        /// -------------------------------
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("MovimientosParaCierre")]
        public IHttpActionResult MovimientosParaCierre(string idCierre = "") =>
            Json(new { Movimientos = Conn.Query<MovimientosCajas>(ObtenerMovimientosDeCierre(idCierre)) });

        /// <summary>
        /// -------------------------------
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("CerrarCaja")]
        public IHttpActionResult CerrarCaja(string cierre)
        {

            var cierreObj = JsonConvert.DeserializeObject<CierresCaja>(cierre);
            var query = new StringBuilder();

            query.Append($"INSERT INTO {DbName}monicaextra.cierrecaja ");
            query.Append("(NumeroCierre, FechaProceso, FechaInicial, FechaFinal, NumeroCaja, SaldoFinal, Comentario) ");
            query.Append("VALUES ( ");
            query.Append("(SELECT MAX(NumeroCierre) +1  ");
            query.Append($"FROM {DbName}monicaextra.cierrecaja), ");
            query.Append("@FechaProceso, ");
            query.Append("@FechaInicial, ");
            query.Append("@FechaFinal, ");
            query.Append("1, ");
            query.Append("@SaldoFinal, ");
            query.Append("'Cierre Normal' ");
            query.Append(") ");

            var exct = Conn.Execute(query.ToString(), new
            {
                FechaProceso = DateTime.Now.ToString("yyyy-MM-dd"),
                cierreObj.FechaInicial,
                cierreObj.FechaFinal,
                cierreObj.SaldoFinal
            });

            if (exct != default) return Ok();
            else return StatusCode(HttpStatusCode.NotImplemented);
        }
        #endregion

        #region METODOS DE - MOVIMIENTOS
        private IEnumerable<Usuarios> GetUsuarios() =>
            Conn.Query<Usuarios>($"SELECT * FROM {DbName}dbo.usuarios WHERE activo = 1");

        private IEnumerable<ClasificacionMovimientoCaja> GetTiposMovimientos() =>
            Conn.Query<ClasificacionMovimientoCaja>($"SELECT * FROM {DbName}monicaextra.clasificacionmovicaja WHERE visible = 1 ORDER BY Tipo, Descripcion");

        private IEnumerable<ClasificacionFiscal> GetClasificacionFiscals() =>
            Conn.Query<ClasificacionFiscal>($"SELECT * FROM {DbName}monicaextra.clasificacionfiscal ORDER BY Descripcion");

        private StringBuilder Singuelton_QueryBasicoMovimientos()
        {
            if (_queryBasicoMovimientosCaja == null)
            {
                _queryBasicoMovimientosCaja = new StringBuilder();
                _queryBasicoMovimientosCaja.Append($"SELECT M.NumeroTransacion, M.Beneficiario, U.nombre_completo, M.Concepto, M.Monto, M.Fecha, M.NumeroCierre ");
                _queryBasicoMovimientosCaja.Append($"FROM {DbName}monicaextra.movimientocaja M ");
                _queryBasicoMovimientosCaja.Append($"LEFT JOIN {DbName}dbo.usuarios U ");
                _queryBasicoMovimientosCaja.Append("ON M.Beneficiario = CAST(U.id_usuario as VARCHAR) ");
                _queryBasicoMovimientosCaja.Append("WHERE Estatus = 1 ");
            }

            return _queryBasicoMovimientosCaja;
        }
        #endregion

        //protected override void Dispose(bool disposing)
        //{
        //    if (disposing)
        //    {
        //        base.Dispose(disposing);
        //        Conn.Dispose();
        //    }
        //}
    }
}
