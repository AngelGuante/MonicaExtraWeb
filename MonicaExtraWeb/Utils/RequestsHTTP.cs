using System.Net.Http;
using System.Threading.Tasks;

namespace MonicaExtraWeb.Utils
{
    public class RequestsHTTP
    {
        public static async Task<string> GET(string path)
        {
            using (var client = new HttpClient())
            using (var response = await client.GetAsync(path))
            using (var content = response.Content)
                return await content.ReadAsStringAsync();
        }
    }
}