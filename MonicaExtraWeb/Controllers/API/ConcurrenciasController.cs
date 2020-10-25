using MonicaExtraWeb.Models.DTO.Control;
using System.Web.Http;
using static MonicaExtraWeb.Utils.Querys.Control.Concurrencias;
using static MonicaExtraWeb.Utils.GlobalVariables;
using Dapper;

namespace MonicaExtraWeb.Controllers.API
{
    [Authorize]
    [RoutePrefix("API/CONCURRENCIAS")]
    public class ConcurrenciasController : ApiController
    {
        [HttpDelete]
        [Route("DELETE")]
        public void DELETE(Usuario usuario) =>
            Conn.Query(Delete(usuario.IdEmpresa.ToString(), usuario.IdUsuario.ToString()));
    }
}
