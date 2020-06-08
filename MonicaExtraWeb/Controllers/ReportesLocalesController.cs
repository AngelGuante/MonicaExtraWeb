using MonicaExtraWeb.Enums;
using MonicaExtraWeb.Models.DTO;
using Newtonsoft.Json;
using System.Configuration;
using System.IO;
using System.Threading.Tasks;
using System.Web.Http;
using static MonicaExtraWeb.Utils.RequestsHTTP;
using System.Web;
using System.Collections.Generic;

namespace MonicaExtraWeb.Controllers
{
    [RoutePrefix("API/ReportesLocales")]
    public class ReportesLocalesController : ApiController
    {
        private string _websocketServerPATH = ConfigurationManager.AppSettings["websocketServerPATH"];
        private static Dictionary<string, string> DataWebsocketPerClient = new Dictionary<string, string>();

        [HttpGet]
        [Route("SendWebsocketServer")]
        [Route("SendWebsocketServer/{status}")]
        public async Task<IHttpActionResult> SendWebsocketServer(ClientMessageStatusEnum status, string data)
        {
            var IP = HttpContext.Current.Request.UserHostAddress;

            var IPExist = await GET($"{_websocketServerPATH}/SendToClient?IP={IP}&status={status}&data={data}");

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
            
            if(resultset != default)
                DataWebsocketPerClient.Remove(IP);

            return Json(new { resultset });
        }
    }
}
