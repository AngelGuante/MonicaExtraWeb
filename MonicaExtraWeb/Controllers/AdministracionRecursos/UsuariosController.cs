using System.Web.Mvc;
using static MonicaExtraWeb.Utils.Token.TokenValidatorController;

namespace MonicaExtraWeb.Controllers
{
    [RoutePrefix("Administracion/Usuarios")]
    public class UsuariosController : Controller
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