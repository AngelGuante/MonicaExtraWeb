//  [0] =>
//         El primer caracter debe ser una letra;
//         Los caracteres 2 y 3 deben ser 01 o 03 o 11 o 14 o 15 o 16;
//         Debe tener de 11 a 13 caracteres en total.
//  [1] =>
//         SOLO PUEDE TENER DE 9 A 11 DIJITOS.
const patterns = [
    "^[a-zA-Z](01|03|11|14|15|16)([a-zA-Z0-9]{8,10}$)",
    "^[0-9]{9,11}$"
];

//  COMPROBAR QUE UNA CADENA CUMPLE CON UN REGEX.
const MatchRegex = (patternIndex, text) =>
    text.match(patterns[patternIndex]);

//  RETORNA LA DIFERENCIA DE DIAS ENTRE DOS FECHAS.
//  PARAMETROS RECIVIDOS EN FORMATO MM/dd/yy.
const DaysDiff = (minDate, maxDate) => {
    const millisecondsInADay = 1000 * 60 * 60 * 24;
    const millisecondsBetweenDates = new Date(maxDate) - new Date(minDate);

    return (Math.round(millisecondsBetweenDates / millisecondsInADay)) - 1;
}

//  RETORNA LA FECHA ACTUAL.
const GetCurrentDate = () => `${new Date().getFullYear()}-${new Date().getMonth().toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`;

