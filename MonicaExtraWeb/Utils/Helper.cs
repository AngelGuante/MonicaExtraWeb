namespace MonicaExtraWeb.Utils
{
    public class Helper
    {
        /// <summary>
        /// 
        /// </summary>
        public static string ComprobanteDictionary(string value)
        {
            switch (value)
            {
                case "creditoFiscal":
                    return "Credito Fiscal";
                case "consumo":
                    return "Consumidor final";
                case "gubernamental":
                    return "Gubernamental";
                case "especial":
                    return "Especial";
                case "exportaciones":
                    return "Exportaciones";
                case "nota_de_debito":
                    return "";
                case "nota_de_credito":
                    return "";
            }
            return "";
        }
    }
}