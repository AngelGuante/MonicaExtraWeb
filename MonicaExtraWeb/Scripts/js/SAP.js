var app = new Vue({
    el: '#app',
    data: {
        ApiRuta: '/API/ASPISAP/',
        ApiClientes: '/API/Clientes/',
        ApiReportes: '/API/Reportes/',

        PaginatorIndex: 1,
        PaginatorLastPage: 0,

        // DIV LOG
        DivLog: {
            remember: true,
            pass: ''
        },

        // DIV EMPRESA
        Empresas: [],

        //  DIV CRUD MOVIMIENTOS
        VentanaCrudMovimientos: {
            FormularioTitle: 'Crear Movimiento de Caja',

            divBuscarMovimientos: {
                checkedBuscarPorFechas: false
            }
        },
        Movimiento: {},
        MovimientosCrud: [],
        Usuarios: [],
        TiposMovimientos: [],
        ClasificacionesFiscales: [],
        BusquedaMovimiento: {
            Opcion: 'abiertas'
        },
        SeccionMovimientos: {
            movimientoSeleccionado: 0,
            btnGuardarState: false,
            chckLlenarDatosFiscales: false,
            NumeroCierre: 0
        },

        //  DIV CIERRES DE CAJA
        VentanaCierres: {
            Cierres: [],
            FechaInicial: '',
            FechaFinal: '',

            PaginatorIndex: 1,
            PaginatorLastPage: 0,

            CierreSeleccionado: {},
            MovimientosDeCierre: [],

            VentanaCrearCierreDiario: {
                FechaInicial: '',
                FechaFinal: '',
                SaldoFinal: '',
                NumeroDeMovimientos: '',
                MovimientosParaCierre: []
            }
        },

        //  ------------------------------------------------
        Reportes: {
            sourceResportes: '',
            opcionReporteSeleccionado: '',
            codsClientes: [],

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
        }
    },
    created: function () {
        CoockiesIniciales();
        let rememberPasswordCookie = GetCookieElement('rememberPass=');

        this.DivLog.remember = rememberPasswordCookie === 'true' ? true : false;
        if (this.DivLog.remember) {
            this.DivLog.pass = rememberPasswordCookie = document.cookie.split('; ')
                .find(item => item.startsWith('password='))
                .replace('password=', '')
                .replace(';', '');
        }
    },
    watch: {
        'Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desde'() {
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desde = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desde.replace(/^0/g, '');
        },
        'Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta'() {
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta.replace(/^0/g, '');
        },
        'Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta'() {
            app.Reportes.VentasYDevolucionesCategoriaYVendedorTablaVisible = [];
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.mostrarDetallesProductosCorte = false;
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.analisisGrafico = false;
            if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA08')
                this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte = 'porCategoria';
        },
        'Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.FormatoConsultas'() {
            SetCoockie(`formatoDataVentasYDevoluciones=${this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.FormatoConsultas};`);
            this.LimpiarTablas();
        },
        'Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor'() {
            SetCoockie(`formatoDataVentasYDevoluciones_vendedor=${this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor};`);
        },
        'Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante'() {
            SetCoockie(`formatoDataVentasYDevoluciones_comprobante=${this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante};`);
        },
        'Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino'() {
            SetCoockie(`formatoDataVentasYDevoluciones_termino=${this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino};`);
        },
        'Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda'() {
            SetCoockie(`formatoDataVentasYDevoluciones_moneda=${this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda};`);
        },
        'Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desdeHastaRango'() {
            const rango = getIntervalDate(this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desdeHastaRango);
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emision = rango.firstday;
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.maxFecha_emision = rango.lastday;
        },
        'Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.analisisGrafico'() {
            if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.analisisGrafico) {
                this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.mostrarDetallesProductosCorte = true;
                document.getElementById('checkboxVentasYDevolucionesCategoriaYVendedorMostrarDetalles').setAttribute('disabled', true);

                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA.length > 0) {
                    document.getElementById('tablaDatosAgrupados').setAttribute('hidden', true);
                    document.getElementById('divGraficosDatosAgrupados').removeAttribute('hidden');
                }
            }
            else {
                document.getElementById('checkboxVentasYDevolucionesCategoriaYVendedorMostrarDetalles').removeAttribute('disabled');

                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA.length > 0) {
                    document.getElementById('tablaDatosAgrupados').removeAttribute('hidden');
                    document.getElementById('divGraficosDatosAgrupados').setAttribute('hidden', true);
                }
            }
        }
    },
    methods: {
        //  DIV PARA LOGEARSE
        //----------------------------------------------------------
        Log() {
            if (this.DivLog.remember) {
                SetCoockie(`password=${this.DivLog.pass};`);
                SetCoockie(`rememberPass=true;`);
            }
            else {
                SetCoockie(`password=;`);
                SetCoockie(`rememberPass=false;`);
            }

            let fecha = new Date();

            if (this.DivLog.pass == fecha.getFullYear() + fecha.getMonth() + 1) {
                document.getElementById('cargando').removeAttribute('hidden');

                document.getElementById('divLog').setAttribute('hidden', true);
                //document.getElementById('SeleccionarEmpresa').removeAttribute('hidden');

                //$.get(`..${this.ApiRuta}GetEmpresas`).done(response => {
                //    this.Empresas = response.Empresas;
                //    document.getElementById('cargando').setAttribute('hidden', true);
                //});

                //---
                document.getElementById('menu').removeAttribute('hidden');
                document.getElementById('cargando').setAttribute('hidden', true);

            }
            else {
                this.DivLog.pass = '';
                document.getElementById('badPass').removeAttribute('hidden');
            }
        },

        //  DIV DONDE SE SELECCIONAN LAS EMPRESAS
        //----------------------------------------------------------
        EmpresaSeleccionada(idEmpresa) {
            document.getElementById('cargando').removeAttribute('hidden');
            $.get(`..${this.ApiRuta}EmpresaSeleccionada`, { idEmpresa }).done((respWonse, statusText, xhr) => {
                if (xhr.status == 200) {

                    localStorage.setItem('Nombre_empresa', respWonse.Empresa.Nombre_empresa);
                    localStorage.setItem('direccionEmpresa1', respWonse.Empresa.direccion1);
                    localStorage.setItem('direccionEmpresa2', respWonse.Empresa.direccion2);
                    localStorage.setItem('direccionEmpresa3', respWonse.Empresa.direccion3);
                    localStorage.setItem('TelefonoEmpresa1', respWonse.Empresa.Telefono1);

                    document.getElementById('SeleccionarEmpresa').setAttribute('hidden', true);
                    document.getElementById('menu').removeAttribute('hidden');
                }
                else if (xhr.status == 204)
                    alert("EMPRESA SELECCIONADA, NO ENCONTRADA.");
                document.getElementById('cargando').setAttribute('hidden', true);
            });
        },

        //  DIV CRUD MOVIMIENTOS
        //----------------------------------------------------------
        MovimientosCRUD() {
            NavigationBehaviour(actual = 'MovimientosCRUD');

            //  LLENAR LOS CAMPOS DE ESTA VENTANA: 
            this.Movimiento.Fecha = new Date().toISOString().slice(0, 10);
            $.get(`..${this.ApiRuta}DatosMovimientosCrud`, { flag: 'todo' }).done(response => {
                this.Usuarios = response.usuarios;
                this.TiposMovimientos = response.tiposMovimientos;
                this.ClasificacionesFiscales = response.clasificacionFiscal;
                this.MovimientosCrud = response.movimientos;
                this.BusquedaMovimiento.cargadoA = response.usuarios;
                document.getElementById('cargando').setAttribute('hidden', true);
            });

            this.BusquedaMovimiento.fechaDesde = (new Date()).toISOString().slice(0, 10);
            this.BusquedaMovimiento.fechaHasta = (new Date()).toISOString().slice(0, 10);
        },

        GuardarMovimiento() {
            let continuar = true;

            if (!this.ValidarFormularioMovimiento())
                continuar = false;

            if (continuar) {
                Swal.fire({
                    title: 'Desea hacer una impresion del movimiento?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Si',
                    cancelButtonText: 'No'
                }).then((result) => {
                    document.getElementById('cargando').removeAttribute('hidden');
                    $.get(`..${this.ApiRuta}GuardarMovimiento?movimiento=${JSON.stringify(this.Movimiento)}`).done((response, statusText, xhr) => {
                        if (xhr.status == 200) {
                            const id = response.id;
                            if (id)
                                Print('movimiento', { 'NumeroTransacion': id });

                            this.LimpiarCamposMovimiento();
                            this.MostrarAlerta(true);
                        }
                        document.getElementById('cargando').setAttribute('hidden', true);
                    });
                });
            }

            this.ReestablecerCamposFormularios_Movimientos();
        },

        AgregarValorITBIsCampos() {
            if (this.SeccionMovimientos.chckLlenarDatosFiscales) {
                this.Movimiento.Neto = Math.floor(this.Movimiento.Monto / 1.18);
                this.Movimiento.Itebis = Math.floor(this.Movimiento.Monto - this.Movimiento.Neto);

                sumaFiscales = this.Movimiento.Neto + this.Movimiento.Itebis;

                if (this.Movimiento.Monto > sumaFiscales)
                    this.Movimiento.Neto += this.Movimiento.Monto - (this.Movimiento.Neto + this.Movimiento.Itebis);
            }
            else {
                this.Movimiento.Neto = '';
                this.Movimiento.Itebis = '';
            }
        },

        //  VALIDAR QUE LA FECHA NO SEA MAYOR A HOY NI MENOR O IGUAL A UNA FECHA DE UN CUADRE YA CERRADO.
        FechaValida() {
            if (new Date(this.Movimiento.Fecha).getTime() > new Date()) {
                this.Movimiento.Fecha = new Date().toISOString().slice(0, 10);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'LA FECHA NO PUEDE SER SUPERIOR A LA FECHA ACTUAL.',
                });
                return;
            }

            $.get(`..${this.ApiRuta}FechaUltimoCierre`).done((response, statusText, xhr) => {
                if (xhr.status == 200) {
                    if (new Date(this.Movimiento.Fecha).getTime() <= new Date(response.FechaUltimoCierre).getTime()) {
                        this.Movimiento.Fecha = new Date().toISOString().slice(0, 10);
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'ESTA FECHA YA ESTA CERRADA.',
                        });
                    }
                }
            });

        },

        //  COMPROBAR QUE TODOS LOS CAMPOS DE EL CARD DE LOS DATOS BASICOS, ESTEN LLENOS.
        ValidarFormularioMovimiento() {
            let returnValue = true;
            if (this.Movimiento.Beneficiario
                && this.Movimiento.Monto
                && this.Movimiento.TipoMovimiento
                && this.Movimiento.Concepto) {

                //  SI EL CHECKBOX DE 'Llenar Datos Fiscales' ESTA CHECADO, COMPROBAR QUE TODOS LOS CAMPOS DE EL CARD DE LOS DATOS FISCALES, ESTEN LLENOS.
                if (this.SeccionMovimientos.chckLlenarDatosFiscales) {
                    if (!this.Movimiento.RNC
                        || !this.Movimiento.NCF
                        || !this.Movimiento.Clasificancf
                        || !this.Movimiento.Neto
                        || !this.Movimiento.Itebis) {

                        this.ReestablecerCamposFormularios_Movimientos();

                        returnValue = false;
                        if (!this.Movimiento.RNC)
                            document.getElementById('inputRnc').style.backgroundColor = '#f5aba6';
                        if (!this.Movimiento.NCF)
                            document.getElementById('inputNcf').style.backgroundColor = '#f5aba6';
                        if (!this.Movimiento.Clasificancf)
                            document.getElementById('selectClsFiscal').style.backgroundColor = '#f5aba6';
                        if (!this.Movimiento.Neto)
                            document.getElementById('inputItbis').style.backgroundColor = '#f5aba6';
                        if (!this.Movimiento.Itebis)
                            document.getElementById('inputItbiFacturado').style.backgroundColor = '#f5aba6';
                    }
                }
            }
            else {
                returnValue = false;

                if (!this.Movimiento.Monto)
                    document.getElementById('inputMonto').style.backgroundColor = '#f5aba6';
                if (!this.Movimiento.Beneficiario)
                    document.getElementById('Beneficiario').style.backgroundColor = '#f5aba6';
                if (!this.Movimiento.TipoMovimiento)
                    document.getElementById('selectTipoMovimiento').style.backgroundColor = '#f5aba6';
                if (!this.Movimiento.Concepto)
                    document.getElementById('inputCocepto').style.backgroundColor = '#f5aba6';
                document.getElementById('cargando').setAttribute('hidden', true);
            }
            return returnValue;
        },

        ReestablecerCamposFormularios_Movimientos(flag) {
            let colorDefault = '';

            if (this.Movimiento.Monto || flag)
                document.getElementById('inputMonto').style.backgroundColor = colorDefault;
            if (this.Movimiento.Beneficiario || flag)
                document.getElementById('Beneficiario').style.backgroundColor = colorDefault;
            if (this.Movimiento.TipoMovimiento || flag)
                document.getElementById('selectTipoMovimiento').style.backgroundColor = colorDefault;
            if (this.Movimiento.Concepto || flag)
                document.getElementById('inputCocepto').style.backgroundColor = colorDefault;

            if (this.SeccionMovimientos.chckLlenarDatosFiscales) {
                if (this.Movimiento.RNC || flag)
                    document.getElementById('inputRnc').style.backgroundColor = colorDefault;
                if (this.Movimiento.NCF || flag)
                    document.getElementById('inputNcf').style.backgroundColor = colorDefault;
                if (this.Movimiento.Clasificancf || flag)
                    document.getElementById('selectClsFiscal').style.backgroundColor = colorDefault;
                if (this.Movimiento.Neto || flag)
                    document.getElementById('inputItbis').style.backgroundColor = colorDefault;
                if (this.Movimiento.Itebis || flag)
                    document.getElementById('inputItbiFacturado').style.backgroundColor = colorDefault;
            }
        },

        ActivarBotonGuardarFormulariosMovimiento() {
            let continar = true;

            if (this.Movimiento.Beneficiario
                && this.Movimiento.Monto
                && this.Movimiento.TipoMovimiento
                && this.Movimiento.Concepto) {

                if (this.SeccionMovimientos.chckLlenarDatosFiscales
                    && (!this.NCFValid() || !this.RNCValid())) {
                    continar = false;
                }
            }
            else
                continar = false;

            if (continar) {
                if (this.Movimiento.NumeroCierre == this.SeccionMovimientos.NumeroCierre)
                    this.SeccionMovimientos.btnGuardarState = true;
                else
                    this.SeccionMovimientos.btnGuardarState = false;
                return;
            }
            else
                this.SeccionMovimientos.btnGuardarState = false;
        },

        CambiarValoresParaImpresionMovimieto(select) {
            switch (select) {
                case 'Beneficiario':
                    this.Movimiento.Nombre_completo = this.Movimiento.Nombre_completo ? this.Movimiento.Nombre_completo : document.getElementById('Beneficiario').options[document.getElementById('Beneficiario').selectedIndex].text;
                    break;
                case 'selectTipoMovimiento':
                    this.Movimiento.DescripcionMovimiento = this.Movimiento.DescripcionMovimiento ? this.Movimiento.DescripcionMovimiento : document.getElementById('selectTipoMovimiento')[document.getElementById('selectTipoMovimiento').selectedIndex].text;
                    break;
                case 'selectClsFiscal':
                    this.Movimiento.DescripcionClasfFiscal = this.Movimiento.DescripcionClasfFiscal ? this.Movimiento.DescripcionClasfFiscal : document.getElementById('selectClsFiscal')[document.getElementById('selectClsFiscal').selectedIndex].text;
                    break;
            }
        },

        LimpiarCamposMovimiento(flag, recargarLista) {
            this.SeccionMovimientos.MovimientoSeleccionado = 0;
            this.ReestablecerCamposFormularios_Movimientos(true);
            this.SeccionMovimientos.btnGuardarState = false;

            this.Movimiento.Fecha = new Date().toISOString().slice(0, 10);
            this.Movimiento.Beneficiario = '';
            this.Movimiento.Monto = '';
            this.Movimiento.TipoMovimiento = '';
            this.Movimiento.Concepto = '';
            this.Movimiento.RNC = '';
            this.Movimiento.NCF = '';
            this.Movimiento.Clasificancf = '';
            this.Movimiento.Neto = '';
            this.Movimiento.Itebis = '';
            this.VentanaCrudMovimientos.FormularioTitle = 'Crear Movimiento de Caja';

            document.getElementById('invalidInputRnc').setAttribute('hidden', true);
            document.getElementById('invalidInputNcf').setAttribute('hidden', true);

            if (recargarLista) {
                this.MovimientosCrud = [];
                $.get(`..${this.ApiRuta}DatosMovimientosCrud`).done(response => {
                    this.MovimientosCrud = response.movimientos;
                });
            }

            this.SeccionMovimientos.chckLlenarDatosFiscales = false;

            if (flag) {
                document.getElementById('btnsMovimientoSeleccionado').setAttribute('hidden', true);
                document.getElementById('btnsNuevoMovimiento').removeAttribute('hidden');
            }
        },

        NCFValid() {
            this.Movimiento.NCF = this.Movimiento.NCF.toUpperCase();
            document.getElementById('invalidInputNcf').setAttribute('hidden', true);
            if (this.Movimiento.NCF.length >= 14)
                this.Movimiento.NCF = this.Movimiento.NCF.substring(0, 13);
            if (this.Movimiento.NCF.length == 11 || this.Movimiento.NCF.length == 13) {
                if (MatchRegex(0, this.Movimiento.NCF)) {
                    document.getElementById('invalidInputNcf').setAttribute('hidden', true);
                    return true
                }
            }
            document.getElementById('invalidInputNcf').removeAttribute('hidden');
            return false;
        },

        RNCValid() {
            document.getElementById('invalidInputRnc').setAttribute('hidden', true);
            if (this.Movimiento.RNC.length >= 12)
                this.Movimiento.RNC = this.Movimiento.RNC.substring(0, 11);
            if (this.Movimiento.RNC.length == 9 || this.Movimiento.RNC.length == 11) {
                if (MatchRegex(1, this.Movimiento.RNC)) {
                    document.getElementById('invalidInputRnc').setAttribute('hidden', true);
                    return true
                }
            }
            document.getElementById('invalidInputRnc').removeAttribute('hidden');
            return false;
        },

        MovimientoSeleccionado(id, print) {
            this.LimpiarCamposMovimiento(recargarLista = true);
            document.getElementById('cargando').removeAttribute('hidden');
            this.VentanaCrudMovimientos.FormularioTitle = 'Modificando Movimiento de Caja';
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;

            this.SeccionMovimientos.MovimientoSeleccionado = id;
            document.getElementById('btnsNuevoMovimiento').setAttribute('hidden', true);
            document.getElementById('btnsMovimientoSeleccionado').removeAttribute('hidden');

            $.get(`..${this.ApiRuta}ObtenerMovimiento`, { id }).done(response => {
                this.Movimiento.Fecha = response.movimiento.Fecha;
                this.Movimiento.Beneficiario = response.movimiento.Beneficiario;
                this.Movimiento.Nombre_completo = response.movimiento.nombre_completo;
                this.Movimiento.Monto = response.movimiento.Monto;
                this.Movimiento.TipoMovimiento = response.movimiento.TipoMovimiento;
                this.Movimiento.DescripcionMovimiento = response.movimiento.DescripcionMovimiento;
                this.Movimiento.Concepto = response.movimiento.Concepto;
                this.Movimiento.NumeroCierre = response.movimiento.NumeroCierre;

                if (this.Movimiento.RNC = response.movimiento.Rnc) {
                    this.SeccionMovimientos.chckLlenarDatosFiscales = true;
                    this.Movimiento.RNC = response.movimiento.Rnc;
                    this.Movimiento.NCF = response.movimiento.Ncf;
                    this.Movimiento.Clasificancf = response.movimiento.Clasificancf;
                    this.Movimiento.DescripcionClasfFiscal = response.movimiento.DescripcionClasfFiscal;
                    this.Movimiento.Neto = response.movimiento.Neto;
                    this.Movimiento.Itebis = response.movimiento.Itebis;
                }
                else {
                    this.Movimiento.RNC = null;
                    this.Movimiento.NCF = null;
                    this.Movimiento.Clasificancf = '';
                    this.Movimiento.Neto = null;
                    this.Movimiento.Itebis = null;

                    this.SeccionMovimientos.chckLlenarDatosFiscales = false;
                }

                if (print) {
                    setTimeout(() => {
                        printJS('toPrint', 'html');
                    },
                        1000);
                }

                $.get(`..${this.ApiRuta}UltimoCierre`).done(response => {
                    document.getElementById('cargando').setAttribute('hidden', true);
                    this.ActivarBotonGuardarFormulariosMovimiento();

                    this.SeccionMovimientos.NumeroCierre = (parseInt(response.UltimoCierre) + 1);

                    if (this.Movimiento.NumeroCierre == this.SeccionMovimientos.NumeroCierre)
                        this.SeccionMovimientos.btnGuardarState = true;
                    else
                        this.SeccionMovimientos.btnGuardarState = false;
                });
            });
        },

        SelectBusquedaMovimientoChanged() {
            this.VentanaCrudMovimientos.divBuscarMovimientos.checkedBuscarPorFechas = true;
            document.getElementById('movimientoOpcTmov').setAttribute('hidden', true);
            document.getElementById('movimientoOpcES').setAttribute('hidden', true);
            document.getElementById('movimientoOpcCfiscal').setAttribute('hidden', true);
            document.getElementById('conceptoOpcTmov').setAttribute('hidden', true);
            document.getElementById('nroMovimientoOpcTmov').setAttribute('hidden', true);
            document.getElementById('beneficiarioOpcTmov').setAttribute('hidden', true);
            document.getElementById('rncOpcTmov').setAttribute('hidden', true);
            document.getElementById('ncfOpcTmov').setAttribute('hidden', true);
            document.getElementById('nroCierreOpcTmov').setAttribute('hidden', true);
            this.VentanaCrudMovimientos.divBuscarMovimientos.checkedBuscarPorFechas = true;
            switch (document.getElementById('selectBusquedaMovimiento').value) {
                case 'CargadoA':
                    document.getElementById('beneficiarioOpcTmov').removeAttribute('hidden');
                    break;
                case 'busquedaEsp':
                    document.getElementById('conceptoOpcTmov').removeAttribute('hidden');
                    break;
                case 'nroMov':
                    document.getElementById('nroMovimientoOpcTmov').removeAttribute('hidden');
                    break;
                case 'rnc':
                    document.getElementById('rncOpcTmov').removeAttribute('hidden');
                    break;
                case 'ncf':
                    document.getElementById('ncfOpcTmov').removeAttribute('hidden');
                    break;
                case 'NroCierre':
                    document.getElementById('nroCierreOpcTmov').removeAttribute('hidden');
                    break;
                case 'tmovimiento':
                    document.getElementById('movimientoOpcTmov').removeAttribute('hidden');
                    break;
                case 'es':
                    document.getElementById('movimientoOpcES').removeAttribute('hidden');
                    break;
                case 'cfiscal':
                    document.getElementById('movimientoOpcCfiscal').removeAttribute('hidden');
                    break;
                case 'abiertas':
                    this.VentanaCrudMovimientos.divBuscarMovimientos.checkedBuscarPorFechas = false;
                    break;
            }
        },

        ModificarMovimiento() {
            let continuar = true;

            if (!this.ValidarFormularioMovimiento())
                continuar = false;

            if (continuar) {
                document.getElementById('cargando').removeAttribute('hidden');
                $.get(`..${this.ApiRuta}ModificarMovimiento?id=${this.SeccionMovimientos.MovimientoSeleccionado}&movimiento=${JSON.stringify(this.Movimiento)}`).done((response, statusText, xhr) => {
                    if (xhr.status == 200) {
                        this.LimpiarCamposMovimiento();

                        document.getElementById('btnsMovimientoSeleccionado').setAttribute('hidden', true);
                        document.getElementById('btnsNuevoMovimiento').removeAttribute('hidden');

                        this.MostrarAlerta(true);
                    } else
                        this.MostrarAlerta(false);
                    document.getElementById('cargando').setAttribute('hidden', true);
                }).fail(() => {
                    document.getElementById('cargando').setAttribute('hidden', true);
                    this.MostrarAlerta(false);
                });
            }
        },

        BuscarMovimientos() {
            document.getElementById('cargando').removeAttribute('hidden');
            let fechaDesde = this.BusquedaMovimiento.fechaDesde;
            let fechaHasta = this.BusquedaMovimiento.fechaHasta;
            let opcion = this.BusquedaMovimiento.Opcion;
            let valor = '';
            let parametros = {};
            let conFecha = false;

            switch (opcion) {
                case 'CargadoA':
                    valor = this.BusquedaMovimiento.cargadoA;
                    break;
                case 'busquedaEsp':
                    valor = this.BusquedaMovimiento.inptConcepto;
                    break;
                case 'nroMov':
                    valor = this.BusquedaMovimiento.inptNroMovimiento;
                    break;
                case 'rnc':
                    valor = this.BusquedaMovimiento.inptRNC;
                    break;
                case 'ncf':
                    valor = this.BusquedaMovimiento.inptNCF;
                    break;
                case 'NroCierre':
                    valor = this.BusquedaMovimiento.inptNroCierre;
                    break;
                case 'abiertas':
                    valor = this.BusquedaMovimiento.Tmovimiento;
                    break;
                case 'tmovimiento':
                    valor = this.BusquedaMovimiento.Tmovimiento;
                    break;
                case 'es':
                    valor = this.BusquedaMovimiento.ES;
                    break;
                case 'cfiscal':
                    valor = this.BusquedaMovimiento.Cfiscal;
                    break;
                case 'abiertas':
                    valor = this.BusquedaMovimiento.abiertas;
                    break;
            };

            parametros = {
                opcion, valor, fechaDesde, fechaHasta
            };

            if (this.VentanaCrudMovimientos.divBuscarMovimientos.checkedBuscarPorFechas)
                conFecha = true;

            this.MovimientosCrud = [];
            $.get(`..${this.ApiRuta}DatosMovimientosCrud?parametros=${JSON.stringify(parametros)}&conFecha=${conFecha}`).done(response => {
                this.MovimientosCrud = response.movimientos;
                document.getElementById('cargando').setAttribute('hidden', true);
            });
        },

        //  DIV QUE MUESTRA LOS CUADRES DE CAJA
        //----------------------------------------------------------
        CuadresCaja(flag) {
            document.getElementById('cargando').removeAttribute('hidden');
            if (flag) {
                this.VentanaCierres.FechaInicial = new Date().toISOString().slice(0, 10);
                this.VentanaCierres.FechaFinal = new Date().toISOString().slice(0, 10);
                NavigationBehaviour(actual = 'CuadresDeCajaCRUD');
            }

            let paramFechaInicial = this.VentanaCierres.FechaInicial == new Date().toISOString().slice(0, 10) ? '' : this.VentanaCierres.FechaInicial;
            let paramFechaFinal = this.VentanaCierres.FechaFinal == new Date().toISOString().slice(0, 10) ? '' : this.VentanaCierres.FechaFinal;
            $.get(`..${this.ApiRuta}ObtenerCierresCaja?fechaInicial=${paramFechaInicial}&fechaFinal=${paramFechaFinal}`).done(response => {
                this.VentanaCierres.Cierres = response.Cierres;
                document.getElementById('cargando').setAttribute('hidden', true);
                this.VentanaCierres.PaginatorLastPage = Math.ceil(response.Total / 10);
            });
        },

        CierresCajaPaginatorMovimientos(index) {
            document.getElementById('cargando').removeAttribute('hidden');
            $.get(`..${this.ApiRuta}ObtenerCierresCaja`, {
                fechaInicial: this.VentanaCierres.FechaInicial,
                fechaFinal: this.VentanaCierres.FechaFinal,
                index
            }).done(response => {
                this.VentanaCierres.PaginatorIndex = index;
                this.VentanaCierres.Cierres = response.Cierres;
                this.VentanaCierres.PaginatorLastPage = Math.ceil(response.Total / 10);
                document.getElementById('cargando').setAttribute('hidden', true);
            });
        },

        DetallesMovimientosParaCierreCaja() {
            document.getElementById('cargando').removeAttribute('hidden');
            document.getElementById('btnVerMovimientosParaCierre').removeAttribute('hidden');
            this.VentanaCierres.VentanaCrearCierreDiario.MovimientosParaCierre = [];

            $.get(`..${this.ApiRuta}ObtnerDatosMovimientosParaCierres`).done(response => {
                this.VentanaCierres.VentanaCrearCierreDiario.FechaInicial = response.FechaUltimoCierre.substring(0, 10);
                this.VentanaCierres.VentanaCrearCierreDiario.FechaFinal = new Date().toISOString().substring(0, 10);
                this.VentanaCierres.VentanaCrearCierreDiario.SaldoFinal = response.Monto ? response.Monto : "0";
                this.VentanaCierres.VentanaCrearCierreDiario.NumeroDeMovimientos = response.Total;

                document.getElementById('cargando').setAttribute('hidden', true);
            });
        },

        MovimientosEnCierre(idCierre) {
            document.getElementById('cargando').removeAttribute('hidden');

            $.get(`..${this.ApiRuta}MovimientosParaCierre`, { idCierre }).done(response => {
                if (idCierre) {
                    let cierreSeleccionado = this.VentanaCierres.Cierres.find(e => { return e.NumeroCierre == idCierre });
                    this.VentanaCierres.MovimientosDeCierre = response.Movimientos;
                    this.VentanaCierres.CierreSeleccionado = {
                        FechaFinal: cierreSeleccionado.FechaFinal,
                        FechaInicial: cierreSeleccionado.FechaInicial,
                        NumeroCierre: cierreSeleccionado.NumeroCierre,
                        SaldoFinal: cierreSeleccionado.SaldoFinal
                    };

                    setTimeout(() => {
                        printJS('toPrintCierre', 'html');
                        document.getElementById('cargando').setAttribute('hidden', true);
                    }, 2000);
                }
                else {
                    this.VentanaCierres.VentanaCrearCierreDiario.MovimientosParaCierre = response.Movimientos;
                    document.getElementById('cargando').setAttribute('hidden', true);
                }
            });

        },

        CerrarCaja() {
            document.getElementById('cargando').removeAttribute('hidden');
            Swal.fire({
                title: 'Desea hacer esta accion? No podra deshacerla despues.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Si',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    let cierres = {
                        "FechaInicial": this.VentanaCierres.VentanaCrearCierreDiario.FechaInicial,
                        "FechaFinal": this.VentanaCierres.VentanaCrearCierreDiario.FechaFinal,
                        "SaldoFinal": parseInt(this.VentanaCierres.VentanaCrearCierreDiario.SaldoFinal)
                    };

                    let cierre = JSON.stringify(cierres);

                    $.get(`..${this.ApiRuta}CerrarCaja`, { cierre }).done(response => {

                        let paramFechaInicial = this.VentanaCierres.FechaInicial == new Date().toISOString().slice(0, 10) ? '' : this.VentanaCierres.FechaInicial;
                        let paramFechaFinal = this.VentanaCierres.FechaFinal == new Date().toISOString().slice(0, 10) ? '' : this.VentanaCierres.FechaFinal;
                        $.get(`..${this.ApiRuta}ObtenerCierresCaja?fechaInicial=${paramFechaInicial}&fechaFinal=${paramFechaFinal}`).done(response => {
                            this.VentanaCierres.Cierres = response.Cierres;
                            document.getElementById('cargando').setAttribute('hidden', true);
                        });
                    });
                }
                else
                    document.getElementById('cargando').setAttribute('hidden', true);
            });
        },

        //---------------------------------------------------------------------------------------------------------------------------------------------------
        //                              MODULO DE REPORTES
        //---------------------------------------------------------------------------------------------------------------------------------------------------

        //  MENU DE MODULO DE REPORTES
        //----------------------------------------------------------
        DivSeleccionarSourceParaReporte() {
            NavigationBehaviour('SeleccionarSourceParaReporte');
            document.getElementById('cargando').setAttribute('hidden', true);
        },

        //  SOURCE DE REPORTES  
        //----------------------------------------------------------
        DivSeleccionarReporte(source) {
            NavigationBehaviour('SeleccionarReporte');
            document.getElementById('cargando').setAttribute('hidden', true);

            this.Reportes.sourceResportes = source;
            if (this.Reportes.sourceResportes === 'web') {
                if (this.Reportes.codsClientes.length === 0) {
                    $.get(`..${this.ApiClientes}GetCodes`, {}, response => {
                        this.Reportes.codsClientes = response.codes;
                    });
                }
            }
        },

        //  OPCIONES DEL MENU
        //-------------------------------------------------------------------------------
        async OpcionMenuCeleccionado(opcionSeleccionada) {
            $('#sidebar').toggleClass('active');
            this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA = [];
            this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA = [];
            this.Reportes.IndividualClientStatusDATA = [];

            switch (opcionSeleccionada) {
                case 'VentasYDevolucionesCategoriaYVendedor':
                    if (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emision) {
                        this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emision = new Date().toISOString().slice(0, 10);
                        this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.maxFecha_emision = new Date().toISOString().slice(0, 10);
                    }
                    if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.vendedores.length === 0)
                        this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.vendedores = await BuscarInformacionLocal('SendWebsocketServer/3', {});
                    if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasClientes.length === 0)
                        this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasClientes = await BuscarInformacionLocal('SendWebsocketServer/5', {});
                    break;
            }

            //  MOSTRAR EL FILTRO SELECCONADO Y OCULTAR EL QUE ESTABA VISIBLE
            if (this.Reportes.opcionReporteSeleccionado)
                document.getElementById(this.Reportes.opcionReporteSeleccionado).setAttribute('hidden', true);
            document.getElementById(opcionSeleccionada).removeAttribute('hidden');
            this.Reportes.opcionReporteSeleccionado = opcionSeleccionada;
        },

        // REPORTES
        //----------------------------------------------------------
        PaginationVentasYDevolucionesCategoriaYVendedor(value) {
            switch (value) {
                case -1:
                    this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorIndex--;
                    break;
                    break;
                case +1:
                    this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorIndex++;
                    break;
                case 'MAX':
                    this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorIndex = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorLastPage;
                    break
                case 0:
                default:
                    this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorIndex = 0;
                    break;
            }
            this.Buscar_VentasYDevolucionesCategoriaYVendedor()
        },

        async Buscar_VentasYDevolucionesCategoriaYVendedor() {
            this.LimpiarTablas();
            
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.toggleData_tablaCorteYReporteGrafico = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.analisisGrafico;
            this.Reportes.toggleTableColumns_byMostrarDetallesProductosCorte = !this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.mostrarDetallesProductosCorte;
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.ConsultaTrajoColumnaVendedor = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor;
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.ConsultaTrajoColumnaComprobante = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante;
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.ConsultaTrajoColumnaTermino = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino;
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.ConsultaTrajoColumnaMoneda = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda;
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.fechaMinReporteBuscado = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emision;
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.fechaMaxReporteBuscado = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.maxFecha_emision;
            if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesSeleccionada)
                this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesBuscada =
                    this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasClientes.find(
                        item => item.categoria_clte_id === this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesSeleccionada)
                        .descripcion_categ;
            else
                this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesBuscada = '-TODO-';

            if (this.Reportes.sourceResportes === 'web')
                alert('Por el momento esta busqueda solo se ha planteado para la parte Local');
            else if (this.Reportes.sourceResportes === 'local') {
                this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA = [];
                this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA = [];
                let campo;

                const filtro = {
                    minFecha_emision: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emision,
                    maxFecha_emision: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.maxFecha_emision,
                    Codigo_vendedor: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.vendedorSeleccionado.trim(),
                    categoria_clte_id: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesSeleccionada,
                    tipoConsulta: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta,
                    tipoReporte: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoReporte,
                    skip: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorIndex
                }

                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoReporte === 'ventas')
                    filtro.tipo_factura = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipo_factura

                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA01'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA02') {
                    filtro.desde = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desde;
                    filtro.hasta = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta;
                }
                else if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA03')
                    filtro.valor = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePagoSeleccionado;
                else if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA0')
                    filtro.valor = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.nombresBodegaSeleccionada;
                else if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA08') {
                    filtro.GROUP = true;
                    filtro.tipoCorte = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte;
                    if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porCategoria')
                        filtro.valor = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasProductosSeleccionada;
                    else if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porCliente' || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porVendedor')
                        filtro.valor = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.valor;
                }
                else if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA04'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA05'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA06')
                    filtro.valor = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.valor;

                //  AGREGAR desde hasta VALORES
                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA03'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA04'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA06'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA0'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA08') {
                    filtro.desde = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desde;
                    filtro.hasta = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta;
                }

                //  AGREGAR COLUMNAS
                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.FormatoConsultas === 'completo') {
                    if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor)
                        filtro.colVendedor = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor;

                    if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante)
                        filtro.colComprobante = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante;

                    if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino)
                        filtro.colTermino = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino;

                    if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda)
                        filtro.colMoneda = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda;
                }
                if (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.mostrarDetallesProductosCorte) {
                    let result = await BuscarInformacionLocal('SendWebsocketServer/2', filtro);

                    for (item of result)
                        this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA.push(item);

                    //  SI ES UNA DATA AGRUPADA, SE ASIGNA EL CAMPO POR EL QUE SE VA A AGRUPAR.
                    if (filtro.GROUP) {
                        if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porCategoria')
                            campo = 'categoria_id';
                        else if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porCliente')
                            campo = 'nombre_clte';
                        else if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte === 'porVendedor')
                            campo = 'vendedor_id';

                        for (let item of [... new Set(this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA.map(data => data[campo]))]) {
                            this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA.push(
                                this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA.filter(el => el[campo] === item)
                            );
                        }
                    }
                }

                //
                let tableName = '';
                let camposArray = [];
                //if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === '') {
                //    tableName = 'tablaVentasYDevoluciones';
                //    camposArray = [4, 5, 6];

                //    for (item of this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA)
                //        item.itbis = Math.floor(item.total / 1.18);
                //}
                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA08') {
                    tableName = 'tablaVentasYDevolucionesGROUP';
                    camposArray = [3, 4, 6, 7, 8];
                }
                else {
                    tableName = 'tablaRangoNroFactura';
                    camposArray = [8, 9, 10, 11];
                }

                //  SI NO TRAE DATA TERMINA EL PROCESO
                if (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.mostrarDetallesProductosCorte)
                    if (this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA.length === 0 && this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA.length === 0)
                        return;

                // TOTALIZACIONES.
                this.Reportes.VentasYDevolucionesCategoriaYVendedorTablaVisible = tableName;

                filtro.SUM = true;

                result = await BuscarInformacionLocal('SendWebsocketServer/2', filtro);
                //
                if (!filtro.GROUP) {
                    this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.PaginatorLastPage = Math.floor(result[0].count / 20);

                    let jsonTotalizacion = {};
                    if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === '')
                        jsonTotalizacion = { 'SubTotalNeto': result[0].sumatoriaMontos, 'impto': result[0].sumatoriaPagosAcumulados, 'total': result[0].sumatoriaBalance };
                    else
                        jsonTotalizacion = { 'ITBIS': result[0].impuesto, 'SubTotalNeto': result[0].subtotal, 'dscto_monto': result[0].dscto_monto, '': '', 'total': result[0].total };

                    this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA.push(jsonTotalizacion);

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
                    if (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.mostrarDetallesProductosCorte) {
                        document.getElementById('divGraficosDatosAgrupados').setAttribute('hidden', true);

                        let contadorDeLineas = 0;
                        for (let index = 0; index < result.length; index++) {
                            contadorDeLineas += this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA[index].length + 1;
                            //  OBTENER LA POSICION DEL TOTAL DE CADA GRUPO PARA DARLE ESTILOS.
                            tableTotalPositionsRows.push(contadorDeLineas);

                            //  AGREGAR LOS SUB ELEMENTOS DE MANERA INTELIGENTE A LOS ELEMENTOS QUE COINCIDAN.
                            for (let i = 0; i < this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA.length; i++) {
                                let valorAgrupadoPor = '';
                                switch (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte) {
                                    case 'porCategoria':
                                        valorAgrupadoPor = result[index].Descripcion_categ;
                                        break;
                                    case 'porCliente':
                                        valorAgrupadoPor = result[index].nombre_clte;
                                        break;
                                    case 'porVendedor':
                                        valorAgrupadoPor = result[index].Nombre_vendedor;
                                        break;
                                }

                                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA[i][0][campo] === result[index][campo]) {
                                    this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA[i].push({
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
                        this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA.push({ 'cantidad': `${totalCantidad}`, 'TPRECIO': `${totalValor}`, 'ITBIS': `${totalImpuesto}`, 'total': `${totalTotal}` });
                        this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA = this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA.flat();

                        let columnasExtras = 0;
                        if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.FormatoConsultas === 'completo') {
                            if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor)
                                columnasExtras++;
                            if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante)
                                columnasExtras++;
                            if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino)
                                columnasExtras++;
                            if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda)
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
                            let valorAgrupadoPor = '';
                            switch (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte) {
                                case 'porCategoria':
                                    valorAgrupadoPor = result[index].Descripcion_categ;
                                    break;
                                case 'porCliente':
                                    valorAgrupadoPor = result[index].nombre_clte;
                                    break;
                                case 'porVendedor':
                                    valorAgrupadoPor = result[index].Nombre_vendedor;
                                    break;
                            }

                            this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA.push([]);
                            this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA[index].push({
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

                            reporteGraficoLabels.push(valorAgrupadoPor.trim().toUpperCase());
                            reporteGraficoTotales.push(result[index].total)
                        }

                        this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.totalReporteBuscado = totalTotal;
                        this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA.push({ 'cantidad': `${totalCantidad}`, 'TPRECIO': `${totalValor}`, 'ITBIS': `${totalImpuesto}`, 'total': `${totalTotal}` });
                        this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA = this.Reportes.VentasYDevolucionesCategoriaYVendedorGroupDATA.flat();
                        setTimeout(() => {
                            TablaEstiloTotalizacionFilaAgrupadas('tablaRangoNroFactura', [0, 1, 2, 3, 4])
                            TablaEstiloTotalizacionFila(document.getElementById('tablaRangoNroFactura'), [1, 2, 3, 4]);
                        }, 1);

                        //  REPORTE GRAFICO.
                        let reporteGraficoBacground = new Array(reporteGraficoLabels.length);
                        reporteGraficoBacground.fill('#17a2b8');

                        if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.chartAnalisisGrafico)
                            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.chartAnalisisGrafico.destroy();

                        let ctx = document.getElementById('reportesGraficos').getContext('2d');

                        this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.chartAnalisisGrafico = new Chart(ctx, {
                            type: 'horizontalBar',
                            data: {
                                labels: reporteGraficoLabels,
                                datasets: [{
                                    label: `Análisis de Ventas por ${(this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoCorte).replace('por', '')}`,
                                    backgroundColor: reporteGraficoBacground,
                                    data: reporteGraficoTotales
                                }]
                            },
                        });

                        //  OCULTAR EL DIV CORRESPONDIENTE. SI SE QUIERE VER LA DATA COMO TABLA SE OCULTA EL DIV DE GRAFICOS Y VICEVERSA.
                        if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.toggleData_tablaCorteYReporteGrafico)
                            setTimeout(() => document.getElementById('tablaDatosAgrupados').setAttribute('hidden', true), 2);
                        else
                            setTimeout(() => document.getElementById('divGraficosDatosAgrupados').setAttribute('hidden', true), 2);
                    }
                }

                //  GUARDARLO EN EL NAVEGADOR PARA CUANDO EL CLIENTE LE DE A IMPRIMIR.
                //localStorage.setItem('sumatoriasEstadoCuentaCliente', JSON.stringify(result[0]));
            }
        },

        async Buscar() {
            this.LimpiarTablas();

            this.Reportes.IndividualClientStatusFILTROS.codCliente = document.getElementById('inputCodigoClienteFiltroReporte').value;

            if (!this.Reportes.IndividualClientStatusFILTROS.codCliente) {
                document.getElementById('validationReportesCodigoCliente').removeAttribute('hidden');
                return;
            }
            else
                document.getElementById('validationReportesCodigoCliente').setAttribute('hidden', true);

            if (this.Reportes.sourceResportes === 'web')
                this.ValidarCampoCodigoCliente();
            else if (this.Reportes.sourceResportes === 'local') {
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
            if (!this.Reportes.codsClientes.includes(this.Reportes.IndividualClientStatusFILTROS.codCliente)) {
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

        async TipoConsultaSelectChanged() {
            //  LIMPIAR TODOS LOS CAMPOS.
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.Codigo_vendedor = '';
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.vendedorSeleccionado = '';
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesSeleccionada = '';
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desde = '';
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta = '';
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.valor = '';
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePagoSeleccionado = '';
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.nombresBodegaSeleccionada = '';
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasProductosSeleccionada = '';

            //  BUSCAR INFORMACION SI ES NECESARIO.
            if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA03')
                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePago.length === 0)
                    this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePago = await BuscarInformacionLocal('SendWebsocketServer/7', {});
            if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA0')
                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.nombresBodega.length === 0)
                    this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.nombresBodega = await BuscarInformacionLocal('SendWebsocketServer/8', {});
            if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA08')
                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasProductos.length === 0)
                    this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasProductos = (await BuscarInformacionLocal('SendWebsocketServer/9', {})).reverse();
        },

        LimpiarTablas() {
            this.Reportes.VentasYDevolucionesCategoriaYVendedorTablaVisible = '';
            this.Reportes.IndividualClientStatusDATA = [];
        },

        //----------------------------------------------------------
        //  UTILS
        //----------------------------------------------------------
        //  PARA PODER IMPRIMIR USANDO EL METODO EN Utils.js
        Print(type, jsonParameters, SetlocalStorageItemsToPrint) {
            if (SetlocalStorageItemsToPrint) {
                switch (type) {
                    case 'cierre':
                        localStorage.setItem('NumeroCierre', SetlocalStorageItemsToPrint.NumeroCierre);
                        localStorage.setItem('FechaInicial', SetlocalStorageItemsToPrint.FechaInicial);
                        localStorage.setItem('FechaFinal', SetlocalStorageItemsToPrint.FechaFinal);
                        localStorage.setItem('SaldoFinal', SetlocalStorageItemsToPrint.SaldoFinal);
                        break;
                }
            }

            Print(type, jsonParameters);
        },

        AjustesAvanzadosFiltros() {
            $('#reporteModal').modal('show');
            $('#modificarFiltrosId').collapse('hide');

            const formatoDataVentasYDevoluciones = GetCookieElement('formatoDataVentasYDevoluciones=');

            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.FormatoConsultas = formatoDataVentasYDevoluciones ? formatoDataVentasYDevoluciones : 'simple';
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaVendedor = GetCookieElement('formatoDataVentasYDevoluciones_vendedor=') === 'false' ? false : true;
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaComprobante = GetCookieElement('formatoDataVentasYDevoluciones_comprobante=') === 'false' ? false : true;
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaTermino = GetCookieElement('formatoDataVentasYDevoluciones_termino=') === 'false' ? false : true;
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.columnaMoneda = GetCookieElement('formatoDataVentasYDevoluciones_moneda=') === 'false' ? false : true;
        }
    },

    filters: {
        FilterUppercase: value => {
            return value ? value.toString().toUpperCase() : value;
        },

        FilterDateFormat: value => {
            const date = new Date(value);
            const fecha = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

            if (!fecha.includes('NaN'))
                return fecha;
            else
                return value;
        },

        FilterStringToMoneyFormat: value => {
            const mount = Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '');

            if (mount !== 'NaN')
                return mount;
            else
                return value;
        },

        FilterRemoveLeftZeros: value => {
            return value ? value.toString().replace(/^0*/g, '') : value;
        },

        FilterMoneda: value => {
            let returnValue;

            if (value === 0)
                returnValue = 'NACIONAL';
            else if (value === 1)
                returnValue = 'EXTRANJERA';

            return returnValue;
        }

        //FilterCategoria: value => {
        //    const dictionary = { 58: 'NACIONAL', 59: 'INTERNACIONAL' }
        //    return dictionary[value]
        //}
    }
});