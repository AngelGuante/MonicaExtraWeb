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
            VentasYDevolucionesCategoriaYVendedorFILTROS: {
                tipoReporte: 'ventas',
                minFecha_emision: '',
                maxFecha_emision: '',
                Codigo_vendedor: '',
                tipo_factura: '1',
                vendedores: [],
                vendedorSeleccionado: '',
                categoriasClientes: [],
                categoriaClientesSeleccionada: '',
                tipoConsulta: '',
                desde: '',
                hasta: '',
                valor: '',
                terminoDePagoSeleccionado: '',
                terminoDePago: [],
                nombresBodegaSeleccionada: '',
                nombresBodega: [],
                categoriasProductosSeleccionada: '',
                categoriasProductos: [],
                traerSubTotal: false
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
            if (Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA01'
                || Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA02'
                || Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA03'
                || Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA04'
                || Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA05'
                || Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA06'
                || Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA0'
                || Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA08')
                this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoReporte = 'ventas';
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
                document.getElementById('SeleccionarEmpresa').removeAttribute('hidden');

                $.get(`..${this.ApiRuta}GetEmpresas`).done(response => {
                    this.Empresas = response.Empresas;
                    document.getElementById('cargando').setAttribute('hidden', true);
                });
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
        async Buscar_VentasYDevolucionesCategoriaYVendedor() {
            if (this.Reportes.sourceResportes === 'web')
                console.log('Por el momento esta busqueda solo se ha planteado para la parte Local');
            else if (this.Reportes.sourceResportes === 'local') {
                this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA = [];

                const filtro = {
                    minFecha_emision: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.minFecha_emision,
                    maxFecha_emision: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.maxFecha_emision,
                    tipo_factura: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipo_factura,
                    Codigo_vendedor: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.vendedorSeleccionado.trim(),
                    categoria_clte_id: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriaClientesSeleccionada,
                    tipoConsulta: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta,
                    traerSubTotal: this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.traerSubTotal
                }

                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA01'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA02') {
                    //  VALIDAR QUE LOS CAMPOS 'Desde' Y 'Hasta' TENGAN UN VALOR.
                    //if (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desde) {
                    //    document.getElementById('validationVentasYDevolucionesCategoriaYVendedorDesde').removeAttribute('hidden');
                    //    return;
                    //}
                    //else (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desde)
                    //document.getElementById('validationVentasYDevolucionesCategoriaYVendedorDesde').setAttribute('hidden', true);

                    //if (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta) {
                    //    document.getElementById('validationVentasYDevolucionesCategoriaYVendedorHasta').removeAttribute('hidden');
                    //    return;
                    //}
                    //else (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desde)
                    //document.getElementById('validationVentasYDevolucionesCategoriaYVendedorHasta').setAttribute('hidden', true);

                    //  AGREGAR  'Desde' Y 'Hasta' AL FILTRO.
                    filtro.desde = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desde;
                    filtro.hasta = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta;
                }
                else if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA03') {
                    //  VALIDAR QUE EL CAMPO 'terminoDePagoSeleccionado' TENGA ALGUN VALOR.
                    //if (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePagoSeleccionado) {
                    //    document.getElementById('validationVentasYDevolucionesCategoriaYVendedorselectTerminoPago').removeAttribute('hidden');
                    //    return;
                    //}
                    //else (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePagoSeleccionado)
                    //document.getElementById('validationVentasYDevolucionesCategoriaYVendedorselectTerminoPago').setAttribute('hidden', true);

                    //  AGREGAR  'valor' AL FILTRO.
                    filtro.valor = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.terminoDePagoSeleccionado;
                }
                else if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA0') {
                    //  VALIDAR QUE EL CAMPO 'nombresBodega' TENGA ALGUN VALOR.
                    //if (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.nombresBodegaSeleccionada) {
                    //    document.getElementById('validationVentasYDevolucionesCategoriaYVendedorselectBodega').removeAttribute('hidden');
                    //    return;
                    //}
                    //else (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.nombresBodegaSeleccionada)
                    //document.getElementById('validationVentasYDevolucionesCategoriaYVendedorselectBodega').setAttribute('hidden', true);

                    //  AGREGAR  'valor' AL FILTRO.
                    filtro.valor = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.nombresBodegaSeleccionada;
                }
                else if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA08') {
                    //  VALIDAR QUE EL CAMPO 'nombresBodega' TENGA ALGUN VALOR.
                    //if (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasProductosSeleccionada) {
                    //    document.getElementById('validationVentasYDevolucionesCategoriaYVendedorselectCategoriaProducto').removeAttribute('hidden');
                    //    return;
                    //}
                    //else (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasProductosSeleccionada)
                    //document.getElementById('validationVentasYDevolucionesCategoriaYVendedorselectCategoriaProducto').setAttribute('hidden', true);

                    //  AGREGAR  'valor' AL FILTRO.
                    filtro.valor = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasProductosSeleccionada;
                }
                else if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA04'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA05'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA06') {
                    //  VALIDAR QUE EL CAMPO 'valor' TENGA ALGUN VALOR. 
                    //if (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.valor) {
                    //    document.getElementById('validationVentasYDevolucionesCategoriaYVendedorValor').removeAttribute('hidden');
                    //    return;
                    //}
                    //else (!this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.valor)
                    //document.getElementById('validationVentasYDevolucionesCategoriaYVendedorValor').setAttribute('hidden', true);

                    //  AGREGAR  'valor' AL FILTRO.
                    filtro.valor = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.valor;
                }
                else
                    filtro.tipoReporte = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoReporte;

                //  AGREGAR desde hasta VALORES
                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA03'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA04'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA06'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA0'
                    || this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === 'RFA08') {
                    filtro.desde = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.desde;
                    filtro.hasta = this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.hasta;
                }

                var result = await BuscarInformacionLocal('SendWebsocketServer/2', filtro);

                for (item of result)
                    this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA.push(item);

                //
                let tableName = '';
                let camposArray = [];
                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === '') {
                    tableName = 'tablaVentasYDevoluciones';
                    camposArray = [4, 5, 6];

                    for (item of this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA)
                        item.itbis = Math.floor(item.total / 1.18);
                }
                else {
                    tableName = 'tablaRangoNroFactura';
                    camposArray = [8, 10];
                }

                //  TOTALIZACIONES.
                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA.length === 0)
                    return;

                this.Reportes.VentasYDevolucionesCategoriaYVendedorTablaVisible = tableName;

                filtro.SUM = true;
                result = await BuscarInformacionLocal('SendWebsocketServer/2', filtro);

                let jsonTotalizacion = {};
                if (this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoConsulta === '')
                    jsonTotalizacion = { '': '', '': '', '': '', '': '', 'SubTotalNeto': result[0].sumatoriaMontos, 'impto': result[0].sumatoriaPagosAcumulados, 'total': result[0].sumatoriaBalance };
                else
                    jsonTotalizacion = { '': '', '': '', '': '', '': '', '': '', '': '', '': '', '': '', 'dscto_monto': result[0].sumatoriaBalance, '': '', 'total': result[0].sumatoriaBalance };

                this.Reportes.VentasYDevolucionesCategoriaYVendedorDATA.push(jsonTotalizacion);

                let interval = setInterval(() => {
                    let tabla = document.getElementById(tableName);

                    if (tabla) {
                        TablaEstiloTotalizacionFila(tabla, camposArray)

                        clearInterval(interval);
                    }
                }, 0);

                //  GUARDARLO EN EL NAVEGADOR PARA CUANDO EL CLIENTE LE DE A IMPRIMIR.
                //localStorage.setItem('sumatoriasEstadoCuentaCliente', JSON.stringify(result[0]));
            }
        },

        async Buscar() {
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
                //IncluirFirmas: this.Reportes.IndividualClientStatusFILTROS.incluirFirmas,
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
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipoReporte = 'ventas';
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.Codigo_vendedor = '';
            this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.tipo_factura = '1';
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
                    this.Reportes.VentasYDevolucionesCategoriaYVendedorFILTROS.categoriasProductos = await BuscarInformacionLocal('SendWebsocketServer/9', {});
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
            return value ? value.replace(/^0/g, '') : value;
        }
    }
});