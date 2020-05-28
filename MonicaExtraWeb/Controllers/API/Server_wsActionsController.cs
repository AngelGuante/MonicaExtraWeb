using System.Web.Http;
using static MonicaExtraWeb.Utils.Server_ws;

namespace MonicaExtraWeb.Controllers.API
{
    [RoutePrefix("api/Server_wsActions")]
    public class Server_wsActionsController : ApiController
    {
        [HttpGet]
        [Route("GetMoviments")]
        public string GetMoviments()
        //public void GetMoviments(string sessionId)
        {
            //sendMessage(sessionId);
            return sendMessage();
        }
    }
}
