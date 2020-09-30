const empresas = new Vue({
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

        empresas: [],
        empresasLocales: [],
        nroEmpresasSeleccionadas: 0,

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
        BuscarEmpresas: function () {
            fetch('../../API/EMPRESAS/GET', {
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                }
            })
                .then(response => { return response.json(); })
                .then(json => {
                    this.empresas = json.empresas;
                    document.getElementById('cargando').setAttribute('hidden', true);
                })
                .catch(err => {
                    document.getElementById('cargando').setAttribute('hidden', true);
                    console.log(err);
                });
        },

        AbrirModalEmpresa: async function (config) {
            document.getElementById('cargando').removeAttribute('hidden');

            this.Limpiar(false);
            this.empresasLocales = await BuscarInformacionLocal('SendWebsocketServer/4', {});

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
                this.fechaInicio = GetFormatedDate(config.FechaInicio);
                this.vencimiento = GetFormatedDate(config.Vencimiento);

                const empresaParams = JSON.stringify({
                    IdEmpresa: config.IdEmpresa
                });

                await fetch(`../../API/EMPRESAS/GET?empresa=${empresaParams}`,)
                    .then(response => { return response.json(); })
                    .then(json => {
                        this.telefono = json.empresas[0].Telefono;
                        this.nroEmpresasSeleccionadas = 0;

                        if (json.empresas[0].idEmpresasM !== null && json.empresas[0].idEmpresasM !== '') {
                            const empresasM = json.empresas[0].idEmpresasM.split(',');
                            this.nroEmpresasSeleccionadas = empresasM.length;

                            for (item of empresasM) {
                                const ele = document.getElementById(`check_${item}`);
                                if (ele != undefined)
                                    ele.checked = true;
                            }
                        }

                        document.getElementById('cargando').setAttribute('hidden', true);
                    });
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
            else if (this.nroEmpresasSeleccionadas > this.nro_empresas) {
                MostrarMensage({
                    title: '',
                    message: `Solo Puede seleccionar ${this.nro_empresas}`,
                    icon: 'warning'
                });
            }

            if (this.tipoModalStatus)
                this.NuevaEmpresa();
            else
                this.ModificarEmrpresa();
        },

        NuevaEmpresa: function () {
            document.getElementById('cargando').removeAttribute('hidden');

            const empresasLocales = []

            for (item of document.querySelectorAll('*[id^="check_"]'))
                if (document.getElementById(item.id).checked)
                    empresasLocales.push(item.id.replace(/check_/g, ''));

            const json = {
                NombreEmpresa: this.nombre,
                Contacto: this.contacto,
                Telefono: this.telefono,
                Correo: this.correo,
                CantidadEmpresas: this.nro_empresas,
                CantidadUsuariosPagados: this.nro_usuarios,
                Vencimiento: this.vencimiento,
                idEmpresasM: empresasLocales.join()
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

            const empresasLocales = []

            for (item of document.querySelectorAll('*[id^="check_"]'))
                if (document.getElementById(item.id).checked)
                    empresasLocales.push(item.id.replace(/check_/g, ''));

            const empresa = {
                IdEmpresa: this.IdEmpresa,
                NombreEmpresa: this.nombre,
                Contacto: this.contacto,
                Telefono: this.telefono,
                Correo: this.correo,
                CantidadEmpresas: this.nro_empresas,
                CantidadUsuariosPagados: this.nro_usuarios,
                Vencimiento: this.vencimiento,
                idEmpresasM: empresasLocales.join()
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

        empresaCheckChanged: function (check) {
            const element = document.getElementById(check);
            const value = element.checked;

            if (value)
                this.nroEmpresasSeleccionadas++;
            else
                this.nroEmpresasSeleccionadas;

            if (this.nroEmpresasSeleccionadas > this.nro_empresas) {
                this.nroEmpresasSeleccionadas--;
                element.checked = false;
                MostrarMensage({
                    title: 'No Puede Seleccionar más empresas',
                    message: `Solo Puede seleccionar ${this.nro_empresas}`,
                    icon: 'warning'
                });
            }
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
            this.nroEmpresasSeleccionadas = 0;
            this.fechaInicio = GetCurrentDate();
            this.vencimiento = '';

            this.empresasLocales = [];

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

        FilterUppercase: value => {
            return value.toUpperCase();
        },
    }
});