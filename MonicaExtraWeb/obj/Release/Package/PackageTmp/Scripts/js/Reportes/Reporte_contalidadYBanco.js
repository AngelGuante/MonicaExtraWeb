const reporte_contabilidadYBanco = new Vue({
    el: '#contabilidadYBanco',

    data: {
        usuarioPuedeProbarNuevasActualizaciones: localStorage.getItem("Number") === '7',
        rncOCedula: localStorage.getItem('Registro_Tributario_empresa').trim(),

        DATA: [],
        FILTROS: {
            tipoReporte: 'contabilidad',
            tipoConsulta: 'Plan_de_Cuentas',
            tipoBusqueda: 'codigo',
            clasificacion: '',
            valor: '',
            ConBalance: false,

            periodoMesSeleccionado: '01',
            periodoAnioSeleccionado: new Date().getFullYear(),
            periodoAnios: [],
            erroresNCF: 0,

            periodoMesSeleccionadoBuscado: '',
            periodoAnioSeleccionadoBuscado: 0,

            PaginatorIndex: 0,
            PaginatorLastPage: 0,
        },

        ProcesoCrear: {
            productosTabla1: [],
            productosTabla2: [],
        }
    },

    watch: {
        'FILTROS.tipoReporte'() {
            this.Limpiar();
        },
    },

    methods: {
        async Buscar(skip) {
            if (skip === undefined) {
                skip = 0;
                this.FILTROS.PaginatorIndex = 0;
            }

            this.FILTROS.periodoMesSeleccionadoBuscado = this.FILTROS.periodoMesSeleccionado;
            this.FILTROS.periodoAnioSeleccionadoBuscado = this.FILTROS.periodoAnioSeleccionado;
            this.FILTROS.erroresNCF = 0;

            this.DATA = [];

            const filtro = {
                tipoConsulta: this.FILTROS.tipoConsulta,
                tipoReporte: this.FILTROS.tipoReporte,
                skip: skip
            }

            switch (this.FILTROS.tipoConsulta) {
                case 'Plan_de_Cuentas':
                    filtro.clasificacion = this.FILTROS.clasificacion;
                    filtro.omitirPaginacion = true;

                    if (this.FILTROS.ConBalance)
                        filtro.conBalance = this.FILTROS.ConBalance;

                    if (this.FILTROS.valor)
                        switch (this.FILTROS.tipoBusqueda) {
                            case "codigo":
                                filtro.code = this.FILTROS.valor;
                                break;
                            case "descripcion":
                                filtro.descripcion = this.FILTROS.valor;
                                break;
                        }
                    break;
                case 'Informe_608':
                case 'Informe_607':
                case 'Informe_606':
                    filtro.mes = this.FILTROS.periodoMesSeleccionado;
                    filtro.anio = this.FILTROS.periodoAnioSeleccionado;
                    break;
            }

            let result = await BuscarInformacionLocal('SendWebsocketServer/24', filtro);

            for (item of result) {
                this.DATA.push(item);

                if (this.FILTROS.tipoConsulta === 'Informe_608')
                    if (this.$options.filters.FilterValidacionesNCF(item.ncf) !== undefined)
                        this.FILTROS.erroresNCF++;
                if (this.FILTROS.tipoConsulta === 'Informe_607'
                    || this.FILTROS.tipoConsulta === 'Informe_606') {
                    if (item.reteiva_monto.length > 0 && Number(item.reteiva_monto) > 0)
                        item.FechaRetencion = this.$options.filters.FilterRemoverGuiones(item.fecha_emision);
                    else
                        item.FechaRetencion = '';

                    item.Efectivo = 0;
                    item.Cheque = 0;
                    item.TarjetaDebito = 0;
                    item.VentaCredito = 0;
                    item.Bonos = 0;
                    item.Permuta = 0;
                    item.MontoFacturado = Number(item.MontoFacturado) - Number(item.impuesto_monto) - Number(item.MontoPropina);

                    switch (Number(item.LENcodigo_termino)) {
                        case 1:
                            item.Efectivo = item.MontoFacturado
                            break;
                        case 2:
                            item.Cheque = item.MontoFacturado
                            break;
                        case 3:
                            item.TarjetaDebito = item.MontoFacturado
                            break;
                        case 4:
                            item.VentaCredito = item.MontoFacturado
                            break;
                        case 8:
                            item.Bonos = item.MontoFacturado
                            break;
                        case 5:
                            item.Permuta = item.MontoFacturado
                            break;
                    }

                    const LENcodigo_termino = Number(item.LENcodigo_termino);
                    if (LENcodigo_termino !== 8 &&
                        (LENcodigo_termino <= 0
                            || LENcodigo_termino >= 6)) {
                        item.OtrasFormas = i
                        tem.MontoFacturado;
                    }
                    else
                        item.OtrasFormas = 0;

                    item.Estatus = '';
                    if (item.registro_tributario === '') {
                        item.Estatus += '1 - No puede estar vacío. ';
                        this.FILTROS.erroresNCF++;
                    }
                    if (Number(item.LENTipoIdentificacion) === 0 && !item.ncf.startsWith('B02')) {
                        item.Estatus += '2 - No puede estar vacío. ';
                        this.FILTROS.erroresNCF++;
                    }
                    if (item.ncf === '') {
                        item.Estatus += '3 - No puede estar vacío. ';
                        this.FILTROS.erroresNCF++;
                    }
                    if (item.TipoIngreso === '') {
                        item.Estatus += '5 - No puede estar vacío. ';
                        this.FILTROS.erroresNCF++;
                    }
                    if (item.fecha_emision === '') {
                        item.Estatus += '6 - No puede estar vacío. ';
                        this.FILTROS.erroresNCF++;
                    }
                    if (item.MontoFacturado === '') {
                        item.Estatus += '8 - No puede estar vacío. ';
                        this.FILTROS.erroresNCF++;
                    }
                    if (item.Efectivo === 0 && item.Cheque === 0 && item.TarjetaDebito === 0
                        && item.VentaCredito === 0 && item.Bonos === 0 && item.Permuta === 0
                        && item.OtrasFormas === 0) {
                        item.Estatus += 'Almenos uno de los siguientes campos debe tener un valor: 17 hasta el 23.';
                        this.FILTROS.erroresNCF++;
                    }
                }
            }
        },

        ExportarATXT() {
            let txtContent = '';
            let informe;

            if (this.FILTROS.tipoConsulta === 'Informe_608')
                informe = '608';
            else if (this.FILTROS.tipoConsulta === 'Informe_607')
                informe = '607';
            else if (this.FILTROS.tipoConsulta === 'Informe_606')
                informe = '606';

            txtContent += `${informe}|${this.rncOCedula.replaceAll(/-/g, '')}|${this.FILTROS.periodoAnioSeleccionadoBuscado}${this.FILTROS.periodoMesSeleccionadoBuscado}|${this.DATA.length} \n`;

            this.DATA.forEach(item => {
                txtContent += (
                    `${item.registro_tributario}|${this.$options.filters.FilterTipoIdentificacion(item.LENTipoIdentificacion)}|${item.ncf}|${item.ncfModificado}|${item.TipoIngreso}|${item.fecha_emision}|${item.FechaRetencion}|${item.MontoFacturado}|${item.impuesto_monto}|${item.reteiva_monto}||||||${this.validarCeroParaExportarTXT(item.MontoPropina)}|${this.validarCeroParaExportarTXT(item.Efectivo)}|${this.validarCeroParaExportarTXT(item.Cheque)}|${this.validarCeroParaExportarTXT(item.TarjetaDebito)}|${this.validarCeroParaExportarTXT(item.VentaCredito)}|${this.validarCeroParaExportarTXT(item.Bonos)}|${this.validarCeroParaExportarTXT(item.Permuta)}|${this.validarCeroParaExportarTXT(item.OtrasFormas)}--\n`).replaceAll(/ /g, '').replaceAll(/-/g, '').replaceAll(/\|0\|/g, '||');
            });

            saveDownloadedData(`${informe}_${new Date().toISOString().substr(0, 10)}`, txtContent);
        },

        validarCeroParaExportarTXT(monto) {
            return monto == '0' ? '' : monto;

        },

        TipoConsultaSelectChanged() {
            this.Limpiar();

            switch (this.FILTROS.tipoConsulta) {
                case "Informe_608":
                case "Informe_607":
                case "Informe_606":
                    for (let i = 2000; i <= this.FILTROS.periodoAnioSeleccionado; i++)
                        this.FILTROS.periodoAnios.unshift(i);
                    break;
            }
        },

        Limpiar() {
            monicaReportes.LimpiarTablas();
            this.FILTROS.valor = '';
            this.FILTROS.clasificacion = 'A';
            this.FILTROS.periodoMesSeleccionado = '01';
            this.FILTROS.periodoAnioSeleccionado = new Date().getFullYear();
        },

        AjustesAvanzadosFiltros() {
            $('#CBreporteModalFormato').modal('show');
        }
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

        FilterNivelCuenta: value => {
            if (value === undefined)
                return;

            switch (value) {
                case "S":
                    return 'CUENTA CONTROL';
                default:
                    return 'DETALLES';
            }
        },

        FilterCentroCostos: value => {
            if (value === undefined)
                return;

            switch (value) {
                case "S":
                    return 'SI';
                default:
                    return 'NO';
            }
        },

        FilterClasificacion: value => {
            if (value === undefined)
                return;

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
        },

        FilterValidacionesNCF: value => {
            if (value.length !== 11
                && value.length !== 13
                && value.length !== 19) {
                return "Longitud de NCF Incorrecta.";
            }
            if (value[0] !== 'A'
                && value[0] !== 'B'
                && value[0] !== 'E') {
                return "Error de Letra en NCF.";
            }
            if (value[value.length - 1] === "0") {
                return "NCF Invalido.";
            }
            if (value.length === 11
                || value.length === 13) {
                const caracteres = `${value[1]}${value[2]}`
                if (caracteres !== "01"
                    && caracteres !== "02"
                    && caracteres !== "14"
                    && caracteres !== "15"
                    && caracteres !== "16")
                    return "Error de Tipo de NCF.";
            }
            if (value.length === 19) {
                const caracteres = `${value[9]}${value[10]}`
                if (caracteres !== "01"
                    && caracteres !== "02"
                    && caracteres !== "14"
                    && caracteres !== "15"
                    && caracteres !== "16")
                    return "Error de Tipo de NCF.";
            }
        },

        FilterTipoIdentificacion: value => {
            const val = Number(value);
            if (val === 0)
                return '';
            else if (val === 9)
                return 1;
            else if (val === 11)
                return 2;
            else
                return 3;
        },

        FilterRemoverGuiones: value => {
            return (value.replaceAll(/-/g, '')).substr(0, 8);
        }
    },
});