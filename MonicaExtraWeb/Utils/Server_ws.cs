using SuperWebSocket;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Linq;
using System.IO;
using System;
using System.Text;
using System.Xml;
using System.Web;

namespace MonicaExtraWeb.Utils
{
    public class Server_ws
    {
        private static WebSocketServer _wsServer = null;
        private static List<WebSocketSession> _sc = new List<WebSocketSession>();
        private static int _port = 8088;

        public static void StartServer()
        {
            try
            {
                throw new Exception("Demo Exception ddd");

                if (_wsServer == null)
                {
                    _wsServer = new WebSocketServer();
                    _wsServer.Setup(_port);
                    _wsServer.NewSessionConnected += WsServer_NewSessionConnected;
                    _wsServer.NewMessageReceived += WsServer_NewMessageReceived;
                    _wsServer.NewDataReceived += WsServer_NewDataReceived;
                    _wsServer.SessionClosed += WsServer_SessionClosed;
                    _wsServer.Start();
                }
            }
            catch (Exception e)
            {
                var path = HttpContext.Current.Server.MapPath("/Exceptions");
                if (!Directory.Exists(path))
                    Directory.CreateDirectory(path);

                //var path = HttpContext.Current.Server.MapPath("demo.xml");
                    
                var newPath = $"{path}/edx.xml";

                var xmlWriter = new XmlTextWriter(newPath, Encoding.UTF8);
                xmlWriter.Formatting = System.Xml.Formatting.Indented;
                xmlWriter.WriteStartDocument();
                xmlWriter.WriteStartElement("Exception");

                xmlWriter.WriteStartElement("demo");
                xmlWriter.WriteString(e.Message);
                xmlWriter.WriteEndDocument();

                xmlWriter.WriteEndDocument();
                xmlWriter.WriteEndDocument();

                xmlWriter.Flush();

            }
        }

        private static void WsServer_SessionClosed(WebSocketSession session, SuperSocket.SocketBase.CloseReason value)
        {
            _sc.Remove(session);
        }

        private static void WsServer_NewDataReceived(WebSocketSession session, byte[] value)
        {
        }

        private static void WsServer_NewMessageReceived(WebSocketSession session, string value)
        {
            string fileName = @"C:\Users\Angel\Desktop\id.txt";

            try
            {
                // Check if file already exists. If yes, delete it.     
                if (File.Exists(fileName))
                {
                    File.Delete(fileName);
                }

                // Create a new file     
                using (FileStream fs = File.Create(fileName))
                {
                    // Add some text to file    
                    var title = new UTF8Encoding(true).GetBytes(value);
                    fs.Write(title, 0, title.Length);
                }

                // Open the stream and read it back.    
                using (StreamReader sr = File.OpenText(fileName))
                {
                    string s = "";
                    while ((s = sr.ReadLine()) != null)
                    {
                        Console.WriteLine(s);
                    }
                }
            }
            catch (Exception Ex)
            {
                Console.WriteLine(Ex.ToString());
            }
        }

        private static void WsServer_NewSessionConnected(WebSocketSession session)
        {
            _sc.Add(session);

            session.Send(JsonConvert.SerializeObject(new
            {
                sessionId = session.SessionID
            }));
        }

        public static string sendMessage()
        //public static void sendMessage(string sessionId)
        {
            return $"COUNT: {_sc.Count()}, {_sc[0].RemoteEndPoint}";
            //var session = _sc[0];
            //var session = _sc.FirstOrDefault(id => id.SessionID == sessionId);

            //session.Send(JsonConvert.SerializeObject(new
            //{
            //    action = "movimientos"
            //}));
        }
    }
}