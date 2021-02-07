﻿using System.Web.Mvc;
using static MonicaExtraWeb.Utils.Token.TokenValidatorController;
using static MonicaExtraWeb.Utils.Token.Claims;
using Newtonsoft.Json;

namespace MonicaExtraWeb.Controllers
{
    public class AdministracionController : Controller
    {
        public ActionResult Index()
        {
            if (Validate(this))
            {
                var claims = GetClaims();
                var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                    new { empresaId = "", userNivel = "" });
                if (json.userNivel == "1")
                    return View();
            }

            Response.StatusCode = 401;
            return null;
        }
    }
}