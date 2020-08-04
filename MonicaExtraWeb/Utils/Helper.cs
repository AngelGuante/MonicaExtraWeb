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
                //case "creditoFiscal":
                //    return "Credito Fiscal";
                //case "consumo":
                //    return "Consumidor final";
                //case "gubernamental":
                //    return "Gubernamental";
                //case "especial":
                //    return "Especial";
                //case "exportaciones":
                //    return "Exportaciones";
                case "creditoFiscal":
                    return "01";
                case "consumo":
                    return "02";
                case "nota_de_debito":
                    return "03";
                case "nota_de_credito":
                    return "04";
                case "comprobante_de_compras":
                    return "11";
                case "gasto_menor":
                    return "13";
                case "especial":
                    return "14";
                case "gubernamental":
                    return "15";
                case "exportaciones":
                    return "16";
            }
            return "";
        }
    }
}