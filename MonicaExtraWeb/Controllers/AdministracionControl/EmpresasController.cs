using System.Web.Mvc;
using static MonicaExtraWeb.Utils.Token.TokenValidatorController;

namespace MonicaExtraWeb.Controllers.AdministracionControl
{
    [RoutePrefix("Control/Empresas")]
    public class EmpresasController : Controller
    {
        [Route("Gestion")]
        public ActionResult Gestion()
        {
            if (Validate(this))
                return View();
            else
                return RedirectToAction("Index", "Acceso", new { tokenStatus = "invalid" });
        }
    }
}