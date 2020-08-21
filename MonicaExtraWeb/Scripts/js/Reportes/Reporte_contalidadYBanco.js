const reporte_contabilidadYBanco = new Vue({
    el: '#contabilidadYBanco',

    data: {
        DATA: [],
        //GroupDATA: [],
        FILTROS: {
            tipoReporte: 'contabilidad',
            tipoConsulta: 'Plan_de_Cuentas',
            tipoBusqueda: 'codigo',
            clasificacion: 'A',
            valor: '',
            ConBalance: false,

            PaginatorIndex: 0,
            PaginatorLastPage: 0,
        },
    },

    watch: {
        'FILTROS.tipoReporte'() {
            this.Limpiar();
        },
        'FILTROS.desdeHastaRango'() {
            //if (this.FILTROS.desdeHastaRango === '-1')
            //    return;

            //const rango = getIntervalDate(this.FILTROS.desdeHastaRango);

            //this.FILTROS.minFecha_emision = rango.firstday;
            //this.FILTROS.maxFecha_emision = rango.lastday;
        },
    },

    methods: {
        Pagination(value, instance, origin) {
            instance = instance === undefined ? this.FILTROS : instance;

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
                    this.ModalBuscarCodigo();
                    break;
                default:
                    this.Buscar(this.FILTROS.PaginatorIndex)
                    break;
            }
        },

        async Buscar(skip) {
            if (skip === undefined) {
                skip = 0;
                this.FILTROS.PaginatorIndex = 0;
            }

            if (monicaReportes.sourceResportes === 'web')
                alert('Por el momento esta busqueda solo se ha planteado para la parte Local');
            else if (monicaReportes.sourceResportes === 'local') {
                this.DATA = [];

                const filtro = {
                    tipoConsulta: this.FILTROS.tipoConsulta,
                    tipoReporte: this.FILTROS.tipoReporte,
                    skip: skip,

                    clasificacion: this.FILTROS.clasificacion
                }

                if (this.FILTROS.ConBalance)
                    filtro.conBalance = this.FILTROS.ConBalance;

                if (this.FILTROS.tipoConsulta === 'Plan_de_Cuentas')
                    if (this.FILTROS.valor)
                        switch (this.FILTROS.tipoBusqueda) {
                            case "codigo":
                                filtro.code = this.FILTROS.valor;
                                break;
                            case "descripcion":
                                filtro.descripcion = this.FILTROS.valor;
                                break;
                        }

                //  SI this.FILTROS.mostrarDetallesProductosCorte ES FALSO, NO SE BUSCAN LOS DETALLES DE LOS PRODUCTOS,
                //  PARA SOLO TRAER LA SUMATORIA DE CADA CATEGORIA.
                if (!this.FILTROS.mostrarDetallesProductosCorte) {
                    let result = await BuscarInformacionLocal('SendWebsocketServer/24', filtro);

                    for (item of result)
                        this.DATA.push(item);
                }
            }
            //    //  GUARDARLO EN EL NAVEGADOR PARA CUANDO EL CLIENTE LE DE A IMPRIMIR.
            //    //localStorage.setItem('sumatoriasEstadoCuentaCliente', JSON.stringify(result[0]));
        },

        TipoConsultaSelectChanged() {
            this.Limpiar();
        },

        Limpiar() {
            monicaReportes.LimpiarTablas();
            this.FILTROS.valor = '';
            this.FILTROS.clasificacion = 'A';
        },

        AjustesAvanzadosFiltros() {
            $('#CBreporteModalFormato').modal('show');
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

        FilterNivelCuenta: value => {
            switch (value) {
                case "S":
                    return 'CUENTA CONTROL';
                default:
                    return 'DETALLES';
            }
        },

        FilterCentroCostos: value => {
            switch (value) {
                case "S":
                    return 'SI';
                default:
                    return 'NO';
            }
        },

        FilterClasificacion: value => {
            value = value.replace(/ /g, '');

            switch (value) {
                case "A":
                    return 'ACTIVO';
                case "P":
                    return 'PASIVO';
                case "C":
                    return 'CAPITAL';
                case "I":
                    return 'INGRESOS';
                case "G":
                    return 'GASTOS';
                case "S":
                    return 'COSTOS';
                case "Q":
                    return 'DEUDAS';
                case "R":
                    return 'ACREEDORA';
            }
        }
    },
});