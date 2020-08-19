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
        subCategoriasProductos: [],
        terminoDePago: [],
        terminoDePagoPv: [],
        nombresBodega: [],
        categoriasProductos: [],
        impuestos: [],
        giroNegocios: [],
        giroNegociosPv: [],
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
            reporte_clientesYProveedores.FILTROS.vendedores = monicaReportes.vendedores;
        },
        categoriasClientes: () => {
            reporte_ventasYDevoluciones.FILTROS.categoriasClientes = monicaReportes.categoriasClientes;
            reporte_cotizacionesYConduces.FILTROS.categoriasClientes = monicaReportes.categoriasClientes;
            reporte_clienteIndividualStatus.FILTROS.categoriasClientes = monicaReportes.categoriasClientes;
            reporte_clientesYProveedores.FILTROS.categoriasClientes = monicaReportes.categoriasClientes;
        },
        categoriasProveedores: () => {
            reporte_clienteIndividualStatus.FILTROS.categoriasProveedores = monicaReportes.categoriasProveedores;
            reporte_comprasDevolucionesYCotizaciones.FILTROS.categoriasProveedores = monicaReportes.categoriasProveedores;
            reporte_clientesYProveedores.FILTROS.categoriasProveedores = monicaReportes.categoriasProveedores;
        },
        minFecha_emision: () => {
            reporte_ventasYDevoluciones.FILTROS.minFecha_emision = monicaReportes.minFecha_emision;
            reporte_cotizacionesYConduces.FILTROS.minFecha_emision = monicaReportes.minFecha_emision;
            reporte_clienteIndividualStatus.FILTROS.minFecha_emision = monicaReportes.minFecha_emision;
            reporte_comprasDevolucionesYCotizaciones.FILTROS.minFecha_emision = monicaReportes.minFecha_emision;
        },
        maxFecha_emision: () => {
            reporte_ventasYDevoluciones.FILTROS.maxFecha_emision = monicaReportes.maxFecha_emision;
            reporte_cotizacionesYConduces.FILTROS.maxFecha_emision = monicaReportes.maxFecha_emision;
            reporte_clienteIndividualStatus.FILTROS.maxFecha_emision = monicaReportes.maxFecha_emision;
            reporte_comprasDevolucionesYCotizaciones.FILTROS.maxFecha_emision = monicaReportes.maxFecha_emision;
        },
        terminoDePago: () => {
            reporte_ventasYDevoluciones.FILTROS.terminoDePago = monicaReportes.terminoDePago;
            reporte_cotizacionesYConduces.FILTROS.terminoDePago = monicaReportes.terminoDePago;
            reporte_clienteIndividualStatus.FILTROS.terminoDePago = monicaReportes.terminoDePago;
            reporte_comprasDevolucionesYCotizaciones.FILTROS.terminoDePago = monicaReportes.terminoDePago;
            reporte_clientesYProveedores.FILTROS.terminoDePago = monicaReportes.terminoDePago;
        },
        terminoDePagoPv: () => {
            reporte_clientesYProveedores.FILTROS.terminoDePagoPv = monicaReportes.terminoDePagoPv;
        },
        impuestos: () => {
            reporte_clientesYProveedores.FILTROS.impuestos = monicaReportes.impuestos;
        },
        giroNegocios: () => {
            reporte_clientesYProveedores.FILTROS.giroNegocios = monicaReportes.giroNegocios;
        },
        giroNegociosPv: () => {
            reporte_clientesYProveedores.FILTROS.giroNegociosPv = monicaReportes.giroNegociosPv;
        },
        nombresBodega: () => {
            reporte_ventasYDevoluciones.FILTROS.nombresBodega = monicaReportes.nombresBodega;
            reporte_cotizacionesYConduces.FILTROS.nombresBodega = monicaReportes.nombresBodega;
            reporte_inventarioYLiquidacion.FILTROS.nombresBodega = monicaReportes.nombresBodega;
            reporte_comprasDevolucionesYCotizaciones.FILTROS.nombresBodega = monicaReportes.nombresBodega;
        },
        categoriasProductos: () => {
            reporte_ventasYDevoluciones.FILTROS.categoriasProductos = monicaReportes.categoriasProductos;
            reporte_cotizacionesYConduces.FILTROS.categoriasProductos = monicaReportes.categoriasProductos;
            reporte_inventarioYLiquidacion.FILTROS.categoriasProductos = monicaReportes.categoriasProductos;
            reporte_comprasDevolucionesYCotizaciones.FILTROS.categoriasProductos = monicaReportes.categoriasProductos;
        },
        subCategoriasProductos: () => {
            reporte_inventarioYLiquidacion.FILTROS.subProductosCategorias = monicaReportes.subCategoriasProductos;
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
            } else if (opcionSeleccionada === 'inventarioYLiquidacionFiltro') {
                await this.BuscarData('nombresBodega');
                await this.BuscarData('subCategoriasProductos');
                await this.BuscarData('categoriasProductos');
            } else if (opcionSeleccionada === 'comprasDevolucionesYConducesFiltro') {
                await this.BuscarData('categoriasProveedores');
            }

            //  PARA CADA REPORTE EN ESPECIFICO
            //switch (opcionSeleccionada) {
            //    case 'VentasYDevolucionesCategoriaYVendedor':
            //        reporte_ventasYDevoluciones.DATA = [];
            //        reporte_ventasYDevoluciones.GroupDATA = [];
            //        reporte_ventasYDevoluciones.DATA = [];
            //        break;
            //    case 'CotizacionesYConducesFiltro':
            //        reporte_cotizacionesYConduces.DATA = [];
            //        reporte_cotizacionesYConduces.GroupDATA = [];
            //        reporte_cotizacionesYConduces.DATA = [];
            //        break;
            //}

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
                case 'terminoDePagoPv':
                    if (this.terminoDePagoPv.length === 0)
                        this.terminoDePagoPv = await BuscarInformacionLocal('SendWebsocketServer/20', {});
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
                case 'subCategoriasProductos':
                    if (this.subCategoriasProductos.length === 0)
                        this.subCategoriasProductos = await BuscarInformacionLocal('SendWebsocketServer/16', {});
                    break;
                case 'impuestos':
                    if (this.impuestos.length === 0)
                        this.impuestos = await BuscarInformacionLocal('SendWebsocketServer/21', {});
                    break;
                case 'giroNegocios':
                    if (this.giroNegocios.length === 0)
                        this.giroNegocios = await BuscarInformacionLocal('SendWebsocketServer/22', {});
                    break;
                case 'giroNegociosPv':
                    if (this.giroNegociosPv.length === 0)
                        this.giroNegociosPv = await BuscarInformacionLocal('SendWebsocketServer/23', {});
                    break;
                case 'clientesList':
                    return await BuscarInformacionLocal('SendWebsocketServer/6', filtro);
                case 'proveedoresList':
                    return await BuscarInformacionLocal('SendWebsocketServer/10', filtro);
                case 'vendedoresList':
                    return await BuscarInformacionLocal('SendWebsocketServer/18', filtro);

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
            let divGrafico;
            //  PARA CADA REPORTE EN ESPECIFICO
            switch (this.opcionReporteSeleccionado) {
                case 'VentasYDevolucionesCategoriaYVendedor':
                    reporte_ventasYDevoluciones.TablaVisible = '';
                    reporte_ventasYDevoluciones.DATA = [];
                    reporte_ventasYDevoluciones.GroupDATA = [];
                    break;
                case 'filtrosClienteIndividualStatus':
                    reporte_clienteIndividualStatus.DATA = [];
                    divGrafico = document.getElementById('CPCCPPdivGraficosDatosAgrupados');
                    break;
                case 'clientesYProveedoresFiltro':
                    reporte_clientesYProveedores.DATA = [];
                    divGrafico = document.getElementById('CPdivGraficosDatosAgrupados');
                    break;
                case 'inventarioYLiquidacion':
                    reporte_inventarioYLiquidacion.DATA = [];
                    divGrafico = document.getElementById('ILdivGraficosDatosAgrupados');
                    break;
                case 'comprasDevolucionesYConducesFiltro':
                    reporte_comprasDevolucionesYCotizaciones.DATA = [];
                    divGrafico = document.getElementById('divTablaComprasVentasCotizaciones');
                    break;
                case 'CotizacionesYConducesFiltro':
                    reporte_cotizacionesYConduces.TablaVisible = '';
                    reporte_cotizacionesYConduces.DATA = [];
                    reporte_cotizacionesYConduces.GroupDATA = [];
                    break;
            }
            if (divGrafico)
                divGrafico.setAttribute('hidden', true);
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

            if (value == 0)
                returnValue = 'NACIONAL';
            else if (value === 1)
                returnValue = 'EXTRANJERA';

            return returnValue;
        },

        FilterTipoProducto: value => {
            switch (value) {
                case 1:
                    return 'FISICO';
                case 2:
                    return 'SERVICIO';
                case 3:
                    return 'OCACIONAL';
            }
        }
    }
});