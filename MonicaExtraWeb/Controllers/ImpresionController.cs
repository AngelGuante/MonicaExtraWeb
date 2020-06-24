using Dapper;
using MonicaExtraWeb.Models.DTO.Impresion;
using MonicaExtraWeb.Models.monica10;
using Newtonsoft.Json;
using System.Linq;
using System.Web.Mvc;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Querys.Data;

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
    }
}