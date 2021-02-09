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
                if (url != "/" && url != "/API/Login/authenticate" && !url.StartsWith("/API/CONEXIONREMOTA/") && !url.StartsWith("/API/ReportesLocales/"))
                {
                    var claims = GetClaims();
                    var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                        new { empresaId = "", userNivel = "", userId = "" });

                    if (json.userNivel != "0" && token != null && token.Length > 0)
                    {
                        var empresa = cache_empresas.FirstOrDefault(x => x.IdEmpresa == long.Parse(json.empresaId));
                        var usuario = CompanyRemoteConnectionUsers.FirstOrDefault(x => x.Key == json.userId);

                        if (empresa == default || empresa.Estatus == 0 || usuario.Value == default)
                            Response.Redirect("/");
                        else if (json.userNivel != "1"
                            && url != "/SeleccionarEmpresa"
                            && usuario.Value.connSeleccionada == default
                            || (json.userNivel == "1"
                                && usuario.Value.connSeleccionada == default
                                && url != "/SeleccionarEmpresa"
                                && (!url.StartsWith("/Administracion")
                                && !url.StartsWith("/API/USUARIOS/")
                                && !url.StartsWith("/API/EMPRESAS/")
                                && !url.StartsWith("/API/MODULOS/")
                                && !url.StartsWith("/API/PERMISOSUSUARIO/"))))
                            Response.Redirect("/SeleccionarEmpresa");
                    }
                }
            }
        }
    }
}
