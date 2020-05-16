var app = new Vue({
    el: '#app',
    data: {
        ApiRuta: '/API/ASPISAP/',

        Navegacion: [
            1,
            'SeleccionarEmpresa',
            'menu',
            'ListadoMovimientos',
            'MovimientosCRUD',
            'CuadresDeCajaCRUD'
        ],
        PaginatorIndex: 1,
        PaginatorLastPage: 0,

        // DIV EMPRESA
        Empresas: [],
        EmpresaSeleccionadaInstancia: {},

        //  DIV LISTADO DE MOVIMIENTOS
        Movimientos: [],
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
            Itebis: ''
        },

        //  DIV CRUD MOVIMIENTOS
        MovimientosCrud: [],
        Usuarios: [],
        TiposMovimientos: [],
        ClasificacionesFiscales: [],
        BusquedaMovimiento: {
            Opcion: 'abiertas',
            Tmovimiento: '',
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
        }
    },
    created: function () {
        $.get(`..${this.ApiRuta}GetEmpresas`).done(response => {
            this.Empresas = response.Empresas;
            document.getElementById('cargando').setAttribute('hidden', true);
        });
    },
    methods: {
        //  DIV DONDE SE SELECCIONAN LAS EMPRESAS
        //----------------------------------------------------------
        EmpresaSeleccionada(idEmpresa) {
            document.getElementById('cargando').removeAttribute('hidden');
            $.get(`..${this.ApiRuta}EmpresaSeleccionada`, { idEmpresa }).done((respWonse, statusText, xhr) => {
                if (xhr.status == 200) {
                    this.EmpresaSeleccionadaInstancia = respWonse.Empresa;

                    document.getElementById('SeleccionarEmpresa').setAttribute('hidden', true);
                    document.getElementById('menu').removeAttribute('hidden');
                    this.Navegacion[0] = this.Navegacion[0] + 1;
                }
                else if (xhr.status == 204)
                    alert("EMPRESA SELECCIONADA, NO ENCONTRADA.");
                document.getElementById('cargando').setAttribute('hidden', true);
            });
        },

        //  DIV DONDE SE MUESTRAN LOS LISTADOS DE MOVIMIENTOS
        //----------------------------------------------------------
        ListadoMovimientosCaja() {
            document.getElementById('cargando').removeAttribute('hidden');
            document.getElementById('menu').setAttribute('hidden', true);
            document.getElementById('ListadoMovimientos').removeAttribute('hidden');
            document.getElementById('btnBack').removeAttribute('hidden');

            this.Navegacion[0] = this.Navegacion[0] + 1;
            $.get(`..${this.ApiRuta}ObtenerListadoMovimientos`).done(response => {
                console.log(response);
                this.Movimientos = response.movimientos;
                this.PaginatorLastPage = Math.ceil(response.total / 10);
                document.getElementById('cargando').setAttribute('hidden', true);
            });
        },

        PaginatorMovimientos(index) {
            document.getElementById('cargando').removeAttribute('hidden');
            $.get(`..${this.ApiRuta}ObtenerListadoMovimientos`, { index }).done(response => {
                this.Movimientos = response.movimientos;
                this.PaginatorIndex = index;
                document.getElementById('cargando').setAttribute('hidden', true);
            });
        },

        //  DIV CRUD MOVIMIENTOS
        //----------------------------------------------------------
        MovimientosCRUD() {
            document.getElementById('cargando').removeAttribute('hidden');
            document.getElementById('ListadoMovimientos').setAttribute('hidden', true);
            document.getElementById('MovimientosCRUD').removeAttribute('hidden');
            document.getElementById('btnHome').removeAttribute('hidden');
            this.Navegacion[0] = this.Navegacion[0] + 1;

            //  LLENAR LOS CAMPOS DE ESTA VENTANA: 
            this.Movimiento.Fecha = new Date().toISOString().slice(0, 10);
            $.get(`..${this.ApiRuta}DatosMovimientosCrud`, { flag: 'todo' }).done(response => {
                this.Usuarios = response.usuarios;
                this.TiposMovimientos = response.tiposMovimientos;
                this.ClasificacionesFiscales = response.clasificacionFiscal;
                this.MovimientosCrud = response.movimientos;
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
            this.SeccionMovimientos.NumeroCierre = 0;

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

            document.getElementById('invalidInputRnc').setAttribute('hidden', true);
            document.getElementById('invalidInputNcf').setAttribute('hidden', true);

            if (recargarLista) {
                this.MovimientosCrud = [];
                $.get(`..${this.ApiRuta}ObtenerListadoMovimientos`).done(response => {
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

        MovimientoSeleccionado(id) {
            this.LimpiarCamposMovimiento(recargarLista = true);
            document.getElementById('cargando').removeAttribute('hidden');
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
                    this.Movimiento.Clasificancf = null;
                    this.Movimiento.Neto = null;
                    this.Movimiento.Itebis = null;

                    this.SeccionMovimientos.chckLlenarDatosFiscales = false;
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
            document.getElementById('movimientoOpcTmov').setAttribute('hidden', true);
            document.getElementById('movimientoOpcES').setAttribute('hidden', true);
            document.getElementById('movimientoOpcCfiscal').setAttribute('hidden', true);
            document.getElementById('divFechaDesde').removeAttribute('hidden');
            document.getElementById('divFechaHasta').removeAttribute('hidden');
            switch (document.getElementById('selectBusquedaMovimiento').value) {
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
                    document.getElementById('divFechaDesde').setAttribute('hidden', true);
                    document.getElementById('divFechaHasta').setAttribute('hidden', true);
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
            switch (opcion) {
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

            let parametros = {
                opcion, valor, fechaDesde, fechaHasta
            };

            this.MovimientosCrud = [];
            $.get(`..${this.ApiRuta}DatosMovimientosCrud?parametros=${JSON.stringify(parametros)}`).done(response => {
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
                document.getElementById('cargando').removeAttribute('hidden');
                document.getElementById('MovimientosCRUD').setAttribute('hidden', true);
                document.getElementById('CuadresDeCajaCRUD').removeAttribute('hidden');
                document.getElementById('cargando').setAttribute('hidden', true);
                this.Navegacion[0] = this.Navegacion[0] + 1;
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
                this.VentanaCierres.VentanaCrearCierreDiario.FechaFinal = response.FechaUltimoMovimiento ? response.FechaUltimoMovimiento.substring(0, 10) : new Date().toISOString().substring(0, 10);
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
        MostrarAlerta(flag) {
            let Toast = Swal.mixin({
                toast: true,
                position: 'bottom',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                onOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            })

            Toast.fire({
                icon: flag ? 'success' : 'error',
                title: flag ? 'Proceso realizado con exito.' : 'Algo ha ocurrido.'
            })
        },

        NavigationBtns(flag) {
            switch (flag) {
                case 0:
                    document.getElementById(this.Navegacion[this.Navegacion[0]]).setAttribute('hidden', true);
                    document.getElementById(this.Navegacion[2]).removeAttribute('hidden');
                    document.getElementById('btnBack').setAttribute('hidden', true);
                    document.getElementById('btnHome').setAttribute('hidden', true);
                    this.Navegacion[0] = 2;
                    break;
                case -1:
                    let index = this.Navegacion[0] - 1;
                    document.getElementById(this.Navegacion[this.Navegacion[0]]).setAttribute('hidden', true);
                    document.getElementById(this.Navegacion[index]).removeAttribute('hidden');
                    this.Navegacion[0] = index;

                    if (index == 3)
                        document.getElementById('btnHome').setAttribute('hidden', true);
                    if (index == 2)
                        document.getElementById('btnBack').setAttribute('hidden', true);
                    break;
            }
        },

        PrintMovimiento() {
            printJS('toPrint', 'html');
        },
    },
    filters: {
        FilterUppercase: value => {
            return value ? value.toString().toUpperCase() : value;
        }
    }
});