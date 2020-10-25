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
using static MonicaExtraWeb.Utils.Token.TokenValidatorController;

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
            if (Validate(this))
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
            return null;
        }

        public ActionResult Movimiento(string parametros)
        {
            if (Validate(this))
            {
                var obj = JsonConvert.DeserializeObject<MovimientoDTO>(parametros);
                var movimiento = Conn.Query<MovimientosCajas>(MovimientoCaja(), new { id = obj.NumeroTransacion }).FirstOrDefault();
                return View(movimiento);
            }

            Response.StatusCode = 401;
            return null;
        }

        public ActionResult Cierre(string parametros)
        {
            if (Validate(this))
            {
                var obj = JsonConvert.DeserializeObject<CierreDTO>(parametros);
                var cierreCaja = Conn.Query<MovimientosCajas>(ObtenerMovimientosDeCierre(obj.NumeroCierre));
                return View(cierreCaja);
            }

            Response.StatusCode = 401;
            return null;
        }

        public async Task<ActionResult> ReporteEstadoCuentaCliente(string parametros)
        {
            if (Validate(this))
            {
                var obj = JsonConvert.DeserializeObject<LocalQueryClientDTO>(parametros);
                _ = await SendQueryToClient(obj.status, obj.filtro);
                string resultset;
                string resultsetCliente;

                do
                {
                    RequestClientData(out resultset);
                    Thread.Sleep(1000);
                }
                while (resultset == null);

                // BUSCAR LOS DATOS DEL CLIENTE
                _ = await SendQueryToClient(Enums.ClientMessageStatusEnum.ClienteInformacion, obj.filtro);

                do
                {
                    RequestClientData(out resultsetCliente);
                    Thread.Sleep(1000);
                }
                while (resultsetCliente == null);

                var AnonymousData = JsonConvert.DeserializeAnonymousType(resultset, new { data = "" });
                var AnonymousDataClient = JsonConvert.DeserializeAnonymousType(resultsetCliente, new { data = "" });

                var model = new EstadoCuentaclienteDTO
                {
                    Reportes = JsonConvert.DeserializeObject<List<ReporteEstadoCuentaClienteDTO>>(AnonymousData.data) ?? new List<ReporteEstadoCuentaClienteDTO>(),
                    Client = JsonConvert.DeserializeObject<List<clientes>>(AnonymousDataClient.data).FirstOrDefault() ?? new clientes()
                };

                return View(model);
            }

            Response.StatusCode = 401;
            return null;
        }
    }
}