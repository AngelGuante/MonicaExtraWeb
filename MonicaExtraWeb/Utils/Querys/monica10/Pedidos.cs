using Dapper;
using MonicaExtraWeb.Models.monica10;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
//using System.Configuration;
using System.Linq;
using System.Text;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Token.Claims;
using static MonicaExtraWeb.Utils.LocalRequestQuery;
using System.Threading.Tasks;
using System.Web;

namespace MonicaExtraWeb.Utils.Querys.monica10
{
    public class Pedidos
    {
        public async static Task<string> Insert(Estimado estimado, List<EstimadoDetalle> detalle, HttpContext context )
        {
            var IP = HttpContext.Current.Request.UserHostAddress;

            await Task.Run(() =>
            {
                var sd = SendQueryToClient(Enums.ClientMessageStatusEnum.InsertPedido, new Models.DTO.Reportes.Filtros { Estimado = estimado }, context);

                string resultset = default;
                while (resultset == default)
                {
                    RequestClientData(out resultset, context);
                }
                return resultset;
            });

            return "";


            //  INSERTAR EL DETALLES 
          
            //}
            //else
            //    throw new Exception();
            //return rslt.ToString();
        }
    }
}