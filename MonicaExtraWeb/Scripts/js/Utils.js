//  [0] => 
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
    if (actual === 'SeleccionarReporte')
        document.getElementById('divMaster').classList.remove('container');
    else {
        if (!document.getElementById('divMaster').classList.contains('container'))
            document.getElementById('divMaster').classList.add('container');
    }


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

//  IR AL LA MAQUINA DEL CLIENTE A BUSCAR INFORMACION EN SU BASE DE DATOS LOCAL.
const ApiReportesLocales = '/API/ReportesLocales/';
BuscarInformacionLocal = (ruta, filtro) => {
    document.getElementById('cargando').removeAttribute('hidden');

    return new Promise(async (resolve, reject) => {
        let interval;
        try {
            const response = await fetch(`..${ApiReportesLocales}${ruta}`, {
                method: 'POST',
                body: JSON.stringify(filtro),
                headers: {
                    'content-type': 'application/json'
                }
            });

            const content = await response.json();

            if (content.value === 'false') {
                document.getElementById('cargando').setAttribute('hidden', true);
                MostrarMensage({
                    title: 'No se pudo conectar a su Base de Datos..',
                    message: `Su equipo no tiene monicaWebsocketClient.dll en ejecucion...`,
                    icon: 'error'
                });
            }
            else if (content.value === 'true') {
                interval = setInterval(async () => {
                    const innerResponse = await fetch(`..${ApiReportesLocales}GetWebsocketResponseFile`);
                    const innerContent = await innerResponse.json();
                    const parsedContent = JSON.parse(innerContent.resultset);

                    if (parsedContent) {
                        clearInterval(interval);

                        if (parsedContent.data.startsWith("Error: ")) {
                            MostrarMensage({
                                title: 'A ocurrido un problema..',
                                message: parsedContent.data.replace('Error: ', ''),
                                icon: 'error'
                            });
                        }

                        document.getElementById('cargando').setAttribute('hidden', true);

                        if (JSON.parse(parsedContent.data).length === 0)
                            MostrarMensage({
                                title: 'Sin coincidencias',
                                message: 'Ningun resultado que coincida con su búsqueda',
                                icon: 'info'
                            });

                        resolve(JSON.parse(parsedContent.data))
                    }
                }, 1000);
            }
        } catch {
            clearInterval(interval);
            document.getElementById('cargando').setAttribute('hidden', true);

            MostrarMensage({
                title: 'Ha ocurrido un problema',
                message: 'Algo ha ocurrido al momento de realizar la peticion.',
                icon: 'error'
            });
        }
    });
}

//  REPORTES
//-----------
BtnMostrarMenuReportes = () =>
    $('#sidebar').toggleClass('active');