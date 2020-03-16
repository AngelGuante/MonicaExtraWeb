using MonicaExtraWeb.Models.monica10_global;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MonicaExtraWeb.Controllers
{
    public class SAPController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult SeleccionarEmpresa()
        {
            using (var empresas = new monica10_globalEntities())
            {
                ViewBag.empresas = JsonConvert.SerializeObject(empresas.empresas.Select(e => new { e.empresa_id, e.Nombre_empresa }).ToList());
                return View();
            }
        }
    }
}