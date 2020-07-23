const reporte_ventasYDevoluciones = new Vue({
    el: '#ventasYDevoluciones',

    data: {
        ApiReportes: '/API/Reportes/',

        VentasYDevolucionesCategoriaYVendedorTablaVisible: '',
        VentasYDevolucionesCategoriaYVendedorDATA: [],
        VentasYDevolucionesCategoriaYVendedorGroupDATA: [],
        VentasYDevolucionesCategoriaYVendedorFILTROS: {
            tipoReporte: 'ventas',
            tipoCorte: '',
            minFecha_emision: '',
            maxFecha_emision: '',
            Codigo_vendedor: '',
            tipo_factura: '1',
            vendedores: [],
            vendedorSeleccionado: '',
            categoriasClientes: [],
            categoriaClientesSeleccionada: '',
            tipoConsulta: 'RFA01',
            desdeHastaRango: 0,
            desde: '',
            hasta: '',
            valor: '',
            terminoDePagoSeleccionado: '',
            terminoDePago: [],
            nombresBodegaSeleccionada: '',
            nombresBodega: [],
            categoriasProductosSeleccionada: '',
            categoriasProductos: [],

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
        },

        IndividualClientStatusDATA: [],
        IndividualClientStatusFILTROS: {
            codCliente: '',
            mostrarNCF: false,
            soloDocsVencidos: false,
            incluirFirmas: false,
            incluirMoras: false
        }
    },

    watch: {
        'VentasYDevolucionesCategoriaYVendedorFILTROS.desde'() {
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.desde = this.VentasYDevolucionesCategoriaYVendedorFILTROS.desde.replace(/^0/g, '');
        },
        'VentasYDevolucionesCategoriaYVendedorFILTROS.hasta'() {
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta = this.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta.replace(/^0/g, '');
        },
        'VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta'() {
            this.VentasYDevolucionesCategoriaYVendedorTablaVisible = [];
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.mostrarDetallesProductosCorte = false;
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.analisisGrafico = false;
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte = 'porCategoria';
        },
        'VentasYDevolucionesCategoriaYVendedorFILTROS.FormatoConsultas'() {
            SetCoockie(`formatoDataVentasYDevoluciones=${this.VentasYDevolucionesCategoriaYVendedorFILTROS.FormatoConsultas};`);
            monicaReportes.LimpiarTablas();
        },
        'VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor'() {
            SetCoockie(`formatoDataVentasYDevoluciones_vendedor=${this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor};`);
        },
        'VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante'() {
            SetCoockie(`formatoDataVentasYDevoluciones_comprobante=${this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante};`);
        },
        'VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino'() {
            SetCoockie(`formatoDataVentasYDevoluciones_termino=${this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino};`);
        },
        'VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda'() {
            SetCoockie(`formatoDataVentasYDevoluciones_moneda=${this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda};`);
        },
        'VentasYDevolucionesCategoriaYVendedorFILTROS.desdeHastaRango'() {
            const rango = getIntervalDate(this.VentasYDevolucionesCategoriaYVendedorFILTROS.desdeHastaRango);

            this.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emision = rango.firstday;
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.maxFecha_emision = rango.lastday;
        },
        'VentasYDevolucionesCategoriaYVendedorFILTROS.analisisGrafico'() {
            if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.analisisGrafico) {
                this.VentasYDevolucionesCategoriaYVendedorFILTROS.mostrarDetallesProductosCorte = true;
                document.getElementById('checkboxVentasYDevolucionesCategoriaYVendedorMostrarDetalles').setAttribute('disabled', true);

                if (this.VentasYDevolucionesCategoriaYVendedorDATA.length > 0) {
                    document.getElementById('tablaDatosAgrupados').setAttribute('hidden', true);
                    document.getElementById('divGraficosDatosAgrupados').removeAttribute('hidden');
                }
            }
            else {
                document.getElementById('checkboxVentasYDevolucionesCategoriaYVendedorMostrarDetalles').removeAttribute('disabled');

                if (this.VentasYDevolucionesCategoriaYVendedorDATA.length > 0) {
                    document.getElementById('tablaDatosAgrupados').removeAttribute('hidden');
                    document.getElementById('divGraficosDatosAgrupados').setAttribute('hidden', true);
                }
            }
        },
        //'VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emision'() {
        //    this.VentasYDevolucionesCategoriaYVendedorFILTROS.desdeHastaRango = '';
        //},
        //'VentasYDevolucionesCategoriaYVendedorFILTROS.maxFecha_emision'() {
        //    this.VentasYDevolucionesCategoriaYVendedorFILTROS.desdeHastaRango = '';
        //}
    },

    methods: {
        PaginationVentasYDevolucionesCategoriaYVendedor(value) {
            switch (value) {
                case -1:
                    this.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorIndex--;
                    break;
                    break;
                case +1:
                    this.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorIndex++;
                    break;
                case 'MAX':
                    this.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorIndex = this.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorLastPage;
                    break
                case 0:
                default:
                    this.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorIndex = 0;
                    break;
            }
            this.Buscar_VentasYDevolucionesCategoriaYVendedor()
        },

        async Buscar_VentasYDevolucionesCategoriaYVendedor() {
            monicaReportes.LimpiarTablas();

            this.VentasYDevolucionesCategoriaYVendedorFILTROS.toggleData_tablaCorteYReporteGrafico = this.VentasYDevolucionesCategoriaYVendedorFILTROS.analisisGrafico;
            this.toggleTableColumns_byMostrarDetallesProductosCorte = !this.VentasYDevolucionesCategoriaYVendedorFILTROS.mostrarDetallesProductosCorte;
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.ConsultaTrajoColumnaVendedor = this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor;
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.ConsultaTrajoColumnaComprobante = this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante;
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.ConsultaTrajoColumnaTermino = this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino;
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.ConsultaTrajoColumnaMoneda = this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda;
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.fechaMinReporteBuscado = this.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emision;
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.fechaMaxReporteBuscado = this.VentasYDevolucionesCategoriaYVendedorFILTROS.maxFecha_emision;
            if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesSeleccionada)
                this.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesBuscada =
                    this.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasClientes.find(
                        item => item.categoria_clte_id === this.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesSeleccionada)
                        .descripcion_categ;
            else
                this.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesBuscada = '-TODO-';

            if (monicaReportes.sourceResportes === 'web')
                alert('Por el momento esta busqueda solo se ha planteado para la parte Local');
            else if (monicaReportes.sourceResportes === 'local') {
                this.VentasYDevolucionesCategoriaYVendedorDATA = [];
                this.VentasYDevolucionesCategoriaYVendedorGroupDATA = [];
                let campo;

                const filtro = {
                    minFecha_emision: this.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emision,
                    maxFecha_emision: this.VentasYDevolucionesCategoriaYVendedorFILTROS.maxFecha_emision,
                    Codigo_vendedor: this.VentasYDevolucionesCategoriaYVendedorFILTROS.vendedorSeleccionado.trim(),
                    categoria_clte_id: this.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesSeleccionada,
                    tipoConsulta: this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta,
                    tipoReporte: this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoReporte,
                    skip: this.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorIndex
                }

                if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoReporte === 'ventas')
                    filtro.tipo_factura = this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipo_factura

                if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA01'
                    || this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA02') {
                    filtro.desde = this.VentasYDevolucionesCategoriaYVendedorFILTROS.desde;
                    filtro.hasta = this.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta;
                }
                else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA03')
                    filtro.valor = this.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePagoSeleccionado;
                else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA0')
                    filtro.valor = this.VentasYDevolucionesCategoriaYVendedorFILTROS.nombresBodegaSeleccionada;
                else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA08') {
                    filtro.GROUP = true;
                    filtro.tipoCorte = this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte;
                    if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porCategoria')
                        filtro.valor = this.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasProductosSeleccionada;
                    else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porMoneda')
                        filtro.valor = this.VentasYDevolucionesCategoriaYVendedorFILTROS.monedaAgrupacionSeleccionada;
                    else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porTermino_de_Pago')
                        filtro.valor = this.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoPagoAgrupacionSeleccionada;
                    else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porCategorias_de_Clientes')
                        filtro.valor = this.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesAgrupacionSeleccionada;
                    else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porFecha_Emision'
                        || this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porFecha_Vencimiento') {
                        filtro.desde = this.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emisionAgrupacionSeleccionada;
                        filtro.hasta = this.VentasYDevolucionesCategoriaYVendedorFILTROS.maxFecha_emisionAgrupacionSeleccionada;
                    }
                    else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porCliente'
                        || this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porVendedor'
                        || this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porComprobante')
                        filtro.valor = this.VentasYDevolucionesCategoriaYVendedorFILTROS.valor;
                }
                else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA04'
                    || this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA05'
                    || this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA06')
                    filtro.valor = this.VentasYDevolucionesCategoriaYVendedorFILTROS.valor;

                //  AGREGAR desde hasta VALORES
                if ((this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA03'
                    || this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA04'
                    || this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA06'
                    || this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA0'
                    || this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA08')
                    && (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte !== 'porFecha_Emision'
                        && this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte !== 'porFecha_Vencimiento')) {
                    filtro.desde = this.VentasYDevolucionesCategoriaYVendedorFILTROS.desde;
                    filtro.hasta = this.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta;
                }

                //  AGREGAR COLUMNAS
                if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.FormatoConsultas === 'completo') {
                    if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor)
                        filtro.colVendedor = this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor;

                    if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante)
                        filtro.colComprobante = this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante;

                    if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino)
                        filtro.colTermino = this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino;

                    if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda)
                        filtro.colMoneda = this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda;
                }
                if (!this.VentasYDevolucionesCategoriaYVendedorFILTROS.mostrarDetallesProductosCorte) {
                    let result = await BuscarInformacionLocal('SendWebsocketServer/2', filtro);

                    for (item of result)
                        this.VentasYDevolucionesCategoriaYVendedorDATA.push(item);

                    //  SI ES UNA DATA AGRUPADA, SE ASIGNA EL CAMPO POR EL QUE SE VA A AGRUPAR.
                    if (filtro.GROUP) {
                        if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porCategoria')
                            campo = 'categoria_id';
                        else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porCliente')
                            campo = 'nombre_clte';
                        else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porVendedor')
                            campo = 'vendedor_id';
                        else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porMoneda')
                            campo = 'moneda';
                        else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porComprobante')
                            campo = 'ncf';
                        else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porFecha_Emision')
                            campo = 'fecha_emision';
                        else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porFecha_Vencimiento')
                            campo = 'fecha_vcmto';
                        else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porTermino_de_Pago')
                            campo = 'termino_id';
                        else if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porCategorias_de_Clientes')
                            campo = 'Categoria_Clte_id';

                        for (let item of [... new Set(this.VentasYDevolucionesCategoriaYVendedorDATA.map(data => data[campo]))]) {
                            this.VentasYDevolucionesCategoriaYVendedorGroupDATA.push(
                                this.VentasYDevolucionesCategoriaYVendedorDATA.filter(el => el[campo] === item)
                            );
                        }
                    }
                }

                //
                let tableName = '';
                let camposArray = [];

                if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA08') {
                    tableName = 'tablaVentasYDevolucionesGROUP';
                    camposArray = [3, 4, 6, 7, 8];
                }
                else {
                    tableName = 'tablaRangoNroFactura';
                    camposArray = [8, 9, 10, 11];
                }

                //  SI NO TRAE DATA TERMINA EL PROCESO
                if (!this.VentasYDevolucionesCategoriaYVendedorFILTROS.mostrarDetallesProductosCorte)
                    if (this.VentasYDevolucionesCategoriaYVendedorDATA.length === 0 && this.VentasYDevolucionesCategoriaYVendedorGroupDATA.length === 0)
                        return;
                // TOTALIZACIONES.
                this.VentasYDevolucionesCategoriaYVendedorTablaVisible = tableName;

                filtro.SUM = true;

                result = await BuscarInformacionLocal('SendWebsocketServer/2', filtro);

                //
                if (!filtro.GROUP) {
                    this.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorLastPage = Math.floor(result[0].count / 20);

                    let jsonTotalizacion = {};
                    if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === '')
                        jsonTotalizacion = { 'SubTotalNeto': result[0].sumatoriaMontos, 'impto': result[0].sumatoriaPagosAcumulados, 'total': result[0].sumatoriaBalance };
                    else
                        jsonTotalizacion = { 'ITBIS': result[0].impuesto, 'SubTotalNeto': result[0].subtotal, 'dscto_monto': result[0].dscto_monto, 'total': result[0].total };

                    this.VentasYDevolucionesCategoriaYVendedorDATA.push(jsonTotalizacion);

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
                    let totalCantidad = 0;
                    let totalTotal = 0;
                    let totalValor = 0;
                    let totalImpuesto = 0;

                    let tableTotalPositionsRows = [];

                    //  CON DETALLES DE PRODUCTOS
                    if (!this.VentasYDevolucionesCategoriaYVendedorFILTROS.mostrarDetallesProductosCorte) {
                        document.getElementById('divGraficosDatosAgrupados').setAttribute('hidden', true);

                        let contadorDeLineas = 0;
                        for (let index = 0; index < result.length; index++) {
                            contadorDeLineas += this.VentasYDevolucionesCategoriaYVendedorGroupDATA[index].length + 1;
                            //  OBTENER LA POSICION DEL TOTAL DE CADA GRUPO PARA DARLE ESTILOS.
                            tableTotalPositionsRows.push(contadorDeLineas);

                            //  AGREGAR LOS SUB ELEMENTOS DE MANERA INTELIGENTE A LOS ELEMENTOS QUE COINCIDAN.
                            for (let i = 0; i < this.VentasYDevolucionesCategoriaYVendedorGroupDATA.length; i++) {
                                const valorAgrupadoPor = this.PonerDescripcionDatosAgrupados(this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte, index);

                                if (this.VentasYDevolucionesCategoriaYVendedorGroupDATA[i][0][campo] === result[index][campo]) {
                                    this.VentasYDevolucionesCategoriaYVendedorGroupDATA[i].push({
                                        'descrip_producto': `${valorAgrupadoPor} => `,
                                        'cantidad': result[index].cantidad,
                                        'TPRECIO': result[index].TPRECIO,
                                        'precio_factura': result[index].precio_factura,
                                        'ITBIS': result[index].impto_monto,
                                        'total': result[index].total
                                    });
                                }
                            }

                            totalCantidad += result[index].cantidad;
                            totalValor += result[index].TPRECIO;
                            totalImpuesto += result[index].impto_monto;
                            totalTotal += result[index].total;
                        }
                        this.VentasYDevolucionesCategoriaYVendedorGroupDATA.push({ 'cantidad': `${totalCantidad}`, 'TPRECIO': `${totalValor}`, 'ITBIS': `${totalImpuesto}`, 'total': `${totalTotal}` });
                        this.VentasYDevolucionesCategoriaYVendedorDATA = this.VentasYDevolucionesCategoriaYVendedorGroupDATA.flat();

                        let columnasExtras = 0;
                        if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.FormatoConsultas === 'completo') {
                            if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor)
                                columnasExtras++;
                            if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante)
                                columnasExtras++;
                            if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino)
                                columnasExtras++;
                            if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda)
                                columnasExtras++;
                        }

                        for (let i = 0; i < camposArray.length; i++)
                            camposArray[i] = camposArray[i] + columnasExtras;

                        setTimeout(() => {
                            TablaEstiloTotalizacionFilaAgrupadas('tablaRangoNroFactura', camposArray, tableTotalPositionsRows);
                            TablaEstiloTotalizacionFila(document.getElementById('tablaRangoNroFactura'), [4 + columnasExtras, 6 + columnasExtras, 7 + columnasExtras, 8 + columnasExtras]);
                        }, 1);
                    }
                    //  SIN DETALLES DE PRODUCTOS
                    else {
                        let reporteGraficoLabels = [];
                        let reporteGraficoTotales = [];

                        for (let index = 0; index < result.length; index++) {
                            const valorAgrupadoPor = this.PonerDescripcionDatosAgrupados(this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte, index);

                            this.VentasYDevolucionesCategoriaYVendedorGroupDATA.push([]);
                            this.VentasYDevolucionesCategoriaYVendedorGroupDATA[index].push({
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

                        this.VentasYDevolucionesCategoriaYVendedorFILTROS.totalReporteBuscado = totalTotal;
                        this.VentasYDevolucionesCategoriaYVendedorGroupDATA.push({ 'cantidad': `${totalCantidad}`, 'TPRECIO': `${totalValor}`, 'ITBIS': `${totalImpuesto}`, 'total': `${totalTotal}` });
                        this.VentasYDevolucionesCategoriaYVendedorDATA = this.VentasYDevolucionesCategoriaYVendedorGroupDATA.flat();
                        setTimeout(() => {
                            TablaEstiloTotalizacionFilaAgrupadas('tablaRangoNroFactura', [0, 1, 2, 3, 4])
                            TablaEstiloTotalizacionFila(document.getElementById('tablaRangoNroFactura'), [1, 2, 3, 4]);
                        }, 1);

                        //  REPORTE GRAFICO.
                        let reporteGraficoBacground = new Array(reporteGraficoLabels.length);
                        reporteGraficoBacground.fill('#17a2b8');

                        if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.chartAnalisisGrafico)
                            this.VentasYDevolucionesCategoriaYVendedorFILTROS.chartAnalisisGrafico.destroy();

                        let ctx = document.getElementById('reportesGraficos').getContext('2d');

                        this.VentasYDevolucionesCategoriaYVendedorFILTROS.chartAnalisisGrafico = new Chart(ctx, {
                            type: 'horizontalBar',
                            data: {
                                labels: reporteGraficoLabels,
                                datasets: [{
                                    label: `Análisis de Ventas por ${(this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte).replace('por', '')}`,
                                    backgroundColor: reporteGraficoBacground,
                                    data: reporteGraficoTotales
                                }]
                            },
                        });

                        //  OCULTAR EL DIV CORRESPONDIENTE. SI SE QUIERE VER LA DATA COMO TABLA SE OCULTA EL DIV DE GRAFICOS Y VICEVERSA.
                        if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.toggleData_tablaCorteYReporteGrafico)
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
                    return result[index].nombre_clte;
                case 'porVendedor':
                    return result[index].Nombre_vendedor;
                case 'porMoneda':
                    return filters.FilterMoneda(result[index].moneda);
                case 'porComprobante':
                    return result[index].ncf;
                case 'porFecha_Emision':
                    return filters.FilterDateFormat(result[index].fecha_emision);
                case 'porFecha_Vencimiento':
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
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.Codigo_vendedor = '';
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.vendedorSeleccionado = '';
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesSeleccionada = '';
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.desde = '';
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta = '';
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.valor = '';
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePagoSeleccionado = '';
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.nombresBodegaSeleccionada = '';
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasProductosSeleccionada = '';

            //  BUSCAR INFORMACION SI ES NECESARIO.
            if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA03')
                if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePago.length === 0)
                    this.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePago = await BuscarInformacionLocal('SendWebsocketServer/7', {});
            if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA0')
                if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.nombresBodega.length === 0)
                    this.VentasYDevolucionesCategoriaYVendedorFILTROS.nombresBodega = await BuscarInformacionLocal('SendWebsocketServer/8', {});
            if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA08')
                if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasProductos.length === 0)
                    this.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasProductos = (await BuscarInformacionLocal('SendWebsocketServer/9', {})).reverse();
        },

        async TipoCorteChanged() {
            if (!('col-lg-5' in document.getElementById('agrupacionDiv').classList))
                document.getElementById('agrupacionDiv').classList.add('col-lg-5');

            switch (this.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte) {
                case 'porTermino_de_Pago':
                    if (this.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePago.length === 0)
                        this.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePago = await BuscarInformacionLocal('SendWebsocketServer/7', {});
                    break;
                case 'porFecha_Emision':
                case 'porFecha_Vencimiento':
                    document.getElementById('agrupacionDiv').classList.remove('col-lg-5');

                    this.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emisionAgrupacionSeleccionada = new Date().toISOString().slice(0, 10);
                    this.VentasYDevolucionesCategoriaYVendedorFILTROS.maxFecha_emisionAgrupacionSeleccionada = new Date().toISOString().slice(0, 10);
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
            $('#reporteModal').modal('show');
            $('#modificarFiltrosId').collapse('hide');

            const formatoDataVentasYDevoluciones = GetCookieElement('formatoDataVentasYDevoluciones=');

            this.VentasYDevolucionesCategoriaYVendedorFILTROS.FormatoConsultas = formatoDataVentasYDevoluciones ? formatoDataVentasYDevoluciones : 'simple';
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor = GetCookieElement('formatoDataVentasYDevoluciones_vendedor=') === 'false' ? false : true;
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante = GetCookieElement('formatoDataVentasYDevoluciones_comprobante=') === 'false' ? false : true;
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino = GetCookieElement('formatoDataVentasYDevoluciones_termino=') === 'false' ? false : true;
            this.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda = GetCookieElement('formatoDataVentasYDevoluciones_moneda=') === 'false' ? false : true;
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