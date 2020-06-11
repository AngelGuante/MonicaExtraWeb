using System.Net.Http;
using System.Threading.Tasks;

namespace MonicaExtraWeb.Utils
{
    public class RequestsHTTP
    {
        public static async Task<string> POST(string path, StringContent content)
        {
            using (var client = new HttpClient())
            using (var response = await client.PostAsync(path, content))
            using (var RequestContent = response.Content)
                return await RequestContent.ReadAsStringAsync();
        }
    }
}