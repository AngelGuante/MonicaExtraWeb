﻿using Dapper;
using MonicaExtraWeb.Models.DTO;
using MonicaExtraWeb.Models.DTO.Control;
using Newtonsoft.Json;
using System.Linq;
using System.Web.Http;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Querys.Usuarios;
using static MonicaExtraWeb.Utils.Token.Claims;
using static MonicaExtraWeb.Models.DTO.DataCacheada;

namespace MonicaExtraWeb.Controllers.API
{
    [Authorize]
    [RoutePrefix("API/USUARIOS")]
    public class UsuariosController : ApiController
    {
        [HttpGet]
        [Route("GET")]
        public IHttpActionResult Get(string usuario = default)
        {
            var claims = GetClaims();
            var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                new { empresaId = "", userNivel = "" });
            var datosEmpresaCaheada = cache_empresas.FirstOrDefault(x => x.IdEmpresa == long.Parse(json.empresaId));
            var usuarioDeserialized = usuario != default ? JsonConvert.DeserializeObject<Usuario>(usuario) : new Usuario();

            if (json.userNivel != "0")
                usuarioDeserialized.IdEmpresa = long.Parse(json.empresaId);

            var query = Select(usuarioDeserialized, new QueryConfigDTO { Select = " U.Login, U.Remoto, U.idEmpresasM ", ExcluirUsuariosControl = true, ExcluirUsuariosRemotos = true });
            var usuarios = Conn.Query<Usuario>(query.ToString()).ToList();

            return Json(new
            {
                usuarios,
                cantidadUsuariosPagados = datosEmpresaCaheada.CantidadUsuariosPagados,
                UsuariosRegistrados = datosEmpresaCaheada.usuariosRegistrados
            });
        }

        [HttpPost]
        [Route("POST")]
        public IHttpActionResult Post(NuevoUsuario param)
        {
            var claims = GetClaims();
            var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                new { empresaId = "", userNivel = "" });
            param.usuario.IdEmpresa = long.Parse(json.empresaId);
            var empresaCacheada = cache_empresas.FirstOrDefault(x => x.IdEmpresa == long.Parse(json.empresaId));

            // VALIDAR QUE EL NOMBRE DE USUARIO NO EXISTA.
            var usuarios = Conn.Query<Usuario>(Select(new Usuario
            {
                IdEmpresa = long.Parse(json.empresaId),
                NombreUsuario = param.usuario.Login
            }, new QueryConfigDTO { ExcluirUsuariosControl = true }).ToString()).ToList();
            if (usuarios.Count > 0 || int.Parse(empresaCacheada.usuariosRegistrados) <= int.Parse(empresaCacheada.CantidadUsuariosPagados) || param.usuario.Login.StartsWith("Remoto"))
                return Ok(false);

            Insert(param.usuario, param.modulos);

            return Ok(true);
        }

        [HttpPut]
        [Route("PUT")]
        public IHttpActionResult PUT(Usuario usuario)
        {
            var query = Update(usuario);
            Conn.Execute(query.ToString());

            return Ok();
        }
    }
}