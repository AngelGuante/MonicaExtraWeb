let menu = new Vue({
    el: '#menu',

    created: function () {
        document.getElementById('cargando').setAttribute('hidden', true);
    },

    methods: {
        ModuloMovimientos: () => {
            alert('Modulo no disponble');
        },

        ModuloReportes: () => {
            document.getElementById('cargando').removeAttribute('hidden');
            window.location.href = '../MoniExtra/';
        }
    },
});