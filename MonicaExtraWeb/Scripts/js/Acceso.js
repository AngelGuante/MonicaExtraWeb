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
        Log() {
            if (this.DivLog.remember) {
                SetCoockie(`user=${this.DivLog.user};`);
                SetCoockie(`rememberPass=true;`);
            }
            else {
                SetCoockie(`user=;`);
                SetCoockie(`rememberPass=false;`);
            }

            document.getElementById('cargando').removeAttribute('hidden');

            fetch('../API/Login/authenticate', {
                method: 'POST',
                body: JSON.stringify({
                    IdEmpresa: this.DivLog.empresaNumeroUnico,
                    Username: this.DivLog.user,
                    Password: this.DivLog.pass
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.status !== 200) {
                    document.getElementById('cargando').setAttribute('hidden', true);
                    this.DivLog.pass = '';
                    document.getElementById('badPass').removeAttribute('hidden');
                    return;
                }
                else
                    return response;
            })
                .then(async content => {
                    if (!content.url.includes('authenticate')) {
                        document.getElementById('cargando').setAttribute('hidden', true);
                        this.DivLog.pass = '';
                        document.getElementById('badPass').removeAttribute('hidden');
                        return;
                    }

                    const json = await content.json();

                    if (json.Estatus == 0) {
                        document.getElementById('cuentaDeshabilitada').removeAttribute('hidden')
                        return;
                    }
                    if (json.initialPass === this.DivLog.pass) {
                        document.getElementById('log').setAttribute('hidden', true);
                        document.getElementById('divCambiarContrasenia').removeAttribute('hidden');
                        window.localStorage.setItem('Number', json.IdUsuario);
                        this.provitional = json.token;
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
                    else
                        window.location.href = `../SeleccionarEmpresa`;
                });
            document.getElementById('cargando').setAttribute('hidden', true);
        },

        CambiarContrasenia: async function () {
            const usuario = {
                IdUsuario: window.localStorage.getItem('Number'),
                Clave: this.newPass
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