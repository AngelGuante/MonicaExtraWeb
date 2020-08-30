let acceso = new Vue({
    el: '#divLog',

    data: {
        DivLog: {
            remember: true,
            pass: ''
        },
    },

    created: function () {
        CoockiesIniciales();
        let rememberPasswordCookie = GetCookieElement('rememberPass=');

        this.DivLog.remember = rememberPasswordCookie === 'true' ? true : false;
        if (this.DivLog.remember) {
            this.DivLog.pass = rememberPasswordCookie = document.cookie.split('; ')
                .find(item => item.startsWith('password='))
                .replace('password=', '')
                .replace(';', '');
        }

        document.getElementById('cargando').setAttribute('hidden', true);
    },

    methods: {
        Log() {
            if (this.DivLog.remember) {
                SetCoockie(`password=${this.DivLog.pass};`);
                SetCoockie(`rememberPass=true;`);
            }
            else {
                SetCoockie(`password=;`);
                SetCoockie(`rememberPass=false;`);
            }

            let fecha = new Date();

            if (this.DivLog.pass == fecha.getFullYear() + fecha.getMonth() + 1) {
                document.getElementById('cargando').removeAttribute('hidden');

                window.location.href = `../Acceso/Acceder`;
            }
            else {
                this.DivLog.pass = '';
                document.getElementById('badPass').removeAttribute('hidden');
            }
        }
    },
});