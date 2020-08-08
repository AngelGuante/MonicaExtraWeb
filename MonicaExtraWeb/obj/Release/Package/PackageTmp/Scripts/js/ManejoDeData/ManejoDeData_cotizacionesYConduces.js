const manejoDeData_cotizacionesYConduces = new Vue({
    el: '#manejoDeData_CotizacionesYConduces',

    data: {
        valorValidoSePuedeCerrar: false,
        FormularioValidoSePuedeCerrar: false,
        tipoCierre: 'Sin_Ventas',
        valor: '',
        factura: '0000000000',
        comentario: '',
        //datosParaCierreBuscados: {}
    },

    methods: {
        async Cerrar() {
            if (!this.valorValidoSePuedeCerrar)
                await MostrarMensage({
                    title: 'Falta Información',
                    message: 'Débe ingresar un Número de Cotizacion a Cerrar válido.',
                    icon: 'error'
                });
            else if (this.valor.length === 0)
                await MostrarMensage({
                    title: 'Falta Información',
                    message: 'Débe íngresar un número de cotizacion.',
                    icon: 'error'
                });
            else if (this.comentario.length <= 2)
                await MostrarMensage({
                    title: 'Falta Información',
                    message: 'Débe íngresar un comentario valido (Más de 2 caracteres).',
                    icon: 'error'
                });
            else if (this.tipoCierre === 'Genero_Ventas' && (!this.FormularioValidoSePuedeCerrar || this.factura === '0000000000'))
                await MostrarMensage({
                    title: 'Falta Información',
                    message: 'Débe íngresar un número de factura válido.',
                    icon: 'error'
                });
            else if (this.tipoCierre === 'Genero_Ventas' && this.factura.length === 0)
                await MostrarMensage({
                    title: 'Falta Información',
                    message: 'Débe íngresar un número de factura.',
                    icon: 'error'
                });
            else {
                const filtro = {
                    'notas': this.comentario,
                    'NroCotizacion': this.valor,
                }

                if (this.tipoCierre === 'Genero_Ventas')
                    filtro.NroFactura = this.factura;

                await monicaReportes.BuscarData('actualizarEstimado', filtro);

                await MostrarMensage({
                    title: 'Listo!',
                    message: `Cotización ${this.valor} se ha cerrado con exito`,
                    icon: 'success'
                });

                this.LimpiarCampos('busqueda');
            }
        },

        //  BUSCAR DATOS DE COTIZACION CUANDO EL IMPUT DE NUMERO DE COTIZACION PIERDA EL FOCO
        async BuscarDatosParaCerrarCotizacion() {
            if (!this.valor)
                return;

            const filtro = {
                'NroCotizacion': this.valor
            }

            //this.datosParaCierreBuscados = await monicaReportes.BuscarData('obtenerCotizacion', filtro);
            this.ValidarDatosCotizacion((await monicaReportes.BuscarData('obtenerEstimado', filtro))[0].count);
            //this.ValidarDatosCotizacion();
        },

        //  VALIDAR LOS DATOS BUSCADOS LUEGO DE BUSCAR EL NRO. DE COTIZACION
        //ValidarDatosCotizacion() {
        //    if (this.datosParaCierreBuscados.length === 0) {
        //        MostrarMensage({
        //            title: 'No encontrado.',
        //            message: `El Número de cotización ${this.valor}, no fue encontrado, favor revisar.`,
        //            icon: 'error'
        //        });
        //        this.valorValidoSePuedeCerrar = false;
        //    }
        //    else
        //        this.valorValidoSePuedeCerrar = true;
        //},
        ValidarDatosCotizacion(value) {
            if (value === 0) {
                MostrarMensage({
                    title: 'No encontrado.',
                    message: `El Número de cotización ${this.valor}, no fue encontrado, favor revisar.`,
                    icon: 'error'
                });
                this.valorValidoSePuedeCerrar = false;
            }
            else
                this.valorValidoSePuedeCerrar = true;
        },

        //  BUSCAR LA EXISTENCIA DEL NUMERO DE FACTURA PARA VER SI YA CE HA CERRADO ALGUNA COTIZACION CON ESE NUMERO DE FACTURA
        async BuscarExistenciaFacturaEnOtroCierre() {
            if (!this.factura || this.factura === '0000000000')
                return;

                //'COUNT': true,
            const filtro = {
                'validarParaCierre': true,
                'genero_factura1': this.factura,
                'genero_factura2': this.factura,
                'genero_factura3': this.factura
            }

            this.ValidarDatosNroFactura((await monicaReportes.BuscarData('obtenerEstimado', filtro))[0].count);
        },

        //  VALIDAR LA EXISTENCIA DE DE UN NUMERO DE FACTURA EN OTRO CIERRE.
        async ValidarDatosNroFactura(valor) {
            if (valor !== 0) {
                await MostrarMensage({
                    title: 'No es posible cerrar con este Número de cotización',
                    message: `El Número de Factura ${valor}, Yá se especificó en otra Cotizacion, Favor Revisar`,
                    icon: 'error'
                });
                this.FormularioValidoSePuedeCerrar = false;
            }
            else
                this.FormularioValidoSePuedeCerrar = true;
        },

        //  LIMPIAR CAMPOS
        LimpiarCampos(parametro) {
            switch (parametro) {
                case 'todo':
                    this.tipoCierre = 'Sin_Ventas';
                case 'busqueda':
                    this.valorValidoSePuedeCerrar = false;
                    this.FormularioValidoSePuedeCerrar = false;
                    this.valor = '';
                    this.factura = '0000000000';
                    this.comentario = '';
                    //this.datosParaCierreBuscados = {};
                    break;
            }
        }
    }
});
