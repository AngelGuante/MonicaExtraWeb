using MonicaExtraWeb.Enums;
using MonicaExtraWeb.Models.DTO;
using MonicaExtraWeb.Models.DTO.Reportes;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Configuration;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using static MonicaExtraWeb.Utils.Reportes;
using static MonicaExtraWeb.Utils.RequestsHTTP;


namespace MonicaExtraWeb.Controllers
{
    [RoutePrefix("API/ReportesLocales")]
    public class ReportesLocalesController : ApiController
    {
        private string _websocketServerPATH = ConfigurationManager.AppSettings["websocketServerPATH"];
        private static Dictionary<string, string> DataWebsocketPerClient = new Dictionary<string, string>();

        [HttpPost]
        [Route("SendWebsocketServer/{status}")]
        public async Task<IHttpActionResult> SendWebsocketServer(ClientMessageStatusEnum status, FiltrosReportes filtro)
        {
            var IP = HttpContext.Current.Request.UserHostAddress;
            string query = "";

            switch (status)
            {
                case ClientMessageStatusEnum.IndividualClientStatusReport:
                    query = IndividualClientQuery(filtro, "");
                    break;
                case ClientMessageStatusEnum.VentasYDevolucionesCategoriaYVendedor:
                    query = VentasDevolucionesCategoriaYVendedor(filtro, "");
                    break;
                case ClientMessageStatusEnum.VendedoresInformacion:
                    query = VendedoresInformacionQuery("");
                    break;
            }

            var obj = new WebSocketDTO
            {
                data = query
            };

            var content = new StringContent(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");

            var IPExist = await POST($"{_websocketServerPATH}/SendToClient/{IP}", content);

            return Json(new { value = IPExist });
        }

        [HttpPost]
        [Route("ReceiveDataFromWebSocketServer")]
        [Route("ReceiveDataFromWebSocketServer/{IP}")]
        public void ReceiveDataFromWebSocketServer(string IP, WebSocketDTO data) =>
            DataWebsocketPerClient.Add(IP, JsonConvert.SerializeObject(data));

        [HttpGet]
        [Route("GetWebsocketResponseFile")]
        public IHttpActionResult GetWebsocketResponseFile()
        {
            var IP = HttpContext.Current.Request.UserHostAddress;
            DataWebsocketPerClient.TryGetValue(IP, out string resultset);

            if (resultset != default)
                DataWebsocketPerClient.Remove(IP);

            return Json(new { resultset });
        }
    }
}
