const monicaReportes = new Vue({
    el: '#moduloReportes',

    data: {
        usuarioPuedeProbarNuevasActualizaciones: localStorage.getItem("Number") === '7',
        fechaHoy: new Date().toISOString().slice(0, 10),
        sourceResportes: 'local',
        codsClientes: [],
        opcionReporteSeleccionado: '',
        vendedores: [],
        categoriasClientes: [],
        categoriasProveedores: [],
        subCategoriasProductos: [],
        terminoDePago: [],
        terminoDePagoPv: [],
        nombresBodega: [],
        categoriasProductos: [],
        impuestos: [],
        giroNegocios: [],
        giroNegociosPv: [],
        minFecha_emision: '',
        maxFecha_emision: '',
        dolar: '',
        modulos: [],
        parametros: []
    },

    created: async function () {
        document.getElementById('btnHome').removeAttribute('hidden');

        fetch(`../../API/PERMISOSUSUARIO/GET/${localStorage.getItem('Number')}`, {
            headers: {
                'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
            }
        })
            .then(response => { return response.json(); })
            .then(json => {
                this.modulos = json.permisosUsuario;

                document.getElementById('cargando').setAttribute('hidden', true);
            })
            .catch(err => {
                document.getElementById('cargando').setAttribute('hidden', true);
                console.log(err);
            });
        document.getElementById('cargando').setAttribute('hidden', true);
        document.getElementById('divMaster').classList.remove('container');

        //  ELEMENTOS QUE NO SE PUEDEN VER POR TODOS LOS USUARIOS
        if (!this.usuarioPuedeProbarNuevasActualizaciones) {
            setTimeout(() => {
                document.getElementsByName('soloAlmonte').forEach(item => {
                    item.setAttribute('hidden', true);
                });
            }, 10)
        }
    },

    watch: {
        vendedores: () => {
            reporte_ventasYDevoluciones.FILTROS.vendedores = monicaReportes.vendedores;
            reporte_cotizacionesYConduces.FILTROS.vendedores = monicaReportes.vendedores;
            reporte_clientesYProveedores.FILTROS.vendedores = monicaReportes.vendedores;
            manejoDeData_crearProceso.FILTROS.vendedores = monicaReportes.vendedores;
        },
        categoriasClientes: () => {
            reporte_ventasYDevoluciones.FILTROS.categoriasClientes = monicaReportes.categoriasClientes;
            reporte_cotizacionesYConduces.FILTROS.categoriasClientes = monicaReportes.categoriasClientes;
            reporte_clienteIndividualStatus.FILTROS.categoriasClientes = monicaReportes.categoriasClientes;
            reporte_clientesYProveedores.FILTROS.categoriasClientes = monicaReportes.categoriasClientes;
        },
        categoriasProveedores: () => {
            reporte_clienteIndividualStatus.FILTROS.categoriasProveedores = monicaReportes.categoriasProveedores;
            reporte_comprasDevolucionesYCotizaciones.FILTROS.categoriasProveedores = monicaReportes.categoriasProveedores;
            reporte_clientesYProveedores.FILTROS.categoriasProveedores = monicaReportes.categoriasProveedores;
        },
        minFecha_emision: () => {
            reporte_ventasYDevoluciones.FILTROS.minFecha_emision = monicaReportes.minFecha_emision;
            reporte_cotizacionesYConduces.FILTROS.minFecha_emision = monicaReportes.minFecha_emision;
            reporte_clienteIndividualStatus.FILTROS.minFecha_emision = monicaReportes.minFecha_emision;
            reporte_comprasDevolucionesYCotizaciones.FILTROS.minFecha_emision = monicaReportes.minFecha_emision;
        },
        maxFecha_emision: () => {
            reporte_ventasYDevoluciones.FILTROS.maxFecha_emision = monicaReportes.maxFecha_emision;
            reporte_cotizacionesYConduces.FILTROS.maxFecha_emision = monicaReportes.maxFecha_emision;
            reporte_clienteIndividualStatus.FILTROS.maxFecha_emision = monicaReportes.maxFecha_emision;
            reporte_comprasDevolucionesYCotizaciones.FILTROS.maxFecha_emision = monicaReportes.maxFecha_emision;
        },
        terminoDePago: () => {
            reporte_ventasYDevoluciones.FILTROS.terminoDePago = monicaReportes.terminoDePago;
            reporte_cotizacionesYConduces.FILTROS.terminoDePago = monicaReportes.terminoDePago;
            reporte_clienteIndividualStatus.FILTROS.terminoDePago = monicaReportes.terminoDePago;
            reporte_comprasDevolucionesYCotizaciones.FILTROS.terminoDePago = monicaReportes.terminoDePago;
            reporte_clientesYProveedores.FILTROS.terminoDePago = monicaReportes.terminoDePago;
            manejoDeData_crearProceso.FILTROS.terminoDePago = monicaReportes.terminoDePago;
        },
        terminoDePagoPv: () => {
            reporte_clientesYProveedores.FILTROS.terminoDePagoPv = monicaReportes.terminoDePagoPv;
        },
        impuestos: () => {
            reporte_clientesYProveedores.FILTROS.impuestos = monicaReportes.impuestos;
        },
        giroNegocios: () => {
            reporte_clientesYProveedores.FILTROS.giroNegocios = monicaReportes.giroNegocios;
        },
        giroNegociosPv: () => {
            reporte_clientesYProveedores.FILTROS.giroNegociosPv = monicaReportes.giroNegociosPv;
        },
        nombresBodega: () => {
            reporte_ventasYDevoluciones.FILTROS.nombresBodega = monicaReportes.nombresBodega;
            reporte_cotizacionesYConduces.FILTROS.nombresBodega = monicaReportes.nombresBodega;
            reporte_inventarioYLiquidacion.FILTROS.nombresBodega = monicaReportes.nombresBodega;
            reporte_comprasDevolucionesYCotizaciones.FILTROS.nombresBodega = monicaReportes.nombresBodega;
        },
        categoriasProductos: () => {
            reporte_ventasYDevoluciones.FILTROS.categoriasProductos = monicaReportes.categoriasProductos;
            reporte_cotizacionesYConduces.FILTROS.categoriasProductos = monicaReportes.categoriasProductos;
            reporte_inventarioYLiquidacion.FILTROS.categoriasProductos = monicaReportes.categoriasProductos;
            reporte_comprasDevolucionesYCotizaciones.FILTROS.categoriasProductos = monicaReportes.categoriasProductos;
        },
        subCategoriasProductos: () => {
            reporte_inventarioYLiquidacion.FILTROS.subProductosCategorias = monicaReportes.subCategoriasProductos;
        },
        parametros: function () {
            manejoDeData_crearProceso.ProcesoCrear.Pedidos.parametro_cambiaPrecioEstimado = this.parametros.find(ele => ele.parametro === 'CAMBIA_PRECIO_ESTIMADO').valor_caracter.toUpperCase() === 'SI';
        },
    },

    methods: {
        //  OPCIONES DEL MENU
        async OpcionMenuCeleccionado(opcionSeleccionada) {
            this.LimpiarTablas();
            $('#sidebar').toggleClass('active');

            //  GENERICO PARA TODOS LOS REPORTES
            this.minFecha_emision = this.fechaHoy;
            this.maxFecha_emision = this.fechaHoy;

            //  MOSTRAR EL FILTRO SELECCONADO Y OCULTAR EL QUE ESTABA VISIBLE
            if (this.opcionReporteSeleccionado)
                document.getElementById(this.opcionReporteSeleccionado).setAttribute('hidden', true);

            document.getElementById(opcionSeleccionada).removeAttribute('hidden');
            this.opcionReporteSeleccionado = opcionSeleccionada;

            //  MODULO ACCESIBLE POR EL USUARIO
            document.getElementById('sinPermisosAModulos').setAttribute('hidden', true);
            switch (opcionSeleccionada) {
                case 'VentasYDevolucionesCategoriaYVendedor':
                    if (!this.modulos.includes('FAC')) {
                        reporte_ventasYDevoluciones.FILTROS.tipoReporte = 'devoluciones';
                        document.getElementById('ventasCheck').setAttribute('disabled', true);
                    }
                    if (!this.modulos.includes('DVC')) {
                        reporte_ventasYDevoluciones.FILTROS.tipoReporte = 'ventas';
                        document.getElementById('devolucionesCheck').setAttribute('disabled', true);
                    }
                    if (!this.modulos.includes('FAC') && !this.modulos.includes('DVC')) {
                        reporte_ventasYDevoluciones.FILTROS.tipoReporte = '';
                        document.getElementById('VentasYDevolucionesCategoriaYVendedor').setAttribute('hidden', true);
                        document.getElementById('sinPermisosAModulos').removeAttribute('hidden');
                    }
                    break;
                case 'filtrosClienteIndividualStatus':
                    if (!this.modulos.includes('CXC')) {
                        reporte_clienteIndividualStatus.FILTROS.tipoReporte = 'porPagar';
                        document.getElementById('CPCCPPporCobrarCheck').setAttribute('disabled', true);
                    }
                    if (!this.modulos.includes('CXP')) {
                        reporte_clienteIndividualStatus.FILTROS.tipoReporte = 'porCobrar';
                        document.getElementById('CPCCPPporPagar').setAttribute('disabled', true);
                    }
                    if (!this.modulos.includes('CXC') && !this.modulos.includes('CXP')) {
                        reporte_clienteIndividualStatus.FILTROS.tipoReporte = '';
                        document.getElementById('filtrosClienteIndividualStatus').setAttribute('hidden', true);
                        document.getElementById('sinPermisosAModulos').removeAttribute('hidden');
                    }
                    break;
                case 'clientesYProveedoresFiltro':
                    if (!this.modulos.includes('CLI')) {
                        reporte_clientesYProveedores.FILTROS.tipoReporte = 'proveedores';
                        document.getElementById('CPClientesCheck').setAttribute('disabled', true);
                    }
                    if (!this.modulos.includes('PRO')) {
                        reporte_clientesYProveedores.FILTROS.tipoReporte = 'clientes';
                        document.getElementById('CPProveedoresCheck').setAttribute('disabled', true);
                    }
                    if (!this.modulos.includes('CLI') && !this.modulos.includes('PRO')) {
                        reporte_clientesYProveedores.FILTROS.tipoReporte = '';
                        document.getElementById('clientesYProveedoresFiltro').setAttribute('hidden', true);
                        document.getElementById('sinPermisosAModulos').removeAttribute('hidden');
                    }
                    break;
                case 'inventarioYLiquidacionFiltro':
                    if (!this.modulos.includes('INV')) {
                        reporte_inventarioYLiquidacion.FILTROS.tipoReporte = '';
                        document.getElementById('inventarioYLiquidacionFiltro').setAttribute('hidden', true);
                        document.getElementById('sinPermisosAModulos').removeAttribute('hidden');
                    }
                    break;
                case 'comprasDevolucionesYConducesFiltro':
                    if (!this.modulos.includes('COM')) {
                        document.getElementById('CDCcomprasCheck').setAttribute('disabled', true);
                        if (this.modulos.includes('COP'))
                            reporte_comprasDevolucionesYCotizaciones.FILTROS.tipoReporte = 'cotizaciones';
                        if (this.modulos.includes('DVP'))
                            reporte_comprasDevolucionesYCotizaciones.FILTROS.tipoReporte = 'devoluciones';
                    }
                    if (!this.modulos.includes('DVP')) {
                        document.getElementById('CDCdevolucionesCheck').setAttribute('disabled', true);
                        if (this.modulos.includes('COP'))
                            reporte_comprasDevolucionesYCotizaciones.FILTROS.tipoReporte = 'cotizaciones';
                        if (this.modulos.includes('COM'))
                            reporte_comprasDevolucionesYCotizaciones.FILTROS.tipoReporte = 'compras';
                    }
                    if (!this.modulos.includes('COP')) {
                        document.getElementById('CDCcotizacionesCheck').setAttribute('disabled', true);
                        if (this.modulos.includes('COP'))
                            reporte_comprasDevolucionesYCotizaciones.FILTROS.tipoReporte = 'cotizaciones';
                        if (this.modulos.includes('DVP'))
                            reporte_comprasDevolucionesYCotizaciones.FILTROS.tipoReporte = 'devoluciones';
                    }
                    if (!this.modulos.includes('COM') && !this.modulos.includes('DVP') && !this.modulos.includes('COP')) {
                        reporte_comprasDevolucionesYCotizaciones.FILTROS.tipoReporte = '';
                        document.getElementById('comprasDevolucionesYConducesFiltro').setAttribute('hidden', true);
                        document.getElementById('sinPermisosAModulos').removeAttribute('hidden');
                    }
                    break;
                case 'contabilidadYBancoFiltro':
                    if (!this.modulos.includes('CON')) {
                        reporte_contabilidadYBanco.FILTROS.tipoReporte = '';
                        document.getElementById('contabilidadYBancoFiltro').setAttribute('hidden', true);
                        document.getElementById('sinPermisosAModulos').removeAttribute('hidden');
                    }
                    break;
                case 'CotizacionesYConducesFiltro':
                    if (!this.modulos.includes('COC')) {
                        reporte_cotizacionesYConduces.FILTROS.tipoReporte = 'conduces';
                        document.getElementById('cotizacionesCheck').setAttribute('disabled', true);
                    }
                    if (!this.modulos.includes('COD')) {
                        reporte_cotizacionesYConduces.FILTROS.tipoReporte = 'cotizaciones';
                        document.getElementById('conducesCheck').setAttribute('disabled', true);
                    }
                    if (!this.modulos.includes('COC') && !this.modulos.includes('COD')) {
                        reporte_cotizacionesYConduces.FILTROS.tipoReporte = '';
                        document.getElementById('CotizacionesYConducesFiltro').setAttribute('hidden', true);
                        document.getElementById('sinPermisosAModulos').removeAttribute('hidden');
                    }
                    break;
                case 'manejoDeData_Pedidos':
                    //  CARGAR PARAMETROS
                    let filtro = {
                        conn: localStorage.getItem('conn'),
                        WHRER_IN: "'USO_IMPTO_ESTIMADO', 'CAMBIA_PRECIO_ESTIMADO', 'P_BUSQPRDFAB_ESTIMADO'"
                    };
                    await this.BuscarData('parametros', filtro);
                    break;
            }
        },

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

        //  BUSCAR INFORMACION SI ES NECESARIA.
        async BuscarData(data, filtro) {
            if (typeof (data) === "string") {
                switch (data) {
                    case 'terminoDePago':
                        if (this.terminoDePago.length === 0)
                            this.terminoDePago = await BuscarInformacionLocal('SendWebsocketServer/7', {});
                        break;
                    case 'terminoDePagoPv':
                        if (this.terminoDePagoPv.length === 0)
                            this.terminoDePagoPv = await BuscarInformacionLocal('SendWebsocketServer/20', {});
                        break;
                    case 'nombresBodega':
                        if (this.nombresBodega.length === 0)
                            this.nombresBodega = await BuscarInformacionLocal('SendWebsocketServer/8', {});
                        break;
                    case 'categoriasProductos':
                        if (this.categoriasProductos.length === 0)
                            this.categoriasProductos = (await BuscarInformacionLocal('SendWebsocketServer/9', {})).reverse();
                        break;
                    case 'vendedores':
                        if (this.vendedores.length === 0)
                            this.vendedores = await BuscarInformacionLocal('SendWebsocketServer/3', {});
                        break;
                    case 'categoriasClientes':
                        if (this.categoriasClientes.length === 0)
                            this.categoriasClientes = await BuscarInformacionLocal('SendWebsocketServer/5', {});
                        break;
                    case 'categoriasProveedores':
                        if (this.categoriasProveedores.length === 0)
                            this.categoriasProveedores = await BuscarInformacionLocal('SendWebsocketServer/11', {});
                        break;
                    case 'subCategoriasProductos':
                        if (this.subCategoriasProductos.length === 0)
                            this.subCategoriasProductos = await BuscarInformacionLocal('SendWebsocketServer/16', {});
                        break;
                    case 'impuestos':
                        if (this.impuestos.length === 0)
                            this.impuestos = await BuscarInformacionLocal('SendWebsocketServer/21', {});
                        break;
                    case 'giroNegocios':
                        if (this.giroNegocios.length === 0)
                            this.giroNegocios = await BuscarInformacionLocal('SendWebsocketServer/22', {});
                        break;
                    case 'giroNegociosPv':
                        if (this.giroNegociosPv.length === 0)
                            this.giroNegociosPv = await BuscarInformacionLocal('SendWebsocketServer/23', {});
                        break;
                    case 'dolar_venta':
                        if (this.dolar)
                            return this.dolar;
                        else
                            return this.dolar = await BuscarInformacionLocal('SendWebsocketServer/26', {});
                    case 'parametros':
                        filtro.WHRER_IN = filtro.WHRER_IN.split(',');
                        this.parametros.forEach(item => {
                            filtro.WHRER_IN.splice(filtro.WHRER_IN.indexOf(item), 1)
                        });
                        filtro.WHRER_IN = filtro.WHRER_IN.join(',');
                        if (filtro.WHRER_IN) {
                            const param = await BuscarInformacionLocal('SendWebsocketServer/27', filtro);
                            param.forEach(item => {
                                this.parametros.push({ parametro: item.parametro.trim(), valor_caracter: item.valor_caracter, valor_numerico: item.valor_numerico });
                            });
                        }
                        return this.parametros;
                    case 'productosList':
                        return await BuscarInformacionLocal('SendWebsocketServer/25', filtro);
                    case 'clientesList':
                        return await BuscarInformacionLocal('SendWebsocketServer/6', filtro);
                    case 'proveedoresList':
                        return await BuscarInformacionLocal('SendWebsocketServer/10', filtro);
                    case 'vendedoresList':
                        return await BuscarInformacionLocal('SendWebsocketServer/18', filtro);

                    //  ---------------
                    //  MANEJO DE DATA.
                    //  ---------------
                    //case 'obtenerCotizacion':
                    //    return await BuscarInformacionLocal('SendWebsocketServer/12', filtro, true);
                    case 'obtenerEstimado':
                        return await BuscarInformacionLocal('SendWebsocketServer/13', filtro);
                    case 'actualizarEstimado':
                        return await BuscarInformacionLocal('SendWebsocketServer/14', filtro, true);

                    default:
                        alert('Console Error');
                        new Error(`Opcion: ${data}, NO manejada.`);
                        break;
                }
            }
            else {
                for (let i = 0; i < data.length; i++)
                    await (this.BuscarData(data[i]));
            }
        },

        LimpiarTablas() {
            let divGrafico;
            //  PARA CADA REPORTE EN ESPECIFICO
            switch (this.opcionReporteSeleccionado) {
                case 'VentasYDevolucionesCategoriaYVendedor':
                    reporte_ventasYDevoluciones.TablaVisible = '';
                    reporte_ventasYDevoluciones.DATA = [];
                    reporte_ventasYDevoluciones.GroupDATA = [];
                    break;
                case 'filtrosClienteIndividualStatus':
                    reporte_clienteIndividualStatus.DATA = [];
                    divGrafico = document.getElementById('CPCCPPdivGraficosDatosAgrupados');
                    break;
                case 'clientesYProveedoresFiltro':
                    reporte_clientesYProveedores.DATA = [];
                    //divGrafico = document.getElementById('CPdivGraficosDatosAgrupados');
                    break;
                case 'inventarioYLiquidacionFiltro':
                    reporte_inventarioYLiquidacion.DATA = [];
                    divGrafico = document.getElementById('ILdivGraficosDatosAgrupados');
                    break;
                case 'comprasDevolucionesYConducesFiltro':
                    reporte_comprasDevolucionesYCotizaciones.DATA = [];
                    divGrafico = document.getElementById('divTablaComprasVentasCotizaciones');
                    break;
                case 'contabilidadYBancoFiltro':
                    reporte_clientesYProveedores.DATA = [];
                    divGrafico = document.getElementById('divTablaContabilidadYBanco');
                    break;
                case 'CotizacionesYConducesFiltro':
                    reporte_cotizacionesYConduces.TablaVisible = '';
                    reporte_cotizacionesYConduces.DATA = [];
                    reporte_cotizacionesYConduces.GroupDATA = [];
                    break;
            }
            if (divGrafico)
                divGrafico.setAttribute('hidden', true);
        },
    },

    filters: {
        FilterUppercase: value => {
            return value ? value.toString().toUpperCase() : value;
        },

        FilterDateFormat: value => {
            const date = new Date(value);
            const fecha = `${(date.getDate() + 1).toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

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

            if (value == 0)
                returnValue = 'NACIONAL';
            else if (value === 1)
                returnValue = 'EXTRANJERA';

            return returnValue;
        },

        FilterTipoProducto: value => {
            switch (value) {
                case 1:
                    return 'FISICO';
                case 2:
                    return 'SERVICIO';
                case 3:
                    return 'OCACIONAL';
            }
        }
    }
});