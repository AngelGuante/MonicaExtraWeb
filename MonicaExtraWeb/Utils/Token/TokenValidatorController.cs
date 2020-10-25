using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace MonicaExtraWeb.Utils.Token
{
    public class TokenValidatorController
    {
        public static bool Validate<T>(T param) where T : Controller
        {
            var token = param.Request.Cookies.Get("Authorization")?.Value;

            if (token == default)
                return false;

            try
            {
                var secretKey = ConfigurationManager.AppSettings["JWT_SECRET_KEY"];
                var audienceToken = ConfigurationManager.AppSettings["JWT_AUDIENCE_TOKEN"];
                var issuerToken = ConfigurationManager.AppSettings["JWT_ISSUER_TOKEN"];
                var securityKey = new SymmetricSecurityKey(System.Text.Encoding.Default.GetBytes(secretKey));
                SecurityToken securityToken;
                var tokenHandler = new JwtSecurityTokenHandler();
                TokenValidationParameters validationParameters = new TokenValidationParameters()
                {
                    ValidAudience = audienceToken,
                    ValidIssuer = issuerToken,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    LifetimeValidator = LifetimeValidator,
                    IssuerSigningKey = securityKey,
                };

                // COMPRUEBA LA VALIDEZ DEL TOKEN
                Thread.CurrentPrincipal = tokenHandler.ValidateToken(token,
                                                                     validationParameters,
                                                                         out securityToken);
                HttpContext.Current.User = tokenHandler.ValidateToken(token,
                                                                      validationParameters,
                                                                      out securityToken);
            }
            catch (SecurityTokenValidationException)
            {
                param.Response.StatusCode = 401;
                return false;
            }
            catch (Exception)
            {
                param.Response.StatusCode = 401;
                return false;
            }
            return true;
        }

        private static bool LifetimeValidator(DateTime? notBefore,
                              DateTime? expires,
                              SecurityToken securityToken,
                              TokenValidationParameters validationParameters)
        {
            var valid = false;

            if ((expires.HasValue && DateTime.UtcNow < expires)
                && (notBefore.HasValue && DateTime.UtcNow > notBefore))
            { valid = true; }

            return valid;
        }

        public static void GetTokenClaims(out SecurityToken validatedToken, string jwtToken, bool validateLifetime = true)
        {
            IdentityModelEventSource.ShowPII = true;
            var validationParameters = new TokenValidationParameters
            {
                ValidateLifetime = validateLifetime,
                ValidAudience = ConfigurationManager.AppSettings["JWT_AUDIENCE_TOKEN"],
                ValidIssuer = ConfigurationManager.AppSettings["JWT_ISSUER_TOKEN"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(ConfigurationManager.AppSettings["JWT_SECRET_KEY"]))
            };

            _ = new JwtSecurityTokenHandler().ValidateToken(jwtToken, validationParameters, out validatedToken);
        }
    }
}