using System.Net.Http;
using System.Threading.Tasks;

namespace MonicaExtraWeb.Utils
{
    public class RequestsHTTP
    {
        public static async Task<string> POST(string path, StringContent content)
        {
            using (var clientHandler = new HttpClientHandler())
            {
#if (DEBUG)
                clientHandler.ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true;
#endif
                using (var client = new HttpClient(clientHandler))
                using (var response = await client.PostAsync(path, content))
                using (var RequestContent = response.Content)
                    return await RequestContent.ReadAsStringAsync();
            }
        }
    }
}