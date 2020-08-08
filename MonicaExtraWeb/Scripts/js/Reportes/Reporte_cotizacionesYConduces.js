const reporte_cotizacionesYConduces = new Vue({
    el: '#cotizacionesYConduces',

    data: {
        TablaVisible: '',
        DATA: [],
        GroupDATA: [],
        FILTROS: {
            vendedores: [],
            categoriasClientes: [],
            terminoDePago: [],
            nombresBodega: [],
            categoriasProductos: [],
            minFecha_emision: '',
            maxFecha_emision: '',

            tipoReporte: 'cotizaciones',
            tipoCorte: '',
            Codigo_vendedor: '',
            estatus: 'abierto',
            estatusSeleccionado: 'abierto',
            vendedorSeleccionado: '',
            categoriaClientesSeleccionada: '',
            tipoConsulta: 'RFA01',
            desdeHastaRango: 0,
            desde: '',
            hasta: '',
            valor: '',
            terminoDePagoSeleccionado: '',
            nombresBodegaSeleccionada: '',
            categoriasProductosSeleccionada: '',
            comprobante: 'creditoFiscal',

            agruparPorMes: false,
            mostrarDetallesProductosCorte: false,
            toggleTableColumns_byMostrarDetallesProductosCorte: true,

            analisisGrafico: false,
            chartAnalisisGrafico: '',
            toggleData_tablaCorteYReporteGrafico: false,
            reporteAgrupadoTerminoDeCargar: false,

            fechaMinReporteBuscado: '',
            fechaMaxReporteBuscado: '',
            categoriaClientesBuscada: '',
            totalReporteBuscado: '',

            monedaAgrupacionSeleccionada: '',
            terminoPagoAgrupacionSeleccionada: '',
            categoriaClientesAgrupacionSeleccionada: '',
            minFecha_emisionAgrupacionSeleccionada: '',
            maxFecha_emisionAgrupacionSeleccionada: '',

            PaginatorIndex: 0,
            PaginatorLastPage: 0,

            FormatoConsultas: '',
            columnaVendedor: false,
            columnaComprobante: false,
            columnaTermino: false,
            columnaMoneda: false,
            ConsultaTrajoColumnaVendedor: false,
            ConsultaTrajoColumnaComprobante: false,
            ConsultaTrajoColumnaTermino: false,
            ConsultaTrajoColumnaMoneda: false,
        }
    },

    watch: {
        'FILTROS.tipoCorte'() {
            if (this.FILTROS.tipoCorte !== 'porFecha_Emision'
                && this.FILTROS.tipoCorte !== 'porFecha_Vencimiento')
                this.FILTROS.agruparPorMes = false;
        },
        'FILTROS.desde'() {
            this.FILTROS.desde = this.FILTROS.desde.replace(/^0/g, '');
        },
        'FILTROS.hasta'() {
            this.FILTROS.hasta = this.FILTROS.hasta.replace(/^0/g, '');
        },
        'FILTROS.tipoConsulta'() {
            this.TablaVisible = [];
            this.FILTROS.agruparPorMes = false;
            this.FILTROS.mostrarDetallesProductosCorte = false;
            this.FILTROS.analisisGrafico = false;
            this.FILTROS.tipoCorte = 'porCategoria';
        },
        'FILTROS.desdeHastaRango'() {
            const rango = getIntervalDate(this.FILTROS.desdeHastaRango);

            this.FILTROS.minFecha_emision = rango.firstday;
            this.FILTROS.maxFecha_emision = rango.lastday;
        },
        'FILTROS.analisisGrafico'() {
            if (this.FILTROS.analisisGrafico) {
                this.FILTROS.mostrarDetallesProductosCorte = true;
                document.getElementById('checkboxMostrarDetalles').setAttribute('disabled', true);

                if (this.DATA.length > 0) {
                    document.getElementById('tablaDatosAgrupados').setAttribute('hidden', true);
                    document.getElementById('divGraficosDatosAgrupados').removeAttribute('hidden');
                }
            }
            else {
                document.getElementById('checkboxMostrarDetalles').removeAttribute('disabled');

                if (this.DATA.length > 0) {
                    document.getElementById('tablaDatosAgrupados').removeAttribute('hidden');
                    document.getElementById('divGraficosDatosAgrupados').setAttribute('hidden', true);
                }
            }
        },
        'FILTROS.tipoReporte'() {
            switch (this.FILTROS.tipoReporte) {
                case 'cotizaciones':
                    this.FILTROS.valorComprobanteAutocompletado = 'A01';
                    break;
                case 'conduces':
                    this.FILTROS.valorComprobanteAutocompletado = 'A04';
                    this.FILTROS.comprobante = 'consumo';
                    break;
            }
        }
    },

    methods: {
        Pagination(value) {
            switch (value) {
                case -1:
                    this.FILTROS.PaginatorIndex--;
                    break;
                    break;
                case +1:
                    this.FILTROS.PaginatorIndex++;
                    break;
                case 'MAX':
                    this.FILTROS.PaginatorIndex = this.FILTROS.PaginatorLastPage;
                    break
                case 0:
                default:
                    this.FILTROS.PaginatorIndex = 0;
                    break;
            }
            this.Buscar()
        },

        async Buscar() {
            monicaReportes.LimpiarTablas();

            this.FILTROS.estatusSeleccionado = this.FILTROS.estatus;
            this.FILTROS.toggleData_tablaCorteYReporteGrafico = this.FILTROS.analisisGrafico;
            this.toggleTableColumns_byMostrarDetallesProductosCorte = !this.FILTROS.mostrarDetallesProductosCorte;
            this.FILTROS.ConsultaTrajoColumnaVendedor = this.FILTROS.columnaVendedor;
            this.FILTROS.ConsultaTrajoColumnaComprobante = this.FILTROS.columnaComprobante;
            this.FILTROS.ConsultaTrajoColumnaTermino = this.FILTROS.columnaTermino;
            this.FILTROS.ConsultaTrajoColumnaMoneda = this.FILTROS.columnaMoneda;
            this.FILTROS.fechaMinReporteBuscado = this.FILTROS.minFecha_emision;
            this.FILTROS.fechaMaxReporteBuscado = this.FILTROS.maxFecha_emision;
            if (this.FILTROS.categoriaClientesSeleccionada)
                this.FILTROS.categoriaClientesBuscada =
                    this.FILTROS.categoriasClientes.find(
                        item => item.categoria_clte_id === this.FILTROS.categoriaClientesSeleccionada)
                        .descripcion_categ;
            else
                this.FILTROS.categoriaClientesBuscada = '-TODO-';

            if (monicaReportes.sourceResportes === 'web')
                alert('Por el momento esta busqueda solo se ha planteado para la parte Local');
            else if (monicaReportes.sourceResportes === 'local') {
                this.DATA = [];
                this.GroupDATA = [];
                let campo;
                
                const filtro = {
                    minFecha_emision: this.FILTROS.minFecha_emision,
                    maxFecha_emision: this.FILTROS.maxFecha_emision,
                    Codigo_vendedor: this.FILTROS.vendedorSeleccionado.trim(),
                    categoria_clte_id: this.FILTROS.categoriaClientesSeleccionada,
                    tipoConsulta: this.FILTROS.tipoConsulta,
                    tipoReporte: this.FILTROS.tipoReporte,
                    skip: this.FILTROS.PaginatorIndex
                }

                if (this.FILTROS.tipoReporte === 'cotizaciones')
                    filtro.estatus = this.FILTROS.estatus

                //  AGREGAR RANGO
                if ((this.FILTROS.tipoConsulta === 'RFA01'
                    || this.FILTROS.tipoConsulta === 'RFA02'
                    || this.FILTROS.tipoConsulta === 'RFA03'
                    || this.FILTROS.tipoConsulta === 'RFA04'
                    || this.FILTROS.tipoConsulta === 'RFA0')
                    && (this.FILTROS.tipoCorte !== 'porFecha_Emision'
                        && this.FILTROS.tipoCorte !== 'porFecha_Vencimiento')) {
                    filtro.desde = this.FILTROS.desde;
                    filtro.hasta = this.FILTROS.hasta;
                }
                //  AGREGAR VALORES
                if (this.FILTROS.tipoConsulta === 'RFA03')
                    filtro.valor = this.FILTROS.terminoDePagoSeleccionado;
                else if (this.FILTROS.tipoConsulta === 'RFA0')
                    filtro.valor = this.FILTROS.nombresBodegaSeleccionada;
                else if (this.FILTROS.tipoConsulta === 'RFA08') {
                    filtro.GROUP = true;
                    filtro.tipoCorte = this.FILTROS.tipoCorte;
                    if (this.FILTROS.tipoCorte === 'porCategoria')
                        filtro.valor = this.FILTROS.categoriasProductosSeleccionada;
                    else if (this.FILTROS.tipoCorte === 'porMoneda')
                        filtro.valor = this.FILTROS.monedaAgrupacionSeleccionada;
                    else if (this.FILTROS.tipoCorte === 'porTermino_de_Pago')
                        filtro.valor = this.FILTROS.terminoPagoAgrupacionSeleccionada;
                    else if (this.FILTROS.tipoCorte === 'porCategorias_de_Clientes')
                        filtro.valor = this.FILTROS.categoriaClientesAgrupacionSeleccionada;
                    else if (this.FILTROS.tipoCorte === 'porFecha_Emision'
                        || this.FILTROS.tipoCorte === 'porFecha_Vencimiento') {
                        filtro.desde = this.FILTROS.minFecha_emisionAgrupacionSeleccionada;
                        filtro.hasta = this.FILTROS.maxFecha_emisionAgrupacionSeleccionada;
                    }
                    else if (this.FILTROS.tipoCorte === 'porCliente'
                        || this.FILTROS.tipoCorte === 'porVendedor'
                        || this.FILTROS.tipoCorte === 'porComprobante')
                        filtro.valor = this.FILTROS.valor;
                }
                else if (this.FILTROS.tipoConsulta === 'RFA04'
                    || this.FILTROS.tipoConsulta === 'RFA05'
                    || this.FILTROS.tipoConsulta === 'RFA06')
                    filtro.valor = this.FILTROS.valor;
                else if (this.FILTROS.tipoConsulta === 'RFA09')
                    filtro.comprobante = this.FILTROS.comprobante;

                if (this.FILTROS.tipoCorte === 'porFecha_Emision'
                    || this.FILTROS.tipoCorte === 'porFecha_Vencimiento')
                    if (this.FILTROS.agruparPorMes)
                        filtro.agruparPorMes = this.FILTROS.agruparPorMes;

                //  SI this.FILTROS.mostrarDetallesProductosCorte ES FALSO, NO SE BUSCAN LOS DETALLES DE LOS PRODUCTOS, PARA SOLO TRAER LA SUMATORIA DE CADA CATEGORIA.
                if (!this.FILTROS.mostrarDetallesProductosCorte) {
                    let result = await BuscarInformacionLocal('SendWebsocketServer/2', filtro);

                    for (item of result)
                        this.DATA.push(item);

                    //  SI ES UNA DATA AGRUPADA, SE ASIGNA EL CAMPO POR EL QUE SE VA A AGRUPAR.
                    if (filtro.GROUP) {
                        if (this.FILTROS.tipoCorte === 'porCategoria')
                            campo = 'categoria_id';
                        else if (this.FILTROS.tipoCorte === 'porCliente')
                            campo = 'clte_direccion1';
                        else if (this.FILTROS.tipoCorte === 'porVendedor')
                            campo = 'vendedor_id';
                        else if (this.FILTROS.tipoCorte === 'porMoneda')
                            campo = 'moneda';
                        else if (this.FILTROS.tipoCorte === 'porComprobante')
                            campo = 'tipo_documento';
                        else if (this.FILTROS.tipoCorte === 'porFecha_Emision')
                            campo = 'fecha_emision';
                        else if (this.FILTROS.tipoCorte === 'porFecha_Vencimiento')
                            campo = 'fecha_vcmto';
                        else if (this.FILTROS.tipoCorte === 'porTermino_de_Pago')
                            campo = 'termino_id';
                        else if (this.FILTROS.tipoCorte === 'porCategorias_de_Clientes')
                            campo = 'Categoria_Clte_id';

                        for (let item of [... new Set(this.DATA.map(data => data[campo]))]) {
                            this.GroupDATA.push(
                                this.DATA.filter(el => el[campo] === item)
                            );
                        }
                    }
                }

                //
                let tableName = '';
                let camposArray = [];

                if (this.FILTROS.tipoConsulta === 'RFA08') {
                    tableName = 'tablaGROUP';
                    camposArray = [4, 5, 6, 7, 8, 9];
                }
                else {
                    let colsAgregadas = 0;

                    if (this.FILTROS.estatusSeleccionado !== 'abierto')
                        colsAgregadas++;

                    tableName = 'tablaRangoNroFactura';
                    camposArray = [9 + colsAgregadas, 10 + colsAgregadas, 11 + colsAgregadas, 12 + colsAgregadas];
                }

                //  SI NO TRAE DATA TERMINA EL PROCESO
                if (!this.FILTROS.mostrarDetallesProductosCorte)
                    if (this.DATA.length === 0 && this.GroupDATA.length === 0)
                        return;
                // TOTALIZACIONES.
                this.TablaVisible = tableName;

                filtro.SUM = true;

                result = await BuscarInformacionLocal('SendWebsocketServer/2', filtro);

                //
                if (!filtro.GROUP) {
                    this.FILTROS.PaginatorLastPage = Math.floor(result[0].count / 20);

                    let jsonTotalizacion = {};
                    if (this.FILTROS.tipoConsulta === '')
                        jsonTotalizacion = { 'SubTotalNeto': result[0].sumatoriaMontos, 'impto': result[0].sumatoriaPagosAcumulados, 'total': result[0].sumatoriaBalance };
                    else
                        jsonTotalizacion = { 'ITBIS': result[0].impuesto, 'SubTotalNeto': result[0].subtotal, 'dscto_monto': result[0].dscto_monto, 'total': result[0].total };

                    this.DATA.push(jsonTotalizacion);

                    let interval = setInterval(() => {
                        let tabla = document.getElementById(tableName);

                        if (tabla) {
                            TablaEstiloTotalizacionFila(tabla, camposArray)

                            clearInterval(interval);
                        }
                    }, 0);
                }
                else {
                    //SI LA DATA ESTA AGRUPADA:
                    let totalPrecio = 0;
                    let totalCantidad = 0;
                    let totalTotal = 0;
                    let totalValor = 0;
                    let totalImpuesto = 0;

                    let tableTotalPositionsRows = [];

                    //  CON DETALLES DE PRODUCTOS
                    if (!this.FILTROS.mostrarDetallesProductosCorte) {
                        document.getElementById('divGraficosDatosAgrupados').setAttribute('hidden', true);

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
                                        'descrip_producto': `${valorAgrupadoPor} => `,
                                        'cantidad': result[index].cantidad,
                                        'precio_estimado': result[index].precio_estimado,
                                        'TPRECIO': result[index].TPRECIO,
                                        'precio_factura': result[index].precio_factura,
                                        'ITBIS': result[index].impto_monto,
                                        'total': result[index].total
                                    });
                                }
                            }
                            totalPrecio += result[index].precio_estimado;
                            totalCantidad += result[index].cantidad;
                            totalValor += result[index].TPRECIO;
                            totalImpuesto += result[index].impto_monto;
                            totalTotal += result[index].total;
                        }
                        this.GroupDATA.push({ 'cantidad': `${totalCantidad}`, 'precio_estimado': `${totalPrecio}`, 'TPRECIO': `${totalValor}`, 'ITBIS': `${totalImpuesto}`, 'total': `${totalTotal}` });
                        this.DATA = this.GroupDATA.flat();

                        setTimeout(() => {
                            TablaEstiloTotalizacionFilaAgrupadas('tablaRangoNroFactura', camposArray, tableTotalPositionsRows);
                            TablaEstiloTotalizacionFila(document.getElementById('tablaRangoNroFactura'), [5, 6, 7, 8, 9]);
                        }, 1);
                    }
                    //  SIN DETALLES DE PRODUCTOS
                    else {
                        let reporteGraficoLabels = [];
                        let reporteGraficoTotales = [];

                        for (let index = 0; index < result.length; index++) {
                            const valorAgrupadoPor = this.PonerDescripcionDatosAgrupados(this.FILTROS.tipoCorte, index);

                            this.GroupDATA.push([]);
                            this.GroupDATA[index].push({
                                'categorizacionSinDetalles': valorAgrupadoPor,
                                'nombre_clte': result[index].nombre_clte,
                                'cantidad': result[index].cantidad,
                                'TPRECIO': result[index].TPRECIO,
                                'precio_factura': result[index].precio_factura,
                                'ITBIS': result[index].impto_monto,
                                'total': result[index].total
                            });
                            totalCantidad += result[index].cantidad;
                            totalValor += result[index].TPRECIO;
                            totalImpuesto += result[index].impto_monto;
                            totalTotal += result[index].total;

                            reporteGraficoLabels.push(valorAgrupadoPor.toString().trim().toUpperCase());
                            reporteGraficoTotales.push(result[index].total)
                        }

                        this.FILTROS.totalReporteBuscado = totalTotal;
                        this.GroupDATA.push({ 'cantidad': `${totalCantidad}`, 'TPRECIO': `${totalValor}`, 'ITBIS': `${totalImpuesto}`, 'total': `${totalTotal}` });
                        this.DATA = this.GroupDATA.flat();
                        setTimeout(() => {
                            TablaEstiloTotalizacionFilaAgrupadas('tablaRangoNroFactura', [0, 1, 2, 3, 4])
                            TablaEstiloTotalizacionFila(document.getElementById('tablaRangoNroFactura'), [1, 2, 3, 4]);
                        }, 1);

                        //  REPORTE GRAFICO.
                        let reporteGraficoBacground = new Array(reporteGraficoLabels.length);
                        reporteGraficoBacground.fill('#73bfb8');

                        if (this.FILTROS.chartAnalisisGrafico)
                            this.FILTROS.chartAnalisisGrafico.destroy();

                        let ctx = document.getElementById('CCreportesGraficos').getContext('2d');

                        this.FILTROS.chartAnalisisGrafico = new Chart(ctx, {
                            type: 'horizontalBar',
                            data: {
                                labels: reporteGraficoLabels,
                                datasets: [{
                                    label: `Análisis de ${this.FILTROS.tipoReporte[0].toUpperCase() + this.FILTROS.tipoReporte.substr(1)} por ${(this.FILTROS.tipoCorte).replace('por', '')}`,
                                    backgroundColor: reporteGraficoBacground,
                                    data: reporteGraficoTotales
                                }]
                            },
                        });

                        //  OCULTAR EL DIV CORRESPONDIENTE. SI SE QUIERE VER LA DATA COMO TABLA SE OCULTA EL DIV DE GRAFICOS Y VICEVERSA.
                        if (this.FILTROS.toggleData_tablaCorteYReporteGrafico)
                            setTimeout(() => document.getElementById('tablaDatosAgrupados').setAttribute('hidden', true), 2);
                        else
                            setTimeout(() => document.getElementById('divGraficosDatosAgrupados').setAttribute('hidden', true), 2);
                    }
                }
                //  GUARDARLO EN EL NAVEGADOR PARA CUANDO EL CLIENTE LE DE A IMPRIMIR.
                //localStorage.setItem('sumatoriasEstadoCuentaCliente', JSON.stringify(result[0]));
            }
        },

        PonerDescripcionDatosAgrupados(tipoCorte, index) {
            const filters = this.$options.filters;

            switch (tipoCorte) {
                case 'porCategoria':
                    return result[index].Descripcion_categ;
                case 'porCliente':
                    return result[index].clte_direccion1;
                case 'porVendedor':
                    return result[index].Nombre_vendedor;
                case 'porMoneda':
                    return filters.FilterMoneda(result[index].moneda);
                case 'porComprobante':
                    return result[index].tipo_documento;
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
                case 'porTermino_de_Pago':
                    return result[index].descripcion_termino;
                    break;
                case 'porCategorias_de_Clientes':
                    return result[index].descripcion_categ;
            }
        },

        async TipoConsultaSelectChanged() {
            //  LIMPIAR TODOS LOS CAMPOS.
            this.FILTROS.Codigo_vendedor = '';
            this.FILTROS.vendedorSeleccionado = '';
            this.FILTROS.categoriaClientesSeleccionada = '';
            this.FILTROS.desde = '';
            this.FILTROS.hasta = '';
            this.FILTROS.valor = '';
            this.FILTROS.terminoDePagoSeleccionado = '';
            this.FILTROS.nombresBodegaSeleccionada = '';
            this.FILTROS.categoriasProductosSeleccionada = '';

            const inputValor = document.getElementById('VDPorComprobanteReporte');
            if (inputValor && 'input-group' in inputValor.classList)
                inputValor.classList.remmove('input-group');

            //  BUSCAR INFORMACION SI ES NECESARIA O HACER CAMBIOS SEGUN EL TIPO DE CONSULTA.
            if (this.FILTROS.tipoConsulta === 'RFA03')
                monicaReportes.BuscarData('terminoDePago');
            if (this.FILTROS.tipoConsulta === 'RFA0')
                monicaReportes.BuscarData('nombresBodega');
            if (this.FILTROS.tipoConsulta === 'RFA08')
                monicaReportes.BuscarData('categoriasProductos');
            if (this.FILTROS.tipoConsulta === 'RFA09') {
                if (inputValor)
                    inputValor.classList.add('input-group');
            }
        },

        async TipoCorteChanged() {
            if (!('col-lg-5' in document.getElementById('agrupacionDiv').classList))
                document.getElementById('agrupacionDiv').classList.add('col-lg-5');

            switch (this.FILTROS.tipoCorte) {
                case 'porTermino_de_Pago':
                    monicaReportes.BuscarData('terminoDePago');
                    break;
                case 'porFecha_Emision':
                case 'porFecha_Vencimiento':
                    document.getElementById('agrupacionDiv').classList.remove('col-lg-5');

                    this.FILTROS.minFecha_emisionAgrupacionSeleccionada = new Date().toISOString().slice(0, 10);
                    this.FILTROS.maxFecha_emisionAgrupacionSeleccionada = new Date().toISOString().slice(0, 10);
                    break;
            }
        },

        //----------------------------------------------------------
        //  UTILS
        //----------------------------------------------------------
        Print(type, jsonParameters, SetlocalStorageItemsToPrint) {
            monicaReportes.Print(type, jsonParameters, SetlocalStorageItemsToPrint)
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