﻿let acceso = new Vue({
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

        if (window.location.search.includes('tokenStatus'))
            document.getElementById('message').removeAttribute('hidden');
        else
            document.getElementById('message').setAttribute('hidden', true);
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

            document.getElementById('cargando').removeAttribute('hidden');

            fetch('../API/Login/authenticate', {
                method: 'POST',
                body: JSON.stringify({
                    Username: 'default',
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

                    let json = await content.json();
                    SetCoockie(`Authorization=${json}`);
                    window.location.href = `../Menu`;
                });
            document.getElementById('cargando').setAttribute('hidden', true);
        }
    },
});