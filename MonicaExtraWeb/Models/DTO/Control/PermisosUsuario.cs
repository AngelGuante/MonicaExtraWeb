﻿namespace MonicaExtraWeb.Models.DTO.Control
{
    public class PermisosUsuario
    {
        public int idPermiso { get; set; }
        public long? idEmpresa { get; set; }
        public long idUsuario { get; set; }
        public string idModulo { get; set; }
    }
}