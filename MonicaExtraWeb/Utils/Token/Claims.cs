using System.Web;
using static MonicaExtraWeb.Utils.Token.TokenValidatorController;

namespace MonicaExtraWeb.Utils.Token
{
    public class Claims
    {
        public static Microsoft.IdentityModel.Tokens.SecurityToken GetClaims()
        {
            GetTokenClaims(out Microsoft.IdentityModel.Tokens.SecurityToken claims, HttpContext.Current.Request.Cookies.Get("Authorization")?.Value, false);
            return claims;
        }
    }
}