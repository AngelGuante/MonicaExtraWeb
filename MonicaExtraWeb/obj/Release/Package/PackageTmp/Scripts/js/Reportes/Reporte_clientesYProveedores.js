﻿const reporte_clientesYProveedores = new Vue({
    el: '#clientesYProveedores',

    data: {
        DATA: [],
        GroupDATA: [],
        FILTROS: {
            tipoReporte: 'clientes',
            tipoCorte: 'porLos_Mas_Recientes',
            tipoConsulta: 'porNombre',
            giroNegocioSeleccionada: '',
            giroNegocios: [],
            giroNegocioPvSeleccionada: '',
            giroNegociosPv: [],
            tipoEmpresaSeleccionada: '',
            vendedorSeleccionado: '',
            vendedores: [],
            categoriaClientesSeleccionada: '',
            categoriasClientes: [],
            categoriaProveedoresSeleccionada: '',
            categoriasProveedores: [],
            terminoDePagoSeleccionado: '',
            terminoDePago: [],
            terminoDePagoPvSeleccionado: '',
            terminoDePagoPv: [],
            impuestoSeleccionadoSeleccionado: '',
            impuestos: [],
            minFecha_emision: '',
            maxFecha_emision: '',
            desdeHastaRango: 0,
            estatus: '',
            //tipoDeProductoSeleccionado: '1',
            //desde: '',
            //hasta: '',
            valor: '',
            //agrupacionProductos: 'unidades',
            registros: 10,

            Activos: false,
            ConBalance: false,
            SinImpt: false,
            SinRnc: false,

            mostrarDetallesProductosCorte: false,
            toggleTableColumns_byMostrarDetallesProductosCorte: true,

            analisisGrafico: false,
            chartAnalisisGrafico: '',
            //toggleData_tablaCorteYReporteGrafico: false,

            //buscadoPorFechaCorte: false,
            //fechaMinReporteBuscado: '',
            //fechaMaxReporteBuscado: '',
            //categoriaClientesBuscada: '',
            //totalReporteBuscado: '',
            //labelUnidadesMontosBuscados: '',

            //soloPrroductosConExistencia: false,
            //agregarProductosInactivos: false,

            //PaginatorIndex: 0,
            //PaginatorLastPage: 0,
        },

        //modalData: {
        //    data: [],
        //    codigoABuscar: '',
        //    PaginatorIndex: 0,
        //    PaginatorLastPage: 0
        //}
    },

    watch: {
        'FILTROS.tipoReporte'() {
            this.Limpiar();
        },
        'FILTROS.analisisGrafico'() {
            //if (this.FILTROS.analisisGrafico) {
            //    this.FILTROS.mostrarDetallesProductosCorte = true;
            //    document.getElementById('ILcheckboxMostrarDetalles').setAttribute('disabled', true);

            //    if (this.toggleTableColumns_byMostrarDetallesProductosCorte)
            //        return;

            //    const divTabla = document.getElementById('divTablaInventarioYLiquidacion');
            //    if (divTabla)
            //        divTabla.setAttribute('hidden', true);
            //    document.getElementById('ILdivGraficosDatosAgrupados').removeAttribute('hidden');
            //}
            //else {
            //    document.getElementById('ILcheckboxMostrarDetalles').removeAttribute('disabled');

            //    if (this.toggleTableColumns_byMostrarDetallesProductosCorte)
            //        return;

            //    const divTabla = document.getElementById('divTablaInventarioYLiquidacion');
            //    if (divTabla)
            //        divTabla.removeAttribute('hidden');
            //    document.getElementById('ILdivGraficosDatosAgrupados').setAttribute('hidden', true);
            //}
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

                switch (this.FILTROS.tipoReporte) {
                    case 'clientes':
                        if (this.FILTROS.giroNegocioSeleccionada)
                            filtro.id_giro = this.FILTROS.giroNegocioSeleccionada;
                        if (this.FILTROS.categoriaClientesSeleccionada)
                            filtro.categoriaP = this.FILTROS.categoriaClientesSeleccionada;
                        break;
                    case 'proveedores':
                        if (this.FILTROS.giroNegocioPvSeleccionada)
                            filtro.id_giro = this.FILTROS.giroNegocioPvSeleccionada;
                        if (this.FILTROS.categoriaProveedoresSeleccionada)
                            filtro.categoriaP = this.FILTROS.categoriaProveedoresSeleccionada;
                        break;
                }
                if (this.FILTROS.tipoEmpresaSeleccionada)
                    filtro.empresa = this.FILTROS.tipoEmpresaSeleccionada;
                if (this.FILTROS.vendedorSeleccionado)
                    filtro.Codigo_vendedor = this.FILTROS.vendedorSeleccionado;
                if (this.FILTROS.Activos)
                    filtro.activo = this.FILTROS.Activos;
                if (this.FILTROS.ConBalance)
                    filtro.conBalance = this.FILTROS.ConBalance;
                if (this.FILTROS.SinImpt)
                    filtro.sinImpt = this.FILTROS.SinImpt;
                if (this.FILTROS.SinRnc)
                    filtro.sinRnc = this.FILTROS.SinRnc;

                //  AGREGAR VALORES
                if (this.FILTROS.tipoConsulta !== 'RFA08') {
                    if (this.FILTROS.tipoConsulta !== 'porTermino'
                        && this.FILTROS.tipoConsulta !== 'porTipo_de_Impuesto')
                        filtro.valor = (this.FILTROS.valor).trim();
                    else if (this.FILTROS.tipoConsulta === 'porTermino') {
                        switch (this.FILTROS.tipoReporte) {
                            case 'clientes':
                                filtro.valor = this.FILTROS.terminoDePagoSeleccionado;
                                break;
                            case 'proveedores':
                                filtro.valor = this.FILTROS.terminoDePagoPvSeleccionado;
                                break;
                        }
                    }
                    else if (this.FILTROS.tipoConsulta === 'porTipo_de_Impuesto')
                        filtro.valor = this.FILTROS.impuestoSeleccionadoSeleccionado;
                }
                else {
                    //  DATOS AGRUPADOS
                    filtro.GROUP = true;
                    filtro.tipoCorte = this.FILTROS.tipoCorte;

                    if (this.FILTROS.tipoCorte === 'porLos_Mas_Recientes'
                        || this.FILTROS.tipoCorte === 'porLos_Mas_Antiguos') {

                        if (!this.FILTROS.registros) {
                            await MostrarMensage({
                                title: 'Falta Información',
                                message: `Débe ingresar una cantidad a buscar.`,
                                icon: 'error'
                            });
                            return;
                        }

                        filtro.take = this.FILTROS.registros;
                    }
                    else if (this.FILTROS.tipoCorte === 'Sin_Actividad') {
                        filtro.desde = this.FILTROS.minFecha_emision;
                        filtro.hasta = this.FILTROS.maxFecha_emision;
                    }
                    else if (this.FILTROS.tipoCorte === 'Por_Categoria')
                        switch (this.FILTROS.tipoReporte) {
                            case 'clientes':
                                filtro.valor = this.FILTROS.categoriaClientesSeleccionada;
                                break;
                            case 'proveedores':
                                filtro.valor = this.FILTROS.categoriaProveedoresSeleccionada;
                                break;
                        }
                    else if (this.FILTROS.tipoCorte === 'Por_Vendedor')
                        filtro.valor = this.FILTROS.vendedorSeleccionado;
                    else if (this.FILTROS.tipoCorte === 'Por_Tipo')
                        filtro.valor = this.FILTROS.tipoEmpresaSeleccionada;
                }

                //  SI this.FILTROS.mostrarDetallesProductosCorte ES FALSO, NO SE BUSCAN LOS DETALLES DE LOS PRODUCTOS, PARA SOLO TRAER LA SUMATORIA DE CADA CATEGORIA.
                if (!this.FILTROS.mostrarDetallesProductosCorte) {
                    let result = await BuscarInformacionLocal('SendWebsocketServer/19', filtro);

                    for (item of result)
                        this.DATA.push(item);

                    //  EXEPTUANDO AQUELLOS REPORTES QUE NO SE VAN A AGRUPAR.
                    if (filtro.GROUP
                        && (this.FILTROS.tipoCorte === 'porLos_Mas_Recientes'
                            || this.FILTROS.tipoCorte === 'porLos_Mas_Antiguos'
                            || this.FILTROS.tipoCorte === 'Sin_Actividad'))
                        return;

                    //  SI ES UNA DATA AGRUPADA, SE ASIGNA EL CAMPO POR EL QUE SE VA A AGRUPAR.
                    if (filtro.GROUP) {
                        if (this.FILTROS.tipoCorte === 'Por_Categoria')
                            campo = 'categoriaDesc';
                        else if (this.FILTROS.tipoCorte === 'Por_Giro')
                            campo = 'giroDesc';
                        else if (this.FILTROS.tipoCorte === 'Por_Vendedor')
                            campo = 'Nombre_vendedor';
                        else if (this.FILTROS.tipoCorte === 'Por_Tipo')
                            campo = 'tipo_empresa';

                        for (let item of [... new Set(this.DATA.map(data => data[campo]))]) {
                            this.GroupDATA.push(
                                this.DATA.filter(el => el[campo] === item)
                            );
                        }
                    }
                }

                const tableName = 'tablaClientesYProveedores';
                let camposArray = [1];

                //  SI NO TRAE DATA TERMINA EL PROCESO
                if (!this.FILTROS.mostrarDetallesProductosCorte) {
                    if (this.DATA.length === 0)
                        return;
                }

                // TOTALIZACIONES.
                //filtro.SUM = true;
                //result = await BuscarInformacionLocal('SendWebsocketServer/19', filtro);

                if (!filtro.GROUP) {
                    //this.FILTROS.PaginatorLastPage = Math.floor(result[0].count / 20);
                    //const jsonTotalizacion = { 'precio1': result[0].precio1, 'precio2': result[0].precio2, 'precio3': result[0].precio3, 'precio4': result[0].precio4 };
                    //this.DATA.push(jsonTotalizacion);

                    //let interval = setInerval(() => {
                    //    let tabla = document.getElementById(tableName);

                    //    if (tabla) {
                    //        TablaEstiloTotalizacionFila(tabla, camposArray)

                    //        clearInterval(interval);
                    //    }
                    //}, 0);
                }
                else {
                    //SI LA DATA ESTA AGRUPADA:
                    let tableTotalPositionsRows = [];

                    //  SI LOS DATOS POR LOS QUE SE VAN A AGRUPAR, NO TIENEN SUMATORIA Y SOLO SE AGRUPAN EL CAMPO POR EL QUE SE AGRUPAN
                    //  SE SACA APARTIR DEL PRIMER result.
                    if (filtro.GROUP
                        && (this.FILTROS.tipoCorte === 'Por_Categoria'
                            || this.FILTROS.tipoCorte === 'Por_Giro'
                            || this.FILTROS.tipoCorte === 'Por_Vendedor'
                            || this.FILTROS.tipoCorte === 'Por_Tipo')) {
                        result = [];
                        for (item of this.GroupDATA)
                            result.push(item[0][campo]);
                    }
                    
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


                                //  SI LOS DATOS POR LOS QUE SE VAN A AGRUPAR, NO TIENEN SUMATORIA Y SOLO SE AGRUPAN EL CAMPO POR EL QUE SE COMPARA
                                //  SE SACA DE MANERA DIFERENTE.
                                let valorAComparar = '';
                                if (this.FILTROS.tipoCorte === 'Por_Categoria'
                                    || this.FILTROS.tipoCorte === 'Por_Giro'
                                    || this.FILTROS.tipoCorte === 'Por_Vendedor'
                                    || this.FILTROS.tipoCorte === 'Por_Tipo')
                                    valorAComparar = result[index];
                                else
                                    valorAComparar = result[index][0];

                                if (this.GroupDATA[i][0][campo] === valorAComparar) {
                                    this.GroupDATA[i].push({
                                        'nombre': `${valorAgrupadoPor}`,
                                    });
                                }
                            }
                        }

                        this.DATA = this.GroupDATA.flat();

                        setTimeout(() => {
                            TablaEstiloTotalizacionFilaAgrupadas(tableName, camposArray, tableTotalPositionsRows, false);
                            //TablaEstiloTotalizacionFila(document.getElementById(tableName), camposArray);
                        }, 1);
                    }
                    else {
                        //  SIN DETALLES DE PRODUCTOS
                        //let reporteGraficoLabels = [];
                        //let reporteGraficoTotales = [];

                        //for (let index = 0; index < result.length; index++) {
                        //    const valorAgrupadoPor = this.PonerDescripcionDatosAgrupados(this.FILTROS.tipoCorte, index);

                        //    this.GroupDATA.push([]);
                        //    this.GroupDATA[index].push({
                        //        'categorizacionSinDetalles': `${valorAgrupadoPor} => `,
                        //        'precio1': result[index].precio1,
                        //        'precio2': result[index].precio2,
                        //        'precio3': result[index].precio3,
                        //        'precio4': result[index].precio4,
                        //        'totalCantidadMonto': result[index].totalCantidadMonto
                        //    });

                        //    totalPrecio1 += result[index].precio1;
                        //    totalPrecio2 += result[index].precio2;
                        //    totalPrecio3 += result[index].precio3;
                        //    totalPrecio4 += result[index].precio4;
                        //    totalCantidadMonto += result[index].totalCantidadMonto;

                        //    reporteGraficoLabels.push(valorAgrupadoPor.toString().trim().toUpperCase());
                        //    reporteGraficoTotales.push(result[index].totalCantidadMonto)
                        //}

                        //this.FILTROS.totalReporteBuscado = totalCantidadMonto;
                        //this.GroupDATA.push({ 'precio1': `${totalPrecio1}`, 'precio2': `${totalPrecio2}`, 'precio3': `${totalPrecio3}`, 'precio4': `${totalPrecio4}`, 'totalCantidadMonto': `${totalCantidadMonto}` });
                        //this.DATA = this.GroupDATA.flat();
                        //setTimeout(() => {
                        //    let estilosCamposAgrupados = [0, 1, 2, 3, 4];
                        //    let estilosCamposTotal = [1, 2, 3, 4];
                        //    if (this.FILTROS.tipoCorte === 'porLos_Mas_Vendidos'
                        //        || this.FILTROS.tipoCorte === 'porLos_Menos_Vendidos') {
                        //        estilosCamposAgrupados = [...estilosCamposAgrupados, 5];
                        //        estilosCamposTotal = [...estilosCamposTotal, 5];
                        //    }

                        //    TablaEstiloTotalizacionFilaAgrupadas(tableName, estilosCamposAgrupados)
                        //    TablaEstiloTotalizacionFila(document.getElementById(tableName), estilosCamposTotal);
                        //}, 1);

                        ////  REPORTE GRAFICO.
                        //let reporteGraficoBacground = new Array(reporteGraficoLabels.length);
                        //reporteGraficoBacground.fill('#17A2B8');

                        //if (this.FILTROS.chartAnalisisGrafico)
                        //    this.FILTROS.chartAnalisisGrafico.destroy();

                        //let ctx = document.getElementById('ILreportesGraficos').getContext('2d');

                        //this.FILTROS.chartAnalisisGrafico = new Chart(ctx, {
                        //    type: 'horizontalBar',
                        //    data: {
                        //        labels: reporteGraficoLabels,
                        //        datasets: [{
                        //            label: `Análisis de ${this.FILTROS.tipoReporte[0].toUpperCase() + this.FILTROS.tipoReporte.substr(1)} por ${(this.FILTROS.tipoCorte).replace('por', '')}`,
                        //            backgroundColor: reporteGraficoBacground,
                        //            data: reporteGraficoTotales
                        //        }]
                        //    },
                        //});

                        ////  OCULTAR EL DIV CORRESPONDIENTE. SI SE QUIERE VER LA DATA COMO TABLA SE OCULTA EL DIV DE GRAFICOS Y VICEVERSA.
                        //if (this.FILTROS.toggleData_tablaCorteYReporteGrafico)
                        //    setTimeout(() => document.getElementById('divTablaInventarioYLiquidacion').setAttribute('hidden', true), 2);
                        //else
                        //    setTimeout(() => document.getElementById('ILdivGraficosDatosAgrupados').setAttribute('hidden', true), 2);
                    }
                }
            }
            //    //  GUARDARLO EN EL NAVEGADOR PARA CUANDO EL CLIENTE LE DE A IMPRIMIR.
            //    //localStorage.setItem('sumatoriasEstadoCuentaCliente', JSON.stringify(result[0]));
        },

        PonerDescripcionDatosAgrupados(tipoCorte, index) {
            switch (tipoCorte) {
                case 'Por_Categoria':
                case 'Por_Giro':
                case 'Por_Vendedor':
                    return result[index].toUpperCase();
                case 'Por_Tipo':
                    return this.$options.filters.FilterTipoEmpresa(result[index]);
            }
        },

        TipoConsultaSelectChanged() {
            this.Limpiar();

            switch (this.FILTROS.tipoConsulta) {
                case 'RFA08':
                    this.FILTROS.maxFecha_emision = monicaReportes.fechaHoy;
                    this.FILTROS.minFecha_emision = monicaReportes.fechaHoy;
                    this.FILTROS.tipoCorte = 'porLos_Mas_Recientes';
                    break;
            }
        },

        TipoCorteChanged() {
            this.Limpiar();
        },

        Limpiar() {
            monicaReportes.LimpiarTablas();
            this.FILTROS.valor = '';
            this.FILTROS.giroNegocioSeleccionada = '';
            this.FILTROS.giroNegocioPvSeleccionada = '';
            this.FILTROS.terminoDePagoSeleccionado = '';
            this.FILTROS.terminoDePagoPvSeleccionado = '';
            this.FILTROS.impuestoSeleccionadoSeleccionado = '';
            this.FILTROS.categoriaProveedoresSeleccionada = '';
            this.FILTROS.categoriaClientesSeleccionada = '';
            this.FILTROS.vendedorSeleccionado = '';
            this.FILTROS.tipoEmpresaSeleccionada = '';
            this.FILTROS.registros = 10;
        },

        LlenarSelect(value) {
            monicaReportes.BuscarData(value);
        },

        AjustesAvanzadosFiltros() {
            $('#CPreporteModalFormato').modal('show');
            $('#CPreporteModalFormato').collapse('hide');
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
        },

        FilterTipoEmpresa: value => {
            switch (value) {
                case 1:
                case "1":
                    return "CREDITO FISCAL";
                case 2:
                case "2":
                    return "DE CONSUMO";
                case 3:
                case "3":
                    return "GUBERNAMENTAL";
                case 4:
                    return "ESPECIAL";
                case 5:
                case "5":
                    return "EXPORTACIONES";
            }
        }
    },
});