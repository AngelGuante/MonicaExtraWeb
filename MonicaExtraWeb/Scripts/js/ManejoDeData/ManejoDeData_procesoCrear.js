const manejoDeData_crearProceso = new Vue({
    el: '#manejoDeData_Pedidos',

    data: {
        FILTROS: {
            vendedorSeleccionado: '',
            vendedores: [],
            buscarProductoPor: 'codProducto',
            valor: '',
        },

        ProcesoCrear: {
            subTotal: '0.00',
            descuento: '0.00',
            itbis: '0.00',
            total: '0.00',

            validoParaGuardar: {
                codClienteCorrecto: false
            },

            Pedidos: {
                cliente: {
                    codigo: '',
                    nombre: '',
                    direcciones: '',
                    telefonos: '',
                    emails: '',
                    rnc: '',
                },
                productosTabla1: [],
                productosTabla2: [],
                producto: {
                    comentario: '',
                    precio2: '0',
                    precio3: '0',
                    precio4: '0'
                }
            }
        },

        modalData: {
            titulo: 'Buscar Clientes',
            clientes: []
        }
    },

    watch: {
        'ProcesoCrear.Pedidos.productosTabla1': function () {
            this.SumarPreciosProductos();
        },
    },

    methods: {
        async validarCodigo() {
            if (!this.ProcesoCrear.Pedidos.cliente.codigo.length || this.ProcesoCrear.codClienteCorrecto)
                return;

            this.ProcesoCrear.codClienteCorrecto = false;
            const filtro = {
                code: this.ProcesoCrear.Pedidos.cliente.codigo,
                SELECT: `, CONCAT(TRIM(direccion1), ' ', TRIM(direccion2), ' ', TRIM(direccion3), TRIM(ciudad), ' ', TRIM(Provincia)) direcciones, CONCAT(telefono1, ' - ', telefono2) telefonos, CONCAT(TRIM(Contacto), ' - ', TRIM(e_mail1)) emails, registro_tributario rnc, maximo_Credito,Balance, Contacto `
            };

            var data = await monicaReportes.BuscarData('clientesList', filtro);
            if (data.length) {
                this.ProcesoCrear.codClienteCorrecto = true;
                this.ProcesoCrear.Pedidos.cliente.nombre = data[0].nombre;
                this.ProcesoCrear.Pedidos.cliente.direcciones = data[0].direcciones;
                this.ProcesoCrear.Pedidos.cliente.telefonos = data[0].telefonos;
                this.ProcesoCrear.Pedidos.cliente.emails = data[0].emails;
                this.ProcesoCrear.Pedidos.cliente.rnc = data[0].rnc;
                this.ProcesoCrear.Pedidos.cliente.maximo_Credito = data[0].maximo_Credito;
                this.ProcesoCrear.Pedidos.cliente.Balance = data[0].Balance;
                this.ProcesoCrear.Pedidos.cliente.Contacto = data[0].Contacto;
            }
            else {
                this.ProcesoCrear.Pedidos.cliente.nombre = '';
                this.ProcesoCrear.Pedidos.cliente.direcciones = '';
                this.ProcesoCrear.Pedidos.cliente.telefonos = '';
                this.ProcesoCrear.Pedidos.cliente.emails = '';
                this.ProcesoCrear.Pedidos.cliente.rnc = '';

                MostrarMensage({
                    title: 'Código incorrecto.',
                    message: `El cliente con el código ${this.ProcesoCrear.Pedidos.cliente.codigo} no existe.`,
                    icon: 'error'
                });
            }
        },

        async ModalBuscarClientes() {
            this.modalData.clientes = [];

            $('#procesoCrearBuscarClienteModal').modal('hide');

            const filtros = {
                skip: this.modalData.PaginatorIndex
            };

            if (this.modalData.nombreClienteABuscar)
                filtros.name = this.modalData.nombreClienteABuscar;

            this.modalData.clientes = await monicaReportes.BuscarData('clientesList', filtros);
            //filtros.SUM = true;
            this.modalData.PaginatorLastPage = Math.floor((await monicaReportes.BuscarData('clientesList', filtros))[0].count / 20);

            $('#procesoCrearBuscarClienteModal').modal('show');
        },

        agregarProductoALista(producto) {
            let productoConsulta = this.ProcesoCrear.Pedidos.productosTabla1.find(x => x.codigo_producto === producto.codigo_producto);

            if (productoConsulta) {
                productoConsulta.cantidad = Number(productoConsulta.cantidad) + 1;
                if (productoConsulta.cantidad > productoConsulta.cant) {
                    productoConsulta.cantidad = productoConsulta.cant;
                    this.ProcesoCrear.Pedidos.productosTabla2 = [];
                }
            }
            else {
                if (Number(producto.cant) > 0) {
                    this.ProcesoCrear.Pedidos.productosTabla1.push(producto);
                    this.ProcesoCrear.Pedidos.productosTabla2 = [];
                }
                else
                    MostrarMensage({
                        title: 'No puede agregar este producto.',
                        message: `Este producto no tiene existencia en almacen.`,
                        icon: 'warning'
                    });
            }

            this.SumarPreciosProductos();
        },

        SumarPreciosProductos(config) {
            if (!config) {
                let total = this.ProcesoCrear.Pedidos.productosTabla1.reduce((total, current) => {
                    return total + (Number(current.precio) * Number(current.cantidad));
                }, 0);

                this.ProcesoCrear.subTotal = monicaReportes.$options.filters.FilterStringToMoneyFormat(total);
                this.ProcesoCrear.total = monicaReportes.$options.filters.FilterStringToMoneyFormat(total);
            }
            else {
                this.ProcesoCrear.Pedidos.productosTabla1.find(item => item.codigo_producto === config.codigo_producto).cantidad = document.getElementById(`item_${config.codigo_producto}`).value;
                this.SumarPreciosProductos();
            }
        },

        removerProducto(codigo) {
            this.ProcesoCrear.Pedidos.productosTabla1.splice(this.ProcesoCrear.Pedidos.productosTabla1.indexOf(this.ProcesoCrear.Pedidos.productosTabla1.find(x => x.codigo_producto === codigo)), 1);
        },

        ModalClienteSleccionado(value) {
            $('#procesoCrearBuscarClienteModal').modal('hide');
            const seleccionado = value.split(' - ');
            this.ProcesoCrear.Pedidos.cliente.codigo = seleccionado[0];
            this.ProcesoCrear.Pedidos.cliente.nombre = seleccionado[1];
            this.ProcesoCrear.codClienteCorrecto = true;
        },

        LlenarSelect(value) {
            monicaReportes.BuscarData(value);
        },

        async BuscarProducto() {
            if (!this.FILTROS.valor.length)
                return;

            let filtro = {
                SELECT: `, cant_total cant, precio1 precio `
            };

            if (this.FILTROS.buscarProductoPor === 'codProducto')
                filtro.code = this.FILTROS.valor;
            else
                filtro.descripcion = this.FILTROS.valor;

            this.FILTROS.valor = '';
            var data = await monicaReportes.BuscarData('productosList', filtro);

            if (data.length === 1) {
                let itemData = data[0];
                itemData.cantidad = 1;
                this.agregarProductoALista(itemData);
            }
            else
                this.ProcesoCrear.Pedidos.productosTabla2 = data;
        },

        async detallesProducto(config) {
            let filtro = {
                SELECT: `, precio2, precio3, precio4, comentario `,
                code: config.codigo_producto
            };

            var data = await monicaReportes.BuscarData('productosList', filtro);

            this.ProcesoCrear.Pedidos.producto.comentario = data[0].comentario;
            this.ProcesoCrear.Pedidos.producto.precio2 = data[0].precio2;
            this.ProcesoCrear.Pedidos.producto.precio3 = data[0].precio3;
            this.ProcesoCrear.Pedidos.producto.precio4 = data[0].precio4;
            window.scrollTo(0, document.body.scrollHeight);
        }

    },

    filters: {
        FilterUppercase: value => {
            return monicaReportes.$options.filters.FilterUppercase(value);
        },

        FilterStringToMoneyFormat: value => {
            return monicaReportes.$options.filters.FilterStringToMoneyFormat(value);
        },
    }
});
