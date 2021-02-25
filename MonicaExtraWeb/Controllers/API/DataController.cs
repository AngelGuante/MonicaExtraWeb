using MonicaExtraWeb.Models.DTO.Control;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;

namespace MonicaExtraWeb.Controllers.API
{
    [Authorize]
    [RoutePrefix("API/DATA")]
    public class DataController : ApiController
    {
        [HttpGet]
        [Route("GET")]
        public IHttpActionResult Get()
        {
            return Json(new
            {
                cache_empresas,
                //DataWebsocketPerClient,
                CompanyRemoteConnectionIP,
                //CompanyRemoteConnectionUsers,
                //CompanyRemoteConnectionUsersDisconected,
                loginFailsUsers,
            });
        }

        [HttpPost]
        [Route("POST")]
        public IHttpActionResult Post(DataDTO data)
        {
            cache_empresas = data.cache_empresas;
            //DataWebsocketPerClient = data.DataWebsocketPerClient;
            CompanyRemoteConnectionIP = data.CompanyRemoteConnectionIP;
            //CompanyRemoteConnectionUsers = data.CompanyRemoteConnectionUsers;
            //CompanyRemoteConnectionUsersDisconected = data.CompanyRemoteConnectionUsersDisconected;
            loginFailsUsers = data.loginFailsUsers;
            return Json(true);
        }
    }

    public class DataDTO
    {
        public List<Empresa> cache_empresas { get; } = new List<Empresa>();
        public Dictionary<string, string> DataWebsocketPerClient { get; } = new Dictionary<string, string>();
        public Dictionary<string, string> CompanyRemoteConnectionIP { get; } = new Dictionary<string, string>();
        public Dictionary<string, Usuario> CompanyRemoteConnectionUsers { get; } = new Dictionary<string, Usuario>();
        //public Dictionary<string, string> CompanyRemoteConnectionUsersDisconected { get; } = new Dictionary<string, string>();
        public Dictionary<string, Usuario> loginFailsUsers { get; } = new Dictionary<string, Usuario>();
    }
}
