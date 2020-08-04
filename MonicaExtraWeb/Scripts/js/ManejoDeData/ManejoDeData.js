const monicaManejoDeData = new Vue({
    el: '#moduloManejoDeData',

    data: {
        opcionReporteSeleccionado: ''
    },

    created: () => {
        document.getElementById('btnHome').removeAttribute('hidden');
    },

    methods: {
        DivSeleccionarReporte(source) {
            NavigationBehaviour('SeleccionarManejoDeData', 'SeleccionarSourceParaManejoDeData');
            document.getElementById('cargando').setAttribute('hidden', true);

            this.sourceResportes = source;
        },

        //  OPCIONES DEL MENU
        async OpcionMenuCeleccionado(opcionSeleccionada) {
            $('#sidebar').toggleClass('active');

            //  MOSTRAR EL FILTRO SELECCONADO Y OCULTAR EL QUE ESTABA VISIBLE
            if (this.opcionReporteSeleccionado)
                document.getElementById(this.opcionReporteSeleccionado).setAttribute('hidden', true);

            document.getElementById(opcionSeleccionada).removeAttribute('hidden');
            this.opcionReporteSeleccionado = opcionSeleccionada;
        },

        //  BUSCAR INFORMACION.
        async BuscarData(data, filtro) {
            switch (data) {
                case 'obtenerCotizacion':
                        return await BuscarInformacionLocal('SendWebsocketServer/12', filtro, true);
                case 'obtenerEstimado':
                        return await BuscarInformacionLocal('SendWebsocketServer/13', filtro);
                case 'actualizarEstimado':
                        return await BuscarInformacionLocal('SendWebsocketServer/14', filtro, true);
                default:
                    alert('Console Error');
                    new Error(`Opcion: ${data}, NO manejada.`);
                    break;
            }
        },
    }
});