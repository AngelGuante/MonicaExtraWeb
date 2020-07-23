const reporte_clienteIndividualStatus = new Vue({
    el: '#clienteIndividualStatus',

    data: {
        ApiReportes: '/API/Reportes/',

        IndividualClientStatusDATA: [],
        IndividualClientStatusFILTROS: {
            codCliente: '',
            mostrarNCF: false,
            soloDocsVencidos: false,
            incluirFirmas: false,
            incluirMoras: false
        }
    },

    methods: {
        async Buscar() {
            monicaReportes.LimpiarTablas();

            this.Reportes.IndividualClientStatusFILTROS.codCliente = document.getElementById('inputCodigoClienteFiltroReporte').value;

            if (!this.Reportes.IndividualClientStatusFILTROS.codCliente) {
                document.getElementById('validationReportesCodigoCliente').removeAttribute('hidden');
                return;
            }
            else
                document.getElementById('validationReportesCodigoCliente').setAttribute('hidden', true);

            if (monicaReportes.sourceResportes === 'web')
                this.ValidarCampoCodigoCliente();
            else if (monicaReportes.sourceResportes === 'local') {
                this.Reportes.IndividualClientStatusDATA = [];

                const filtro = {
                    clientCode: this.Reportes.IndividualClientStatusFILTROS.codCliente.trim(),
                    SoloDocsVencidos: this.Reportes.IndividualClientStatusFILTROS.soloDocsVencidos,
                }

                let result = await BuscarInformacionLocal('SendWebsocketServer/1', filtro);

                for (item of result)
                    this.Reportes.IndividualClientStatusDATA.push(item);

                for (item of this.Reportes.IndividualClientStatusDATA)
                    item.diasTrancurridos = DaysDiff(item.fecha_emision, new Date().toISOString().slice(0, 10));

                //  TOTALIZACIONES.
                if (this.Reportes.IndividualClientStatusDATA.length === 0)
                    return;

                filtro.SUM = true;
                result = await BuscarInformacionLocal('SendWebsocketServer/1', filtro);

                this.Reportes.IndividualClientStatusDATA.push(
                    { '': '', '': '', '': '', '': '', 'monto': result[0].sumatoriaMontos, 'pagosAcumulados': result[0].sumatoriaPagosAcumulados, 'balance': result[0].sumatoriaBalance });

                let interval = setInterval(() => {
                    let tabla = document.getElementById('tablaEstadoCuentaCliente');

                    if (tabla) {
                        TablaEstiloTotalizacionFila(tabla, [4, 5, 6])

                        clearInterval(interval);
                    }
                }, 0);

                //  GUARDARLO EN EL NAVEGADOR PARA CUANDO EL CLIENTE LE DE A IMPRIMIR.
                localStorage.setItem('sumatoriasEstadoCuentaCliente', JSON.stringify(result[0]));
            }
        },

        ValidarCampoCodigoCliente() {
            if (!monicaReportes.codsClientes.includes(this.Reportes.IndividualClientStatusFILTROS.codCliente)) {
                MostrarMensage({
                    title: 'Código No Encontrado',
                    message: `El código ${this.Reportes.IndividualClientStatusFILTROS.codCliente}, no ha sido encontrado, favor ingrese un código válido.`,
                    icon: 'info'
                });
                return;
            }

            document.getElementById('cargando').removeAttribute('hidden');
            this.BuscarCliente();
        },

        BuscarCliente() {
            const filtro = {
                clientCode: this.Reportes.IndividualClientStatusFILTROS.codCliente,
                SoloDocsVencidos: this.Reportes.IndividualClientStatusFILTROS.soloDocsVencidos,
                IncluirMoras: this.Reportes.IndividualClientStatusFILTROS.incluirMoras
            }

            $.get(`..${this.ApiReportes}GetIndividualClientStatus`, { filtro }, response => {
                this.Reportes.IndividualClientStatusDATA = [];

                for (item of response.IndividualClientStatusDATA)
                    this.Reportes.IndividualClientStatusDATA.push(item);

                for (item of response.IndividualClientStatusDATA)
                    item.diasTrancurridos = DaysDiff(item.fecha_emision, item.fecha_vcmto),

                        document.getElementById('cargando').setAttribute('hidden', true);

                if (!this.Reportes.IndividualClientStatusDATA.length)
                    MostrarMensage({
                        title: 'Sin registros',
                        message: `El código ${this.Reportes.IndividualClientStatusFILTROS.codCliente}, no tiene ningún registro.`,
                        icon: 'info'
                    });
            });
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