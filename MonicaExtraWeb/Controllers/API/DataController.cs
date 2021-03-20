using MonicaExtraWeb.Models.DTO.Control;
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
                CompanyRemoteConnectionIP,
                loginFailsUsers,
            });
        }

        [HttpPost]
        [Route("POST")]
        public IHttpActionResult Post(DataDTO data)
        {
            cache_empresas = data.cache_empresas;
            CompanyRemoteConnectionIP = data.CompanyRemoteConnectionIP;
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
        public Dictionary<string, Usuario> loginFailsUsers { get; } = new Dictionary<string, Usuario>();
    }
}
