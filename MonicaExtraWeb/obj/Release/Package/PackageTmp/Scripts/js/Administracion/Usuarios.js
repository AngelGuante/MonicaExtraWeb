const usuarios = new Vue({
    el: '#manejoUsuarios',

    data: {
        nombre: '',
        apellidos: '',
        nombreUsuario: '',

        usuarios: []
    },

    created: function() {
        fetch('~/API/USUARIOS/GET', {
            headers: {
                'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
            }
        })
            .then(response => { return response.json(); })
            .then(json => { this.usuarios = json.usuarios; });
    },

    watch: {
        nombre: function () {
            this.nombre = (this.nombre).toUpperCase();
            if (this.apellidos.length > 0)
                document.getElementById('btnGenerarUserName').removeAttribute('disabled');
            else
                document.getElementById('btnGenerarUserName').setAttribute('disabled', true);

            if (this.nombre.length === 0)
                document.getElementById('btnGenerarUserName').setAttribute('disabled', true);
        },

        apellidos: function () {
            this.apellidos = (this.apellidos).toUpperCase();

            if (this.nombre.length > 0)
                document.getElementById('btnGenerarUserName').removeAttribute('disabled');
            else
                document.getElementById('btnGenerarUserName').setAttribute('disabled', true);

            if (this.apellidos.length === 0)
                document.getElementById('btnGenerarUserName').setAttribute('disabled', true);
        }
    },

    methods: {
        GenerarUserName: function () {
            this.nombreUsuario = '';

            const stringChanged = (this.nombreUsuario.split(''));
            stringChanged[0] = this.nombre[0];
            this.nombreUsuario = stringChanged.join('');

            const apellidosArray = this.apellidos.split(' ');
            this.nombreUsuario = `${this.nombreUsuario}${apellidosArray[0][0]}${((apellidosArray[0]).substr(1)).toLowerCase()}`;

            document.getElementById('inptNombreNuevoUsuario').setAttribute('disabled', true);
            document.getElementById('inptApellidosNuevoUsuario').setAttribute('disabled', true);
            document.getElementById('btnGenerarUserName').setAttribute('disabled', true);
            document.getElementById('btnAgregarNuevoUsuario').removeAttribute('disabled');
        }
    },



    //filters: {
    //    FilterUppercase: value => {
    //        return value ? value.toString().toUpperCase() : value;
    //    },
    //}

});