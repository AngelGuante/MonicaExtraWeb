const monicaReportes = new Vue({
    el: '#moduloReportes',

    data: {
        fechaHoy: new Date().toISOString().slice(0, 10),
        sourceResportes: '',
        codsClientes: [],
        opcionReporteSeleccionado: '',
        vendedores: [],
        categoriasClientes: [],
        categoriasProveedores: [],
        terminoDePago: [],
        nombresBodega: [],
        categoriasProductos: [],
        minFecha_emision: '',
        maxFecha_emision: '',
    },

    created: () => {
        document.getElementById('btnHome').removeAttribute('hidden');
    },

    watch: {
        vendedores: () => {
            reporte_ventasYDevoluciones.FILTROS.vendedores = monicaReportes.vendedores;
            reporte_cotizacionesYConduces.FILTROS.vendedores = monicaReportes.vendedores;
        },
        categoriasClientes: () => {
            reporte_ventasYDevoluciones.FILTROS.categoriasClientes = monicaReportes.categoriasClientes;
            reporte_cotizacionesYConduces.FILTROS.categoriasClientes = monicaReportes.categoriasClientes;
            reporte_clienteIndividualStatus.FILTROS.categoriasClientes = monicaReportes.categoriasClientes;
        },
        categoriasProveedores: () => {
            reporte_clienteIndividualStatus.FILTROS.categoriasProveedores = monicaReportes.categoriasProveedores;
        },
        minFecha_emision: () => {
            reporte_ventasYDevoluciones.FILTROS.minFecha_emision = monicaReportes.minFecha_emision;
            reporte_cotizacionesYConduces.FILTROS.minFecha_emision = monicaReportes.minFecha_emision;
            reporte_clienteIndividualStatus.FILTROS.minFecha_emision = monicaReportes.minFecha_emision;
        },
        maxFecha_emision: () => {
            reporte_ventasYDevoluciones.FILTROS.maxFecha_emision = monicaReportes.maxFecha_emision;
            reporte_cotizacionesYConduces.FILTROS.maxFecha_emision = monicaReportes.maxFecha_emision;
            reporte_clienteIndividualStatus.FILTROS.maxFecha_emision = monicaReportes.maxFecha_emision;
        },
        terminoDePago: () => {
            reporte_ventasYDevoluciones.FILTROS.terminoDePago = monicaReportes.terminoDePago;
            reporte_cotizacionesYConduces.FILTROS.terminoDePago = monicaReportes.terminoDePago;
            reporte_clienteIndividualStatus.FILTROS.terminoDePago = monicaReportes.terminoDePago;
        },
        nombresBodega: () => {
            reporte_ventasYDevoluciones.FILTROS.nombresBodega = monicaReportes.nombresBodega;
            reporte_cotizacionesYConduces.FILTROS.nombresBodega = monicaReportes.nombresBodega;
        },
        categoriasProductos: () => {
            reporte_ventasYDevoluciones.FILTROS.categoriasProductos = monicaReportes.categoriasProductos;
            reporte_cotizacionesYConduces.FILTROS.categoriasProductos = monicaReportes.categoriasProductos;
        },
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

            //  GENERICO PARA TODOS LOS REPORTES
            this.minFecha_emision = this.fechaHoy;
            this.maxFecha_emision = this.fechaHoy;

            //CARGAR LA DATA CORRESPONDIENTE PARA CADA FILTRO
            if (opcionSeleccionada === 'VentasYDevolucionesCategoriaYVendedor'
                || opcionSeleccionada === 'CotizacionesYConducesFiltro') {
                await this.BuscarData('vendedores');
                await this.BuscarData('categoriasClientes');
            }

            //  PARA CADA REPORTE EN ESPECIFICO
            switch (opcionSeleccionada) {
                case 'VentasYDevolucionesCategoriaYVendedor':
                    reporte_ventasYDevoluciones.DATA = [];
                    reporte_ventasYDevoluciones.GroupDATA = [];
                    reporte_ventasYDevoluciones.DATA = [];
                    break;
                case 'CotizacionesYConducesFiltro':
                    reporte_cotizacionesYConduces.DATA = [];
                    reporte_cotizacionesYConduces.GroupDATA = [];
                    reporte_cotizacionesYConduces.DATA = [];
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

        //  BUSCAR INFORMACION SI ES NECESARIA.
        async BuscarData(data, filtro) {
            switch (data) {
                //  ---------
                //  REPORTES.
                //  ---------
                case 'terminoDePago':
                    if (this.terminoDePago.length === 0)
                        this.terminoDePago = await BuscarInformacionLocal('SendWebsocketServer/7', {});
                    break;
                case 'nombresBodega':
                    if (this.nombresBodega.length === 0)
                        this.nombresBodega = await BuscarInformacionLocal('SendWebsocketServer/8', {});
                    break;
                case 'categoriasProductos':
                    if (this.categoriasProductos.length === 0)
                        this.categoriasProductos = (await BuscarInformacionLocal('SendWebsocketServer/9', {})).reverse();
                    break;
                case 'vendedores':
                    if (this.vendedores.length === 0)
                        this.vendedores = await BuscarInformacionLocal('SendWebsocketServer/3', {});
                    break;
                case 'categoriasClientes':
                    if (this.categoriasClientes.length === 0)
                        this.categoriasClientes = await BuscarInformacionLocal('SendWebsocketServer/5', {});
                    break;
                case 'categoriasProveedores':
                    if (this.categoriasProveedores.length === 0)
                        this.categoriasProveedores = await BuscarInformacionLocal('SendWebsocketServer/11', {});
                    break;
                case 'clientes':
                    return await BuscarInformacionLocal('SendWebsocketServer/6', filtro);
                case 'proveedores':
                    return await BuscarInformacionLocal('SendWebsocketServer/10', filtro);

                //  ---------------
                //  MANEJO DE DATA.
                //  ---------------
                //case 'obtenerCotizacion':
                //    return await BuscarInformacionLocal('SendWebsocketServer/12', filtro, true);
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

        LimpiarTablas() {
            reporte_cotizacionesYConduces.TablaVisible = '';
            reporte_ventasYDevoluciones.TablaVisible = '';
            reporte_clienteIndividualStatus.DATA = [];
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