//  RETORNA LA FECHA EN FORMATO YYYY/MM/DD.
const GetFormatedDate = date => {
    date = new Date(date);
    return `${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

//  AGREGAR DIAS A UNA FECHA.
const AddDaysToDate = (days, returnFormat, date) => {
    if (!date)
        date = new Date();

    date.setDate(date.getDate() + days);

    if (returnFormat) {
        let day = date.getDate();
        let month = date.getMonth();
        let year = date.getFullYear();

        if (!month)
            month = 1;

        switch (returnFormat) {
            case 'ddMMyyyy':
                return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
            case 'yyyyMMdd':
                return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
    }

    return date;
}

//  RETORNA EL INTERVALO DE DOS FECHAS SEGUN EL PARAMETRO ESTABLECIDO
const getIntervalDate = param => {
    const curr = new Date();
    const currYear = curr.getFullYear();
    const currMonth = (curr.getMonth() + 1).toString().padStart(2, '0');
    const currDay = curr.getDate();

    switch (param) {
        case "0":
            return { firstday: curr.toISOString().slice(0, 10), lastday: curr.toISOString().slice(0, 10) };
        case "1":
            const first = curr.getDate() - curr.getDay();
            const last = first + 6;
            const minDate = new Date(curr.setDate(first)).toUTCString();
            const maxDate = new Date(curr.setDate(last)).toUTCString();
            return { firstday: new Date(minDate).toISOString().slice(0, 10), lastday: new Date(maxDate).toISOString().slice(0, 10) };
        case "2":
            return { firstday: `${currYear}-${currMonth}-01`, lastday: new Date().toISOString().slice(0, 10) };
        case "3":
            return { firstday: `${currYear}-${(currMonth - 1).toString().padStart(2, '0')}-01`, lastday: `${currYear}-${(currMonth - 1).toString().padStart(2, '0')}-${new Date(currYear, currMonth - 1, 0).getDate()}` };
        case "4":
            return { firstday: `${currYear}-01-01`, lastday: new Date().toISOString().slice(0, 10) };
        case "5":
            return { firstday: `${currYear - 2}-${currMonth}-${currDay}`, lastday: new Date().toISOString().slice(0, 10) };
        case "6":
            return { firstday: `${currYear - 3}-${currMonth}-${currDay}`, lastday: new Date().toISOString().slice(0, 10) };
        case "7":
            return { firstday: `${currYear}-01-01`, lastday: `${currYear}-01-${new Date(currYear, 01, 0).getDate()}` };
        case "8":
            return { firstday: `${currYear}-02-01`, lastday: `${currYear}-02-${new Date(currYear, 02, 0).getDate()}` };
        case "9":
            return { firstday: `${currYear}-03-01`, lastday: `${currYear}-03-${new Date(currYear, 03, 0).getDate()}` };
        case "10":
            return { firstday: `${currYear}-04-01`, lastday: `${currYear}-04-${new Date(currYear, 04, 0).getDate()}` };
        case "11":
            return { firstday: `${currYear}-05-01`, lastday: `${currYear}-05-${new Date(currYear, 05, 0).getDate()}` };
        case "12":
            return { firstday: `${currYear}-06-01`, lastday: `${currYear}-06-${new Date(currYear, 06, 0).getDate()}` };
        case "13":
            return { firstday: `${currYear}-07-01`, lastday: `${currYear}-07-${new Date(currYear, 07, 0).getDate()}` };
        case "14":
            return { firstday: `${currYear}-08-01`, lastday: `${currYear}-08-${new Date(currYear, 08, 0).getDate()}` };
        case "15":
            return { firstday: `${currYear}-09-01`, lastday: `${currYear}-09-${new Date(currYear, 09, 0).getDate()}` };
        case "16":
            return { firstday: `${currYear}-10-01`, lastday: `${currYear}-10-${new Date(currYear, 10, 0).getDate()}` };
        case "17":
            return { firstday: `${currYear}-11-01`, lastday: `${currYear}-11-${new Date(currYear, 11, 0).getDate()}` };
        case "18":
            return { firstday: `${currYear}-12-01`, lastday: `${currYear}-12-${new Date(currYear, 12, 0).getDate()}` };
    }
}

//  EXPORTAR UN TXT.
const saveDownloadedData = (fileName, data) => {
    if (~navigator.userAgent.indexOf('MSIE') || ~navigator.appVersion.indexOf('Trident/')) { /* IE9-11 */
        const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
        navigator.msSaveBlob(blob, fileName);
    } else {
        const link = document.createElement('a')
        link.setAttribute('target', '_blank');
        if (Blob !== undefined) {
            const blob = new Blob([data], { type: 'text/plain' });
            link.setAttribute('href', URL.createObjectURL(blob));
        } else {
            link.setAttribute('href', 'data:text/plain,' + encodeURIComponent(data));
        }

        ~window.navigator.userAgent.indexOf('Edge')
            && (fileName = fileName.replace(/[&\/\\#,+$~%.'':*?<>{}]/g, '_')); /* Edge */

        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

//  CREAR DATOS INICIALES DE LA COOCKIE PARA LA PAGINA.
const CoockiesIniciales = () => {
    let rememberPasswordCookie = GetCookieElement('rememberPass=');

    if (!rememberPasswordCookie) {
        SetCoockie('user=;');
        SetCoockie('rememberPass=true;');
    }
}

//  AGREGAR UN ELEMENTO A LA COOCKIE.
const SetCoockie = valor =>
    document.cookie = valor;

//  RETORNA UN ELEMENTO ESPECIFICO DE LA COOCKIE.
const GetCookieElement = element => {
    const arrayElements = document.cookie.split('; ');

    if (arrayElements) {
        const ele = arrayElements.find(item => item.startsWith(element));

        if (ele)
            return ele.replace(element, '')
                .replace(';', '');
    }

    return '';
}

//  REMOVER UN ELEMENTO DE LA COOCKIE
const RemoveCookieElement = element => {
    document.cookie = `${element}=; expires=Thu, 01 Jan 2020 00:00:00 UTC; path=/;`;
}

//  CERRAR SECCION DE UN USUARIO.
const CloseUserSession = async () => {
    $('#modalUsuarioLogeado').modal('hide');
    await CerrarConexionRemota();

    RemoveCookieElement('Authorization');
    //window.localStorage.removeItem('NumeroUnicoEmpresa');
    window.localStorage.removeItem('NombreUsuario');
    window.localStorage.removeItem('conn');
    window.localStorage.removeItem('Empresas');
    window.localStorage.removeItem('Number');
    window.localStorage.removeItem('Nivel');
    window.localStorage.removeItem('Nombre_empresa');
    window.localStorage.removeItem('direccionEmpresa1');
    window.localStorage.removeItem('direccionEmpresa2');
    window.localStorage.removeItem('direccionEmpresa3');
    window.localStorage.removeItem('TelefonoEmpresa1');
    window.localStorage.removeItem('Registro_Tributario_empresa');
    window.localStorage.removeItem('remoteConexion');
    window.location.href = '/'
}

//  MUESTRA ALERTAS.
const MostrarAlerta = flag => {
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
const MostrarMensage = config => {
    Swal.fire(
        config.title,
        config.message,
        config.icon,
    )
}

//  MUESTRA UNA ALERTA DE CONFIRMACION.
const MostrarConfirmacion = config => new Promise((resolve, reject) => {
    Swal.fire({
        title: config.title,
        text: config.message,
        icon: config.icon,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: config.confirmButtonText ? config.confirmButtonText : 'Continuar'
    }).then((result) => {
        resolve(result.value);
    });
});

//  COMVERTIR MESES DE ESCALARES A DESCRIPCION
const ConvertirMesADescripcion = value => {
    switch (value) {
        case '1':
        case '01':
            return 'ENERO';
        case '2':
        case '02':
            return 'FEBRERO';
        case '3':
        case '03':
            return 'MARZO';
        case '4':
        case '04':
            return 'ABRIL';
        case '5':
        case '05':
            return 'MAYO';
        case '6':
        case '06':
            return 'JUNIO';
        case '7':
        case '07':
            return 'JULIO';
        case '8':
        case '08':
            return 'AGOSTO';
        case '9':
        case '09':
            return 'SEPTIEMBRE';
        case '10':
            return 'OCTUBRE';
        case '11':
            return 'NOVIEMBRE';
        case '12':
            return 'DICIEMBRE';
        case '1':
        case '01':
            return 'ENERO';
    }
}

//  AGREGAR ESTILOS A LAS CELDAS QUE VAN A SER LOS TOTALES DE LAS COLUMNAS DE LA TABLA.
const TablaEstiloTotalizacionFila = (tabla, cols) => {
    const tableSize = tabla.rows.length - 1;
    const lastRow = tabla.rows[tableSize].children;

    for (col of cols) {
        lastRow[col].style.border = ".2px solid #17A2B8"
        lastRow[col].style.fontWeight = "bolder"
        lastRow[col].style.color = "#17A2B8"
    }
}

//  AGREGAR ESTILOS A LAS CELDAS QUE VAN A SER LOS TOTALES DE LAS COLUMNAS DE LA TABLA AGRUPADAS.
const TablaEstiloTotalizacionFilaAgrupadas = (tableName, cols, rows, restarleValorAlUltimoRegistro) => {
    const tabla = document.getElementById(tableName);

    if (rows) {
        if (restarleValorAlUltimoRegistro === undefined)
            rows[rows.length - 1] = (tabla.rows.length - 2);
        for (item of rows) {

            let row = tabla.rows[item].children;

            for (col of cols) {
                row[col].style.fontWeight = "bolder"
                row[col].style.fontWeight = "900"
                row[col].style.color = "#17A2B8"
            }
        }
    }
    else {
        for (let i = 1; i < tabla.rows.length; i++) {
            let row = tabla.rows[i].children;

            for (col of cols) {
                row[col].style.fontWeight = "bolder"
                row[col].style.fontWeight = "900"
                row[col].style.color = "#17A2B8"
            }
        }
    }
}

//  AGREGA A LA VENTANA VISIBLE EN EL MOMENTO, LAS VARIABLES QUE NECESITA.
const ConfigurarVentana = (config) => {
    let usuario = '';
    let empresa = '';

    usuario = window.localStorage.getItem('NombreUsuario');
    empresa = window.localStorage.getItem('Nombre_empresa');

    document.getElementById('btnUsuario').innerHTML = `${usuario} ${empresa ? ' - ' + empresa.toUpperCase() : ''}`;

    //  --
    BotonesConexionesRemotas();
}

//  METODO QUE ESTABLECE LA CONEXION PARA CONECTARSE A DISTANCIA.
const EstablecerConexionRemota = async () => {
    document.getElementById('cargando').removeAttribute('hidden');
    var res = await fetch(`../../API/CONEXIONREMOTA/ESTABLECER`, {
        headers: {
            'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
        }
    });

    var json = await res.json();
    if (json.message)
        MostrarMensage({
            title: 'No se puede abrir la conexion',
            message: `${json.message}`,
            icon: 'warning'
        });
    else {
        localStorage.setItem('remoteConexion', true);
        BotonesConexionesRemotas();

        MostrarMensage({
            title: 'Listo!',
            message: `Conexión remota abierta.`,
            icon: 'success'
        });
    }
    document.getElementById('cargando').setAttribute('hidden', true);
}

//  METODO QUE CIERRA LA CONEXION A DISTANCIA.
const CerrarConexionRemota = async () => {
    document.getElementById('cargando').removeAttribute('hidden');
    var res = await fetch(`../../API/CONEXIONREMOTA/CERRAR`, {
        headers: {
            'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
        }
    });

    localStorage.setItem('remoteConexion', false);
    BotonesConexionesRemotas();
    document.getElementById('cargando').setAttribute('hidden', true);
}

//  BONOTES DE OPCION DE CONEXION REMOTA
const BotonesConexionesRemotas = () => {
    const btn = document.getElementById('btnConnection');
    const nvl = localStorage.getItem('Nivel');

    if (!btn)
        return;

    if (nvl && nvl === '0') {
        btn.setAttribute('hidden', true);
        return;
    }

    if (localStorage.getItem('remoteConexion') === 'true') {
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-success');
        document.getElementById('infoConectado').removeAttribute('hidden');
    }
    else {
        btn.classList.remove('btn-success');
        btn.classList.add('btn-danger');
        document.getElementById('optConecction_objener').removeAttribute('hidden');
        document.getElementById('infoConectado').setAttribute('hidden', true);
    }
}

//  NAVEGACION DE LA PAGINA
const Navegacion = [
    { anterior: '', actual: '' }
];

//  SISTEMA DE NAVEGACION.
const NavigationBehaviour = (actual, inicial) => {
    let divActualVisible = Navegacion[Navegacion.length - 1].actual;

    if (actual === 0) {
        document.getElementById('cargando').removeAttribute('hidden');
        window.location.href = '/Menu';
    }
    else if (actual === -1) {
        if (!divActualVisible) {
            Navegacion.pop();
            window.history.back();
        }
        document.getElementById(divActualVisible).setAttribute('hidden', true);
        document.getElementById(Navegacion[Navegacion.length - 2].actual).removeAttribute('hidden');
        Navegacion.pop();
    }
    else if (actual) {
        document.getElementById('cargando').removeAttribute('hidden');

        if (divActualVisible.length > 0)
            document.getElementById(divActualVisible).setAttribute('hidden', true);
        else {
            document.getElementById(inicial).setAttribute('hidden', true);
            Navegacion[Navegacion.length - 1].actual = inicial;
            divActualVisible = inicial;
        }

        document.getElementById(actual).removeAttribute('hidden');

        Navegacion.push({ anterior: divActualVisible, actual })
    }

    //  MOSTRAR EL BOTON DE ATRAS SOLO CUANDO SE HAYA PASADO POR MENU
    if (Navegacion.length >= 2)
        document.getElementById('btnBack').removeAttribute('hidden');
    else
        document.getElementById('btnBack').setAttribute('hidden', true);
}

//  HACER IMPRESION
const ImprimirRecursoURL = '/IMPRESION/IMPRIMIR';
const Print = (type, paramsa) => {
    const url = `..${ImprimirRecursoURL}?type=${type}&paremetros=${JSON.stringify(paramsa)}`;
    window.open(url, '_blank', 'top = 0, left = 0, width = 900, height = 900');
}

//  IR AL LA MAQUINA DEL CLIENTE A BUSCAR INFORMACION EN SU BASE DE DATOS LOCAL.
const ApiReportesLocales = '/API/ReportesLocales/';
const BuscarInformacionLocal = (ruta, filtro, mostrarAlerta) => {
    let cargando = document.getElementById('cargando');
    filtro.conn = localStorage.getItem('conn');

    if (cargando)
        cargando.removeAttribute('hidden');

    return new Promise(async (resolve, reject) => {
        let interval;
        try {
            const response = await fetch(`../..${ApiReportesLocales}${ruta}`, {
                method: 'POST',
                body: JSON.stringify(filtro),
                headers: {
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                }
            });

            const content = await response.json();

            if (content.value === 'false') {
                if (cargando)
                    cargando.setAttribute('hidden', true);

                MostrarMensage({
                    title: 'No se pudo conectar a su Base de Datos..',
                    message: `Asegúrese de que la PC-Servidor de Monica o el servicio ExtraService se encuentren disponibles y en ejecución.`,
                    icon: 'error'
                });
            }
            else if (content.value === 'true') {
                interval = setInterval(async () => {
                    const innerResponse = await fetch(`../..${ApiReportesLocales}GetWebsocketResponseFile`, {
                        headers: {
                            'Authorization': 'Bearer ' + GetCookieElement(`Authorization`).replace("=", "")
                        }
                    });
                    const innerContent = await innerResponse.json();
                    let parsedContent = JSON.parse(innerContent.resultset);

                    if (parsedContent.data.includes('-->>')) {
                        parsedContent.data = (parsedContent.data.split('-->>'))[0];
                        localStorage.setItem('remoteConexion', true);
                    }
                    else
                        localStorage.setItem('remoteConexion', false);

                    BotonesConexionesRemotas();

                    if (parsedContent) {
                        clearInterval(interval);

                        if (parsedContent.data.startsWith("Error: ")) {
                            MostrarMensage({
                                title: 'A ocurrido un problema..',
                                message: parsedContent.data.replace('Error: ', ''),
                                icon: 'error'
                            });
                        }

                        if (cargando)
                            cargando.setAttribute('hidden', true);

                        if (JSON.parse(parsedContent.data).length === 0)
                            if (!mostrarAlerta)
                                MostrarMensage({
                                    title: 'Sin coincidencias',
                                    message: 'Ningún resultado que coincida con su búsqueda',
                                    icon: 'info'
                                });

                        resolve(JSON.parse(parsedContent.data))
                    }
                }, 1000);
            }
            else {
                cargando.setAttribute('hidden', true);
                if (content.value.startsWith('Error_RemoteConectionNotAllowed:') || content.value.startsWith('Error_RemoteConectionUserDisconected:')) {
                    content.value = content.value.replace(/Error_RemoteConectionNotAllowed:/g, '');
                    content.value = content.value.replace(/Error_RemoteConectionUserDisconected:/g, '');

                    localStorage.setItem('remoteConexion', false);
                    BotonesConexionesRemotas();

                    MostrarMensage({
                        title: 'No se púdo establecer la conexión.',
                        message: content.value,
                        icon: 'error'
                    });
                }
            }
        } catch {
            clearInterval(interval);
            if (cargando)
                cargando.setAttribute('hidden', true);

            localStorage.removeItem('remoteConexion');
            BotonesConexionesRemotas();

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
const BtnMostrarMenuReportes = () =>
    $('#sidebar').toggleClass('active');