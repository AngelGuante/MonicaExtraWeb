using MonicaExtraWeb.Models;
using MonicaExtraWeb.Utils.Token;
using System;
using System.Net;
using System.Web.Http;

namespace MonicaExtraWeb.Controllers.API
{
    [AllowAnonymous]
    [RoutePrefix("API/Login")]
    public class LoginController : ApiController
    {
        [HttpPost]
        [Route("authenticate")]
        public IHttpActionResult Authenticate(LoginRequest login)
        {
            if (login == null)
                throw new HttpResponseException(HttpStatusCode.BadRequest);

            if (login.Password == (DateTime.Now.Year + DateTime.Now.Month).ToString())
            {
                var token = TokenGenerator.GenerateTokenJwt(login.Username);
                return Ok(token);
            }
            else
                return Unauthorized();
        }
    }
}