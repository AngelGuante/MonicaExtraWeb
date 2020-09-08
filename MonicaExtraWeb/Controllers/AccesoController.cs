using System.Web.Mvc;

namespace MonicaExtraWeb.Controllers
{
    [AllowAnonymous]
    public class AccesoController : Controller
    {
        public ActionResult Index() =>
            View();
    }
}