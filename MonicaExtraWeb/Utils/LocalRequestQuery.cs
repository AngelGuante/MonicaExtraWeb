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
//using static MonicaExtraWeb.Utils.Helper;
using System.Linq;
using MonicaExtraWeb.Models.DTO.Control;
using Dapper;

namespace MonicaExtraWeb.Utils
{
    public class LocalRequestQuery
    {
        private static string _websocketServerPATH = ConfigurationManager.AppSettings["websocketServerPATH"];

        public static async Task<string> SendQueryToClient(ClientMessageStatusEnum status, Filtros filtro, HttpContext context = null)
        {
            if (context != default)
                HttpContext.Current = context;

            var IP = HttpContext.Current.Request.UserHostAddress;
            var query = "";
            var datosConeccion = "";

            #region VALIDAR SI ES UNA CONEXION REMOTA
            var claims = GetClaims();
            var json = JsonConvert.DeserializeAnonymousType(claims.ToString().Substring(claims.ToString().IndexOf(".") + 1),
                new { userId = "", empresaId = "", userNivel = "" });
            string _ip = default;
            CompanyRemoteConnectionUsers.FirstOrDefault(x => x.Key == json.userId);

            if (CompanyRemoteConnectionUsers.ContainsKey(json.userId))
            {
                var dataUsuario_cache = CompanyRemoteConnectionUsers.FirstOrDefault(x => x.Key == json.userId);

                if (dataUsuario_cache.Value.connSeleccionada == default && filtro.conn != null)
                    dataUsuario_cache.Value.connSeleccionada = filtro.conn.Trim();
                else if (dataUsuario_cache.Value.connSeleccionada != default)
                    filtro.conn = dataUsuario_cache.Value.connSeleccionada;

                Usuario usuario = default;
                if (json.userNivel == "0" || json.userNivel == "4")
                    usuario = new Usuario
                    {
                        Remoto = true
                    };
                else
                    usuario = Conn.Query<Usuario>(Select(new Usuario
                    {
                        IdUsuario = long.Parse(json.userId),
                    }, new QueryConfigDTO { Select = "U.Remoto", ExcluirUsuariosControl = false })).FirstOrDefault();

                if (!usuario.Remoto.Value)
                    return "Error_RemoteConectionNotAllowed:No tiene permiso para acceder de manera remota.";

                CompanyRemoteConnectionIP.TryGetValue(json.empresaId, out _ip);

                var connectionString = cache_empresas.FirstOrDefault(x => x.IdEmpresa == long.Parse(json.empresaId)).ConnectionString;
                datosConeccion += $@"-->>{IP}-->>{ConfigurationManager.AppSettings[$"{connectionString}_Servcer"]}-->>{ConfigurationManager.AppSettings[$"{connectionString}_DataBase"]}-->>{ConfigurationManager.AppSettings[$"{connectionString}_UID"]}-->>{ConfigurationManager.AppSettings[$"{connectionString}_PWD"]}";
            }
            else if (CompanyRemoteConnectionUsersDisconected.ContainsKey(json.userId))
            {
                CompanyRemoteConnectionUsersDisconected.Remove(json.userId);
                return "Error_RemoteConectionUserDisconected:Su usuario ha sido desconectado por un usuario Administrador.";
            }
            else
                return "Error_UserNotConected:Su usuario no se encuentra logueado, puede que haya ocurrido un error o que se haya publicado una nueva version del sistema, Favor vuelva a la pantalla de login.";

            #endregion

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
                    query = EmpresaInformacionQuery(filtro);
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
                    query = Dolar();
                    break;
                case ClientMessageStatusEnum.Paramtro:
                    query = Parametro(filtro);
                    break;

                case ClientMessageStatusEnum.InsertPedido:
                    query = InsertarPedido(filtro);
                    break;
                case ClientMessageStatusEnum.InsertDetallePedido:
                    query = InsertarDetallesPedido(filtro);
                    break;
            }

            query += datosConeccion;

            var obj = new WebSocketDTO
            {
                data = query
            };

            var content = new StringContent(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");

            return await POST($"{_websocketServerPATH}/SendToClient/{(_ip != default ? _ip : IP)}", content);
        }

        public static void RequestClientData(out string resultset, HttpContext context = null)
        {
            if (context != default)
                HttpContext.Current = context;

            var IP = HttpContext.Current.Request.UserHostAddress;
            DataWebsocketPerClient.TryGetValue(IP, out resultset);

            if (resultset != default)
            {
                if (resultset.IndexOf("-->>") > 0)
                {
                    var ip = resultset.Split(new string[] { "-->>" }, System.StringSplitOptions.None)[1];
                    resultset.Replace($"-->>{ip}", "");
                }

                DataWebsocketPerClient.Remove(IP);
            }
        }
    }
}