const reporte_clienteIndividualStatus = new Vue({
    el: '#clienteIndividualStatus',

    data: {
        ApiReportes: '/API/Reportes/',

        DATA: [],
        FILTROS: {
            codCliente: '',
            mostrarNCF: false,
            soloDocsVencidos: false,
            incluirFirmas: false,
            incluirMoras: false,

            tipoReporte: 'PorCobrar',
            tipoConsulta: '',
            desdeHastaRango: 0,
            desde: 0,
            hasta: 0,
        },

        modalData: {
            clientes: [],
            PaginatorIndex: 0,
            PaginatorLastPage: 0,
            nombreClienteABuscar: ''
        }
    },

    watch: {
        'FILTROS.desdeHastaRango'() {
            const rango = getIntervalDate(this.FILTROS.desdeHastaRango);

            this.FILTROS.minFecha_emision = rango.firstday;
            this.FILTROS.maxFecha_emision = rango.lastday;
        },
    },

    methods: {
        Pagination(value, instance, origin) {
            switch (value) {
                case -1:
                    instance.PaginatorIndex--;
                    break;
                case +1:
                    instance.PaginatorIndex++;
                    break;
                case 'MAX':
                    instance.PaginatorIndex = instance.PaginatorLastPage;
                    break
                case 0:
                default:
                    instance.PaginatorIndex = 0;
                    break;
            }
            switch (origin) {
                case 'paginator':
                    this.ModalBuscarClientes();
                    break;
                default:
                    this.Buscar()
                    break;
            }
        },

        async Buscar() {
            monicaReportes.LimpiarTablas();
            const codigo = (this.FILTROS.codCliente.split(' - '))[0];

            if (this.FILTROS.tipoConsulta === 'estadoCuentaIndividual' && !codigo) {
                MostrarMensage({
                    title: 'No se puede hacer su búsqueda.',
                    message: `Debe ingresar un codigo de cliente.`,
                    icon: 'info'
                });
                return;
            }

            if (monicaReportes.sourceResportes === 'web')
                this.ValidarCampoCodigoCliente();
            else if (monicaReportes.sourceResportes === 'local') {
                this.DATA = [];

                const filtro = {
                    minFecha_emision: this.FILTROS.minFecha_emision,
                    maxFecha_emision: this.FILTROS.maxFecha_emision,
                    code: codigo,
                    SoloDocsVencidos: this.FILTROS.soloDocsVencidos,
                    tipoReporte: this.FILTROS.tipoReporte,
                    tipoConsulta: this.FILTROS.tipoConsulta,
                }
                
                if (this.FILTROS.tipoConsulta === 'RFA01'
                    || this.FILTROS.tipoConsulta === 'RFA02'
                    || this.FILTROS.tipoConsulta === 'RFA03'
                    || this.FILTROS.tipoConsulta === 'RFA04'
                    || this.FILTROS.tipoConsulta === 'RFA06'
                    || this.FILTROS.tipoConsulta === 'RFA0'
                    || this.FILTROS.tipoConsulta === 'RFA08') {
                    filtro.desde = this.FILTROS.desde;
                    filtro.hasta = this.FILTROS.hasta;
                }

                let result = await BuscarInformacionLocal('SendWebsocketServer/1', filtro);

                for (item of result)
                    this.DATA.push(item);

                for (item of this.DATA)
                    item.diasTrancurridos = DaysDiff(item.fecha_emision, new Date().toISOString().slice(0, 10));

                //  TOTALIZACIONES.
                if (this.DATA.length === 0)
                    return;

                filtro.SUM = true;
                result = await BuscarInformacionLocal('SendWebsocketServer/1', filtro);

                this.DATA.push(
                    { '': '', '': '', '': '', '': '', 'monto': result[0].sumatoriaMontos, 'pagosAcumulados': result[0].sumatoriaPagosAcumulados, 'balance': result[0].sumatoriaBalance });

                let interval = setInterval(() => {
                    let tabla = document.getElementById('tablaEstadoCuentaCliente');

                    if (tabla) {
                        TablaEstiloTotalizacionFila(tabla, [5, 6, 7])

                        clearInterval(interval);
                    }
                }, 0);

                //  GUARDARLO EN EL NAVEGADOR PARA CUANDO EL CLIENTE LE DE A IMPRIMIR.
                localStorage.setItem('sumatoriasEstadoCuentaCliente', JSON.stringify(result[0]));
            }
        },

        ValidarCampoCodigoCliente() {
            if (!monicaReportes.codsClientes.includes(codigo)) {
                MostrarMensage({
                    title: 'Código No Encontrado',
                    message: `El código ${this.FILTROS.codCliente}, no ha sido encontrado, favor ingrese un código válido.`,
                    icon: 'info'
                });
                return;
            }

            document.getElementById('cargando').removeAttribute('hidden');
            this.BuscarClienteProveedor();
        },

        BuscarClienteProveedor() {
            const filtro = {
                code: this.FILTROS.codCliente,
                SoloDocsVencidos: this.FILTROS.soloDocsVencidos,
                IncluirMoras: this.FILTROS.incluirMoras
            }

            $.get(`..${this.ApiReportes}GetStatus`, { filtro }, response => {
                this.DATA = [];

                for (item of response.DATA)
                    this.DATA.push(item);

                for (item of response.DATA)
                    item.diasTrancurridos = DaysDiff(item.fecha_emision, item.fecha_vcmto),

                        document.getElementById('cargando').setAttribute('hidden', true);

                if (!this.DATA.length)
                    MostrarMensage({
                        title: 'Sin registros',
                        message: `El código ${this.FILTROS.codCliente}, no tiene ningún registro.`,
                        icon: 'info'
                    });
            });
        },

        async ModalBuscarClientes() {
            this.modalData.clientes = [];

            $('#buscarClienteModal').modal('hide');

            const filtros = {
                skip: this.modalData.PaginatorIndex
            };

            if (this.modalData.nombreClienteABuscar)
                filtros.name = this.modalData.nombreClienteABuscar;

            if (this.FILTROS.tipoReporte === 'PorCobrar') {
                this.modalData.clientes = await monicaReportes.BuscarData('clientes', filtros);
                filtros.SUM = true;
                this.modalData.PaginatorLastPage = Math.floor((await monicaReportes.BuscarData('clientes', filtros))[0].count / 20);
            }
            else if (this.FILTROS.tipoReporte === 'porPagar') {
                this.modalData.clientes = await monicaReportes.BuscarData('proveedores', filtros);
                filtros.SUM = true;
                this.modalData.PaginatorLastPage = Math.floor((await monicaReportes.BuscarData('proveedores', filtros))[0].count / 20);
            }

            $('#buscarClienteModal').modal('show');
        },

        ModalClienteSleccionado(value) {
            $('#buscarClienteModal').modal('hide');

            this.FILTROS.codCliente = value;
        },

        async TipoConsultaSelectChanged() {
            //  LIMPIAR TODOS LOS CAMPOS.
            //this.FILTROS.Codigo_vendedor = '';
            //this.FILTROS.vendedorSeleccionado = '';
            //this.FILTROS.categoriaClientesSeleccionada = '';
            //this.FILTROS.desde = '';
            //this.FILTROS.hasta = '';
            //this.FILTROS.valor = '';
            //this.FILTROS.terminoDePagoSeleccionado = '';
            //this.FILTROS.nombresBodegaSeleccionada = '';
            //this.FILTROS.categoriasProductosSeleccionada = '';

            //const inputValor = document.getElementById('VDPorComprobanteReporte');
            //if (inputValor && 'input-group' in inputValor.classList)
            //    inputValor.classList.remmove('input-group');

            //  BUSCAR INFORMACION SI ES NECESARIA O HACER CAMBIOS SEGUN EL TIPO DE CONSULTA.
            //if (this.FILTROS.tipoConsulta === 'RFA03')
            //    monicaReportes.BuscarData('terminoDePago');
            //if (this.FILTROS.tipoConsulta === 'RFA0')
            //    monicaReportes.BuscarData('nombresBodega');
            //if (this.FILTROS.tipoConsulta === 'RFA08')
            //    monicaReportes.BuscarData('categoriasProductos');
            //if (this.FILTROS.tipoConsulta === 'RFA09') {
            //    if (inputValor)
            //        inputValor.classList.add('input-group');
            //}
        },

        //----------------------------------------------------------
        //  UTILS
        //----------------------------------------------------------
        Print(type, jsonParameters, SetlocalStorageItemsToPrint) {
            monicaReportes.Print(type, jsonParameters, SetlocalStorageItemsToPrint)
        },
    },

    filters: {
        FilterUppercase: value => {
            return monicaReportes.$options.filters.FilterUppercase(value);
        },

        FilterDateFormat: value => {
            return monicaReportes.$options.filters.FilterDateFormat(value);
        },

        FilterStringToMoneyFormat: value => {
            return monicaReportes.$options.filters.FilterStringToMoneyFormat(value);
        },

        FilterRemoveLeftZeros: value => {
            return monicaReportes.$options.filters.FilterRemoveLeftZeros(value);
        },

        FilterMoneda: value => {
            return monicaReportes.$options.filters.FilterMoneda(value);
        }
    },
});