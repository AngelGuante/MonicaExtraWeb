var app = new Vue({
    el: '#app',
    data: {
        ApiRuta: '/API/ASPISAP/',
        Empresas: [],
        Movimientos: [],
        Movimiento: {
            FechaEmicion: '',
            CargadoA: '',
            Monto: '',
            TipoMovimiento: '',
            Concepto: '',
            RNC: '',
            NCF: '',
            ClasificacionFiscal: '',
            ValorSinITBIs: '',
            ITBsFacturado: ''
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
        }
    },
    created: function () {
        $.get(`..${this.ApiRuta}GetEmpresas`).done(response => {
            this.Empresas = response.Empresas;
        });
    },
    methods: {
        EmpresaSeleccionada(idEmpresa) {
            $.get(`..${this.ApiRuta}EmpresaSeleccionada`, { idEmpresa }).done((respWonse, statusText, xhr) => {
                if (xhr.status == 200) {
                    document.getElementById('SeleccionarEmpresa').hidden = true;
                    document.getElementById('menu').hidden = false;
                }
                else if (xhr.status == 204)
                    alert("EMPRESA SELECCIONADA, NO ENCONTRADA.");
            });
        },

        ListadoMovimientosCaja() {
            document.getElementById('menu').hidden = true;
            document.getElementById('ListadoMovimientos').hidden = false;
            $.get(`..${this.ApiRuta}ObtenerListadoMovimientos`).done(response => {
                this.Movimientos = response.movimientos;
                this.PaginatorLastPage = Math.ceil(response.total / 10);
            });
        },

        PaginatorMovimientos(index) {
            $.get(`..${this.ApiRuta}ObtenerListadoMovimientos`, { index }).done(response => {
                this.Movimientos = response.movimientos;
                this.PaginatorIndex = index;
            });
        },

        MovimientosCRUD() {
            document.getElementById('ListadoMovimientos').hidden = true;
            document.getElementById('MovimientosCRUD').hidden = false;

            //  LLENAR LOS CAMPOS DE ESTA VENTANA:
            this.Movimiento.FechaEmicion = new Date().toISOString().slice(0, 10);
            $.get(`..${this.ApiRuta}ModuleMovimientosCajaCRUD`).done(response => {
                this.Usuarios = response.usuarios;
                this.TiposMovimientos = response.tiposMovimientos;
                this.ClasificacionesFiscales = response.clasificacionFiscal;
            });

            this.BusquedaMovimiento.fechaDesde = (new Date()).toISOString().slice(0, 10);
            this.BusquedaMovimiento.fechaHasta = (new Date()).toISOString().slice(0, 10);
        },

        GuardarMovimiento() {
            let continuar = true;

            //  COMPROBAR QUE TODOS LOS CAMPOS DE EL CARD DE LOS DATOS BASICOS, ESTEN LLENOS.
            if (this.Movimiento.CargadoA
                && this.Movimiento.Monto
                && this.Movimiento.TipoMovimiento
                && this.Movimiento.Concepto) {

                //  SI EL CHECKBOX DE 'Llenar Datos Fiscales' ESTA CHECADO, COMPROBAR QUE TODOS LOS CAMPOS DE EL CARD DE LOS DATOS FISCALES, ESTEN LLENOS.
                if (this.SeccionMovimientos.chckLlenarDatosFiscales) {
                    if (!this.Movimiento.RNC
                        || !this.Movimiento.NCF
                        || !this.Movimiento.ClasificacionFiscal
                        || !this.Movimiento.ValorSinITBIs
                        || !this.Movimiento.ITBsFacturado) {

                        if (!this.Movimiento.RNC)
                            document.getElementById('inputRnc').style.backgroundColor = '#f5aba6';
                        if (!this.Movimiento.NCF)
                            document.getElementById('inputNcf').style.backgroundColor = '#f5aba6';
                        if (!this.Movimiento.ClasificacionFiscal)
                            document.getElementById('selectClsFiscal').style.backgroundColor = '#f5aba6';
                        if (!this.Movimiento.ValorSinITBIs)
                            document.getElementById('inputItbis').style.backgroundColor = '#f5aba6';
                        if (!this.Movimiento.ITBsFacturado)
                            document.getElementById('inputItbiFacturado').style.backgroundColor = '#f5aba6';

                        continuar = false;
                    }
                }

                if (continuar) {
                    $.get(`..${this.ApiRuta}GuardarMovimiento?movimiento=${JSON.stringify(this.Movimiento)}`).done((response, statusText, xhr) => {
                        if (xhr.status == 200) {
                            this.LimpiarCamposMovimiento();
                        }
                    });
                }

                this.ReestablecerCamposFormularios_Movimientos();
            } else {
                this.ReestablecerCamposFormularios_Movimientos();

                if (!this.Movimiento.Monto)
                    document.getElementById('inputMonto').style.backgroundColor = '#f5aba6';
                if (!this.Movimiento.CargadoA)
                    document.getElementById('cargadoA').style.backgroundColor = '#f5aba6';
                if (!this.Movimiento.TipoMovimiento)
                    document.getElementById('selectTipoMovimiento').style.backgroundColor = '#f5aba6';
                if (!this.Movimiento.Concepto)
                    document.getElementById('inputCocepto').style.backgroundColor = '#f5aba6';
            }
        },

        ReestablecerCamposFormularios_Movimientos(flag) {
            let colorDefault = 'white';

            if (this.Movimiento.Monto || flag)
                document.getElementById('inputMonto').style.backgroundColor = colorDefault;
            if (this.Movimiento.CargadoA || flag)
                document.getElementById('cargadoA').style.backgroundColor = colorDefault;
            if (this.Movimiento.TipoMovimiento || flag)
                document.getElementById('selectTipoMovimiento').style.backgroundColor = colorDefault;
            if (this.Movimiento.Concepto || flag)
                document.getElementById('inputCocepto').style.backgroundColor = colorDefault;

            if (this.SeccionMovimientos.chckLlenarDatosFiscales) {
                if (this.Movimiento.RNC || flag)
                    document.getElementById('inputRnc').style.backgroundColor = colorDefault;
                if (this.Movimiento.NCF || flag)
                    document.getElementById('inputNcf').style.backgroundColor = colorDefault;
                if (this.Movimiento.ClasificacionFiscal || flag)
                    document.getElementById('selectClsFiscal').style.backgroundColor = colorDefault;
                if (this.Movimiento.ValorSinITBIs || flag)
                    document.getElementById('inputItbis').style.backgroundColor = colorDefault;
                if (this.Movimiento.ITBsFacturado || flag)
                    document.getElementById('inputItbiFacturado').style.backgroundColor = colorDefault;
            }
        },

        ActivarBotonGuardarFormulariosMovimiento_keyPress() {
            if (this.Movimiento.CargadoA
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

            this.Movimiento.FechaEmicion = new Date().toISOString().slice(0, 10);
            this.Movimiento.CargadoA = '';
            this.Movimiento.Monto = '';
            this.Movimiento.TipoMovimiento = '';
            this.Movimiento.Concepto = '';
            this.Movimiento.RNC = '';
            this.Movimiento.NCF = '';
            this.Movimiento.ClasificacionFiscal = '';
            this.Movimiento.ValorSinITBIs = '';
            this.Movimiento.ITBsFacturado = '';

            this.Movimientos = [];
            $.get(`..${this.ApiRuta}ObtenerListadoMovimientos`).done(response => {
                this.Movimientos = response.movimientos;
            });

            this.SeccionMovimientos.chckLlenarDatosFiscales = false;

            if (flag) {
                document.getElementById('btnModificarForm').setAttribute('hidden', true);
                document.getElementById('btnCancelModifyForm').setAttribute('hidden', true);

                document.getElementById('btnSaveForm').removeAttribute('hidden');
                document.getElementById('btnClean').removeAttribute('hidden');
            }
        },

        MovimientoSeleccionado(id) {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;

            this.SeccionMovimientos.MovimientoSeleccionado = id;
            document.getElementById('btnSaveForm').setAttribute('hidden', true);
            document.getElementById('btnClean').setAttribute('hidden', true);

            document.getElementById('btnModificarForm').removeAttribute('hidden');
            document.getElementById('btnCancelModifyForm').removeAttribute('hidden');

            $.get(`..${this.ApiRuta}ObtenerMovimiento`, { id }).done(response => {
                this.Movimiento.FechaEmicion = response.movimiento.Fecha;
                this.Movimiento.CargadoA = response.movimiento.Beneficiario;
                this.Movimiento.Monto = response.movimiento.Monto;
                this.Movimiento.TipoMovimiento = response.movimiento.TipoMovimiento;
                this.Movimiento.Concepto = response.movimiento.Concepto;

                if (this.Movimiento.RNC = response.movimiento.Rnc) {
                    this.SeccionMovimientos.chckLlenarDatosFiscales = true;
                    this.Movimiento.RNC = response.movimiento.Rnc;
                    this.Movimiento.NCF = response.movimiento.Ncf;
                    this.Movimiento.ClasificacionFiscal = response.movimiento.Clasificancf;
                    this.Movimiento.ValorSinITBIs = response.movimiento.Neto;
                    this.Movimiento.ITBsFacturado = response.movimiento.Itebis;
                }
                else
                    this.SeccionMovimientos.chckLlenarDatosFiscales = false;
            });
        },

        SelectBusquedaMovimientoChanged() {
            document.getElementById('movimientoOpcTmov').hidden = true;
            document.getElementById('movimientoOpcES').hidden = true;
            document.getElementById('movimientoOpcCfiscal').hidden = true;
            switch (document.getElementById('selectBusquedaMovimiento').value) {
                case 'tmovimiento':
                    document.getElementById('movimientoOpcTmov').hidden = false;
                    break;
                case 'es':
                    document.getElementById('movimientoOpcES').hidden = false;
                    break;
                case 'cfiscal':
                    document.getElementById('movimientoOpcCfiscal').hidden = false;
                    break;
            }
        },

        ModificarMovimiento() {
            $.get(`..${this.ApiRuta}ModificarMovimiento?id=${this.SeccionMovimientos.MovimientoSeleccionado}&movimiento=${JSON.stringify(this.Movimiento)}`).done((response, statusText, xhr) => {
                if (xhr.status == 200) {
                    this.LimpiarCamposMovimiento();
                } else {
                    alert('Algo salio mal.');
                }
            }).fail(() => {
                alert('Algo salio mal.');
            });
        },

        BuscarMovimientos() {
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
            });
        }
    }
});