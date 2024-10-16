let num1, num2, operacion, total;

num1 = parseInt(prompt("Ingresa el primer valor"));
num2 = parseInt(prompt("Ingresa el segundo valor"));
operacion = prompt("Qué operacion quieres realizar?");

if(operacion == "suma"){
    total = (num1 + num2);
}

else if(operacion == "resta"){
    total = (num1 - num2);
}

else if(operacion == "multiplicacion"){
    total = (num1 * num2);
}

else if(operacion == "division"){
    if (num2 && num1 !== 0) {
        total = num1 / num2;
    } else {
        document.write("No se puede dividir entre cero");
        total = null;
    }
} 

document.write("El resultado es: " + total);