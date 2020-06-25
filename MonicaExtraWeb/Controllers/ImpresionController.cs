using Dapper;
using MonicaExtraWeb.Models.DTO.Impresion;
using MonicaExtraWeb.Models.monica10;
using Newtonsoft.Json;
using System.Linq;
using System.Web.Mvc;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Querys.Data;
using static MonicaExtraWeb.Utils.LocalRequestQuery;
using System.Threading.Tasks;
using System.Threading;
using MonicaExtraWeb.Models.DTO.Impresion.LocalReports;
using System.Collections.Generic;

namespace MonicaExtraWeb.Controllers
{
    public class ImpresionController : Controller
    {
        /// <summary>
        /// Controlará todo lo que se quiera imprimir.
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public ActionResult Imprimir(string type, string paremetros)
        {
            switch (type)
            {
                case "movimiento":
                    return RedirectToAction("Movimiento", new { parametros = paremetros });
                case "cierre":
                    return RedirectToAction("Cierre", new { parametros = paremetros });
                case "reporteEstadoCuentaCliente":
                    return RedirectToAction("ReporteEstadoCuentaCliente", new { parametros = paremetros });
            }

            return null;
        }

        public ActionResult Movimiento(string parametros)
        {
            var obj = JsonConvert.DeserializeObject<MovimientoDTO>(parametros);
            var movimiento = Conn.Query<MovimientosCajas>(MovimientoCaja(), new { id = obj.NumeroTransacion }).FirstOrDefault();
            return View(movimiento);
        }

        public ActionResult Cierre(string parametros)
        {
            var obj = JsonConvert.DeserializeObject<CierreDTO>(parametros);
            var cierreCaja = Conn.Query<MovimientosCajas>(ObtenerMovimientosDeCierre(obj.NumeroCierre));
            return View(cierreCaja);
        }

        public async Task<ActionResult> ReporteEstadoCuentaCliente(string parametros)
        {

            string resultset = null;

            var obj = JsonConvert.DeserializeObject<LocalQueryClientDTO>(parametros);

            var IPExist = await SendQueryToClient(obj.status, obj.filtro);

            do
            {
                RequestClientData(out resultset);
                Thread.Sleep(1000);
            }
            while (resultset == null);

            var AnonymousData = JsonConvert.DeserializeAnonymousType(resultset, new { data = "" });

            return View(JsonConvert.DeserializeObject<List<IndividualClientDTO>>(AnonymousData.data));
        }
    }
}