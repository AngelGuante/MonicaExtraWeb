using System.Linq;
using System.Web.Http;
using MonicaExtraWeb.Models.DTO.Control;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Querys.Control.Empresas;
using static MonicaExtraWeb.Utils.Token.Claims;
using static MonicaExtraWeb.Models.DTO.DataCacheada;
using Dapper;
using Newtonsoft.Json;
using MonicaExtraWeb.Models.DTO;

namespace MonicaExtraWeb.Controllers.API
{
    [Authorize]
    [RoutePrefix("API/EMPRESAS")]
    public class EmpresasController : ApiController
    {
        [HttpGet]
        [Route("GET")]
        public IHttpActionResult Get(string empresa = default, string config = default)
        {
            var claims = GetClaims();
            var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                new { empresaId = "", userNivel = "" });

            var queryConfigDeserialized = config != default ? JsonConvert.DeserializeObject<QueryConfigDTO>(config) : default;
            var empresaDeserialized = empresa != default ? JsonConvert.DeserializeObject<Empresa>(empresa) : new Empresa();

            if (json.userNivel != "0")
                empresaDeserialized.IdEmpresa = long.Parse(json.empresaId);

            var query = Select(empresaDeserialized, queryConfigDeserialized);
            var empresas = Conn.Query<Empresa>(query.ToString()).ToList();

            return Json(new
            {
                empresas
            });
        }

        [HttpPost]
        [Route("POST")]
        public IHttpActionResult Post(Empresa empresa) =>
            Json(new { numeroUnicoEmpresa = Insert(empresa) });

        [HttpPut]
        [Route("PUT")]
        public IHttpActionResult PUT(Empresa empresa)
        {
            var claims = GetClaims();
            var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                new { empresaId = "", userNivel = "" });

            if (json.userNivel != "0")
                empresa.IdEmpresa = long.Parse(json.empresaId);

            var empresaCacheada = cache_empresas.FirstOrDefault(x => x.IdEmpresa == empresa.IdEmpresa.Value);

            if (empresaCacheada != default)
            {
                if (empresa.CantidadUsuariosPagados != default)
                    empresaCacheada.CantidadUsuariosPagados = empresa.CantidadUsuariosPagados;
                if (empresa.CantidadEmpresas != default)
                    empresaCacheada.CantidadEmpresas = empresa.CantidadEmpresas;
                if (empresa.ConnectionString != default)
                    empresaCacheada.ConnectionString = empresa.ConnectionString;
                if (empresa.Estatus != default)
                    empresaCacheada.Estatus = empresa.Estatus;
            }

            if (empresa.idEmpresasM != default)
            {
                var cantidad_EmpresasM = (empresa.idEmpresasM.Split(new string[] { "," }, System.StringSplitOptions.RemoveEmptyEntries)).Length;
                if (cantidad_EmpresasM > int.Parse(empresaCacheada.CantidadUsuariosPagados))
                    return BadRequest();
            }

            var query = Update(empresa);
            Conn.Execute(query.ToString());

            return Ok();
        }
    }
}
