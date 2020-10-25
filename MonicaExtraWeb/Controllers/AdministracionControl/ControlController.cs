using System.Web.Mvc;
using static MonicaExtraWeb.Utils.Token.TokenValidatorController;

namespace MonicaExtraWeb.Controllers
{
    public class ControlController : Controller
    {
        public ActionResult Index()
        {
            if (Validate(this))
                return View();

            Response.StatusCode = 401;
            return null;
        }
    }
}