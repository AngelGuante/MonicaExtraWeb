const seleccionarEmpresa = new Vue({
    el: '#SeleccionarEmpresa',

    data: {
        ApiRuta: '/API/ASPISAP/',
        Empresas: [],
    },

    created: async function () {
        const filtro = {
            WHRER_IN: window.localStorage.getItem('Empresas') ? window.localStorage.getItem('Empresas') : '-1'
        };
        this.Empresas = await BuscarInformacionLocal('SendWebsocketServer/4', filtro);

        if (this.Empresas.length === 0)
            switch (window.localStorage.getItem('Nivel')) {
                case '1':
                    window.location.href = `../Administracion`;
                    document.getElementById('cargando').removeAttribute('hidden');
                    break;
                case '2':
                    document.getElementById('SeleccionarEmpresa').setAttribute('hidden', true);
                    document.getElementById('sinEmpresasATrabajar').removeAttribute('hidden');
            }
    },

    methods: {
        async EmpresaSeleccionada(idEmpresa, conn) {
            localStorage.setItem('conn', conn);
            document.getElementById('cargando').removeAttribute('hidden');
            
            const filtro = {
                SELECT: 'Nombre_empresa, direccion1, direccion2, direccion3, Telefono1, Registro_Tributario_empresa',
                WHRER_IN: idEmpresa
            };

            const data = await BuscarInformacionLocal('SendWebsocketServer/4', filtro);
            document.getElementById('cargando').removeAttribute('hidden');
            localStorage.setItem('Nombre_empresa', data[0].Nombre_empresa);
            localStorage.setItem('direccionEmpresa1', data[0].direccion1);
            localStorage.setItem('direccionEmpresa2', data[0].direccion2);
            localStorage.setItem('direccionEmpresa3', data[0].direccion3);
            localStorage.setItem('TelefonoEmpresa1', data[0].Telefono1);
            localStorage.setItem('Registro_Tributario_empresa', data[0].Registro_Tributario_empresa);

            window.location.href = `../Menu`;
        },
    }
});