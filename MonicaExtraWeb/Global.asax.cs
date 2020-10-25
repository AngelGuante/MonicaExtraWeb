using System;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using static MonicaExtraWeb.Utils.Token.TokenValidatorController;
using static MonicaExtraWeb.Utils.Querys.Control.Concurrencias;
using static MonicaExtraWeb.Utils.GlobalVariables;
using Dapper;
using Newtonsoft.Json;

namespace MonicaExtraWeb
{
    public class MvcApplication : HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        protected void Application_EndRequest(object sender, EventArgs e)
        {
            var token = HttpContext.Current.Request.Cookies.Get("Authorization")?.Value;

            if (Response.StatusCode == 401)
            {
                if (token != default)
                {
                    GetTokenClaims(out Microsoft.IdentityModel.Tokens.SecurityToken claims, token, false);
                    var usuario = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                        new { userId = "", empresaId = "" });
                    Conn.Query(Delete(usuario.empresaId, usuario.userId));
                }
                Response.Redirect("~/Acceso?tokenStatus=invalid");
            }
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            // SI SE ESTA ACCEDIENDO A LA RAIZ DEL PROYECTO Y SE TIENE UN TOKEN, SE REDIRECCIONA AL USUARIO PARA LA VENTANA DE MENU.
            var url = HttpContext.Current.Request.RawUrl;
            if (url == "/" && HttpContext.Current.Request.Cookies.Get("Authorization")?.Value != null)
                Response.Redirect("~/SeleccionarEmpresa");
        }
    }
}
