﻿const reporte_inventarioYLiquidacion = new Vue({
    el: '#inventarioYLiquidacion',

    data: {
        DATA: [],
        GroupDATA: [],
        FILTROS: {
            nombresBodegaSeleccionada: '',
            nombresBodega: [],
            subProductoCategoriaSeleccionada: '',
            subProductosCategorias: [],
            categoriaProductosSeleccionada: '',
            categoriasProductos: [],
            minFecha_emision: '',
            maxFecha_emision: '',
            tipoReporte: 'inventario',
            tipoCorte: '',
            tipoDeProducto: '1',
            tipoDeProductoSeleccionado: '1',
            tipoConsulta: 'porDescripcion',
            desdeHastaRango: 0,
            desde: '',
            hasta: '',
            valor: '',
            agrupacionProductos: 'unidades',
            cantidadAgrupacionProductos: 10,

            mostrarDetallesProductosCorte: false,
            toggleTableColumns_byMostrarDetallesProductosCorte: true,

            analisisGrafico: false,
            chartAnalisisGrafico: '',
            toggleData_tablaCorteYReporteGrafico: false,

            buscadoPorFechaCorte: false,
            fechaMinReporteBuscado: '',
            fechaMaxReporteBuscado: '',
            categoriaClientesBuscada: '',
            totalReporteBuscado: '',
            labelUnidadesMontosBuscados: '',

            soloPrroductosConExistencia: false,
            agregarProductosInactivos: false,

            PaginatorIndex: 0,
            PaginatorLastPage: 0,
        },

        modalData: {
            data: [],
            codigoABuscar: '',
            PaginatorIndex: 0,
            PaginatorLastPage: 0
        }
    },

    watch: {
        'FILTROS.analisisGrafico'() {
            if (this.FILTROS.analisisGrafico) {
                this.FILTROS.mostrarDetallesProductosCorte = true;
                document.getElementById('ILcheckboxMostrarDetalles').setAttribute('disabled', true);

                if (this.toggleTableColumns_byMostrarDetallesProductosCorte)
                    return;

                const divTabla = document.getElementById('divTablaInventarioYLiquidacion');
                if (divTabla)
                    divTabla.setAttribute('hidden', true);
                document.getElementById('ILdivGraficosDatosAgrupados').removeAttribute('hidden');
            }
            else {
                document.getElementById('ILcheckboxMostrarDetalles').removeAttribute('disabled');

                if (this.toggleTableColumns_byMostrarDetallesProductosCorte)
                    return;

                const divTabla = document.getElementById('divTablaInventarioYLiquidacion');
                if (divTabla)
                    divTabla.removeAttribute('hidden');
                document.getElementById('ILdivGraficosDatosAgrupados').setAttribute('hidden', true);
            }
        },

        'FILTROS.desdeHastaRango'() {
            if (this.FILTROS.desdeHastaRango === '-1')
                return;

            const rango = getIntervalDate(this.FILTROS.desdeHastaRango);

            this.FILTROS.minFecha_emision = rango.firstday;
            this.FILTROS.maxFecha_emision = rango.lastday;
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
            this.FILTROS.buscadoPorFechaCorte = false;
            this.FILTROS.toggleData_tablaCorteYReporteGrafico = this.FILTROS.analisisGrafico;
            this.toggleTableColumns_byMostrarDetallesProductosCorte = !this.FILTROS.mostrarDetallesProductosCorte;
            this.FILTROS.labelUnidadesMontosBuscados = this.FILTROS.agrupacionProductos === 'unidades' ? 'Unidades' : 'Montos';

            if (monicaReportes.sourceResportes === 'web')
                alert('Por el momento esta busqueda solo se ha planteado para la parte Local');
            else if (monicaReportes.sourceResportes === 'local') {
                this.DATA = [];
                this.GroupDATA = [];
                let campo;

                const filtro = {
                    tipoConsulta: this.FILTROS.tipoConsulta,
                    tipoReporte: this.FILTROS.tipoReporte,
                    skip: skip
                }

                if (this.FILTROS.tipoDeProducto)
                    filtro.estatus = this.FILTROS.tipoDeProducto;
                if (this.FILTROS.subProductoCategoriaSeleccionada.toString().length > 0)
                    filtro.subCategoriaProductos = this.FILTROS.subProductoCategoriaSeleccionada;
                if (this.FILTROS.categoriaProductosSeleccionada.toString().length > 0)
                    filtro.categoriaProductos = this.FILTROS.categoriaProductosSeleccionada;
                if (this.FILTROS.nombresBodegaSeleccionada.toString().length > 0)
                    filtro.bodega = this.FILTROS.nombresBodegaSeleccionada;
                if (this.FILTROS.soloPrroductosConExistencia)
                    filtro.soloPrroductosConExistencia = true;
                if (this.FILTROS.agregarProductosInactivos)
                    filtro.agregarProductosInactivos = true;

                //  AGREGAR VALORES
                if (this.FILTROS.tipoConsulta !== 'RFA08') {
                    if (this.FILTROS.tipoConsulta === 'porCodigo'
                        || this.FILTROS.tipoConsulta === 'porDescripcion'
                        || this.FILTROS.tipoConsulta === 'porProveedor')
                        filtro.valor = this.FILTROS.valor;
                    else if (this.FILTROS.tipoConsulta === 'porCantidad_En_Almacen'
                        || this.FILTROS.tipoConsulta === 'porPrecio') {
                        filtro.desde = this.FILTROS.desde;
                        filtro.hasta = this.FILTROS.hasta;
                    }
                }
                else {
                    filtro.GROUP = true;
                    //this.toggleTableColumns_porCorte = true;
                    filtro.tipoCorte = this.FILTROS.tipoCorte;

                    //  DATOS AGRUPADOS
                    if (this.FILTROS.tipoCorte === 'porLos_Mas_Vendidos'
                        || this.FILTROS.tipoCorte === 'porLos_Menos_Vendidos') {
                        this.FILTROS.buscadoPorFechaCorte = true;

                        if (!this.FILTROS.cantidadAgrupacionProductos) {
                            await MostrarMensage({
                                title: 'Falta Información',
                                message: `Débe ingresar una cantidad de los productos a buscar.`,
                                icon: 'error'
                            });
                            return;
                        }

                        filtro.agrupacionProductos = this.FILTROS.agrupacionProductos;
                        filtro.minFecha_emision = this.FILTROS.minFecha_emision;
                        filtro.maxFecha_emision = this.FILTROS.maxFecha_emision;
                        filtro.take = this.FILTROS.cantidadAgrupacionProductos;
                    }
                    else if (this.FILTROS.tipoCorte === 'porCategoria')
                        filtro.valor = this.FILTROS.subProductoCategoriaSeleccionada;
                }

                //  SI this.FILTROS.mostrarDetallesProductosCorte ES FALSO, NO SE BUSCAN LOS DETALLES DE LOS PRODUCTOS, PARA SOLO TRAER LA SUMATORIA DE CADA CATEGORIA.
                if (!this.FILTROS.mostrarDetallesProductosCorte) {
                    let result = await BuscarInformacionLocal('SendWebsocketServer/15', filtro);

                    for (item of result)
                        this.DATA.push(item);

                    //  SI ES UNA DATA AGRUPADA, SE ASIGNA EL CAMPO POR EL QUE SE VA A AGRUPAR.
                    if (filtro.GROUP) {
                        if (this.FILTROS.tipoCorte === 'porLos_Mas_Vendidos'
                            || this.FILTROS.tipoCorte === 'porLos_Menos_Vendidos')
                            campo = 'codigo_producto';
                        else if (this.FILTROS.tipoCorte === 'porCategoria')
                            campo = 'descripcion_categ';

                        for (let item of [... new Set(this.DATA.map(data => data[campo]))]) {
                            this.GroupDATA.push(
                                this.DATA.filter(el => el[campo] === item)
                            );
                        }
                    }
                }

                //
                const tableName = 'tablaInventarioYLiquidacion';
                let camposArray = [2, 10, 11, 12];

                //  SI NO TRAE DATA TERMINA EL PROCESO
                if (!this.FILTROS.mostrarDetallesProductosCorte)
                    if (this.DATA.length === 0)
                        return;

                // TOTALIZACIONES.
                filtro.SUM = true;
                result = await BuscarInformacionLocal('SendWebsocketServer/15', filtro);

                if (!filtro.GROUP) {
                    this.FILTROS.PaginatorLastPage = Math.floor(result[0].count / 20);
                    const jsonTotalizacion = { 'precio1': result[0].precio1, 'precio2': result[0].precio2, 'precio3': result[0].precio3, 'precio4': result[0].precio4 };
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
                    let totalPrecio1 = 0;
                    let totalPrecio2 = 0;
                    let totalPrecio3 = 0;
                    let totalPrecio4 = 0;
                    let totalCantidadMonto = 0;

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
                                        'descrip_producto': `${valorAgrupadoPor} => `,
                                        'precio1': result[index].precio1,
                                        'precio2': result[index].precio2,
                                        'precio3': result[index].precio3,
                                        'precio4': result[index].precio4
                                    });
                                }
                            }
                            totalPrecio1 += result[index].precio1;
                            totalPrecio2 += result[index].precio2;
                            totalPrecio3 += result[index].precio3;
                            totalPrecio4 += result[index].precio4;
                            totalCantidadMonto += result[index].totalCantidadMonto;
                        }

                        this.GroupDATA.push({ 'precio1': `${totalPrecio1}`, 'precio2': `${totalPrecio2}`, 'precio3': `${totalPrecio3}`, 'precio4': `${totalPrecio4}` });
                        this.DATA = this.GroupDATA.flat();

                        setTimeout(() => {
                            if (this.FILTROS.tipoCorte !== 'porLos_Mas_Vendidos'
                                && this.FILTROS.tipoCorte !== 'porLos_Menos_Vendidos')
                                TablaEstiloTotalizacionFilaAgrupadas('tablaInventarioYLiquidacion', [1, 2, ...camposArray], tableTotalPositionsRows);
                            TablaEstiloTotalizacionFila(document.getElementById('tablaInventarioYLiquidacion'), camposArray);
                        }, 1);
                    }
                    else {
                        //  SIN DETALLES DE PRODUCTOS
                        let reporteGraficoLabels = [];
                        let reporteGraficoTotales = [];

                        for (let index = 0; index < result.length; index++) {
                            const valorAgrupadoPor = this.PonerDescripcionDatosAgrupados(this.FILTROS.tipoCorte, index);

                            this.GroupDATA.push([]);
                            this.GroupDATA[index].push({
                                'categorizacionSinDetalles': `${valorAgrupadoPor} => `,
                                'precio1': result[index].precio1,
                                'precio2': result[index].precio2,
                                'precio3': result[index].precio3,
                                'precio4': result[index].precio4,
                                'totalCantidadMonto': result[index].totalCantidadMonto
                            });

                            totalPrecio1 += result[index].precio1;
                            totalPrecio2 += result[index].precio2;
                            totalPrecio3 += result[index].precio3;
                            totalPrecio4 += result[index].precio4;
                            totalCantidadMonto += result[index].totalCantidadMonto;

                            reporteGraficoLabels.push(valorAgrupadoPor.toString().trim().toUpperCase());
                            reporteGraficoTotales.push(result[index].totalCantidadMonto)
                        }

                        this.FILTROS.totalReporteBuscado = totalCantidadMonto;
                        this.GroupDATA.push({ 'precio1': `${totalPrecio1}`, 'precio2': `${totalPrecio2}`, 'precio3': `${totalPrecio3}`, 'precio4': `${totalPrecio4}`, 'totalCantidadMonto': `${totalCantidadMonto}` });
                        this.DATA = this.GroupDATA.flat();
                        setTimeout(() => {
                            let estilosCamposAgrupados = [0, 1, 2, 3, 4];
                            let estilosCamposTotal = [1, 2, 3, 4];
                            if (this.FILTROS.tipoCorte === 'porLos_Mas_Vendidos'
                                || this.FILTROS.tipoCorte === 'porLos_Menos_Vendidos') {
                                estilosCamposAgrupados = [...estilosCamposAgrupados, 5];
                                estilosCamposTotal = [...estilosCamposTotal, 5];
                            }

                            TablaEstiloTotalizacionFilaAgrupadas(tableName, estilosCamposAgrupados)
                            TablaEstiloTotalizacionFila(document.getElementById(tableName), estilosCamposTotal);
                        }, 1);

                        //  REPORTE GRAFICO.
                        let reporteGraficoBacground = new Array(reporteGraficoLabels.length);
                        reporteGraficoBacground.fill('#17A2B8');

                        if (this.FILTROS.chartAnalisisGrafico)
                            this.FILTROS.chartAnalisisGrafico.destroy();

                        let ctx = document.getElementById('ILreportesGraficos').getContext('2d');

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
                            setTimeout(() => document.getElementById('divTablaInventarioYLiquidacion').setAttribute('hidden', true), 2);
                        else
                            setTimeout(() => document.getElementById('ILdivGraficosDatosAgrupados').setAttribute('hidden', true), 2);
                    }
                }
            }
            //    //  GUARDARLO EN EL NAVEGADOR PARA CUANDO EL CLIENTE LE DE A IMPRIMIR.
            //    //localStorage.setItem('sumatoriasEstadoCuentaCliente', JSON.stringify(result[0]));
        },

        PonerDescripcionDatosAgrupados(tipoCorte, index) {
            switch (tipoCorte) {
                case 'porLos_Mas_Vendidos':
                case 'porLos_Menos_Vendidos':
                    return `${result[index].descrip_producto.toUpperCase()} - (${result[index].codigo_producto.toUpperCase()})`
                case 'porCategoria':
                    return result[index].descripcion_categ.toUpperCase();
            }
        },

        async ModalBuscarCodigo() {
            this.modalData.clientes = [];

            $('#ILBuscarCodigoModal').modal('hide');

            const filtros = {
                skip: this.modalData.PaginatorIndex
            };

            if (this.modalData.codigoABuscar)
                filtros.name = this.modalData.codigoABuscar;

            this.modalData.data = await monicaReportes.BuscarData('proveedores', filtros);
            filtros.SUM = true;
            this.modalData.PaginatorLastPage = Math.floor((await monicaReportes.BuscarData('proveedores', filtros))[0].count / 20);

            $('#ILBuscarCodigoModal').modal('show');
        },

        ModalClienteSleccionado(value) {
            $('#ILBuscarCodigoModal').modal('hide');

            this.FILTROS.valor = value;
        },

        async TipoConsultaSelectChanged() {
            //  LIMPIAR TODOS LOS CAMPOS.
            this.FILTROS.desde = '';
            this.FILTROS.hasta = '';
            this.FILTROS.valor = '';
            this.FILTROS.tipoCorte = '';
            this.FILTROS.subProductoCategoriaSeleccionada = '';
            this.FILTROS.categoriaProductosSeleccionada = '';
            this.FILTROS.cantidadAgrupacionProductos = 10;
            this.FILTROS.nombresBodegaSeleccionada = '';

            //  BUSCAR INFORMACION SI ES NECESARIA O HACER CAMBIOS SEGUN EL TIPO DE CONSULTA.
            switch (this.FILTROS.tipoConsulta) {
                case 'RFA08':
                    this.FILTROS.maxFecha_emision = monicaReportes.fechaHoy;
                    this.FILTROS.minFecha_emision = monicaReportes.fechaHoy;
                    this.FILTROS.tipoCorte = 'porLos_Mas_Vendidos';
                    break;
            }
        },

        async TipoCorteChanged() {
            this.FILTROS.desde = '';
            this.FILTROS.hasta = '';
            this.FILTROS.valor = '';
            this.FILTROS.subProductoCategoriaSeleccionada = '';
            this.FILTROS.categoriaProductosSeleccionada = '';
            this.FILTROS.cantidadAgrupacionProductos = 10;
            this.FILTROS.nombresBodegaSeleccionada = '';
        },

        LlenarSelect(value) {
            monicaReportes.BuscarData(value);
        },

        AjustesAvanzadosFiltros() {
            $('#ILreporteModalFormato').modal('show');
            $('#ILreporteModalFormato').collapse('hide');
        },
    },

    filters: {
        FilterUppercase: value => {
            return monicaReportes.$options.filters.FilterUppercase(value);
        },

        FilterDateFormat: value => {
            return monicaReportes.$options.filters.FilterDateFormat(value);
        },

        FilterDateFormat2: value => {
            return monicaReportes.$options.filters.FilterDateFormat2(value);
        },

        FilterStringToMoneyFormat: value => {
            return monicaReportes.$options.filters.FilterStringToMoneyFormat(value);
        },

        FilterTipoProducto: value => {
            return monicaReportes.$options.filters.FilterTipoProducto(value);
        }
    },
});