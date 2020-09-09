using System.Web.Mvc;
using static MonicaExtraWeb.Utils.Token.TokenValidatorController;

namespace MonicaExtraWeb.Controllers
{
    public class AdministracionController : Controller
    {
        public ActionResult Index()
        {
            if (Validate(this))
                return View();
            else
                return RedirectToAction("Index", "Acceso", new { tokenStatus = "invalid" });
        }
    }
}