using System.Web.Mvc;

namespace MonicaExtraWeb.Controllers
{
    public class MenuController : Controller
    {
        public ActionResult Index() =>
            View();
    }
}