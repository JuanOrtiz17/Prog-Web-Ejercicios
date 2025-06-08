import math

# 1. Tabla de multiplicar de un número
def mostrar_tabla_multiplicar(numero):
    for i in range(1, 11):
        print(f"{numero} x {i} = {numero * i}")

# Programa principal
if __name__ == "__main__":
    # Ejercicio 1: Tabla de multiplicar
    numero = int(input("Introduce un número para mostrar su tabla de multiplicar: "))
    mostrar_tabla_multiplicar(numero)

    # Ejercicio 2: Resolver ecuación cuadrática
    a = float(input("Introduce el coeficiente a: "))
    b = float(input("Introduce el coeficiente b: "))
    c = float(input("Introduce el coeficiente c: "))
    resolver_ecuacion_cuadratica(a, b, c)

    # Ejercicio 3: Crear y mostrar un alumno
    nombre = input("Introduce el nombre del alumno: ")
    matricula = input("Introduce la matrícula: ")
    carrera = input("Introduce la carrera: ")
    semestre = int(input("Introduce el semestre: "))

    alumno = AlumnoUniversitario(nombre, matricula, carrera, semestre)
    alumno.mostrar_informacion()