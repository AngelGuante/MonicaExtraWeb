using Dapper;
using MonicaExtraWeb.Models.DTO.Reportes;
using System;
using System.Text;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;

namespace MonicaExtraWeb.Controllers.API
{
    [RoutePrefix("API/Reportes")]
    public class ReportesController : ApiController
    {
        [HttpGet]
        [Route("GetIndividualClientStatus")]
        [Route("GetIndividualClientStatus/{clientCode}")]
        public IHttpActionResult GetIndividualClientStatus(string clientCode, [FromUri] FiltroGetIndividualClientStatus filtro)
        {
            if (clientCode == null
                || clientCode == default)
                return StatusCode(System.Net.HttpStatusCode.BadRequest);

            #region CREATING THE QUERY
            var query = new StringBuilder();

            query.Append("  SELECT ");
            query.Append("      D.fecha_emision, ");
            query.Append("      D.fecha_vcmto, ");
            query.Append("      D.descripcion_dcmto, ");
            query.Append("      (D.monto_dcmto - D.balance) pagosAcumulados, ");
            query.Append("      D.ncf ");
            query.Append($" FROM {DbName}.dbo.clientes C ");
            query.Append("  JOIN docs_cc D ON C.cliente_id = D.cliente_id ");
            query.Append($" WHERE C.codigo_clte = {clientCode} ");

            if (filtro.SoloDocsVencidos)
            {
                var dateNow = DateTime.Now;
                query.Append($" AND fecha_vcmto < '{dateNow.Year}-{dateNow.Month}-{dateNow.Day}'  ");
            } 
            #endregion

            return Json(new
            {
                IndividualClientStatusDATA = Conn.Query<IndividualClientStatusDTO>(query.ToString())
            });
        }
    }
}
