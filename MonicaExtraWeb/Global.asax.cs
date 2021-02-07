using Newtonsoft.Json;
using System;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using static MonicaExtraWeb.Utils.Token.Claims;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Models.DTO.DataCacheada;
using System.Linq;

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
                    var claims = GetClaims();
                    var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                        new { userId = "", empresaId = "" });

                    if (CompanyRemoteConnectionIP.ContainsKey(json.empresaId) && CompanyRemoteConnectionUsers.ContainsKey(json.userId))
                        CompanyRemoteConnectionUsers.Remove(json.userId);
                }
                Response.Redirect("~/Acceso?tokenStatus=invalid");
            }
        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            var url = HttpContext.Current.Request.RawUrl;
            var token = HttpContext.Current.Request.Cookies.Get("Authorization")?.Value;

            if (token != default)
            {
                //  VALIDAR EL REQUEST PARA COMPROBAR QUE EL ESTATUS DE LA EMPRESA DEL USUARIO QUE HACE EL REQUEST, ESTE ACTIVA.
                if (url != "/" && url != "/API/Login/authenticate" && !url.StartsWith("/API/CONEXIONREMOTA/") && !url.StartsWith("/API/ReportesLocales/ReceiveDataFromWebSocketServer"))
                {
                    var claims = GetClaims();
                    var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                        new { empresaId = "", userNivel = "" });

                    if (json.userNivel != "0" && token != null && token.Length > 0)
                    {
                        var empresa = cache_empresas.FirstOrDefault(x => x.IdEmpresa == long.Parse(json.empresaId));

                        if (empresa == default || empresa.Estatus == 0)
                            Response.Redirect("/");
                    }
                }

                //  SI SE ESTA ACCEDIENDO A LA RAIZ DEL PROYECTO Y SE TIENE UN TOKEN, SE REDIRECCIONA AL USUARIO PARA LA VENTANA DE MENU.
                //if (url == "/")
                //    Response.Redirect("~/SeleccionarEmpresa");
            }
        }
    }
}
