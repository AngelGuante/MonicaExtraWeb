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
function MatchRegex(patternIndex, text) {
    return text.match(patterns[patternIndex]);
}