const reporte_clienteIndividualStatus = new Vue({
    el: '#clienteIndividualStatus',

    data: {
        ApiReportes: '/API/Reportes/',
        tituloDiasMostrados: 'Días Transcurridos',
        tituloClienteOProveedor: 'Clientes',
        datosBuscados: false,

        GroupDATA: [],
        DATA: [],
        FILTROS: {
            terminoDePago: [],
            categoriasClientes: [],
            categoriasProveedores: [],

            codCliente: '',
            mostrarNCF: false,
            soloDocsVencidos: false,
            incluirFirmas: false,
            incluirMoras: false,
            descripcionSimplificada: true,
            diasVencidos: false,

            fechaMinReporteBuscado: '',
            fechaMaxReporteBuscado: '',
            categoriaClientesBuscada: '',
            totalReporteBuscado: '',
            diasVencidosFiltroBuscado: false,

            analisisGrafico: false,
            chartAnalisisGrafico: '',

            comprobante: 'creditoFiscal',
            tipoDocumento: '',
            numeroSeleccion: 'documento',
            tipoReporte: 'porCobrar',
            tipoConsulta: '',
            desdeHastaRango: 0,
            desde: 0,
            hasta: 0,
            valor: '',
            terminoDePagoSeleccionado: '',
            categoriaClientesAgrupacionSeleccionada: '',
            categoriaProveedorAgrupacionSeleccionada: '',
            campoNCFBuscado: '',

            tipoCorte: '',
            agruparPorMes: false,
            mostrarDetallesProductosCorte: false,

            // MODAL FILTRO AVANZADO
            FormatoConsultas: '',
            columnaNCF: true,
            descripcionSimplificada: false,
            soloDocsVencidos: false,
            diasVencidos: false,
        },

        modalData: {
            clientes: [],
            PaginatorIndex: 0,
            PaginatorLastPage: 0,
            nombreClienteABuscar: ''
        }
    },

    watch: {
        'FILTROS.tipoConsulta'() {
            this.FILTROS.agruparPorMes = false;
            this.FILTROS.mostrarDetallesProductosCorte = false;
            this.FILTROS.analisisGrafico = false;

            if (this.FILTROS.tipoConsulta === 'analisis_Grafico')
                this.FILTROS.tipoCorte = 'porFecha_Emision';
            else
                this.FILTROS.tipoCorte = '';
        },
        'FILTROS.tipoReporte'() {
            switch (this.FILTROS.tipoReporte) {
                case 'porCobrar':
                    this.tituloClienteOProveedor = 'Clientes';
                    break;
                case 'porPagar':
                    this.TipoCorteChanged();

                    this.tituloClienteOProveedor = 'Proveedores';
                    if (this.FILTROS.tipoConsulta === 'RFA09')
                        this.FILTROS.tipoConsulta = '';
                    break;
            }
        },
        'FILTROS.desdeHastaRango'() {
            const rango = getIntervalDate(this.FILTROS.desdeHastaRango);

            this.FILTROS.minFecha_emision = rango.firstday;
            this.FILTROS.maxFecha_emision = rango.lastday;
        },
        'FILTROS.analisisGrafico'() {
            if (this.FILTROS.analisisGrafico) {
                this.FILTROS.mostrarDetallesProductosCorte = true;
                document.getElementById('CPCCPPcheckboxMostrarDetalles').setAttribute('disabled', true);

                if (this.DATA.length > 0) {
                    document.getElementById('tablaEstadoCuentaCliente').setAttribute('hidden', true);
                    document.getElementById('CPCCPPdivGraficosDatosAgrupados').removeAttribute('hidden');
                }
            }
            else {
                document.getElementById('CPCCPPcheckboxMostrarDetalles').removeAttribute('disabled');

                if (this.DATA.length > 0) {
                    document.getElementById('tablaEstadoCuentaCliente').removeAttribute('hidden');
                    document.getElementById('CPCCPPdivGraficosDatosAgrupados').setAttribute('hidden', true);
                }
            }
        },
        'FILTROS.FormatoConsultas'() {
            SetCoockie(`formatoDataCuentasPorCobrarPorPagar=${this.FILTROS.FormatoConsultas};`);
            monicaReportes.LimpiarTablas();
        },
        'FILTROS.columnaNCF'() {
            SetCoockie(`formatoDataCPCCPP_NCF=${this.FILTROS.columnaNCF};`);
        },
        'FILTROS.descripcionSimplificada'() {
            SetCoockie(`formatoDataCPCCPP_descripcionSimplificada=${this.FILTROS.descripcionSimplificada};`);
        },
        'FILTROS.soloDocsVencidos'() {
            SetCoockie(`formatoDataCPCCPP_soloDocsVencidos=${this.FILTROS.soloDocsVencidos};`);
        },
        'FILTROS.diasVencidos'() {
            SetCoockie(`formatoDataCPCCPP_diasVencidos=${this.FILTROS.diasVencidos};`);
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
            document.getElementById('CPCCPPdivGraficosDatosAgrupados').setAttribute('hidden', true);
            monicaReportes.LimpiarTablas();
            this.LlenarDatosCoockies();

            this.tituloDiasMostrados = this.FILTROS.diasVencidos ? 'Días Vencidos' : 'Días Transcurridos';
            this.FILTROS.diasVencidosFiltroBuscado = this.FILTROS.diasVencidos;
            this.FILTROS.toggleData_tablaCorteYReporteGrafico = this.FILTROS.analisisGrafico;
            this.toggleTableColumns_byMostrarDetallesProductosCorte = !this.FILTROS.mostrarDetallesProductosCorte;
            this.FILTROS.fechaMinReporteBuscado = this.FILTROS.minFecha_emision;
            this.FILTROS.fechaMaxReporteBuscado = this.FILTROS.maxFecha_emision;
            this.FILTROS.campoNCFBuscado = this.FILTROS.columnaNCF;

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
                alert('Codigo implementado solo para la busqueda local');
            else if (monicaReportes.sourceResportes === 'local') {
                this.DATA = [];
                this.GroupDATA = [];

                const filtro = {
                    minFecha_emision: this.FILTROS.minFecha_emision,
                    maxFecha_emision: this.FILTROS.maxFecha_emision,
                    code: codigo,
                    tipoReporte: this.FILTROS.tipoReporte,
                    tipoConsulta: this.FILTROS.tipoConsulta,
                }
                debugger
                //  AGREGAR VALORES DEL FRILTRO PERSONALIZADO
                if (this.FILTROS.FormatoConsultas === 'personalizado') {
                    if (!this.FILTROS.descripcionSimplificada)
                        filtro.descripcionSimplificada = this.FILTROS.descripcionSimplificada;
                    if (this.FILTROS.columnaNCF)
                        filtro.colComprobante = this.FILTROS.columnaNCF;
                    if (this.FILTROS.soloDocsVencidos)
                        filtro.SoloDocsVencidos = this.FILTROS.soloDocsVencidos
                }

                //  AGREGAR VALORES PARA DATOS AGRUPADOS
                if (this.FILTROS.tipoConsulta === 'analisis_Grafico') {
                    filtro.GROUP = true;
                    filtro.tipoCorte = this.FILTROS.tipoCorte;

                    switch (this.FILTROS.tipoCorte) {
                        case 'porFecha_Emision':
                        case 'porFecha_Vencimiento':
                            filtro.desde = this.FILTROS.minFecha_emisionAgrupacionSeleccionada;
                            filtro.hasta = this.FILTROS.maxFecha_emisionAgrupacionSeleccionada;

                            if (this.FILTROS.agruparPorMes)
                                filtro.agruparPorMes = this.FILTROS.agruparPorMes;
                            break;
                        case 'porCliente':
                        case 'porVendedor':
                            filtro.valor = this.FILTROS.valor;
                            break;
                        case 'porCategorias_de_Clientes':
                            filtro.valor = this.FILTROS.categoriaClientesAgrupacionSeleccionada;
                            break;
                    }
                }

                //  AGREGAR RANGO
                else if (this.FILTROS.tipoConsulta === 'RFA01'
                    || this.FILTROS.tipoConsulta === 'RFA02'
                    || this.FILTROS.tipoConsulta === 'RFA04'
                    || this.FILTROS.tipoConsulta === 'RFA06'
                    || this.FILTROS.tipoConsulta === 'RFA08') {
                    filtro.desde = this.FILTROS.desde;
                    filtro.hasta = this.FILTROS.hasta;
                }
                else if (this.FILTROS.tipoConsulta === 'RFA09')
                    filtro.comprobante = this.FILTROS.comprobante;

                //  AGREGAR VALORES
                if (this.FILTROS.tipoConsulta === 'RFA01')
                    filtro.opcion = this.FILTROS.numeroSeleccion;
                else if (this.FILTROS.tipoConsulta === 'RFA03')
                    filtro.valor = this.FILTROS.terminoDePagoSeleccionado

                //  SI this.FILTROS.mostrarDetallesProductosCorte ES FALSO, NO SE BUSCAN LOS DETALLES DE LOS PRODUCTOS, PARA SOLO TRAER LA SUMATORIA DE CADA CATEGORIA.
                if (!this.FILTROS.mostrarDetallesProductosCorte) {
                    let result = await BuscarInformacionLocal('SendWebsocketServer/1', filtro);

                    for (item of result)
                        this.DATA.push(item);

                    for (item of this.DATA)
                        if (!this.FILTROS.diasVencidosFiltroBuscado)
                            item.diasTrancurridos = DaysDiff(item.fecha_emision, new Date().toISOString().slice(0, 10));
                        else
                            item.diasTrancurridos = DaysDiff(item.fecha_vcmto, new Date().toISOString().slice(0, 10));

                    //  SI ES UNA DATA AGRUPADA, SE ASIGNA EL CAMPO POR EL QUE SE VA A AGRUPAR.
                    if (filtro.GROUP) {
                        if (this.FILTROS.tipoCorte === 'porFecha_Emision')
                            campo = 'fecha_emision';
                        else if (this.FILTROS.tipoCorte === 'porFecha_Vencimiento')
                            campo = 'fecha_vcmto';
                        else if (this.FILTROS.tipoCorte === 'porCliente')
                            campo = 'nombre';
                        else if (this.FILTROS.tipoCorte === 'porVendedor')
                            campo = 'Nombre_vendedor';
                        else if (this.FILTROS.tipoCorte === 'porCategorias_de_Clientes')
                            campo = 'CCPDescripcion';
                        else if (this.FILTROS.tipoCorte === 'value="porAntigüedad_de_saldos"')
                            campo = '------------------';

                        for (let item of [... new Set(this.DATA.map(data => data[campo]))]) {
                            this.GroupDATA.push(
                                this.DATA.filter(el => el[campo] === item)
                            );
                        }
                    }
                }

                let camposArray = [9, 10, 11];

                let columnasExtras = 0;
                if (this.FILTROS.FormatoConsultas === 'personalizado') {
                    if (this.FILTROS.columnaNCF)
                        columnasExtras++;
                }

                for (let i = 0; i < camposArray.length; i++)
                    camposArray[i] = camposArray[i] + columnasExtras;

                //  TOTALIZACIONES.
                if (!this.FILTROS.mostrarDetallesProductosCorte)
                    if (this.DATA.length === 0 && this.GroupDATA.length === 0)
                        return;

                filtro.SUM = true;
                result = await BuscarInformacionLocal('SendWebsocketServer/1', filtro);

                if (!filtro.GROUP) {
                    this.DATA.push(
                        { '': '', '': '', '': '', '': '', 'monto': result[0].sumatoriaMontos, 'pagosAcumulados': result[0].sumatoriaPagosAcumulados, 'balance': result[0].sumatoriaBalance });

                    let interval = setInterval(() => {
                        let tabla = document.getElementById('tablaEstadoCuentaCliente');

                        if (tabla) {
                            TablaEstiloTotalizacionFila(tabla, camposArray)

                            clearInterval(interval);
                        }
                    }, 0);
                }
                else {
                    //SI LA DATA ESTA AGRUPADA:
                    let totalMonto = 0;
                    let totalPagosAcumulados = 0;
                    let totalBalence = 0;

                    let tableTotalPositionsRows = [];

                    //  CON DETALLES DE PRODUCTOS
                    if (!this.FILTROS.mostrarDetallesProductosCorte) {
                        document.getElementById('CPCCPPdivGraficosDatosAgrupados').setAttribute('hidden', true);

                        let contadorDeLineas = 0;
                        for (let index = 0; index < result.length; index++) {
                            contadorDeLineas += this.GroupDATA[index].length + 1;
                            //  OBTENER LA POSICION DEL TOTAL DE CADA GRUPO PARA DARLE ESTILOS.
                            tableTotalPositionsRows.push(contadorDeLineas);

                            //  AGREGAR LOS SUB ELEMENTOS DE MANERA INTELIGENTE A LOS ELEMENTOS QUE COINCIDAN.
                            for (let i = 0; i < this.GroupDATA.length; i++) {
                                const valorAgrupadoPor = this.PonerDescripcionDatosAgrupados(this.FILTROS.tipoCorte, index);

                                if (this.GroupDATA[i][0][campo] === result[index][campo]) {
                                    this.GroupDATA[i].push({
                                        'descripcion_dcmto': `${valorAgrupadoPor} => `,
                                        'monto': result[index].sumatoriaMontos,
                                        'pagosAcumulados': result[index].sumatoriaPagosAcumulados,
                                        'balance': result[index].sumatoriaBalance
                                    });
                                }
                            }

                            totalMonto += result[index].sumatoriaMontos;
                            totalPagosAcumulados += result[index].sumatoriaPagosAcumulados;
                            totalBalence += result[index].sumatoriaBalance;
                        }
                        this.GroupDATA.push({ 'monto': `${totalMonto}`, 'pagosAcumulados': `${totalPagosAcumulados}`, 'balance': `${totalBalence}` });
                        this.DATA = this.GroupDATA.flat();

                        let columnasExtras = 0;
                        if (this.FILTROS.FormatoConsultas === 'personalizado') {
                            if (this.FILTROS.columnaNCF)
                                columnasExtras++;
                        }

                        for (let i = 0; i < camposArray.length; i++)
                            camposArray[i] = camposArray[i] + columnasExtras;

                        setTimeout(() => {
                            TablaEstiloTotalizacionFilaAgrupadas('tablaEstadoCuentaCliente', [5, 10, 11, 12], tableTotalPositionsRows);
                            TablaEstiloTotalizacionFila(document.getElementById('tablaEstadoCuentaCliente'), camposArray);
                        }, 1);
                    }
                    //  SIN DETALLES DE PRODUCTOS
                    else {
                        let reporteGraficoLabels = [];
                        let reporteGraficoTotales = [];
                        datosBuscados = false;

                        for (let index = 0; index < result.length; index++) {
                            const valorAgrupadoPor = this.PonerDescripcionDatosAgrupados(this.FILTROS.tipoCorte, index);

                            this.DATA.push({
                                'categorizacionSinDetalles': valorAgrupadoPor,
                                'monto': result[index].sumatoriaMontos,
                                'pagosAcumulados': result[index].sumatoriaPagosAcumulados,
                                'balance': result[index].sumatoriaBalance
                            });
                            totalMonto += result[index].sumatoriaMontos;
                            totalPagosAcumulados += result[index].sumatoriaPagosAcumulados;
                            totalBalence += result[index].sumatoriaBalance;

                            reporteGraficoLabels.push(valorAgrupadoPor.toString().trim().toUpperCase());
                            reporteGraficoTotales.push(result[index].sumatoriaBalance);
                        }

                        this.FILTROS.totalReporteBuscado = totalMonto;
                        this.DATA.push({ 'monto': `${totalMonto}`, 'pagosAcumulados': `${totalPagosAcumulados}`, 'balance': `${totalBalence}` });
                        setTimeout(() => {
                            TablaEstiloTotalizacionFilaAgrupadas('tablaEstadoCuentaCliente', [0, 1, 2, 3])
                            TablaEstiloTotalizacionFila(document.getElementById('tablaEstadoCuentaCliente'), [1, 2, 3]);
                        }, 1);

                        //  REPORTE GRAFICO.
                        //  SI EL GRAFICO NO ESTA VISIBLE CUANDO SE CARGA LA DATA LA PRIMERA VEZ, NO SE PODRA ALTERNAR ENTRE MOSTRARSE
                        //  U OCULTARSE EL GRAFICO PORQUE EL GRAFICO NO SE LLENA. ASI QUE LO QUE HAGO ES MOSTRARLO ANTES DE CARGAR LA DATA Y 
                        //  LUEGO SI SE TIENE QUE OCULTAR, SE OCULTA Y SE EVITA ESE PROBLEMA.
                        document.getElementById('CPCCPPdivGraficosDatosAgrupados').removeAttribute('hidden');

                        let reporteGraficoBacground = new Array(reporteGraficoLabels.length);
                        reporteGraficoBacground.fill('#17a2b8');

                        if (this.FILTROS.chartAnalisisGrafico)
                            this.FILTROS.chartAnalisisGrafico.destroy();

                        let ctx = document.getElementById('CPCCPPreportesGraficos').getContext('2d');

                        this.FILTROS.chartAnalisisGrafico = new Chart(ctx, {
                            type: 'horizontalBar',
                            data: {
                                labels: reporteGraficoLabels,
                                datasets: [{
                                    label: `Análisis de Cuentas por ${(this.FILTROS.tipoCorte).replace('_', ' ').replace('por', '')}`,
                                    backgroundColor: reporteGraficoBacground,
                                    data: reporteGraficoTotales
                                }]
                            },
                        });

                        //  OCULTAR EL DIV CORRESPONDIENTE. SI SE QUIERE VER LA DATA COMO TABLA SE OCULTA EL DIV DE GRAFICOS Y VICEVERSA.
                        if (this.FILTROS.toggleData_tablaCorteYReporteGrafico)
                            setTimeout(() => document.getElementById('tablaEstadoCuentaCliente').setAttribute('hidden', true), 2);
                        else
                            setTimeout(() => document.getElementById('CPCCPPdivGraficosDatosAgrupados').setAttribute('hidden', true), 2);
                    }
                }

                //  GUARDARLO EN EL NAVEGADOR PARA CUANDO EL CLIENTE LE DE A IMPRIMIR.
                localStorage.setItem('sumatoriasEstadoCuentaCliente', JSON.stringify(result[0]));
            }
        },

        PonerDescripcionDatosAgrupados(tipoCorte, index) {
            const filters = this.$options.filters;

            switch (tipoCorte) {
                case 'porFecha_Emision':
                    if (this.FILTROS.agruparPorMes) {
                        const dateSplited = result[index].fecha_emision.split('/');
                        return `${ConvertirMesADescripcion(dateSplited[0])}/${dateSplited[1]}`;
                    } else
                        return filters.FilterDateFormat(result[index].fecha_emision);
                case 'porFecha_Vencimiento':
                    if (this.FILTROS.agruparPorMes) {
                        const dateSplited = result[index].fecha_vcmto.split('/');
                        return `${ConvertirMesADescripcion(dateSplited[0])}/${dateSplited[1]}`;
                    } else
                        return filters.FilterDateFormat(result[index].fecha_vcmto);
                case 'porCliente':
                    return result[index].nombre;
                case 'porVendedor':
                    return result[index].Nombre_vendedor;
                case 'porCategorias_de_Clientes':
                    return result[index].CCPDescripcion;
                case 'porAntigüedad_de_saldos':
                    return '-------------------'
            }
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
            this.FILTROS.categoriaClientesSeleccionada = '';
            this.FILTROS.desde = '';
            this.FILTROS.hasta = '';
            this.FILTROS.valor = '';
            this.FILTROS.terminoDePagoSeleccionado = '';
            //  CAMBIAR LA ALTURA DE EL ICONO DEL BOTON DE BUSCAR PARA QUE SE VEA MAS AJUSTADO CUANDO SOLO ESTé éL EN EL DIV INFERIOR.
            document.getElementById('CPCCPPIconBottonBuscar').style = 'margin-top: 0';

            //  BUSCAR INFORMACION SI ES NECESARIA O HACER CAMBIOS SEGUN EL TIPO DE CONSULTA.
            switch (this.FILTROS.tipoConsulta) {
                case 'RFA03':
                    monicaReportes.BuscarData('terminoDePago');
                    break;
            }
        },

        async TipoCorteChanged() {
            const divAgrupacion = document.getElementById('CPCCPPagrupacionDiv');

            document.getElementById('CPCCPPIconBottonBuscar').style = 'margin-top: 3%';

            if (!('col-lg-5' in divAgrupacion.classList))
                divAgrupacion.classList.add('col-lg-5');

            switch (this.FILTROS.tipoCorte) {
                case 'porTermino_de_Pago':
                    monicaReportes.BuscarData('terminoDePago');
                    break;
                case 'porFecha_Emision':
                case 'porFecha_Vencimiento':
                    divAgrupacion.classList.remove('col-lg-5');
                    document.getElementById('CPCCPPIconBottonBuscar').style = 'margin-top: 0';

                    this.FILTROS.minFecha_emisionAgrupacionSeleccionada = new Date().toISOString().slice(0, 10);
                    this.FILTROS.maxFecha_emisionAgrupacionSeleccionada = new Date().toISOString().slice(0, 10);
                    break;
                case 'porCategorias_de_Clientes':
                    debugger
                    if (this.FILTROS.tipoReporte === 'porCobrar')
                        await monicaReportes.BuscarData('categoriasClientes');
                    else if (this.FILTROS.tipoReporte === 'porPagar')
                        await monicaReportes.BuscarData('categoriasProveedores');
                    break;
            }
        },

        //----------------------------------------------------------
        //  UTILS
        //----------------------------------------------------------
        Print(type, jsonParameters, SetlocalStorageItemsToPrint) {
            monicaReportes.Print(type, jsonParameters, SetlocalStorageItemsToPrint)
        },

        AjustesAvanzadosFiltros() {
            $('#CPCCPPreporteModalFormato').modal('show');
            $('#CPCCPPmodificarFiltrosId').collapse('hide');
            this.LlenarDatosCoockies();
        },

        LlenarDatosCoockies() {
            const formatoData = GetCookieElement('formatoDataCuentasPorCobrarPorPagar=');

            this.FILTROS.FormatoConsultas = formatoData ? formatoData : 'simple';
            this.FILTROS.columnaNCF = GetCookieElement('formatoDataCPCCPP_NCF=') === 'false' ? false : true;
            this.FILTROS.descripcionSimplificada = GetCookieElement('formatoDataCPCCPP_descripcionSimplificada=') === 'false' ? false : true;
            this.FILTROS.soloDocsVencidos = GetCookieElement('formatoDataCPCCPP_soloDocsVencidos=') === 'false' ? false : true;
            this.FILTROS.diasVencidos = GetCookieElement('formatoDataCPCCPP_diasVencidos=') === 'false' ? false : true;
        }
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