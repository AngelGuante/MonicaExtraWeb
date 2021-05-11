const manejoDeData_crearProceso = new Vue({
    el: '#manejoDeData_Pedidos',

    data: {
        FILTROS: {
            vendedorSeleccionado: '',
            buscarProductoPor: 'codProducto',
            valor: '',
            fechaInicio: GetCurrentDate(),
            fechaVence: AddDaysToDate(30, 'yyyyMMdd'),
            refCliente: '',
            terminoDePago: [],
            vendedores: [],
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
                parametro_cambiaPrecioEstimado: false,
                parametro_producto_comenta_factura: false,
                mostrarDetallesProducto: false,
                itbis: 0,
                comentario: '',
                cliente: {
                    codigo: '',
                    nombre: '',
                    direcciones: '',
                    telefonos: '',
                    emails: '',
                    rnc: '',
                    Impto_incluido: '',
                    tipo_empresaUsuario: '',
                    termino: '',
                    vendedor: '',
                    descuentoBk: 0,
                    aplica_impto: 0,
                    descuento: 0,
                    detalesProductosAgregados: []
                },
                productosTabla1: [],
                productosTabla2: [],
                producto: {
                    comentario: '',
                    precio2: '0',
                    precio3: '0',
                    precio4: '0',
                    pi_impuesto: '0',
                    enUS: '0',
                    valor_impto: '0'
                }
            }
        },

        modalData: {
            titulo: 'Buscar Clientes',
            clientes: []
        }
    },

    watch: {
        'ProcesoCrear.Pedidos.cliente.descuento': function () {
            if (Number(this.ProcesoCrear.Pedidos.cliente.descuento) < 0)
                this.ProcesoCrear.Pedidos.cliente.descuento = 0;
            else if (Number(this.ProcesoCrear.Pedidos.cliente.descuento) > Number(this.ProcesoCrear.Pedidos.cliente.descuentoBk))
                this.ProcesoCrear.Pedidos.cliente.descuento = this.ProcesoCrear.Pedidos.cliente.descuentoBk;
            else
                this.SumarPreciosProductos();
        },
        'ProcesoCrear.Pedidos.itbis': function () {
            if (Number(this.ProcesoCrear.Pedidos.itbis) < 0)
                this.ProcesoCrear.Pedidos.itbis = 0;
            else
                this.SumarPreciosProductos();
        },
        'ProcesoCrear.Pedidos.cliente.Impto_incluido': function () {
            this.SumarPreciosProductos();
        }
    },

    methods: {
        async validarCodigo() {
            if (!String(this.ProcesoCrear.Pedidos.cliente.codigo).length || this.ProcesoCrear.codClienteCorrecto)
                return;

            let filtro = {
                code: this.ProcesoCrear.Pedidos.cliente.codigo,
                SELECT: `, CONCAT(TRIM(direccion1), ' ', TRIM(direccion2), ' ', TRIM(direccion3), TRIM(ciudad), ' ', TRIM(Provincia)) direcciones, CONCAT(telefono1, ' - ', telefono2) telefonos, CONCAT(TRIM(Contacto), ' - ', TRIM(e_mail1)) emails, registro_tributario rnc, maximo_Credito,Balance, Contacto, Impto_incluido, tipo_empresa, termino_id, vendedor_id, Descuento, aplica_impto, I.valor_impto `,
                JOIN: 'impuestos'
            };

            var data = await monicaReportes.BuscarData('clientesList', filtro);
            if (data.length) {
                this.LlenarSelect(['terminoDePago', 'vendedores']);
                this.ProcesoCrear.codClienteCorrecto = true;
                this.ProcesoCrear.Pedidos.cliente.nombre = data[0].nombre;
                this.ProcesoCrear.Pedidos.cliente.direcciones = data[0].direcciones.substr(0, 79);
                this.ProcesoCrear.Pedidos.cliente.telefonos = data[0].telefonos;
                this.ProcesoCrear.Pedidos.cliente.emails = data[0].emails.toString().trim().length > 1 ? `ATENCION: ${data[0].emails}` : '';
                this.ProcesoCrear.Pedidos.cliente.rnc = data[0].rnc;
                this.ProcesoCrear.Pedidos.cliente.maximo_Credito = data[0].maximo_Credito;
                this.ProcesoCrear.Pedidos.cliente.Balance = data[0].Balance;
                this.ProcesoCrear.Pedidos.cliente.Contacto = data[0].Contacto;
                this.ProcesoCrear.Pedidos.cliente.Impto_incluido = data[0].Impto_incluido === 'S' ? true : false;
                this.ProcesoCrear.Pedidos.cliente.tipo_empresaUsuario = data[0].tipo_empresa;
                this.ProcesoCrear.Pedidos.cliente.termino = data[0].termino_id;
                this.ProcesoCrear.Pedidos.cliente.vendedor = data[0].vendedor_id;
                this.ProcesoCrear.Pedidos.cliente.descuento = data[0].Descuento;
                this.ProcesoCrear.Pedidos.cliente.descuentoBk = data[0].Descuento;
                this.ProcesoCrear.Pedidos.cliente.aplica_impto = data[0].aplica_impto;
                this.ProcesoCrear.Pedidos.itbis = data[0].valor_impto;
            }
            else {
                this.Limpiar();

                MostrarMensage({
                    title: 'Código incorrecto.',
                    message: `El cliente con el código ${this.ProcesoCrear.Pedidos.cliente.codigo} no existe.`,
                    icon: 'error'
                });
            }
        },

        async ModalBuscarClientes() {
            $('#procesoCrearBuscarClienteModal').modal('hide');
            this.Limpiar();
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

        async agregarProductoALista(producto) {
            let parametro_facturarSinStock = false;
            let productoConsulta = this.ProcesoCrear.Pedidos.productosTabla1.find(x => x.codigo_producto === producto.codigo_producto);

            if (producto.factura_sin_stock && producto.factura_sin_stock.toUpperCase() === 'SI') {
                const cantidadProducto = productoConsulta ? Number(productoConsulta.cantidad) + 1 : 1;

                if (cantidadProducto > producto.cant) {
                    const confirmacion = await MostrarConfirmacion({
                        title: 'Desea agregar este producto apesar de que está superando la cantidad en almacen?',
                        message: `La cantidad que está tratando de facturar de este producto, es superior a la cantidad en existencia.`,
                        icon: 'warning'
                    });
                    if (!confirmacion)
                        return;
                    parametro_facturarSinStock = true;
                }
            }

            if (productoConsulta) {
                productoConsulta.cantidad = Number(productoConsulta.cantidad) + 1;
                if (productoConsulta.cantidad > productoConsulta.cant) {
                    productoConsulta.cantidad = productoConsulta.cant;
                    this.ProcesoCrear.Pedidos.productosTabla2 = [];
                    this.detallesProducto({ tipo: 'add', codigo_producto: producto.codigo_producto, comentario: this.ProcesoCrear.Pedidos.producto.comentario });
                }
            }
            else {
                if (Number(producto.cant) > 0 || parametro_facturarSinStock) {
                    this.ProcesoCrear.Pedidos.productosTabla1.push(producto);
                    this.ProcesoCrear.Pedidos.productosTabla2 = [];
                    this.detallesProducto({ tipo: 'add', codigo_producto: producto.codigo_producto, comentario: this.ProcesoCrear.Pedidos.producto.comentario });
                }
                else
                    MostrarMensage({
                        title: 'No puede agregar este producto.',
                        message: `Este producto no tiene existencia en almacen.`,
                        icon: 'warning'
                    });
            }
            this.ProcesoCrear.Pedidos.mostrarDetallesProducto = false;

            this.ProcesoCrear.Pedidos.producto.comentario = '';
            this.ProcesoCrear.Pedidos.producto.precio2 = '';
            this.ProcesoCrear.Pedidos.producto.precio3 = '';
            this.ProcesoCrear.Pedidos.producto.precio4 = '';
            this.ProcesoCrear.Pedidos.producto.valor_impto = '';
            this.ProcesoCrear.Pedidos.producto.enUS = '';
            this.ProcesoCrear.Pedidos.producto.pi_impuesto = '';
        },

        async SumarPreciosProductos(config) {
            //  SI NO HAY NINGUN PRODUCTO, SE COLOTA EL CAMPO TOTAL = 0.00
            if (!this.ProcesoCrear.Pedidos.productosTabla1.length) {
                this.ProcesoCrear.subTotal = this.ProcesoCrear.descuento = this.ProcesoCrear.itbis = this.ProcesoCrear.total = '0.00';
                return;
            }

            if (!config) {
                let total = this.ProcesoCrear.Pedidos.productosTabla1.reduce((total, current) => {
                    return total + (Number(current.precio) * Number(current.cantidad));
                }, 0);

                this.ProcesoCrear.subTotal = monicaReportes.$options.filters.FilterStringToMoneyFormat(total);
                let descuento = 0;
                if (Number(this.ProcesoCrear.Pedidos.cliente.descuento)) {
                    if (this.ProcesoCrear.Pedidos.cliente.Impto_incluido) {
                        descuento = (Number(total) / ((Number(this.ProcesoCrear.Pedidos.itbis) / 100) + 1) * (Number(this.ProcesoCrear.Pedidos.cliente.descuento) / 100));

                        let totalProd = 0;
                        if (monicaReportes.parametros.find(item => { return item.parametro === 'USO_IMPTO_ESTIMADO' }).valor_caracter.toUpperCase() === 'SI')
                            totalProd = Number(total);
                        else {
                            totalProd = this.ProcesoCrear.Pedidos.productosTabla1.reduce((total, actual) => {
                                if (this.ProcesoCrear.Pedidos.cliente.detalesProductosAgregados.find(item => { return item.codigo_producto.trim() === actual.codigo_producto.trim() })) {
                                    return total + (Number(actual.cantidad) * Number(actual.precio));
                                }
                                else {
                                    return total;
                                }
                            }, 0);
                        }
                        itbis = (totalProd - (100 / descuento)) * (Number(this.ProcesoCrear.Pedidos.itbis) / 100);
                    }
                    else {
                        descuento = (Number(this.ProcesoCrear.Pedidos.cliente.descuento) / 100) * Number(total);
                        itbis = (Number(total) - descuento) * (Number(this.ProcesoCrear.Pedidos.itbis) / 100);
                    }
                    this.ProcesoCrear.itbis = monicaReportes.$options.filters.FilterStringToMoneyFormat(itbis);
                }
                this.ProcesoCrear.descuento = monicaReportes.$options.filters.FilterStringToMoneyFormat(descuento);

                const sumatorias = (Number(total) - Number(descuento)) + Number(this.ProcesoCrear.itbis.replace(/,/g, '').replace(/.00/g, ''));
                this.ProcesoCrear.total = monicaReportes.$options.filters.FilterStringToMoneyFormat(sumatorias);
            }
            else {
                //  VALIDAR QUE EL PRODUCTO TENGA EXISTENCIA.
                let valor = document.getElementById(`item_${config.codigo_producto}`).value;
                let valorPrecio = document.getElementById(`itemPrecio_${config.codigo_producto}`).value;
                if (config.cant !== 0 && Number(valor) > Number(config.cant)) {
                    document.getElementById(`item_${config.codigo_producto}`).value = config.cant;
                    return;
                }
                else if (Number(valor) < 1) {
                    document.getElementById(`item_${config.codigo_producto}`).value = 1;
                    return;
                }
                //  VALIDAR EL PRECIO DEL PRODUCTO.
                if (Number(valorPrecio) < this.ProcesoCrear.Pedidos.productosTabla1.find(x => x.codigo_producto === config.codigo_producto).costo) {
                    document.getElementById(`itemPrecio_${config.codigo_producto}`).value = this.ProcesoCrear.Pedidos.productosTabla1.find(x => x.codigo_producto === config.codigo_producto).costo;

                    MostrarMensage({
                        title: 'Precio incorrecto.',
                        message: `El precio de venta no puede ser menor al costo del producto.`,
                        icon: 'warning'
                    });
                }

                //let impto = this.ProcesoCrear.Pedidos.cliente.detalesProductosAgregados.find(x => { return x.codigo_producto.trim() === config.codigo_producto.trim() });
                //if (impto) {
                //    impto.cant = Number(valor);

                //    let itbisTodal = this.ProcesoCrear.Pedidos.cliente.detalesProductosAgregados.reduce((total, current) => {
                //        return total + (current.valor_impto * current.cant)
                //    }, 0);
                //    this.ProcesoCrear.itbis = monicaReportes.$options.filters.FilterStringToMoneyFormat(itbisTodal);
                //}

                if (config.precio) {
                    let valorPrecio = document.getElementById(`itemPrecio_${config.codigo_producto}`).value;
                    let producto = this.ProcesoCrear.Pedidos.productosTabla1.find(x => x.codigo_producto === config.codigo_producto);
                    if (!valorPrecio || Number(valorPrecio) < 0)
                        producto.precio = 0;
                    else
                        producto.precio = valorPrecio;
                }

                this.ProcesoCrear.Pedidos.productosTabla1.find(item => item.codigo_producto === config.codigo_producto).cantidad = valor;
                this.SumarPreciosProductos();
            }
        },

        removerProducto(codigo) {
            this.ProcesoCrear.Pedidos.productosTabla1.splice(this.ProcesoCrear.Pedidos.productosTabla1.indexOf(this.ProcesoCrear.Pedidos.productosTabla1.find(x => x.codigo_producto === codigo)), 1);
            this.SumarPreciosProductos();
            //  REMOVER ITBIS.
            //const obj = this.ProcesoCrear.Pedidos.cliente.detalesProductosAgregados.find(x => x.codigo_producto === codigo);
            //if (obj) {
            //    const totalItbis = Number(obj.cant) * Number(obj.valor_impto);
            //    const resta = Number(this.ProcesoCrear.itbis.replace(/,/g, '').replace(/.00/g, '')) - Number(totalItbis);
            //    this.ProcesoCrear.itbis = monicaReportes.$options.filters.FilterStringToMoneyFormat(resta);
            //    this.ProcesoCrear.Pedidos.cliente.detalesProductosAgregados.splice(this.ProcesoCrear.Pedidos.cliente.detalesProductosAgregados.indexOf(obj), 1);
            //}
        },

        async ModalClienteSleccionado(value) {
            $('#procesoCrearBuscarClienteModal').modal('hide');
            this.ProcesoCrear.Pedidos.cliente.codigo = value.codigo;
            this.ProcesoCrear.Pedidos.cliente.nombre = value.nombre;
            this.ProcesoCrear.Pedidos.cliente.id = value.id;
            //this.ProcesoCrear.codClienteCorrecto = true;
            await this.validarCodigo();
        },

        LlenarSelect(value) {
            monicaReportes.BuscarData(value);
        },

        async BuscarProducto() {
            if (!this.FILTROS.valor.length)
                return;

            let filtro = {
                SELECT: `, cant_total cant, precio1 precio, factura_sin_stock, bodega_id `,
                estatus: `> 0`,
                take: 8
            };

            if (this.FILTROS.buscarProductoPor === 'codProducto') {
                filtro.code = this.FILTROS.valor;

                if (monicaReportes.parametros.find(item => { return item.parametro === 'P_BUSQPRDFAB_ESTIMADO' }).valor_numerico == '1')
                    filtro.parametro_P_BUSQPRDFAB_ESTIMADO = true;
            }
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
            this.ProcesoCrear.Pedidos.mostrarDetallesProducto = true;
            let filtro = {};

            if (config.tipo === 'add') {
                filtro = {
                    SELECT: `, P.producto_id, P.impto1_en_vtas, P.costo `,
                    //SELECT: `, P.impto1_en_vtas, I.valor_impto `,
                    //JOIN: `impuestos`,
                    code: config.codigo_producto,
                    estatus: `> 0`
                };

                const data = await monicaReportes.BuscarData('productosList', filtro);
                if (data[0].impto1_en_vtas === 'Si')
                    this.ProcesoCrear.Pedidos.cliente.detalesProductosAgregados.push({ codigo_producto: config.codigo_producto, cant: 1 });

                // AGREGAR LOS DATOS DEL PRODUCTO AGREGADO A LA TABLA PARA LUEGO PODER HACER INSERT DE ESTOS
                let producto = this.ProcesoCrear.Pedidos.productosTabla1.find(x => x.codigo_producto === config.codigo_producto);
                if (producto) {
                    producto.producto_id = data[0].producto_id;
                    producto.comentario = config.comentario.trim();
                    producto.costo = data[0].costo;
                }
            }
            else {
                let dolar_venta = await monicaReportes.BuscarData('dolar_venta');

                filtro = {
                    SELECT: `, precio1, precio2, precio3, precio4, comentario, I.valor_impto, comenta_factura `,
                    code: config.codigo_producto,
                    JOIN: `impuestos`,
                };

                const data = await monicaReportes.BuscarData('productosList', filtro);

                this.ProcesoCrear.Pedidos.producto.comentario = data[0].comentario;
                this.ProcesoCrear.Pedidos.producto.precio2 = data[0].precio2;
                this.ProcesoCrear.Pedidos.producto.precio3 = data[0].precio3;
                this.ProcesoCrear.Pedidos.producto.precio4 = data[0].precio4;
                this.ProcesoCrear.Pedidos.producto.valor_impto = data[0].valor_impto;
                this.ProcesoCrear.Pedidos.producto.enUS = Number(data[0].precio1) / dolar_venta[0].dolar_venta;
                this.ProcesoCrear.Pedidos.producto.pi_impuesto = (((Number(data[0].valor_impto) / 100) + 1) * Number(data[0].precio1))

                //  HABILITAR O DESHABILITAR EL CUADRO DE COMENTARIO SEGUN EL PRODUCTO AMERITE O NO LA EDICION DE SU COMENTARIO.
                this.ProcesoCrear.Pedidos.parametro_producto_comenta_factura = data[0].comenta_factura.toUpperCase() === 'SI' ? true : false;

                window.scrollTo(0, document.body.scrollHeight);
            }
            this.SumarPreciosProductos();
        },

        async GuardarPedido() {
            let error = '';
            if (!MatchRegex(1, this.ProcesoCrear.Pedidos.cliente.rnc))
                error = 'RNC invalido.';
            else if (!this.ProcesoCrear.Pedidos.cliente.tipo_empresaUsuario)
                error = 'Débe seleccionar el NCF.';
            else if (!this.ProcesoCrear.Pedidos.cliente.termino)
                error = 'Débe seleccionar el término.';
            else if (!this.ProcesoCrear.Pedidos.cliente.vendedor)
                error = 'Débe seleccionar el vendedor.';
            else if (!this.ProcesoCrear.Pedidos.productosTabla1.length)
                error = 'Débe ingresar almenos un producto.';

            if (error.length) {
                MostrarMensage({
                    title: 'No se puede crear el pedido.',
                    message: error,
                    icon: 'error'
                });
                return;
            }

            let filtro = '';

            //  PRIMERO SE GUARDA EL PEDIDO PARA OBTENER EL ID.
            filtro = {
                Estimado: {
                    cliente_id: this.ProcesoCrear.Pedidos.cliente.id,
                    clte_direccion1: this.ProcesoCrear.Pedidos.cliente.direcciones,
                    clte_direccion2: this.ProcesoCrear.Pedidos.cliente.telefonos,
                    clte_direccion3: this.ProcesoCrear.Pedidos.cliente.emails,
                    registro_tributario: this.ProcesoCrear.Pedidos.cliente.rnc,
                    vendedor_id: this.ProcesoCrear.Pedidos.cliente.vendedor,
                    tipo_documento: this.ProcesoCrear.Pedidos.cliente.tipo_empresaUsuario,
                    fecha_emision: this.FILTROS.fechaInicio,
                    fecha_vcmto: this.FILTROS.fechaVence,
                    refer_cliente: this.FILTROS.refCliente,
                    termino_id: this.ProcesoCrear.Pedidos.cliente.termino,
                    impto_en_precio: this.ProcesoCrear.Pedidos.cliente.Impto_incluido ? 1 : 0,
                    comentario_Detalle: this.ProcesoCrear.Pedidos.comentario,
                    subtotal: this.ProcesoCrear.subTotal,
                    dscto_monto: this.ProcesoCrear.descuento,
                    impuesto_monto: this.ProcesoCrear.itbis,
                    total: this.ProcesoCrear.total,
                    dscto_pciento: this.ProcesoCrear.Pedidos.cliente.descuento,
                    impuesto_pciento: this.ProcesoCrear.Pedidos.itbis,
                    tipo_cambio: parseFloat((await monicaReportes.BuscarData('dolar_venta'))[0].dolar_venta)
                }
            };

            var data = await monicaReportes.BuscarData('guardarPedido', filtro);

            //  LUEGO SE GUARDAN LOS DETALLES DEL PEDIDO.
            if (data && data.length && data[0].pedidoId && data[0].pedidoId > 0) {
                filtro = {
                    Estimado: {
                        estimado_id: data[0].pedidoId,
                        fecha_emision: this.FILTROS.fechaInicio,
                        cliente_id: this.ProcesoCrear.Pedidos.cliente.id,
                    },
                    EstimadoDetalles: this.ProcesoCrear.Pedidos.productosTabla1
                }

                filtro.EstimadoDetalles.forEach(item => {
                    delete item.descrip_producto;
                    delete item.codigo_producto;
                    delete item.cant;
                });
                await monicaReportes.BuscarData('guardarDetallesPedido', filtro, false);

                this.Limpiar({
                    limpiarTablas: true,
                    limpiarFechas: true,
                });

                MostrarMensage({
                    title: 'Pedido Creado.',
                    message: `Se ha creado el pedido ${data[0].pedidoId}`,
                    icon: 'success'
                });
            }
            else
                MostrarMensage({
                    title: 'Algo a ocurrido.',
                    message: `Un error a ocurrido con la creacion de su pedido.`,
                    icon: 'error'
                });
        },

        Limpiar(config) {
            this.ProcesoCrear.Pedidos.cliente.nombre = '';
            this.ProcesoCrear.Pedidos.cliente.direcciones = '';
            this.ProcesoCrear.Pedidos.cliente.telefonos = '';
            this.ProcesoCrear.Pedidos.cliente.emails = '';
            this.ProcesoCrear.Pedidos.cliente.rnc = '';
            this.ProcesoCrear.Pedidos.cliente.tipo_empresaUsuario = '';
            this.ProcesoCrear.Pedidos.cliente.termino = '';
            this.ProcesoCrear.Pedidos.cliente.descuento = 0;
            this.ProcesoCrear.Pedidos.cliente.descuentoBk = 0;

            this.ProcesoCrear.Pedidos.cliente.codigo = '';
            this.ProcesoCrear.codClienteCorrecto = false;
            this.modalData.clientes = [];

            if (!config)
                return;

            if (config.limpiarTablas) {
                this.ProcesoCrear.Pedidos.productosTabla1 = [];
                this.ProcesoCrear.Pedidos.productosTabla2 = [];
            }

            if (config && config.limpiarFechas) {
                this.FILTROS.fechaInicio = GetCurrentDate();
                this.FILTROS.fechaVence = AddDaysToDate(30, 'yyyyMMdd');
            }
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
