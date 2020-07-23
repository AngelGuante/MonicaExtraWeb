const monicaReportes = new Vue({
    el: '#moduloReportes',

    data: {
        sourceResportes: '',
        codsClientes: [],
        opcionReporteSeleccionado: '',
    },

    methods: {
        DivSeleccionarReporte(source) {
            this.LimpiarTablas();

            NavigationBehaviour('SeleccionarReporte', 'SeleccionarSourceParaReporte');
            document.getElementById('cargando').setAttribute('hidden', true);

            this.sourceResportes = source;
            if (this.sourceResportes === 'web') {
                if (this.codsClientes.length === 0) {
                    $.get(`..${this.ApiClientes}GetCodes`, {}, response => {
                        this.codsClientes = response.codes;
                    });
                }
            }
        },

        //  OPCIONES DEL MENU
        async OpcionMenuCeleccionado(opcionSeleccionada) {
            this.LimpiarTablas();
            $('#sidebar').toggleClass('active');

            switch (opcionSeleccionada) {
                case 'VentasYDevolucionesCategoriaYVendedor':
                    reporte_ventasYDevoluciones.VentasYDevolucionesCategoriaYVendedorDATA = [];
                    reporte_ventasYDevoluciones.VentasYDevolucionesCategoriaYVendedorGroupDATA = [];
                    reporte_ventasYDevoluciones.IndividualClientStatusDATA = [];

                    if (!reporte_ventasYDevoluciones.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emision) {
                        reporte_ventasYDevoluciones.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emision = new Date().toISOString().slice(0, 10);
                        reporte_ventasYDevoluciones.VentasYDevolucionesCategoriaYVendedorFILTROS.maxFecha_emision = new Date().toISOString().slice(0, 10);
                    }
                    if (reporte_ventasYDevoluciones.VentasYDevolucionesCategoriaYVendedorFILTROS.vendedores.length === 0)
                        reporte_ventasYDevoluciones.VentasYDevolucionesCategoriaYVendedorFILTROS.vendedores = await BuscarInformacionLocal('SendWebsocketServer/3', {});
                    if (reporte_ventasYDevoluciones.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasClientes.length === 0)
                        reporte_ventasYDevoluciones.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasClientes = await BuscarInformacionLocal('SendWebsocketServer/5', {});
                    break;
            }

            //  MOSTRAR EL FILTRO SELECCONADO Y OCULTAR EL QUE ESTABA VISIBLE
            if (this.opcionReporteSeleccionado)
                document.getElementById(this.opcionReporteSeleccionado).setAttribute('hidden', true);

            document.getElementById(opcionSeleccionada).removeAttribute('hidden');
            this.opcionReporteSeleccionado = opcionSeleccionada;
        },

        //  PARA PODER IMPRIMIR USANDO EL METODO EN Utils.js
        Print(type, jsonParameters, SetlocalStorageItemsToPrint) {
            if (SetlocalStorageItemsToPrint) {
                switch (type) {
                    case 'cierre':
                        localStorage.setItem('NumeroCierre', SetlocalStorageItemsToPrint.NumeroCierre);
                        localStorage.setItem('FechaInicial', SetlocalStorageItemsToPrint.FechaInicial);
                        localStorage.setItem('FechaFinal', SetlocalStorageItemsToPrint.FechaFinal);
                        localStorage.setItem('SaldoFinal', SetlocalStorageItemsToPrint.SaldoFinal);
                        break;
                }
            }

            Print(type, jsonParameters);
        },

        LimpiarTablas() {
            reporte_ventasYDevoluciones.VentasYDevolucionesCategoriaYVendedorTablaVisible = '';
            reporte_clienteIndividualStatus.IndividualClientStatusDATA = [];
        },
    },

    filters: {
        FilterUppercase: value => {
            return value ? value.toString().toUpperCase() : value;
        },

        FilterDateFormat: value => {
            const date = new Date(value);
            const fecha = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

            if (!fecha.includes('NaN'))
                return fecha;
            else
                return value;
        },

        FilterStringToMoneyFormat: value => {
            const mount = Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '');

            if (mount !== 'NaN')
                return mount;
            else
                return value;
        },

        FilterRemoveLeftZeros: value => {
            return value ? value.toString().replace(/^0*/g, '') : value;
        },

        FilterMoneda: value => {
            let returnValue;

            if (value === 0)
                returnValue = 'NACIONAL';
            else if (value === 1)
                returnValue = 'EXTRANJERA';

            return returnValue;
        }
    }
});