using Dapper;
using MonicaExtraWeb.Models.DTO;
using MonicaExtraWeb.Models.DTO.Control;
using System.Linq;
using System.Text;
using System.Web.Helpers;
using static MonicaExtraWeb.Utils.GlobalVariables;

namespace MonicaExtraWeb.Utils.Querys.Control
{
    public class Empresas
    {
        public static string Select(Empresa empresa = default, QueryConfigDTO queryConfig = default)
        {
            var query = new StringBuilder();

            if (queryConfig != null)
                query.Append($"SELECT {queryConfig.Select} ");
            else
                query.Append($"SELECT * ");

            query.Append($"FROM {GlobalVariables.Control}dbo.EmpresaRegistrada ");
            query.Append($"WHERE idEmpresa != 1 ");

            if (empresa?.IdEmpresa != default)
                query.Append($"AND idEmpresa = {empresa.IdEmpresa} ");
            //else if (queryConfig?.Where_In != default)
            //    query.Append($"AND idEmpresa IN ({queryConfig.Where_In}) ");

            return query.ToString();
        }

        public static int Insert(Empresa empresa)
        {
            var query = new StringBuilder();

            query.Append($"INSERT INTO {GlobalVariables.Control}dbo.EmpresaRegistrada ");
            query.Append("(NombreEmpresa, Contacto, Telefono, Correo, CantidadEmpresas, CantidadUsuariosPagados, Vencimiento, idEmpresasM) ");
            query.Append("VALUES ");
            query.Append("(@NombreEmpresa, ");
            query.Append("@Contacto, ");
            query.Append("@Telefono, ");
            query.Append("@Correo, ");
            query.Append("@CantidadEmpresas, ");
            query.Append("@CantidadUsuariosPagados, ");
            query.Append("@Vencimiento, ");
            query.Append("@idEmpresasM) ");
            query.Append("SELECT CAST(SCOPE_IDENTITY() AS INT) ");

            var rslt = Conn.Query<int>(query.ToString(), new
            {
                empresa.NombreEmpresa,
                empresa.Contacto,
                empresa.Telefono,
                empresa.Correo,
                empresa.CantidadEmpresas,
                empresa.CantidadUsuariosPagados,
                empresa.Vencimiento,
                empresa.idEmpresasM,
            }).FirstOrDefault();

            //  INSERTAR EL USUARIO ADMINISTRADOR
            if (rslt != default)
            {
                query.Clear();
                query.Append($"INSERT INTO {GlobalVariables.Control}dbo.Usuario ");
                query.Append("(idEmpresa, Login, Nivel, Remoto, NombreUsuario) ");
                query.Append("VALUES ");
                query.Append("(@idEmpresa, ");
                query.Append("@Login, ");
                query.Append("@Nivel, ");
                query.Append("@Remoto, ");
                query.Append("@NombreUsuario) ");
                Conn.Query(query.ToString(), new
                {
                    idEmpresa = rslt,
                    Login = "Admin",
                    Nivel = "1",
                    NombreUsuario = "Usuario Administrador",
                    Remoto = 1
                });
            }
            else
                return 0;

            return rslt;
        }

        public static string Update(Empresa empresa)
        {
            var query = new StringBuilder();
            var querySet = new StringBuilder();

            query.Append($"UPDATE Control.dbo.EmpresaRegistrada SET ");

            if (!string.IsNullOrWhiteSpace(empresa.NombreEmpresa))
                querySet.Append($"NombreEmpresa = '{empresa.NombreEmpresa}' ");
            if (!string.IsNullOrWhiteSpace(empresa.Telefono))
            {
                if (querySet.Length > 0)
                    querySet.Append(",");
                querySet.Append($"Telefono = '{empresa.Telefono}' ");
            }
            if (!string.IsNullOrWhiteSpace(empresa.Correo))
            {
                if (querySet.Length > 0)
                    querySet.Append(",");
                querySet.Append($"Correo = '{empresa.Correo}' ");
            }
            if (!string.IsNullOrWhiteSpace(empresa.CantidadEmpresas))
            {
                if (querySet.Length > 0)
                    querySet.Append(",");
                querySet.Append($"CantidadEmpresas = '{empresa.CantidadEmpresas}' ");
            }
            if (!string.IsNullOrWhiteSpace(empresa.CantidadUsuariosPagados))
            {
                if (querySet.Length > 0)
                    querySet.Append(",");
                querySet.Append($"CantidadUsuariosPagados = '{empresa.CantidadUsuariosPagados}' ");
            }
            if (empresa.Vencimiento != default)
            {
                if (querySet.Length > 0)
                    querySet.Append(",");
                querySet.Append($"Vencimiento = '{empresa.Vencimiento}' ");
            }
            //if (!string.IsNullOrWhiteSpace(empresa.idEmpresasM))
            //{
            if (querySet.Length > 0)
                querySet.Append(",");
            querySet.Append($"idEmpresasM = '{empresa.idEmpresasM}' ");
            //}

            query.Append(querySet.ToString());
            query.Append($"WHERE IdEmpresa = {empresa.IdEmpresa} ");

            return query.ToString();
        }
    }
}