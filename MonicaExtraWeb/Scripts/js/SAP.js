var app = new Vue({
    el: '#app',
    data: {
        Navegacion: [
            1,
            'SeleccionarEmpresa',
            'menu',
            'ListadoMovimientos',
            'MovimientosCRUD'
        ],
        ApiRuta: '/API/ASPISAP/',
        Empresas: [],
        EmpresaSeleccionadaInstancia: {},
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
        PaginatorIndex: 1,
        PaginatorLastPage: 0,
        Usuarios: [],
        TiposMovimientos: [],
        ClasificacionesFiscales: [],
        BusquedaMovimiento: {
            Opcion: 'todo',
            Tmovimiento: '',
            ES: '',
            Cfiscal: '',
            fechaDesde: '',
            fechaHasta: ''
        },
        SeccionMovimientos: {
            movimientoSeleccionado: 0,
            btnGuardarState: false,
            chckLlenarDatosFiscales: false
        },
        VentanaCierres: {
            Cierres: []
        }
    },
    created: function () {
        $.get(`..${this.ApiRuta}GetEmpresas`).done(response => {
            this.Empresas = response.Empresas;
            document.getElementById('cargando').setAttribute('hidden', true);
        });
    },
    methods: {
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

        ListadoMovimientosCaja() {
            document.getElementById('cargando').removeAttribute('hidden');
            document.getElementById('menu').setAttribute('hidden', true);
            document.getElementById('ListadoMovimientos').removeAttribute('hidden');
            document.getElementById('btnBack').removeAttribute('hidden');

            this.Navegacion[0] = this.Navegacion[0] + 1;
            $.get(`..${this.ApiRuta}ObtenerListadoMovimientos`).done(response => {
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

        MovimientosCRUD() {
            document.getElementById('cargando').removeAttribute('hidden');
            document.getElementById('ListadoMovimientos').setAttribute('hidden', true);
            document.getElementById('MovimientosCRUD').removeAttribute('hidden');
            document.getElementById('btnHome').removeAttribute('hidden');
            this.Navegacion[0] = this.Navegacion[0] + 1;

            //  LLENAR LOS CAMPOS DE ESTA VENTANA:
            this.Movimiento.Fecha = new Date().toISOString().slice(0, 10);
            $.get(`..${this.ApiRuta}ModuleMovimientosCajaCRUD`).done(response => {
                this.Usuarios = response.usuarios;
                this.TiposMovimientos = response.tiposMovimientos;
                this.ClasificacionesFiscales = response.clasificacionFiscal;
                document.getElementById('cargando').setAttribute('hidden', true);
            });

            this.BusquedaMovimiento.fechaDesde = (new Date()).toISOString().slice(0, 10);
            this.BusquedaMovimiento.fechaHasta = (new Date()).toISOString().slice(0, 10);
        },

        GuardarMovimiento() {
            let continuar = true;

            //  COMPROBAR QUE TODOS LOS CAMPOS DE EL CARD DE LOS DATOS BASICOS, ESTEN LLENOS.
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

                        continuar = false;
                    }
                }

                if (continuar) {
                    Swal.fire({
                        title: 'Desea hacer una impresion del movimiento?',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Si'
                    }).then((result) => {
                        if (result.value)
                            this.Print();

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
            } else {
                this.ReestablecerCamposFormularios_Movimientos();

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
        },

        ReestablecerCamposFormularios_Movimientos(flag) {
            let colorDefault = 'white';

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

        ActivarBotonGuardarFormulariosMovimiento_keyPress() {
            if (this.Movimiento.Beneficiario
                && this.Movimiento.Monto
                && this.Movimiento.TipoMovimiento
                && this.Movimiento.Concepto)
                this.SeccionMovimientos.btnGuardarState = true;
            else
                this.SeccionMovimientos.btnGuardarState = false;
        },

        LimpiarCamposMovimiento(flag) {
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

            this.Movimientos = [];
            $.get(`..${this.ApiRuta}ObtenerListadoMovimientos`).done(response => {
                this.Movimientos = response.movimientos;
            });

            this.SeccionMovimientos.chckLlenarDatosFiscales = false;

            if (flag) {
                document.getElementById('btnsMovimientoSeleccionado').setAttribute('hidden', true);
                document.getElementById('btnsNuevoMovimiento').removeAttribute('hidden');
            }
        },

        MovimientoSeleccionado(id) {
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
                document.getElementById('cargando').setAttribute('hidden', true);
            });
        },

        SelectBusquedaMovimientoChanged() {
            document.getElementById('movimientoOpcTmov').setAttribute('hidden', true);
            document.getElementById('movimientoOpcES').setAttribute('hidden', true);
            document.getElementById('movimientoOpcCfiscal').setAttribute('hidden', true);
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
            }
        },

        ModificarMovimiento() {
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
            };

            let parametros = {
                opcion, valor, fechaDesde, fechaHasta
            };

            this.Movimientos = [];
            $.get(`..${this.ApiRuta}BuscarMovimientos?parametros=${JSON.stringify(parametros)}`).done(response => {
                this.Movimientos = response.movimientos;
                document.getElementById('cargando').setAttribute('hidden', true);
            });
        },

        CuadresCaja() {
            document.getElementById('cargando').removeAttribute('hidden');
            document.getElementById('MovimientosCRUD').setAttribute('hidden', true);
            document.getElementById('CuadresDeCajaCRUD').removeAttribute('hidden');
            document.getElementById('cargando').setAttribute('hidden', true);

            $.get(`..${this.ApiRuta}ObtenerCierresCaja?fechaInicial=fechaInicial&fechaFinal=fechaFinal`).done(response => {
                this.VentanaCierres.Cierres = response.Cierres;
            });
        },

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

        Print() {
            printJS('toPrint', 'html');
        }
    },
    filters: {
        FilterUppercase: value => {
            return value ? value.toString().toUpperCase() : value;
        }
    }
});