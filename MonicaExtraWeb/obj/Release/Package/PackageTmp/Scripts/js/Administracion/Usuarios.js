const usuarios = new Vue({
    el: '#manejoUsuarios',

    data: {
        nombre: '',
        apellidos: '',
        nombreUsuario: '',
        nombreCompleto: '',
        nivelUsuarioSeleccionado: 2,
        permisoRemoto: 1,
        teniaEmpresasMSeleccionadas: false,
        usuariosPagados: 0,
        usuariosRegistrados: 0,
        empresaDefaultPass: '',

        nro_empresas: 0,

        usuarios: [],
        modulos: [],
        empresas: [],

        empresasLocales: [],
        nroEmpresasSeleccionadas: 0,
        numeroUnicoEmpresa: '',

        conexionesRemotasAbiertas: [],

        IdUsuarioSeleccionado: '',
        EstadoUsuarioSeleccionado: '',

        tipoModalStatus: true
    },

    created: function () {
        document.getElementById('btnHome').removeAttribute('hidden');
        document.getElementById('btnBack').removeAttribute('hidden');

        this.numeroUnicoEmpresa = localStorage.getItem('NumeroUnicoEmpresa');
        this.BuscarUsuarios();
    },

    watch: {
        nombre: function () {
            this.nombre = (this.nombre).toUpperCase();
            if (this.apellidos.length > 0)
                document.getElementById('btnGenerarUserName').removeAttribute('disabled');
            else
                document.getElementById('btnGenerarUserName').setAttribute('disabled', true);

            if (this.nombre.length === 0)
                document.getElementById('btnGenerarUserName').setAttribute('disabled', true);
        },

        apellidos: function () {
            this.apellidos = (this.apellidos).toUpperCase();

            if (this.nombre.length > 0)
                document.getElementById('btnGenerarUserName').removeAttribute('disabled');
            else
                document.getElementById('btnGenerarUserName').setAttribute('disabled', true);

            if (this.apellidos.length === 0)
                document.getElementById('btnGenerarUserName').setAttribute('disabled', true);
        },

        nivelUsuarioSeleccionado: function () {
            if (this.nivelUsuarioSeleccionado === "1")
                this.ToggleTodosCheck(true, 'check_');
            else if (this.nivelUsuarioSeleccionado === "2")
                this.ToggleTodosCheck(false, 'check_');
        }
    },

    methods: {
        BuscarUsuarios: async function () {
            const response = await fetch(`../../API/USUARIOS/GET`, {
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                }
            });
            var json = (await response.json());
            this.usuarios = json.usuarios;
            this.usuariosPagados = json.cantidadUsuariosPagados;
            this.usuariosRegistrados = json.UsuariosRegistrados;
            this.empresaDefaultPass = json.empresaDefaultPass;
            document.getElementById('cargando').setAttribute('hidden', true);
        },

        GenerarUserName: async function () {
            this.nombreUsuario = '';

            const stringChanged = (this.nombreUsuario.split(''));
            stringChanged[0] = this.nombre[0];
            this.nombreUsuario = stringChanged.join('');

            const apellidosArray = this.apellidos.split(' ');
            this.nombreUsuario = `${this.nombreUsuario}${apellidosArray[0][0]}${((apellidosArray[0]).substr(1)).toLowerCase()}`;

            document.getElementById('inptNombreNuevoUsuario').setAttribute('disabled', true);
            document.getElementById('inptApellidosNuevoUsuario').setAttribute('disabled', true);
            document.getElementById('btnGenerarUserName').setAttribute('disabled', true);
            document.getElementById('btnAgregarNuevoUsuario').removeAttribute('disabled');
        },

        AbrirModalUsuario: async function (config) {
            document.getElementById('cargando').removeAttribute('hidden');
            this.ToggleTodosCheck(false, 'check_');
            this.ToggleTodosCheck(false, 'checkEmpresas_');

            //  BUSCAR TODOS LOS MODULOS
            if (this.modulos.length === 0) {
                const modulosRequest = await fetch('../../API/MODULOS/GET', {
                    headers: {
                        'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                    }
                });
                this.modulos = (await modulosRequest.json()).modulos;

                //  BUSCAR LAS EMPRESAS ASIGNADAS AL PLAN
                const config = {
                    'Select': 'idEmpresasM'
                };
                const empresasRequest = await fetch(`../../API/EMPRESAS/GET?config=${JSON.stringify(config)}`, {
                    headers: {
                        'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                    }
                });

                var empresasTemp = await empresasRequest.json();
                if (empresasTemp.empresas[0].idEmpresasM) {
                    this.empresas = ((empresasTemp).empresas[0].idEmpresasM).split(',');
                    this.empresas = this.empresas[0] === '' ? [] : this.empresas;
                }

                document.getElementById('cargando').setAttribute('hidden', true);
            }

            const inptNombre = document.getElementById('inptNombreNuevoUsuario');
            if (inptNombre)
                inptNombre.removeAttribute('disabled');
            const inptApellido = document.getElementById('inptApellidosNuevoUsuario');
            if (inptApellido)
                inptApellido.removeAttribute('disabled');
            const inptNombreUsuario = document.getElementById('inptNombreUsuario');
            if (inptNombreUsuario)
                inptNombreUsuario.setAttribute('disabled', true);

            //  SI ES UN USUARIO NUEVO
            if (!config) {
                this.tipoModalStatus = true;
                this.nombreUsuario = '';
                this.nombre = '';
                this.apellidos = '';
                this.nivelUsuarioSeleccionado = '2';
                this.permisoRemoto = '1';
                inptNombreUsuario.removeAttribute('disabled');
                document.getElementById('cargando').setAttribute('hidden', true);
            }
            //  SI ES UN USUARIO EXISTENTE
            else {
                this.tipoModalStatus = false;
                this.nombreCompleto = config.NombreUsuario;
                this.nombreUsuario = config.Login;
                this.IdUsuarioSeleccionado = config.IdUsuario;
                this.EstadoUsuarioSeleccionado = config.Estatus;
                this.nivelUsuarioSeleccionado = config.Nivel;
                this.permisoRemoto = config.Remoto === true ? '1' : '0';

                const response = await fetch(`../../API/PERMISOSUSUARIO/GET/${config.IdUsuario}`, {
                    headers: {
                        'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                    }
                });

                for (item of (await response.json()).permisosUsuario)
                    document.getElementById(`check_${item}`).checked = true;

                if (config.idEmpresasM !== null && config.idEmpresasM !== '') {
                    this.teniaEmpresasMSeleccionadas = true;
                    config.idEmpresasM.split(',').forEach(x => {
                        let ele = document.getElementById(`checkEmpresas_${x}`);
                        if (ele)
                            ele.checked = true;
                    });
                }

                document.getElementById('cargando').setAttribute('hidden', true);
            }
            $('#modalNuevoUsuario').modal('show');
        },

        AbrirModalEmpresas: async function () {
            if (this.empresasLocales.length === 0)
                this.empresasLocales = await BuscarInformacionLocal('SendWebsocketServer/4', {});

            await fetch(`../../API/EMPRESAS/GET`, {
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                }
            })
                .then(response => { return response.json(); })
                .then(json => {
                    this.nroEmpresasSeleccionadas = 0;
                    this.nro_empresas = json.empresas[0].CantidadEmpresas;

                    if (json.empresas[0].idEmpresasM !== null && json.empresas[0].idEmpresasM !== '') {
                        const empresasM = json.empresas[0].idEmpresasM.split(',');
                        this.nroEmpresasSeleccionadas = empresasM.length;

                        for (item of empresasM) {
                            const ele = document.getElementById(`checkEmpresasLocales_${item}`);
                            if (ele != undefined)
                                ele.checked = true;
                        }
                    }

                    document.getElementById('cargando').setAttribute('hidden', true);
                });

            $('#modalEmpresas').modal('show');
        },

        AbrirModalConexionesRemotas: async function () {
            document.getElementById('cargando').removeAttribute('hidden');
            const res = await fetch(`../../API/CONEXIONREMOTA/OBTENERCOEXIONES`, {
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                }
            });
            debugger
            var json = await res.json();
            this.conexionesRemotasAbiertas = json.conexiones;
            document.getElementById('cargando').setAttribute('hidden', true);

            $('#modalConexionesRemotasAbiertas').modal('show');
        },

        DesconectarUsuario: async function (config) {
            document.getElementById('cargando').removeAttribute('hidden');
            $('#modalConexionesRemotasAbiertas').modal('hide');

            await fetch(`../../API/CONEXIONREMOTA/CERRAR?idUsuarioADesconectar=${String(config.idUsuario)}&quitarPermiso=${config.quitarRemoto}&disconectedByAdmin=true`, {
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                }
            });
            this.BuscarUsuarios();
            document.getElementById('cargando').setAttribute('hidden', true);
        },

        ModificarEmpresa: async function () {
            const empresasLocales = []

            for (item of document.querySelectorAll('*[id^="checkEmpresasLocales_"]'))
                if (document.getElementById(item.id).checked)
                    empresasLocales.push(item.id.replace(/checkEmpresasLocales_/g, ''));

            const empresa = {
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
            });
            window.location.reload();
        },

        empresaCheckChanged: function (check) {
            const element = document.getElementById(check);
            const value = element.checked;

            if (value)
                this.nroEmpresasSeleccionadas++;
            else
                this.nroEmpresasSeleccionadas--;

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

        ToggleTodosCheck: (value, id) => {
            const checkBoxesModulos = document.querySelectorAll(`*[id^="${id}"]`);

            for (item of checkBoxesModulos)
                document.getElementById(item.id).checked = value;
        },

        NuevoUsuario: async function () {
            if (this.nombreUsuario === ''
                || this.nombre === ''
                || this.apellidos === ''
                || this.nivelUsuarioSeleccionado === ''
                || this.permisoRemoto === ''
                || localStorage.getItem('NumeroUnicoEmpresa') === '') {
                return;
            }
            document.getElementById('cargando').removeAttribute('hidden');

            const modulos = [];
            const idEmpresasM = [];

            for (item of document.querySelectorAll('*[id^="check_"]'))
                if (document.getElementById(item.id).checked)
                    modulos.push(item.id.replace(/check_/g, ''));
            document.querySelectorAll('*[id^="checkEmpresas_"]:checked').forEach(x => {
                idEmpresasM.push(`${x.id.replaceAll(/checkEmpresas_/g, '')}`)
            });

            const json = {
                usuario: {
                    Login: this.nombreUsuario,
                    NombreUsuario: `${this.nombre} ${this.apellidos}`,
                    Nivel: this.nivelUsuarioSeleccionado,
                    Remoto: this.permisoRemoto === '1' ? true : false,
                    idEmpresasM: idEmpresasM.join(',')
                },
                modulos
            };

            const response = await fetch('../../API/USUARIOS/POST', {
                method: 'POST',
                body: JSON.stringify(json),
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", ""),
                    'Content-Type': 'application/json'
                }
            });
            const jsonRes = await response.json();
            console.log(jsonRes);

            if (jsonRes === true)
                this.Limpiar();
            else if (jsonRes === false) {
                document.getElementById('cargando').setAttribute('hidden', true);
                document.getElementById('inptNombreUsuario').removeAttribute('disabled');

                MostrarMensage({
                    title: '',
                    message: `El nombre de usuario <b>${this.nombreUsuario}</b>, yá existe o no puede ser usado, ingrese uno manualmente.`,
                    icon: 'warning'
                });
            }
        },

        ModificarUsuario: async function (IdUsuario) {
            document.getElementById('cargando').removeAttribute('hidden');

            const modulos = [];
            const idEmpresasM = [];

            for (item of document.querySelectorAll('*[id^="check_"]'))
                if (document.getElementById(item.id).checked)
                    modulos.push(item.id.replace(/check_/g, ''));
            document.querySelectorAll('*[id^="checkEmpresas_"]:checked').forEach(x => {
                idEmpresasM.push(`${x.id.replaceAll(/checkEmpresas_/g, '')}`)
            });
            
            const usuario = {
                IdUsuario: this.IdUsuarioSeleccionado,
                Nivel: this.nivelUsuarioSeleccionado,
                Remoto: this.permisoRemoto === '1' ? true : false,
            };

            if (idEmpresasM.length || this.teniaEmpresasMSeleccionadas)
                usuario.idEmpresasM = idEmpresasM.join(',')

            const json = {
                usuario,
                modulos
            };

            //  ACTUALIZAR LOS MODULOS
            await fetch('../../API/PERMISOSUSUARIO/PUT', {
                method: 'PUT',
                body: JSON.stringify(json),
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", ""),
                    'Content-Type': 'application/json'
                }
            })
                .then(response => { });

            //  ACTUALIZAR LOS DATOS DEL USUAIO
            await fetch('../../API/USUARIOS/PUT', {
                method: 'PUT',
                body: JSON.stringify(usuario),
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", ""),
                    'Content-Type': 'application/json'
                }
            })
                .then(response => { });

            this.Limpiar();
        },

        ResetearContrasenia: async function () {
            document.getElementById('cargando').removeAttribute('hidden');

            const json = {
                IdUsuario: this.IdUsuarioSeleccionado,
                Clave: 'default'
            };

            await fetch('../../API/USUARIOS/PUT', {
                method: 'PUT',
                body: JSON.stringify(json),
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", ""),
                    'Content-Type': 'application/json'
                }
            })
                .then(response => { this.Limpiar(); });
            document.getElementById('btnGenerarUserName').setAttribute('disabled', true);
        },

        CambiarEstadoUsuario: async function () {
            document.getElementById('cargando').removeAttribute('hidden');

            const json = {
                IdUsuario: this.IdUsuarioSeleccionado,
                Estatus: this.EstadoUsuarioSeleccionado === 1 ? 0 : 1
            };

            await fetch('../../API/USUARIOS/PUT', {
                method: 'PUT',
                body: JSON.stringify(json),
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", ""),
                    'Content-Type': 'application/json'
                }
            })
                .then(response => { this.Limpiar(); });
            document.getElementById('btnGenerarUserName').setAttribute('disabled', true);
        },

        Limpiar: function () {
            $('#modalNuevoUsuario').modal('hide');

            const inptNombreNuevoUsuario = document.getElementById('inptNombreNuevoUsuario');
            if (inptNombreNuevoUsuario)
                inptNombreNuevoUsuario.removeAttribute('disabled');
            const inptApellidosNuevoUsuario = document.getElementById('inptApellidosNuevoUsuario');
            if (inptApellidosNuevoUsuario)
                inptApellidosNuevoUsuario.removeAttribute('disabled');
            const btnAgregarNuevoUsuario = document.getElementById('btnAgregarNuevoUsuario');
            if (btnAgregarNuevoUsuario)
                inptNombreNuevoUsuario.removeAttribute('disabled');

            this.tipoModalStatus = true;
            this.nombre = '';
            this.apellidos = '';
            this.nombreUsuario = '';
            this.nombreCompleto = '';
            this.IdUsuarioSeleccionado = '';
            this.EstadoUsuarioSeleccionado = '';
            this.nivelUsuarioSeleccionado = 2;
            this.permisoRemoto = 1;
            this.usuarios = [];
            this.nroEmpresasSeleccionadas = 0;
            this.teniaEmpresasMSeleccionadas = false;
            //this.modulos = [];

            this.BuscarUsuarios();
        }
    },

    filters: {
        FilterUppercase: value => {
            return value.toUpperCase();
        }
    }
});