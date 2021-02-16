let acceso = new Vue({
    el: '#divLog',

    data: {
        DivLog: {
            remember: true,
            empresaNumeroUnico: '',
            user: '',
            pass: ''
        },

        newPass: '',
        provitional: ''
    },

    created: function () {
        CoockiesIniciales();
        let rememberPasswordCookie = GetCookieElement('rememberPass=');

        this.DivLog.remember = rememberPasswordCookie === 'true' ? true : false;
        if (this.DivLog.remember) {
            this.DivLog.empresaNumeroUnico = window.localStorage.getItem('NumeroUnicoEmpresa');
            this.DivLog.user = rememberPasswordCookie = document.cookie.split('; ')
                .find(item => item.startsWith('user='))
                .replace('user=', '')
                .replace(';', '');
        }

        document.getElementById('cargando').setAttribute('hidden', true);

        if (window.location.search.includes('tokenStatus'))
            document.getElementById('message').removeAttribute('hidden');
        else
            document.getElementById('message').setAttribute('hidden', true);
    },

    methods: {
        async Log() {
            if (this.DivLog.remember) {
                SetCoockie(`user=${this.DivLog.user};`);
                SetCoockie(`rememberPass=true;`);
            }
            else {
                SetCoockie(`user=;`);
                SetCoockie(`rememberPass=false;`);
            }

            document.getElementById('cargando').removeAttribute('hidden');

            let auth = {
                IdEmpresa: this.DivLog.empresaNumeroUnico,
                Username: this.DivLog.user,
                Password: this.DivLog.pass
            };

            var response = await fetch('../API/Login/authenticate', {
                method: 'POST',
                body: JSON.stringify(auth),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status !== 200) {
                document.getElementById('cargando').setAttribute('hidden', true);
                this.DivLog.pass = '';
                document.getElementById('badPass').removeAttribute('hidden');
                return;
            }
            if (!response.url.includes('authenticate')) {
                document.getElementById('cargando').setAttribute('hidden', true);
                this.DivLog.pass = '';
                document.getElementById('badPass').removeAttribute('hidden');
                return;
            }

            const json = await response.json();
            if ('message' in json) {
                if (json.message.startsWith('Este usuario está conectado en otro equipo')) {
                    Swal.fire({
                        title: json.message,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Si',
                        cancelButtonText: 'No'
                    }).then(async result => {
                        if (result.value) {
                            document.getElementById('cargando').removeAttribute('hidden');

                            auth.desconectar = true;
                            response = await fetch('../API/Login/authenticate', {
                                method: 'POST',
                                body: JSON.stringify(auth),
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            });

                            this.procesoConexion(await response.json());
                        }
                    });
                }
                else {
                    document.getElementById('ServerMessageDiv').removeAttribute('hidden')
                    document.getElementById('serverLoginMessage').innerHTML = json.message;
                }
                document.getElementById('cargando').setAttribute('hidden', true);
                return;
            }

            this.procesoConexion(json);
        },

        procesoConexion: async function (json) {
            if (json.initialPass === this.DivLog.pass) {
                document.getElementById('log').setAttribute('hidden', true);
                document.getElementById('divCambiarContrasenia').removeAttribute('hidden');
                window.localStorage.setItem('Number', json.IdUsuario);
                this.provitional = json.token;
                document.getElementById('cargando').setAttribute('hidden', true);
                return;
            }

            localStorage.setItem('Number', json.IdUsuario);
            SetCoockie(`Authorization=${json.token}`);
            localStorage.setItem('NombreUsuario', json.NombreUsuario);
            localStorage.setItem('Empresas', json.idEmpresasM);
            localStorage.setItem('NumeroUnicoEmpresa', this.DivLog.empresaNumeroUnico);
            localStorage.setItem('Nivel', json.Nivel);

            if (json.Nivel === 0)
                window.location.href = `../Control`;
            else if (json.Nivel === 3) {
                alert("Este usuario está configurado para funcionar como remoto en la aplicación 'ExtraService Notification'.");
                await CloseUserSession();
                window.location.href = `../`;
                return;
            }
            else {
                localStorage.setItem('remoteConexion', true);
                window.location.href = `../SeleccionarEmpresa`;
            }
        },

        CambiarContrasenia: async function () {
            const usuario = {
                IdUsuario: window.localStorage.getItem('Number'),
                Clave: this.newPass,
                desconectar: true
            };

            //  ACTUALIZAR LAS CONTRASEñAS
            await fetch('../API/USUARIOS/PUT', {
                method: 'PUT',
                body: JSON.stringify(usuario),
                headers: {
                    'Authorization': 'Bearer ' + this.provitional,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    this.provitional = '';
                    window.location.href = `../SeleccionarEmpresa`;
                });
        }
    },
});