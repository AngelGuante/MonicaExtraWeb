﻿const empresas = new Vue({
    el: '#gestionEmpresas',

    data: {
        IdEmpresa: '',
        nombre: '',
        contacto: '',
        telefono: '',
        correo: '',
        nro_empresas: 0,
        nro_usuarios: 0,
        fechaInicio: '',
        vencimiento: '',
        database: '',
        idEmpresasM: '',
        empresasConectadas: 0,
        usuariosConectados: 0,
        usuariosIntentosFallidos: 0,
        PermitirAlmonte: false,
        PermitirProgramador: false,
        defaultPass: '',

        empresas: [],

        filtroEmpresasEstatus: '1',
        filtroEmpresasVencimiento: '1',

        IdEmpresaSleccionada: '',
        EstadoEmpresaSeleccionada: '',

        tipoModalStatus: true
    },

    created: async function () {
        document.getElementById('btnBack').removeAttribute('hidden');

        this.fechaInicio = GetCurrentDate();
        this.BuscarEmpresas();
    },

    methods: {
        BuscarEmpresas: async function () {
            let empresa = {}
            let config = {}
            if (this.filtroEmpresasEstatus !== '' && (this.filtroEmpresasEstatus === '0' || this.filtroEmpresasEstatus === '1')) {
                empresa = {
                    'Estatus': Number(this.filtroEmpresasEstatus)
                };
            }
            if (this.filtroEmpresasVencimiento !== '') {
                config = {
                    'VencimientoEmpresa': Number(this.filtroEmpresasVencimiento)
                };
            }
            let response = await fetch(`../../API/EMPRESAS/GET?empresa=${JSON.stringify(empresa)}&config=${JSON.stringify(config)}`, {
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                }
            });

            let json = await response.json();
            this.empresas = json.empresas;
            this.empresasConectadas = json.empresasConectadas;
            this.usuariosConectados = json.usuariosConectados;
            this.usuariosIntentosFallidos = json.usuariosIntentosFallidos;
            document.getElementById('cargando').setAttribute('hidden', true);
        },

        AbrirModalEmpresa: async function (config) {
            document.getElementById('cargando').removeAttribute('hidden');

            this.Limpiar(false);

            //  SI ES UNA EMPRESA NUEVA
            if (!config)
                document.getElementById('cargando').setAttribute('hidden', true);
            else {
                this.tipoModalStatus = false;

                this.IdEmpresa = config.IdEmpresa;
                this.nombre = config.NombreEmpresa;
                this.correo = config.Correo;
                this.nro_empresas = config.CantidadEmpresas;
                this.nro_usuarios = config.CantidadUsuariosPagados;
                this.database = config.ConnectionString;
                this.fechaInicio = GetFormatedDate(config.FechaInicio);
                this.vencimiento = GetFormatedDate(config.Vencimiento);
                this.EstadoEmpresaSeleccionada = config.Estatus;
                this.defaultPass = config.defaultPass;
                this.PermitirAlmonte = config.PermitirAlmonte;
                this.PermitirProgramador = config.PermitirProgramador;

                document.getElementById('cargando').setAttribute('hidden', true);
            }

            $('#modalNuevaEmpresa').modal('show');
        },

        ValidarDatosEmpresa: function () {
            let mensaje = '';

            if (this.nombre.trim() === '') {
                MostrarMensage({
                    title: 'Débe ingresar el nombre de la empresa.',
                    message: mensaje,
                    icon: 'warning'
                });
                return;
            }
            else if (this.correo.trim() === '') {
                MostrarMensage({
                    title: 'Débe ingresar el correo de la empresa.',
                    message: mensaje,
                    icon: 'warning'
                });
                return;
            }
            else if (this.nro_empresas.toString().trim() === '') {
                MostrarMensage({
                    title: 'Débe ingresar el número máximo de empresas.',
                    message: mensaje,
                    icon: 'warning'
                });
                return;
            }
            else if (this.nro_usuarios.toString().trim() === '') {
                MostrarMensage({
                    title: 'Débe ingresar el número máximo de usuarios.',
                    message: mensaje,
                    icon: 'warning'
                });
                return;
            }
            else if (this.vencimiento.toString().trim() === '') {
                MostrarMensage({
                    title: 'Débe ingresar la fecha de vencimiento para el plan de esta empresa.',
                    message: mensaje,
                    icon: 'warning'
                });
                return;
            }
            else if (this.database.toString().trim() === '') {
                MostrarMensage({
                    title: 'Débe seleccionar la base de datos que utilizará la empresa.',
                    message: mensaje,
                    icon: 'warning'
                });
                return;
            }

            if (this.tipoModalStatus)
                this.NuevaEmpresa();
            else
                this.ModificarEmrpresa();
        },

        CambiarEstadoEmpresa: async function () {
            document.getElementById('cargando').removeAttribute('hidden');

            const json = {
                IdEmpresa: this.IdEmpresa,
                Estatus: this.EstadoEmpresaSeleccionada === 1 ? 0 : 1
            };

            await fetch('../../API/EMPRESAS/PUT', {
                method: 'PUT',
                body: JSON.stringify(json),
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", ""),
                    'Content-Type': 'application/json'
                }
            });

            this.Limpiar();
        },

        NuevaEmpresa: function () {
            document.getElementById('cargando').removeAttribute('hidden');

            const json = {
                NombreEmpresa: this.nombre,
                Contacto: this.contacto,
                Telefono: this.telefono,
                Correo: this.correo,
                CantidadEmpresas: this.nro_empresas,
                CantidadUsuariosPagados: this.nro_usuarios,
                Vencimiento: this.vencimiento,
                ConnectionString: this.database,
                PermitirAlmonte: this.PermitirAlmonte,
                PermitirProgramador: this.PermitirProgramador
            };

            fetch('../../API/EMPRESAS/POST', {
                method: 'POST',
                body: JSON.stringify(json),
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", ""),
                    'Content-Type': 'application/json'
                }
            })
                .then(response => { return response.json() })
                .then(json => {
                    this.Limpiar();

                    MostrarMensage({
                        title: 'Empresa Creada.',
                        message: `Número único de la nueva empresa: ${json.numeroUnicoEmpresa}`,
                        icon: 'success'
                    });
                });
        },

        ModificarEmrpresa: async function () {
            document.getElementById('cargando').removeAttribute('hidden');
            const empresa = {
                IdEmpresa: this.IdEmpresa,
                NombreEmpresa: this.nombre,
                Contacto: this.contacto,
                Telefono: this.telefono,
                Correo: this.correo,
                CantidadEmpresas: this.nro_empresas,
                CantidadUsuariosPagados: this.nro_usuarios,
                Vencimiento: this.vencimiento,
                ConnectionString: this.database,
                PermitirAlmonte: this.PermitirAlmonte,
                PermitirProgramador: this.PermitirProgramador
            };

            //  ACTUALIZAR LOS DATOS DE LA EMPRESA
            await fetch('../../API/EMPRESAS/PUT', {
                method: 'PUT',
                body: JSON.stringify(empresa),
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", ""),
                    'Content-Type': 'application/json'
                }
            })
                .then(response => { });

            this.Limpiar();
        },

        Limpiar: function (soloLimpiar) {
            this.tipoModalStatus = true;
            this.IdEmpresaSleccionada =

                this.IdEmpresa = '';
            this.nombre = '';
            this.contacto = '';
            this.telefono = '';
            this.correo = '';
            this.nro_empresas = 0;
            this.nro_usuarios = 0;
            this.fechaInicio = GetCurrentDate();
            this.vencimiento = '';
            this.database = '';

            if (soloLimpiar !== false) {
                $('#modalNuevaEmpresa').modal('hide');
                this.empresas = [];

                this.BuscarEmpresas();
            }
        }
    },

    filters: {
        FilterDateFormat: value => {
            const date = new Date(value);
            const fecha = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

            if (!fecha.includes('NaN'))
                return fecha;
            else
                return value;
        },
    }
});