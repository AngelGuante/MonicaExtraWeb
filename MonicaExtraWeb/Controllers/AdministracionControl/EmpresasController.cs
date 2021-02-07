using System.Web.Mvc;
using static MonicaExtraWeb.Utils.Token.TokenValidatorController;
using static MonicaExtraWeb.Utils.Token.Claims;
using Newtonsoft.Json;

namespace MonicaExtraWeb.Controllers.AdministracionControl
{
    [RoutePrefix("Control/Empresas")]
    public class EmpresasController : Controller
    {
        [Route("Gestion")]
        public ActionResult Gestion()
        {
            if (Validate(this))
            {
                var claims = GetClaims();
                var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                    new { empresaId = "", userNivel = "" });
                if (json.userNivel == "0")
                    return View();
            }

            Response.StatusCode = 401;
            return null;
        }
    }
}