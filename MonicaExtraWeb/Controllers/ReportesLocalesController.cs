using MonicaExtraWeb.Enums;
using MonicaExtraWeb.Models.DTO;
using MonicaExtraWeb.Models.DTO.Reportes;
using Newtonsoft.Json;
using System.Threading.Tasks;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.LocalRequestQuery;


namespace MonicaExtraWeb.Controllers
{
    [RoutePrefix("API/ReportesLocales")]
    public class ReportesLocalesController : ApiController
    {
        [HttpPost]
        [Route("SendWebsocketServer/{status}")]
        public async Task<IHttpActionResult> SendWebsocketServer(ClientMessageStatusEnum status, FiltrosReportes filtro) =>
            Json(new { value = await SendQueryToClient(status, filtro) });

        [HttpPost]
        [Route("ReceiveDataFromWebSocketServer")]
        [Route("ReceiveDataFromWebSocketServer/{IP}")]
        public void ReceiveDataFromWebSocketServer(string IP, WebSocketDTO data) =>
            DataWebsocketPerClient.Add(IP, JsonConvert.SerializeObject(data));

        [HttpGet]
        [Route("GetWebsocketResponseFile")]
        public IHttpActionResult GetWebsocketResponseFile()
        {
            RequestClientData(out string resultset);

            return Json(new { resultset });
        }
    }
}
