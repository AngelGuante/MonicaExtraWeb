﻿using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;

namespace MonicaExtraWeb.Utils
{
    public abstract class GlobalVariables
    {
        private static string _connectionString = ConfigurationManager.ConnectionStrings["monica10_global"].ConnectionString;
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
        public static string monica10_global { get; } = "monica10_global.";

        public static Dictionary<string, string> DataWebsocketPerClient = new Dictionary<string, string>();
    }
}