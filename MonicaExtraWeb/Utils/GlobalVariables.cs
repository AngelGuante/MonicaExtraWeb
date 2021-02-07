using MonicaExtraWeb.Models.DTO.Control;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;

namespace MonicaExtraWeb.Utils
{
    public abstract class GlobalVariables
    {
        private static string _connectionString = ConfigurationManager.ConnectionStrings["Control"].ConnectionString;
        private static SqlConnection _conn = null;

        public static SqlConnection Conn
        {
            get {
                if (_conn == default)
                    _conn = new SqlConnection(_connectionString);

                return _conn;
            }
        }
        
        public static string DbName { get; } = "DB_A5E94C_monica10global.";
        public static string Control { get; } = "Control.";

        public static Dictionary<string, string> DataWebsocketPerClient = new Dictionary<string, string>();
        public static Dictionary<string, string> CompanyRemoteConnectionIP = new Dictionary<string, string>();
        public static Dictionary<string, Usuario> CompanyRemoteConnectionUsers = new Dictionary<string, Usuario>();
        //public static Dictionary<string, string> CompanyRemoteConnectionUsers = new Dictionary<string, string>();
        public static Dictionary<string, string> CompanyRemoteConnectionUsersDisconected = new Dictionary<string, string>();
    }
}