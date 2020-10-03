const reporte_comprasDevolucionesYCotizaciones = new Vue({
    el: '#comprasDevolucionesYConduces',

    data: {
        DATA: [],
        GroupDATA: [],
        FILTROS: {
            nombresBodegaSeleccionada: '',
            nombresBodega: [],
            categoriasProveedoresSeleccionada: '',
            categoriasProveedores: [],
            estatusSeleccionado: '',
            estatus: '',
            categoriasProductosSeleccionada: '',
            categoriasProductos: [],
            monedaAgrupacionSeleccionada: '',
            tipoNCF: '',
            terminoDePagoSeleccionado: '',
            terminoDePago: [],
            vendedorEspesifico: '',
            minFecha_emision: '',
            maxfecha_emision: '',
            tipoReporteBuscado: '',
            tipoReporte: 'compras',
            tipoCorte: '',
            tipoConsulta: 'RFA01',
            desdeHastaRango: 0,
            desde: '',
            hasta: '',
            valor: '',

            mostrarDetallesProductosCorte: false,
            toggleTableColumns_byMostrarDetallesProductosCorte: true,

            analisisGrafico: false,
            chartAnalisisGrafico: '',
            toggleData_tablaCorteYReporteGrafico: false,

            fechaMinReporteBuscado: '',
            fechaMaxReporteBuscado: '',
            categoriaClientesBuscada: '',
            totalReporteBuscado: '',

            PaginatorIndex: 0,
            PaginatorLastPage: 0,
        },

        modalData: {
            data: [],
            nombreABuscar: '',
            PaginatorIndex: 0,
            PaginatorLastPage: 0
        }
    },

    watch: {
        'FILTROS.analisisGrafico'() {
            if (this.FILTROS.analisisGrafico) {
                this.FILTROS.mostrarDetallesProductosCorte = true;
                document.getElementById('CDCcheckboxMostrarDetalles').setAttribute('disabled', true);

                if (this.toggleTableColumns_byMostrarDetallesProductosCorte)
                    return;

                const divTabla = document.getElementById('divTablaComprasVentasCotizaciones');
                if (divTabla)
                    divTabla.setAttribute('hidden', true);
                document.getElementById('CDCdivGraficosDatosAgrupados').removeAttribute('hidden');
            }
            else {
                document.getElementById('CDCcheckboxMostrarDetalles').removeAttribute('disabled');

                if (this.toggleTableColumns_byMostrarDetallesProductosCorte)
                    return;

                const divTabla = document.getElementById('divTablaComprasVentasCotizaciones');
                if (divTabla)
                    divTabla.removeAttribute('hidden');
                document.getElementById('CDCdivGraficosDatosAgrupados').setAttribute('hidden', true);
            }
        },
        'FILTROS.desdeHastaRango'() {
            if (this.FILTROS.desdeHastaRango === '-1')
                return;

            const rango = getIntervalDate(this.FILTROS.desdeHastaRango);

            this.FILTROS.minFecha_emision = rango.firstday;
            this.FILTROS.maxFecha_emision = rango.lastday;
        },
        'FILTROS.tipoReporte'() {
            this.FILTROS.tipoNCF = '';
            this.FILTROS.estatus = '';
            this.FILTROS.vendedorEspesifico = '';
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

            monicaReportes.LimpiarTablas();

            this.FILTROS.tipoReporteBuscado = this.FILTROS.tipoReporte;
            this.FILTROS.toggleData_tablaCorteYReporteGrafico = this.FILTROS.analisisGrafico;
            this.toggleTableColumns_byMostrarDetallesProductosCorte = !this.FILTROS.mostrarDetallesProductosCorte;

            if (monicaReportes.sourceResportes === 'web')
                alert('Por el momento esta busqueda solo se ha planteado para la parte Local');
            else if (monicaReportes.sourceResportes === 'local') {
                this.DATA = [];
                this.GroupDATA = [];
                let campo;

                const filtro = {
                    minFecha_emision: this.FILTROS.minFecha_emision,
                    tipoConsulta: this.FILTROS.tipoConsulta,
                    tipoReporte: this.FILTROS.tipoReporte,
                    skip: skip
                }

                if (this.FILTROS.estatus)
                    filtro.estatus = this.FILTROS.estatus;
                if (this.FILTROS.vendedorEspesifico)
                    filtro.vendedorEspesifico = this.FILTROS.vendedorEspesifico;
                if (this.FILTROS.estatus)
                    filtro.estatus = this.FILTROS.estatus;
                if (this.FILTROS.tipoNCF)
                    filtro.tipoNCF = this.FILTROS.tipoNCF;

                //  AGREGAR VALORES
                if (this.FILTROS.tipoConsulta !== 'RFA08') {
                    if (this.FILTROS.tipoConsulta === 'RFA01'
                        || this.FILTROS.tipoConsulta === 'RFA02') {
                        filtro.desde = this.FILTROS.desde;
                        filtro.hasta = this.FILTROS.hasta;
                    }
                    else if (this.FILTROS.tipoConsulta === 'RFA03')
                        filtro.valor = this.FILTROS.terminoDePagoSeleccionado;
                    else if (this.FILTROS.tipoConsulta === 'RFA06')
                        filtro.valor = this.FILTROS.valor;
                    else if (this.FILTROS.tipoConsulta === 'RFA0')
                        filtro.valor = this.FILTROS.nombresBodegaSeleccionada;
                }
                else {
                    //  DATOS AGRUPADOS
                    filtro.GROUP = true;
                    filtro.tipoCorte = this.FILTROS.tipoCorte;
                    if (this.FILTROS.tipoCorte === 'porCategoria')
                        filtro.valor = this.FILTROS.categoriasProductosSeleccionada;
                    else if (this.FILTROS.tipoCorte === 'porVendedor')
                        filtro.valor = this.FILTROS.valor.substr(0, this.FILTROS.valor.indexOf(' '));
                    else if (this.FILTROS.tipoCorte === 'porMoneda')
                        filtro.valor = this.FILTROS.monedaAgrupacionSeleccionada;
                    else if (this.FILTROS.tipoCorte === 'porFecha_Emision')
                        if (this.FILTROS.agruparPorMes)
                            filtro.agruparPorMes = this.FILTROS.agruparPorMes;
                }

                //  SI this.FILTROS.mostrarDetallesProductosCorte ES FALSO, NO SE BUSCAN LOS DETALLES DE LOS PRODUCTOS, PARA SOLO TRAER LA SUMATORIA DE CADA CATEGORIA.
                if (!this.FILTROS.mostrarDetallesProductosCorte) {
                    let result = await BuscarInformacionLocal('SendWebsocketServer/17', filtro);

                    for (item of result)
                        this.DATA.push(item);

                    switch (this.FILTROS.tipoReporte) {
                        case "devoluciones":
                            for (let i = 0; i < this.DATA.length; i++) {
                                if (this.DATA[i].pago === 0)
                                    this.DATA[i].estatus = 'SIN APLICAR';
                                else if (this.DATA[i].pago === this.DATA[i].total)
                                    this.DATA[i].estatus = 'APLICADA';
                                else if (this.DATA[index].pago < this.DATA[i].total)
                                    this.DATA[i].estatus = 'APLICADA PARCIAL';
                            }
                            break;
                        case "compras":
                            for (let i = 0; i < this.DATA.length; i++) {
                                if (this.DATA[i].recibida === 'T')
                                    this.DATA[i].estatus = 'RECIBIDA';
                                else if (this.DATA[i].recibida === 'S')
                                    this.DATA[i].estatus = 'SIN RECIBIR';
                                else if (this.DATA[i].recibida === 'P')
                                    this.DATA[i].estatus = 'PARCIALMENTE RECIBIDA';
                            }
                            break;
                    }

                    //  SI ES UNA DATA AGRUPADA, SE ASIGNA EL CAMPO POR EL QUE SE VA A AGRUPAR.
                    if (filtro.GROUP) {
                        if (this.FILTROS.tipoCorte === 'porCategoria')
                            campo = 'nro';
                        else if (this.FILTROS.tipoCorte === 'porVendedor')
                            campo = 'vendedor_id';
                        else if (this.FILTROS.tipoCorte === 'porMoneda')
                            campo = 'moneda';
                        else if (this.FILTROS.tipoCorte === 'porFecha_Emision')
                            campo = 'fecha';

                        for (let item of [... new Set(this.DATA.map(data => data[campo]))]) {
                            this.GroupDATA.push(
                                this.DATA.filter(el => el[campo] === item)
                            );
                        }
                    }
                }

                let tableName = 'tablaComprasVentasCotizaciones';
                let camposArray = [8, 9, 10];

                if (this.FILTROS.tipoReporte === 'devoluciones'
                    || this.FILTROS.tipoReporte === 'compras') {
                    let colsagregadas = 2;

                    for (let i = 0; i < camposArray.length; i++)
                        camposArray[i] = (camposArray[i] + colsagregadas);
                }

                //  SI NO TRAE DATA TERMINA EL PROCESO
                if (!this.FILTROS.mostrarDetallesProductosCorte)
                    if (this.DATA.length === 0)
                        return;

                //TOTALIZACIONES.
                filtro.SUM = true;
                result = await BuscarInformacionLocal('SendWebsocketServer/17', filtro);

                if (!filtro.GROUP) {
                    this.FILTROS.PaginatorLastPage = Math.floor(result[0].count / 20);
                    const jsonTotalizacion = { 'subtotal': result[0].subtotal, 'impuesto_monto': result[0].impuesto_monto, 'total': result[0].total };
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
                    let totalSubTotal = 0;
                    let totalImpuesto = 0;
                    let totalTotal = 0;

                    let tableTotalPositionsRows = [];

                    //  CON DETALLES DE PRODUCTOS
                    if (!this.FILTROS.mostrarDetallesProductosCorte) {
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
                                        'Nombre_vendedor': `${valorAgrupadoPor} => `,
                                        'subtotal': result[index].subtotal,
                                        'impuesto_monto': result[index].impuesto_monto,
                                        'total': result[index].total,
                                    });
                                }
                            }
                            totalSubTotal += result[index].subtotal;
                            totalImpuesto += result[index].impuesto_monto;
                            totalTotal += result[index].total;
                        }
                        this.GroupDATA.push({ 'subtotal': totalSubTotal, 'impuesto_monto': totalImpuesto, 'total': totalTotal });
                        this.DATA = this.GroupDATA.flat();

                        setTimeout(() => {
                            TablaEstiloTotalizacionFilaAgrupadas(tableName, [3, 4, ...camposArray], tableTotalPositionsRows);
                            TablaEstiloTotalizacionFila(document.getElementById(tableName), camposArray);
                        }, 1);
                    }
                    else {
                        //  SIN DETALLES DE PRODUCTOS
                        let reporteGraficoLabels = [];
                        let reporteGraficoTotales = [];
                        document.getElementById('CDCdivGraficosDatosAgrupados').removeAttribute('hidden');

                        for (let index = 0; index < result.length; index++) {
                            const valorAgrupadoPor = this.PonerDescripcionDatosAgrupados(this.FILTROS.tipoCorte, index);

                            this.GroupDATA.push([]);
                            this.GroupDATA[index].push({
                                'categorizacionSinDetalles': valorAgrupadoPor,
                                'subtotal': result[index].subtotal,
                                'impuesto_monto': result[index].impuesto_monto,
                                'total': result[index].total,

                            });

                            totalSubTotal += result[index].subtotal;
                            totalImpuesto += result[index].impuesto_monto;
                            totalTotal += result[index].total;

                            reporteGraficoLabels.push(valorAgrupadoPor.toString().trim().toUpperCase());
                            reporteGraficoTotales.push(result[index].total)
                        }

                        this.FILTROS.totalReporteBuscado = totalTotal;
                        this.GroupDATA.push({ 'subtotal': totalSubTotal, 'impuesto_monto': totalImpuesto, 'total': totalTotal });
                        this.DATA = this.GroupDATA.flat();
                        setTimeout(() => {
                            TablaEstiloTotalizacionFilaAgrupadas(tableName, [0, 1, 2, 3])
                            TablaEstiloTotalizacionFila(document.getElementById(tableName), [1, 2, 3]);
                        }, 1);

                        //  REPORTE GRAFICO.
                        let reporteGraficoBacground = new Array(reporteGraficoLabels.length);
                        reporteGraficoBacground.fill('#17A2B8');

                        if (this.FILTROS.chartAnalisisGrafico)
                            this.FILTROS.chartAnalisisGrafico.destroy();

                        let ctx = document.getElementById('CDCreportesGraficos').getContext('2d');

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
                            setTimeout(() => document.getElementById('divTablaComprasVentasCotizaciones').setAttribute('hidden', true), 2);
                        else
                            setTimeout(() => document.getElementById('CDCdivGraficosDatosAgrupados').setAttribute('hidden', true), 2);
                    }
                }
            }
            //    //  GUARDARLO EN EL NAVEGADOR PARA CUANDO EL CLIENTE LE DE A IMPRIMIR.
            //    //localStorage.setItem('sumatoriasEstadoCuentaCliente', JSON.stringify(result[0]));
        },

        PonerDescripcionDatosAgrupados(tipoCorte, index) {
            switch (tipoCorte) {
                case 'porCategoria':
                    return result[index].Descripcion_categ.toUpperCase();
                case 'porVendedor':
                    return result[index].Nombre_vendedor.toUpperCase();
                case 'porMoneda':
                    return this.$options.filters.FilterMoneda(result[index].moneda);
                case 'porFecha_Emision':
                    if (this.FILTROS.agruparPorMes) {
                        const dateSplited = result[index].fecha.split('/');
                        return `${ConvertirMesADescripcion(dateSplited[0])}/${dateSplited[1]}`;
                    } else
                        return this.$options.filters.FilterDateFormat(result[index].fecha);
            }
        },

        async ModalBuscarCodigo() {
            this.modalData.clientes = [];

            $('#CDCbuscarCodigoModal').modal('hide');

            const filtros = {
                skip: this.modalData.PaginatorfIndex
            };

            if (this.modalData.nombreABuscar)
                filtros.name = this.modalData.ntiombreABuscar;

            this.modalData.data = await monicaReportes.BuscarData('vendedoresList', filtros);
            filtros.SUM = true;
            this.modalData.PaginatorLastPage = Math.floor((await monicaReportes.BuscarData('vendedoresList', filtros))[0].count / 20);

            $('#CDCbuscarCodigoModal').modal('show');
        },

        ModalCodigoSeleccionado(value) {
            $('#CDCbuscarCodigoModal').modal('hide');

            this.FILTROS.valor = value;
        },

        async TipoConsultaSelectChanged() {
            //  LIMPIAR TODOS LOS CAMPOS.
            this.FILTROS.desde = '';
            this.FILTROS.hasta = '';
            this.FILTROS.valor = '';
            this.FILTROS.analisisGrafico = false;
            this.FILTROS.mostrarDetallesProductosCorte = false;
            this.FILTROS.vendedorEspesifico = '';

            //  BUSCAR INFORMACION SI ES NECESARIA O HACER CAMBIOS SEGUN EL TIPO DE CONSULTA.
            switch (this.FILTROS.tipoConsulta) {
                case 'RFA03':
                    monicaReportes.BuscarData('terminoDePago');
                    break;
                case 'RFA0':
                    monicaReportes.BuscarData('nombresBodega');
                    break;
                case 'RFA08':
                    this.FILTROS.maxFecha_emision = monicaReportes.fechaHoy;
                    this.FILTROS.minFecha_emision = monicaReportes.fechaHoy;
                    this.FILTROS.tipoCorte = 'porCategoria';
                    await monicaReportes.BuscarData('categoriasProductos');
                    break;
            }
        },

        LlenarSelect(value) {
            monicaReportes.BuscarData(value);
        },

        async TipoCorteChanged() {
            this.FILTROS.desde = '';
            this.FILTROS.hasta = '';
            this.FILTROS.valor = '';
            this.FILTROS.vendedorEspesifico = '';
            this.FILTROS.monedaAgrupacionSeleccionada = '';
            this.FILTROS.analisisGrafico = false;
            this.FILTROS.mostrarDetallesProductosCorte = false;

            const divAgrupacion = document.getElementById('CDCagrupacionDiv');

            if (divAgrupacion !== null && !('col-lg-5' in divAgrupacion))
                divAgrupacion.classList.add('col-lg-5');

            switch (this.FILTROS.tipoCorte) {
                case 'porFecha_Emision':
                    divAgrupacion.classList.remove('col-lg-5');
                    document.getElementById('CPCCPPIconBottonBuscar').style = 'margin-top: 0';

                    this.FILTROS.minFecha_emisionAgrupacionSeleccionada = new Date().toISOString().slice(0, 10);
                    this.FILTROS.maxFecha_emisionAgrupacionSeleccionada = new Date().toISOString().slice(0, 10);
                    break;
            }

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

        FilterMoneda: value => {
            return monicaReportes.$options.filters.FilterMoneda(value);
        },

        FilterEstatusCotizacion: value => {
            if (reporte_comprasDevolucionesYCotizaciones.FILTROS.tipoReporte === 'cotizaciones')
                return value === 0 ? 'ABIERTO' : value !== undefined ? 'CERRADO' : '';
            else
                return value;
        }
    },
});