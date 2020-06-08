﻿//  [0] => 
//         El primer caracter debe ser una letra;
//         Los caracteres 2 y 3 deben ser 01 o 03 o 11 o 14 o 15 o 16;
//         Debe tener de 11 a 13 caracteres en total.
//  [1] =>
//         SOLO PUEDE TENER DE 9 A 11 DIJITOS.
let patterns = [
    "^[a-zA-Z](01|03|11|14|15|16)([a-zA-Z0-9]{8,10}$)",
    "^[0-9]{9,11}$"
];

//  COMPROBAR QUE UNA CADENA CUMPLE CON UN REGEX.
MatchRegex = (patternIndex, text) =>
    text.match(patterns[patternIndex]);


//  RETORNA LA DIFERENCIA DE DIAS ENTRE DOS FECHAS.
//  PARAMETROS RECIVIDOS EN FORMATO MM/dd/yy.
DaysDiff = (minDate, maxDate) => {
    const millisecondsInADay = 1000 * 60 * 60 * 24;
    const millisecondsBetweenDates = new Date(maxDate) - new Date(minDate);

    return Math.round(millisecondsBetweenDates / millisecondsInADay);
}

//  MUESTRA ALERTAS.
MostrarAlerta = flag => {
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
}

//  MUESTRA MENSAGES DE ALERTAS.
MostrarMensage = config => {
    Swal.fire(
        config.title,
        config.message,
        config.icon,
    )
}

//  NAVEGACION DE LA PAGINA
let Navegacion = [
    { anterior: '', actual: 'menu' }
];

NavigationBehaviour = actual => {
    let divActualVisible = Navegacion[Navegacion.length - 1].actual;

    if (actual === 0) {
        document.getElementById(divActualVisible).setAttribute('hidden', true);
        document.getElementById('menu').removeAttribute('hidden');
        Navegacion = Navegacion.slice(0, 1);
    }
    else if (actual === -1) {
        document.getElementById(divActualVisible).setAttribute('hidden', true);
        document.getElementById(Navegacion[Navegacion.length - 2].actual).removeAttribute('hidden');
        Navegacion.pop();
    }
    else if (actual) {
        document.getElementById('cargando').removeAttribute('hidden');

        document.getElementById(divActualVisible).setAttribute('hidden', true);
        document.getElementById(actual).removeAttribute('hidden');

        Navegacion.push({ anterior: divActualVisible, actual })
    }

    //  MOSTRAR EL BOTON DE ATRAS SOLO CUANDO SE HAYA PASADO POR MENU
    if (Navegacion.length >= 2)
        document.getElementById('btnBack').removeAttribute('hidden');
    else
        document.getElementById('btnBack').setAttribute('hidden', true);

    //  MOSTRAR EL BOTON DE HOME
    if (Navegacion.length >= 3)
        document.getElementById('btnHome').removeAttribute('hidden');
    else
        document.getElementById('btnHome').setAttribute('hidden', true);
}

//  REPORTES
//-----------
BtnMostrarMenuReportes = () => {
    document.getElementById('filtrosReportes').style.display = 'none';
    document.getElementById('btnReporteMostrarMenu').style.display = 'none';
    document.getElementById('seleccionarReporte').style.display = 'block';
}