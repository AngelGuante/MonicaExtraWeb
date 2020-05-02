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
            $.get(`..${this.ApiRuta}GuardarMovimiento?movimiento=${JSON.stringify(this.Movimiento)}`).done((response, statusText, xhr) => {
                if (xhr.status == 200) {
                    this.LimpiarCamposMovimiento();
                }
            });
        },

        LimpiarCamposMovimiento() {
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
        },

        MovimientoSeleccionado(id) {
            $.get(`..${this.ApiRuta}ObtenerMovimiento`, { id }).done(response => {
                this.Movimiento.FechaEmicion = response.movimiento.Fecha;
                this.Movimiento.CargadoA = response.movimiento.Beneficiario;
                this.Movimiento.Monto = response.movimiento.Monto;
                this.Movimiento.TipoMovimiento = response.movimiento.TipoMovimiento;
                this.Movimiento.Concepto = response.movimiento.Concepto;
                this.Movimiento.RNC = response.movimiento.Rnc;
                this.Movimiento.NCF = response.movimiento.Ncf;
                this.Movimiento.ClasificacionFiscal = response.movimiento.Clasificancf;
                this.Movimiento.ValorSinITBIs = response.movimiento.Neto;
                this.Movimiento.ITBsFacturado = response.movimiento.Itebis;
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