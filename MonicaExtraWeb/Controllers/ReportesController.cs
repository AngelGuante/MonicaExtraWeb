using System.Web.Mvc;

namespace MonicaExtraWeb.Controllers
{
    public class ReportesController : Controller
    {
        //[Authorize]
        public ActionResult Index() =>
            View();
    }
}