﻿var app = new Vue({
    el: '#app',
    data: {
        ApiRuta: '/API/ASPISAP/',
        ApiClientes: '/API/Clientes/',
        ApiReportes: '/API/Reportes/',
        ApiRuta_ws: '/API/Server_wsActions/',

        PaginatorIndex: 1,
        PaginatorLastPage: 0,

        // DIV LOG
        DivLog: {
            remember: true,
            pass: ''
        },

        // DIV EMPRESA
        Empresas: [],
        EmpresaSeleccionadaInstancia: {},

        //  DIV CRUD MOVIMIENTOS
        VentanaCrudMovimientos: {
            FormularioTitle: 'Crear Movimiento de Caja',

            divBuscarMovimientos: {
                checkedBuscarPorFechas: false
            }
        },

        Movimiento: {
            Fecha: '',
            Beneficiario: '',
            Nombre_completo: '',
            Monto: '',
            TipoMovimiento: '',
            DescripcionMovimiento: '',
            Concepto: '',
            RNC: '',
            NCF: '',
            Clasificancf: '',
            DescripcionClasfFiscal: '',
            Neto: '',
            Itebis: '',
            NumeroCierre: 0
        },
        MovimientosCrud: [],
        Usuarios: [],
        TiposMovimientos: [],
        ClasificacionesFiscales: [],
        BusquedaMovimiento: {
            Opcion: 'abiertas',
            inptConcepto: '',
            inptNroMovimiento: '',
            cargadoA: '',
            inptRNC: '',
            inptNCF: '',
            inptNroCierre: '',
            ES: '',
            Cfiscal: '',
            abiertas: '',
            fechaDesde: '',
            fechaHasta: ''
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

            CierreSeleccionado: {

            },
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
            codsClientes: [],
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
        let rememberPasswordCookie = document.cookie.split('; ')
            .find(item => item.startsWith('rememberPass='));

        if (!rememberPasswordCookie) {
            document.cookie = 'password=;'
            document.cookie = 'rememberPass=true;'
            rememberPasswordCookie = 'rememberPass=true;'
        }

        this.DivLog.remember = rememberPasswordCookie.replace('rememberPass=', '').replace(';', '') == 'true' ? true : false;
        if (this.DivLog.remember) {
            this.DivLog.pass = rememberPasswordCookie = document.cookie.split('; ')
                .find(item => item.startsWith('password='))
                .replace('password=', '')
                .replace(';', '');
        }
    },
    methods: {
        //  DIV PARA LOGEARSE
        //----------------------------------------------------------
        Log() {
            if (this.DivLog.remember) {
                document.cookie = `password=${this.DivLog.pass};`
                document.cookie = `rememberPass=true;`
            }
            else {
                document.cookie = `password=;`
                document.cookie = `rememberPass=false;`
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
                    this.EmpresaSeleccionadaInstancia = respWonse.Empresa;

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
                    if (result.value)
                        this.PrintMovimiento();

                    document.getElementById('cargando').removeAttribute('hidden');
                    $.get(`..${this.ApiRuta}GuardarMovimiento?movimiento=${JSON.stringify(this.Movimiento)}`).done((response, statusText, xhr) => {
                        if (xhr.status == 200) {
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

        //  UTILS
        //----------------------------------------------------------
        PrintMovimiento(idMovimiento) {
            if (idMovimiento) {
                this.MovimientoSeleccionado(idMovimiento, true);
                return;
            }
            printJS('toPrint', 'html');
        },

        //---------------------------------------------------------------------------------------------------------------------------------------------------
        //                              MODULO DE REPORTES
        //---------------------------------------------------------------------------------------------------------------------------------------------------

        ObtenerDatos() {
            $.get(`..${this.ApiRuta_ws}GetMoviments`).done((response) => {
                //$.get(`..${this.ApiRuta_ws}GetMoviments?sessionId=a1ddb8c4-e576-426f-91e3-49816b3a70dc`).done(response => {
                //this.paraDemo = JSON.parse('[{"NumeroTransacion":225,"Beneficiario":"49","Concepto":"B","Rnc":"1","Ncf":"2","TipoMovimiento":3,"Monto":0.00,"Itebis":"4","Neto":3.00,"Soporte":"C","Fecha":"2020-05-08","Saldo":null,"EntradaSalida":"E","CodigoCajero":null,"NumeroCaja":1,"TipoMoneda":"P","TasaCambio":0.0000,"Estatus":1,"Clasificancf":10,"NumeroCierre":53},{"NumeroTransacion":224,"Beneficiario":"49","Concepto":"A","Rnc":"2","Ncf":"3","TipoMovimiento":3,"Monto":1.00,"Itebis":"5","Neto":4.00,"Soporte":"C","Fecha":"2020-05-08","Saldo":null,"EntradaSalida":"E","CodigoCajero":null,"NumeroCaja":1,"TipoMoneda":"P","TasaCambio":0.0000,"Estatus":1,"Clasificancf":10,"NumeroCierre":53},{"NumeroTransacion":223,"Beneficiario":null,"Concepto":"tewteet","Rnc":"32424","Ncf":"3","TipoMovimiento":3,"Monto":345243.00,"Itebis":null,"Neto":null,"Soporte":"C","Fecha":null,"Saldo":null,"EntradaSalida":"E","CodigoCajero":null,"NumeroCaja":1,"TipoMoneda":"P","TasaCambio":0.0000,"Estatus":1,"Clasificancf":null,"NumeroCierre":53},{"NumeroTransacion":222,"Beneficiario":null,"Concepto":"ULTIMA PRUEBA","Rnc":"","Ncf":"","TipoMovimiento":3,"Monto":141123.00,"Itebis":null,"Neto":null,"Soporte":"C","Fecha":null,"Saldo":null,"EntradaSalida":"E","CodigoCajero":null,"NumeroCaja":1,"TipoMoneda":"P","TasaCambio":0.0000,"Estatus":1,"Clasificancf":null,"NumeroCierre":53},{"NumeroTransacion":221,"Beneficiario":null,"Concepto":"erwe","Rnc":"","Ncf":"","TipoMovimiento":3,"Monto":341243.00,"Itebis":null,"Neto":null,"Soporte":"C","Fecha":null,"Saldo":null,"EntradaSalida":"E","CodigoCajero":null,"NumeroCaja":1,"TipoMoneda":"P","TasaCambio":0.0000,"Estatus":1,"Clasificancf":null,"NumeroCierre":53},{"NumeroTransacion":220,"Beneficiario":null,"Concepto":"ewr","Rnc":"","Ncf":"","TipoMovimiento":3,"Monto":1234.00,"Itebis":null,"Neto":null,"Soporte":"C","Fecha":null,"Saldo":null,"EntradaSalida":"E","CodigoCajero":null,"NumeroCaja":1,"TipoMoneda":"P","TasaCambio":0.0000,"Estatus":1,"Clasificancf":null,"NumeroCierre":53},{"NumeroTransacion":219,"Beneficiario":null,"Concepto":"werqwr","Rnc":"","Ncf":"","TipoMovimiento":994,"Monto":3243.00,"Itebis":null,"Neto":null,"Soporte":"C","Fecha":null,"Saldo":null,"EntradaSalida":"E","CodigoCajero":null,"NumeroCaja":1,"TipoMoneda":"P","TasaCambio":0.0000,"Estatus":1,"Clasificancf":null,"NumeroCierre":53},{"NumeroTransacion":218,"Beneficiario":null,"Concepto":"rete","Rnc":"","Ncf":"","TipoMovimiento":3,"Monto":4523.00,"Itebis":null,"Neto":null,"Soporte":"C","Fecha":null,"Saldo":null,"EntradaSalida":"E","CodigoCajero":null,"NumeroCaja":1,"TipoMoneda":"P","TasaCambio":0.0000,"Estatus":1,"Clasificancf":null,"NumeroCierre":53},{"NumeroTransacion":217,"Beneficiario":null,"Concepto":"2433214124","Rnc":"","Ncf":"","TipoMovimiento":3,"Monto":32423.00,"Itebis":null,"Neto":null,"Soporte":"C","Fecha":null,"Saldo":null,"EntradaSalida":"E","CodigoCajero":null,"NumeroCaja":1,"TipoMoneda":"P","TasaCambio":0.0000,"Estatus":1,"Clasificancf":null,"NumeroCierre":53},{"NumeroTransacion":216,"Beneficiario":null,"Concepto":"ytyt","Rnc":"","Ncf":"","TipoMovimiento":3,"Monto":55.00,"Itebis":null,"Neto":null,"Soporte":"C","Fecha":null,"Saldo":null,"EntradaSalida":"E","CodigoCajero":null,"NumeroCaja":1,"TipoMoneda":"P","TasaCambio":0.0000,"Estatus":1,"Clasificancf":null,"NumeroCierre":53}]');
                //document.getElementById('paraDemo').removeAttribute('hidden');
                //document.getElementById('dondeBuscar').setAttribute('hidden', true);
                console.log(response);
            });
        },

        //  MENU DE SOURCE DE REPORTES
        //----------------------------------------------------------
        DivSeleccionarSourceParaReporte() {
            NavigationBehaviour('SeleccionarSourceParaReporte');
            document.getElementById('cargando').setAttribute('hidden', true);
        },

        //  OPCIONES DEL MENU
        //-------------------------------------------------------------------------------
        OptCuentasPorCobrarClte() {
            if (window.innerWidth < 990) {
                document.getElementById('filtrosReportes').style.display = 'flex';
                document.getElementById('btnReporteMostrarMenu').style.display = 'block';
                document.getElementById('seleccionarReporte').style.display = 'none';
            }
        },

        //  MENU DE REPORTES  
        //----------------------------------------------------------
        DivSeleccionarReporte() {
            NavigationBehaviour('SeleccionarReporte');
            document.getElementById('cargando').setAttribute('hidden', true);

            if (this.Reportes.codsClientes.length === 0) {
                $.get(`..${this.ApiClientes}GetCodes`, {}, response => {
                    this.Reportes.codsClientes = response.codes;
                });
            }
        },

        // REPORTES
        //----------------------------------------------------------
        ValidarCampoCodigoCliente() {
            this.Reportes.IndividualClientStatusFILTROS.codCliente = document.getElementById('inputCodigoClienteFiltroReporte').value;

            if (!this.Reportes.IndividualClientStatusFILTROS.codCliente) {
                document.getElementById('validationReportesCodigoCliente').removeAttribute('hidden');
                return;
            }
            else
                document.getElementById('validationReportesCodigoCliente').setAttribute('hidden', true);

            if (!this.Reportes.codsClientes.includes(this.Reportes.IndividualClientStatusFILTROS.codCliente)) {
                MostrarMensage({
                    title: 'Código No Encontrado',
                    message: `El código ${this.Reportes.IndividualClientStatusFILTROS.codCliente}, no ha sido encontrado, favor ingrese un código válido.`,
                    icon: 'info'
                });
                return;
            }

            this.BuscarCliente();
        },

        BuscarCliente() {
            const filtro = {
                SoloDocsVencidos: this.Reportes.IndividualClientStatusFILTROS.soloDocsVencidos,
                //IncluirFirmas: this.Reportes.IndividualClientStatusFILTROS.incluirFirmas,
                IncluirMoras: this.Reportes.IndividualClientStatusFILTROS.incluirMoras
            }

            $.get(`..${this.ApiReportes}GetIndividualClientStatus`, { clientCode: this.Reportes.IndividualClientStatusFILTROS.codCliente, filtro }, response => {
                this.Reportes.IndividualClientStatusDATA = [];

                for (item of response.IndividualClientStatusDATA) {
                    this.Reportes.IndividualClientStatusDATA.push({
                        descripcion_dcmto: item.descripcion_dcmto,
                        fecha_emision: item.fecha_emision,
                        fecha_vcmto: item.fecha_vcmto,
                        ncf: item.ncf,
                        diasTrancurridos: DaysDiff(item.fecha_emision, item.fecha_vcmto),
                        pagosAcumulados: item.pagosAcumulados,
                    });
                }

                if (!this.Reportes.IndividualClientStatusDATA.length)
                    MostrarMensage({
                        title: 'Sin registros',
                        message: `El código ${this.Reportes.IndividualClientStatusFILTROS.codCliente}, no tiene ningún registro.`,
                        icon: 'info'
                    });
            });
        }

    },
    filters: {
        FilterUppercase: value => {
            return value ? value.toString().toUpperCase() : value;
        },

        FilterDateFormat: value => {
            const date = new Date(value);
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        }
    }
});