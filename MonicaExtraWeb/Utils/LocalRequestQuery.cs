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
using static MonicaExtraWeb.Utils.Querys.Usuarios;
using static MonicaExtraWeb.Utils.Token.Claims;
using System.Linq;
using MonicaExtraWeb.Models.DTO.Control;
using Dapper;

namespace MonicaExtraWeb.Utils
{
    public class LocalRequestQuery
    {
        private static string _websocketServerPATH = ConfigurationManager.AppSettings["websocketServerPATH"];

        public static async Task<string> SendQueryToClient(ClientMessageStatusEnum status, Filtros filtro)
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
                    query = VendedoresInformacionQuery(filtro);
                    break;
                case ClientMessageStatusEnum.EmpresaInformacion:
                    query = EmpresaInformacionQuery(filtro, monica10_global);
                    break;
                case ClientMessageStatusEnum.CategoriasClientesInformacion:
                    query = CategoriasClientesQuery(filtro);
                    break;
                case ClientMessageStatusEnum.ClienteInformacion:
                    query = ClienteQuery(filtro);
                    break;
                case ClientMessageStatusEnum.TerminosPagos:
                    query = TerminosPagosQuery(filtro);
                    break;
                case ClientMessageStatusEnum.Bodegas:
                    query = BodegasQuery(filtro);
                    break;
                case ClientMessageStatusEnum.CategoriasProductos:
                    query = CategoriasProductosQuery(filtro);
                    break;
                case ClientMessageStatusEnum.Proveedores:
                    query = ProveedoresQuery(filtro);
                    break;
                case ClientMessageStatusEnum.CategoriasProveedoresInformacion:
                    query = CategoriasProveedoresQuery(filtro);
                    break;
                case ClientMessageStatusEnum.ObtenerEstimado:
                    query = GetEstimadoQuery(filtro);
                    break;
                case ClientMessageStatusEnum.ActualizarEstimado:
                    query = CerrarCotizacionQuery(filtro);
                    break;

                case ClientMessageStatusEnum.InventarioLiquidacion:
                    query = InventarioYLiquidacion(filtro);
                    break;
                case ClientMessageStatusEnum.subCategoriasProductos:
                    query = SubCategoriasProductosQuery(filtro);
                    break;
                case ClientMessageStatusEnum.ComprasDevolucionesCotizaciones:
                    query = ComprasDevolucionesCotizaciones(filtro);
                    break;
                case ClientMessageStatusEnum.VendedoresList:
                    query = VendedoresQuery(filtro);
                    break;
                case ClientMessageStatusEnum.ClientesProveedores:
                    query = ClientesProveedores(filtro);
                    break;
                case ClientMessageStatusEnum.TerminosPagosPv:
                    query = TerminosPagosPvQuery(filtro);
                    break;
                case ClientMessageStatusEnum.Impuestos:
                    query = ImpuestosQuery(filtro);
                    break;
                case ClientMessageStatusEnum.GiroNecogios:
                    query = GiroNegociosQuery(filtro);
                    break;
                case ClientMessageStatusEnum.GiroNecogiosPv:
                    query = GiroNegociosPvQuery(filtro);
                    break;
                case ClientMessageStatusEnum.ContabilidadBanco:
                    query = ContabilidadBanco(filtro);
                    break;

                case ClientMessageStatusEnum.Productos:
                    query = Productos(filtro);
                    break;
                case ClientMessageStatusEnum.Dolar:
                    query = Dolar(monica10_global);
                    break;
                case ClientMessageStatusEnum.Paramtro:
                    query = Parametro(filtro);
                    break;
            }


            #region VALIDAR SI ES UNA CONEXION REMOTA
            var claims = GetClaims();
            var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                new { userId = "", empresaId = "" });
            string _ip = default;

            if (CompanyRemoteConnectionUsers.ContainsKey(json.userId))
            {
                var usuario = Conn.Query<Usuario>(Select(new Usuario
                {
                    IdEmpresa = long.Parse(json.empresaId),
                    IdUsuario = long.Parse(json.userId),
                }, new QueryConfigDTO { Select = "U.Remoto", ExcluirUsuariosControl = false/*, Usuario_Join_IdEmpresaM = false*/ })).FirstOrDefault();

                if (!usuario.Remoto)
                    return "Error_RemoteConectionNotAllowed:No tiene permiso para acceder de manera remota.";

                CompanyRemoteConnectionIP.TryGetValue(json.empresaId, out _ip);

                query += $"-->>{IP}";
            }
            else if (CompanyRemoteConnectionUsersDisconected.ContainsKey(json.userId)) {
                CompanyRemoteConnectionUsersDisconected.Remove(json.userId);
                return "Error_RemoteConectionUserDisconected:Su usuario ha sido desconectado por un usuario Administrador.";
            }

            #endregion
            var obj = new WebSocketDTO
            {
                data = query
            };

            var content = new StringContent(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");

            return await POST($"{_websocketServerPATH}/SendToClient/{(_ip != default ? _ip : IP)}", content);
        }

        public static void RequestClientData(out string resultset)
        {
            var IP = HttpContext.Current.Request.UserHostAddress;
            DataWebsocketPerClient.TryGetValue(IP, out resultset);

            if (resultset != default)
            {
                if (resultset.IndexOf("-->>") > 0)
                {
                    var ip = (resultset.Split(new string[] { "-->>" }, System.StringSplitOptions.None))[1];
                    resultset.Replace($"-->>{ip}", "");
                }

                DataWebsocketPerClient.Remove(IP);
            }
        }
    }
}