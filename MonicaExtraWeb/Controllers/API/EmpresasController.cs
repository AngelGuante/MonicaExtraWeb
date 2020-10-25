﻿using System.Linq;
using System.Web.Http;
using MonicaExtraWeb.Models.DTO.Control;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Querys.Control.Empresas;
using Dapper;
using Newtonsoft.Json;
using MonicaExtraWeb.Models.DTO;

namespace MonicaExtraWeb.Controllers.API
{
    [RoutePrefix("API/EMPRESAS")]
    public class EmpresasController : ApiController
    {
        [HttpGet]
        [Route("GET")]
        public IHttpActionResult Get(string empresa = default, string config = default)
        {
            var queryConfigDeserialized = config != default ? JsonConvert.DeserializeObject<QueryConfigDTO>(config) : default;
            var empresaDeserialized = empresa != default ? JsonConvert.DeserializeObject<Empresa>(empresa) : default;
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
            var query = Update(empresa);
            Conn.Execute(query.ToString());

            return Ok();
        }
    }
}