const usuarios = new Vue({
    el: '#manejoUsuarios',

    data: {
        nombre: '',
        apellidos: '',
        nombreUsuario: '',
        nombreCompleto: '',
        nivelUsuarioSeleccionado: 2,

        numeroUnicoEmpresa: '',

        usuarios: [],
        modulos: [],

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
                this.ToggleTodosLosModulos(true);
            else if (this.nivelUsuarioSeleccionado === "2")
                this.ToggleTodosLosModulos(false);
        }
    },

    methods: {
        BuscarUsuarios: function () {
            const usuario = {
                IdEmpresa: localStorage.getItem('NumeroUnicoEmpresa')
            };

            fetch(`../../API/USUARIOS/GET?usuario=${JSON.stringify(usuario)}`, {
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                }
            })
                .then(response => { return response.json(); })
                .then(json => {
                    this.usuarios = json.usuarios;
                    document.getElementById('cargando').setAttribute('hidden', true);
                })
                .catch(err => {
                    document.getElementById('cargando').setAttribute('hidden', true);
                    console.log(err);
                });
        },

        GenerarUserName: function () {
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
            this.ToggleTodosLosModulos(false);

            //  BUSCAR TODOS LOS MODULOS
            if (this.modulos.length === 0) {
                await fetch('../../API/MODULOS/GET', {
                    headers: {
                        'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                    }
                })
                    .then(response => { return response.json(); })
                    .then(json => {
                        this.modulos = json.modulos;
                        document.getElementById('cargando').setAttribute('hidden', true);
                    })
                    .catch(err => {
                        document.getElementById('cargando').setAttribute('hidden', true);
                        console.log(err);
                    });
            }

            //  SI ES UN USUARIO NUEVO
            if (!config) {
                this.tipoModalStatus = true;
                this.nombreUsuario = '';
                this.nivelUsuarioSeleccionado = '2';
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

                await fetch(`../../API/PERMISOSUSUARIO/GET/${config.IdUsuario}`, {
                    headers: {
                        'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                    }
                })
                    .then(response => { return response.json(); })
                    .then(json => {
                        for (item of json.permisosUsuario)
                            document.getElementById(`check_${item}`).checked = true;

                        document.getElementById('cargando').setAttribute('hidden', true);
                    })
                    .catch(err => {
                        document.getElementById('cargando').setAttribute('hidden', true);
                        console.log(err);
                    });
                document.getElementById('cargando').setAttribute('hidden', true);
            }

            $('#modalNuevoUsuario').modal('show');
        },

        ToggleTodosLosModulos: (value) => {
            const checkBoxesModulos = document.querySelectorAll('*[id^="check_"]');

            for (item of checkBoxesModulos)
                document.getElementById(item.id).checked = value;
        },

        NuevoUsuario: function () {
            document.getElementById('cargando').removeAttribute('hidden');

            const modulos = []

            for (item of document.querySelectorAll('*[id^="check_"]'))
                if (document.getElementById(item.id).checked)
                    modulos.push(item.id.replace(/check_/g, ''));

            const json = {
                usuario: {
                    Login: this.nombreUsuario,
                    NombreUsuario: `${this.nombre} ${this.apellidos}`,
                    Nivel: this.nivelUsuarioSeleccionado,
                    IdEmpresa: localStorage.getItem('NumeroUnicoEmpresa')
                },
                modulos
            };

            fetch('../../API/USUARIOS/POST', {
                method: 'POST',
                body: JSON.stringify(json),
                headers: {
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", ""),
                    'Content-Type': 'application/json'
                }
            })
                .then(response => { this.Limpiar(); });
        },

        ModificarUsuario: async function (IdUsuario) {
            document.getElementById('cargando').removeAttribute('hidden');

            const modulos = []

            for (item of document.querySelectorAll('*[id^="check_"]'))
                if (document.getElementById(item.id).checked)
                    modulos.push(item.id.replace(/check_/g, ''));


            const usuario = {
                IdUsuario: this.IdUsuarioSeleccionado,
                Nivel: this.nivelUsuarioSeleccionado
            };

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
            this.usuarios = [];
            //this.modulos = [];

            this.BuscarUsuarios();
        }
    }
});