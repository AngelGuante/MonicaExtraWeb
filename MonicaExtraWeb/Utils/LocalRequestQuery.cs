using MonicaExtraWeb.Enums;
using MonicaExtraWeb.Models.DTO;
using MonicaExtraWeb.Models.DTO.Reportes;
using Newtonsoft.Json;
using System.Configuration;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using static MonicaExtraWeb.Utils.GlobalVariables;
using static MonicaExtraWeb.Utils.Reportes;
using static MonicaExtraWeb.Utils.RequestsHTTP;


namespace MonicaExtraWeb.Utils
{
    public class LocalRequestQuery
    {
        private static string _websocketServerPATH = ConfigurationManager.AppSettings["websocketServerPATH"];

        public static async Task<string> SendQueryToClient(ClientMessageStatusEnum status, FiltrosReportes filtro)
        {
            var IP = HttpContext.Current.Request.UserHostAddress;
            string query = "";

            switch (status)
            {
                case ClientMessageStatusEnum.IndividualClientStatusReport:
                    query = IndividualClientQuery(filtro);
                    break;
                case ClientMessageStatusEnum.VentasYDevolucionesCategoriaYVendedor:
                    query = VentasDevolucionesCategoriaYVendedor(filtro);
                    break;
                case ClientMessageStatusEnum.VendedoresInformacion:
                    query = VendedoresInformacionQuery();
                    break;
                case ClientMessageStatusEnum.EmpresaInformacion:
                    query = EmpresaInformacionQuery(monica10_global);
                    break;
                case ClientMessageStatusEnum.CategoriasClientesInformacion:
                    query = CategoriasClientesQuery();
                    break;
                case ClientMessageStatusEnum.ClienteInformacion:
                    query = ClienteQuery(filtro);
                    break;
                case ClientMessageStatusEnum.TerminosPagos:
                    query = TerminosPagosQuery();
                    break;
                case ClientMessageStatusEnum.Bodegas:
                    query = BodegasQuery();
                    break;
                case ClientMessageStatusEnum.CategoriasProductos:
                    query = CategoriasProductosQuery();
                    break;
                case ClientMessageStatusEnum.Proveedores:
                    query = ProveedoresQuery(filtro);
                    break;
            }

            var obj = new WebSocketDTO
            {
                data = query
            };

            var content = new StringContent(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");

            return await POST($"{_websocketServerPATH}/SendToClient/{IP}", content);
        }

        public static void RequestClientData(out string resultset)
        {
            var IP = HttpContext.Current.Request.UserHostAddress;
            DataWebsocketPerClient.TryGetValue(IP, out resultset);

            if (resultset != default)
                DataWebsocketPerClient.Remove(IP);
        }
    }
}