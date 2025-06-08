"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Search, Trophy, Clock, Target, RotateCcw, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"

interface NivelDificultad {
  nombre: string
  tamaño: number
  palabras: number
  descripcion: string
  color: string
  icono: string
}

interface PalabraEncontrada {
  palabra: string
  posiciones: { fila: number; columna: number }[]
  encontrada: boolean
}

interface Celda {
  letra: string
  seleccionada: boolean
  encontrada: boolean
  palabraId?: number
}

const nivelesDificultad: NivelDificultad[] = [
  {
    nombre: "Fácil",
    tamaño: 10,
    palabras: 6,
    descripcion: "Grilla 10x10 - 6 plantas para empezar",
    color: "from-green-400 to-emerald-500",
    icono: "🌱",
  },
  {
    nombre: "Medio",
    tamaño: 12,
    palabras: 8,
    descripcion: "Grilla 12x12 - 8 plantas de nivel intermedio",
    color: "from-yellow-400 to-orange-500",
    icono: "🌿",
  },
  {
    nombre: "Difícil",
    tamaño: 15,
    palabras: 10,
    descripcion: "Grilla 15x15 - 10 plantas para expertos",
    color: "from-red-400 to-pink-500",
    icono: "🌺",
  },
]

export default function SopaLetrasPage() {
  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelDificultad | null>(null)
  const [plantasDelJuego, setPlantasDelJuego] = useState<any[]>([])
  const [grilla, setGrilla] = useState<Celda[][]>([])
  const [palabrasObjetivo, setPalabrasObjetivo] = useState<PalabraEncontrada[]>([])
  const [palabrasEncontradas, setPalabrasEncontradas] = useState<string[]>([])
  const [celdaInicio, setCeldaInicio] = useState<{ fila: number; columna: number } | null>(null)
  const [celdaFin, setCeldaFin] = useState<{ fila: number; columna: number } | null>(null)
  const [tiempo, setTiempo] = useState(0)
  const [juegoTerminado, setJuegoTerminado] = useState(false)
  const [juegoIniciado, setJuegoIniciado] = useState(false)
  const [puntuacion, setPuntuacion] = useState(0)
  const { usuario, guardarProgresoJuego, actualizarEstadisticasJuego, desbloquearLogro } = useAuth()
  const puntosActualizados = useRef(false)

  // Helpers de la sopa
  const obtenerPlantasAleatorias = async (cantidad: number) => {
    try {
      const res = await fetch(`http://localhost/plantas/app/Backend/get_plantas.php?cantidad=${cantidad}`)
      const data = await res.json()
      if (data.exito) return data.plantas
      return []
    } catch (err) {
      console.error("Error al obtener plantas:", err)
      return []
    }
  }

  const generarGrillaVacia = (tamaño: number): Celda[][] => {
    return Array(tamaño)
      .fill(null)
      .map(() =>
        Array(tamaño)
          .fill(null)
          .map(() => ({
            letra: "",
            seleccionada: false,
            encontrada: false,
          }))
      )
  }

  const colocarPalabra = (
    grilla: Celda[][],
    palabra: string,
    fila: number,
    columna: number,
    direccion: { df: number; dc: number }
  ): { fila: number; columna: number }[] => {
    const posiciones = []
    for (let i = 0; i < palabra.length; i++) {
      const nuevaFila = fila + i * direccion.df
      const nuevaColumna = columna + i * direccion.dc
      grilla[nuevaFila][nuevaColumna].letra = palabra[i]
      posiciones.push({ fila: nuevaFila, columna: nuevaColumna })
    }
    return posiciones
  }

  const puedeColocarPalabra = (
    grilla: Celda[][],
    palabra: string,
    fila: number,
    columna: number,
    direccion: { df: number; dc: number }
  ): boolean => {
    const tamaño = grilla.length
    for (let i = 0; i < palabra.length; i++) {
      const nuevaFila = fila + i * direccion.df
      const nuevaColumna = columna + i * direccion.dc
      if (nuevaFila < 0 || nuevaFila >= tamaño || nuevaColumna < 0 || nuevaColumna >= tamaño) return false
      if (grilla[nuevaFila][nuevaColumna].letra !== "" && grilla[nuevaFila][nuevaColumna].letra !== palabra[i]) return false
    }
    return true
  }

  const generarSopaLetras = (nivel: NivelDificultad, plantasAleatorias: any[]) => {
    console.log('Generando grilla con plantas:', plantasAleatorias)
    setPlantasDelJuego(plantasAleatorias)
    const grillaNueva = generarGrillaVacia(nivel.tamaño)
    const palabrasColocadas: PalabraEncontrada[] = []
    const direcciones = [
      { df: 0, dc: 1 }, { df: 1, dc: 0 }, { df: 1, dc: 1 }, { df: 1, dc: -1 },
      { df: 0, dc: -1 }, { df: -1, dc: 0 }, { df: -1, dc: -1 }, { df: -1, dc: 1 },
    ]

    plantasAleatorias.forEach((planta) => {
      // CAMBIA ESTO:
      // const palabra = planta.nombre_comun.toUpperCase().replace(/\s/g, "")
      // POR ESTO:
      const palabra = planta.nombre.toUpperCase().replace(/\s/g, "")
      let colocada = false
      let intentos = 0
      while (!colocada && intentos < 100) {
        const fila = Math.floor(Math.random() * nivel.tamaño)
        const columna = Math.floor(Math.random() * nivel.tamaño)
        const direccion = direcciones[Math.floor(Math.random() * direcciones.length)]
        if (puedeColocarPalabra(grillaNueva, palabra, fila, columna, direccion)) {
          const posiciones = colocarPalabra(grillaNueva, palabra, fila, columna, direccion)
          palabrasColocadas.push({
            // palabra: planta.nombre_comun,
            palabra: planta.nombre, // <---- CAMBIA AQUÍ TAMBIÉN
            posiciones,
            encontrada: false,
          })
          colocada = true
        }
        intentos++
      }
    })


    // Llenar espacios vacíos con letras aleatorias
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for (let i = 0; i < nivel.tamaño; i++) {
      for (let j = 0; j < nivel.tamaño; j++) {
        if (grillaNueva[i][j].letra === "") {
          grillaNueva[i][j].letra = letras[Math.floor(Math.random() * letras.length)]
        }
      }
    }

    setGrilla(grillaNueva)
    setPalabrasObjetivo(palabrasColocadas)
  }

  // Cambia la lógica: seleccionar inicio y luego fin con clic
  const manejarCeldaClick = (fila: number, columna: number) => {
    if (!celdaInicio) {
      setCeldaInicio({ fila, columna });
      setCeldaFin(null);
      setGrilla(prev =>
        prev.map((filaArr, i) =>
          filaArr.map((celda, j) => ({
            ...celda,
            seleccionada: i === fila && j === columna,
          }))
        )
      );
    } else {
      const inicio = celdaInicio;
      const fin = { fila, columna };
      setCeldaFin(fin);

      if (esLineaValida(inicio, fin)) {
        const celdasLinea = obtenerCeldasEnLinea(inicio, fin);
        setGrilla(prev =>
          prev.map((filaArr, i) =>
            filaArr.map((celda, j) => ({
              ...celda,
              seleccionada: celdasLinea.some(pos => pos.fila === i && pos.columna === j),
            }))
          )
        );

        setTimeout(() => {
          verificarPalabraCustom(inicio, fin);
          setCeldaInicio(null);
          setCeldaFin(null);
          limpiarSeleccion();
        }, 250);
      } else {
        setCeldaInicio(null);
        setCeldaFin(null);
        limpiarSeleccion();
      }
    }
  };

  const verificarPalabraCustom = (inicio: { fila: number; columna: number }, fin: { fila: number; columna: number }) => {
    const celdasLinea = obtenerCeldasEnLinea(inicio, fin);
    const palabraSeleccionada = celdasLinea.map(pos => grilla[pos.fila][pos.columna].letra).join("");
    const palabraInversa = palabraSeleccionada.split("").reverse().join("");
    const palabraEncontrada = palabrasObjetivo.find(
      (p) =>
        (p.palabra.toUpperCase().replace(/\s/g, "") === palabraSeleccionada ||
          p.palabra.toUpperCase().replace(/\s/g, "") === palabraInversa) &&
        !p.encontrada
    );
    if (palabraEncontrada) {
      setPalabrasObjetivo(prev =>
        prev.map(p => (p.palabra === palabraEncontrada.palabra ? { ...p, encontrada: true } : p))
      );
      setPalabrasEncontradas(prev => [...prev, palabraEncontrada.palabra]);
      setGrilla(prev => {
        const nuevaGrilla = [...prev];
        celdasLinea.forEach(pos => {
          nuevaGrilla[pos.fila][pos.columna].encontrada = true;
        });
        return nuevaGrilla;
      });
      const puntosBase = palabraEncontrada.palabra.length * 10;
      const bonusTiempo = Math.max(100 - tiempo, 10);
      setPuntuacion(prev => prev + puntosBase + bonusTiempo);
      if (palabrasEncontradas.length + 1 === palabrasObjetivo.length) {
        setJuegoTerminado(true);
      }
    }
  };

  const limpiarSeleccion = () => {
    setGrilla(prev => prev.map(fila => fila.map(celda => ({ ...celda, seleccionada: false }))));
  };

  // Helpers para línea
  const esLineaValida = (inicio: { fila: number; columna: number }, fin: { fila: number; columna: number }) => {
    const df = fin.fila - inicio.fila
    const dc = fin.columna - inicio.columna
    // horizontal, vertical o diagonal
    return df === 0 || dc === 0 || Math.abs(df) === Math.abs(dc)
  }

  const obtenerCeldasEnLinea = (inicio: { fila: number; columna: number }, fin: { fila: number; columna: number }) => {
    const celdas = []
    const df = fin.fila - inicio.fila
    const dc = fin.columna - inicio.columna
    const pasos = Math.max(Math.abs(df), Math.abs(dc))
    const stepF = pasos === 0 ? 0 : df / pasos
    const stepC = pasos === 0 ? 0 : dc / pasos
    for (let i = 0; i <= pasos; i++) {
      celdas.push({
        fila: inicio.fila + Math.round(i * stepF),
        columna: inicio.columna + Math.round(i * stepC),
      })
    }
    return celdas
  }

  // INICIAR JUEGO
  const iniciarJuego = async (nivel: NivelDificultad) => {
    setNivelSeleccionado(nivel)
    const plantas = await obtenerPlantasAleatorias(nivel.palabras)
    console.log('Plantas recibidas del backend:', plantas)
    generarSopaLetras(nivel, plantas)
    setPalabrasEncontradas([])
    setTiempo(0)
    setJuegoTerminado(false)
    setJuegoIniciado(true)
    setPuntuacion(0)
    setCeldaInicio(null)
    setCeldaFin(null)
    puntosActualizados.current = false
  }

  const volverASeleccionNivel = () => {
    setNivelSeleccionado(null)
    setJuegoIniciado(false)
    setJuegoTerminado(false)
    setGrilla([])
    setPlantasDelJuego([])
    puntosActualizados.current = false
  }

  // Timer
  useEffect(() => {
    let intervalo: NodeJS.Timeout
    if (juegoIniciado && !juegoTerminado) {
      intervalo = setInterval(() => {
        setTiempo((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(intervalo)
  }, [juegoIniciado, juegoTerminado])

  // Actualizar puntos cuando termine el juego
  useEffect(() => {
    if (usuario && juegoTerminado && nivelSeleccionado && !puntosActualizados.current) {
      const multiplicadorDificultad = nivelSeleccionado.palabras === 6 ? 1 : nivelSeleccionado.palabras === 8 ? 1.5 : 2
      const puntosGanados = Math.floor(puntuacion * multiplicadorDificultad)
      const experienciaGanada = Math.floor(puntosGanados / 10)
      const plantasDescubiertasIds = plantasDelJuego.map((planta) => planta.id)

      guardarProgresoJuego("Sopa de Letras", {
        puntos: puntosGanados,
        experiencia: experienciaGanada,
        tiempo: formatearTiempo(tiempo),
        resultado: `${palabrasEncontradas.length}/${nivelSeleccionado.palabras} palabras`,
        nivel: nivelSeleccionado.nombre,
        tiempoJugadoMinutos: Math.ceil(tiempo / 60),
        plantasDescubiertas: plantasDescubiertasIds,
      })

      const estadisticasActuales = usuario.estadisticasJuegos?.sopaLetras || {
        partidasJugadas: 0,
        partidasGanadas: 0,
        mejorTiempo: 0,
        palabrasEncontradas: 0,
      }

      actualizarEstadisticasJuego("sopaLetras", {
        partidasJugadas: estadisticasActuales.partidasJugadas + 1,
        partidasGanadas: estadisticasActuales.partidasGanadas + 1,
        mejorTiempo:
          estadisticasActuales.mejorTiempo === 0 ? tiempo : Math.min(estadisticasActuales.mejorTiempo, tiempo),
        palabrasEncontradas: estadisticasActuales.palabrasEncontradas + palabrasEncontradas.length,
      })

      if (palabrasEncontradas.length === nivelSeleccionado.palabras) {
        desbloquearLogro(1) // Primer Paso
      }
      if (estadisticasActuales.palabrasEncontradas + palabrasEncontradas.length >= 50) {
        desbloquearLogro(2) // Botánico Jr.
      }

      puntosActualizados.current = true
    }
  }, [juegoTerminado, nivelSeleccionado, puntuacion, tiempo, palabrasEncontradas, plantasDelJuego])

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const calcularPuntosFinal = () => {
    if (!nivelSeleccionado) return 0
    const multiplicadorDificultad = nivelSeleccionado.palabras === 6 ? 1 : nivelSeleccionado.palabras === 8 ? 1.5 : 2
    return Math.floor(puntuacion * multiplicadorDificultad)
  }

  if (!nivelSeleccionado) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100">
          <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold">🔍 Sopa de Letras BCS</h1>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <Card className="max-w-4xl mx-auto bg-white shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
                  <CardTitle className="text-3xl font-bold">🌿 ¡Sopa de Letras de Plantas BCS! 🔍</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-8">
                    <Search className="h-20 w-20 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      ¡Encuentra los nombres de las plantas escondidas!
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                      Cada nivel usa plantas diferentes seleccionadas aleatoriamente
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {nivelesDificultad.map((nivel) => (
                      <Card
                        key={nivel.nombre}
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-orange-300"
                        onClick={() => iniciarJuego(nivel)}
                      >
                        <div className={`h-4 bg-gradient-to-r ${nivel.color}`}></div>
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl mb-4">{nivel.icono}</div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{nivel.nombre}</h3>
                          <p className="text-gray-600 mb-4">{nivel.descripcion}</p>
                          <div className="bg-gray-100 rounded-lg p-3 mb-4">
                            <p className="font-bold text-gray-700">
                              Grilla {nivel.tamaño}x{nivel.tamaño}
                            </p>
                            <p className="text-sm text-gray-600">{nivel.palabras} plantas a encontrar</p>
                          </div>
                          <Button className={`w-full bg-gradient-to-r ${nivel.color} text-white font-bold`}>
                            <Search className="mr-2 h-4 w-4" />
                            Jugar {nivel.nombre}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="font-bold text-orange-800 mb-3">¿Cómo jugar?</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-orange-700">
                      <div>
                        <p>
                          🎯 <strong>Objetivo:</strong> Encuentra todas las plantas en la grilla
                        </p>
                        <p>
                          🖱️ <strong>Controles:</strong> Haz clic en la primera y en la última letra de la palabra
                        </p>
                      </div>
                      <div>
                        <p>
                          🌱 <strong>Direcciones:</strong> Horizontal, vertical y diagonal
                        </p>
                        <p>
                          ⭐ <strong>Puntos:</strong> Más rápido = más puntos
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (juegoTerminado) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100">
          <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold">🔍 Sopa de Letras BCS</h1>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <Card className="max-w-2xl mx-auto bg-white shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <CardTitle className="text-3xl font-bold">🎉 ¡Sopa Completada! 🎉</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-6">
                    <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      ¡Encontraste todas las plantas del nivel {nivelSeleccionado.nombre}!
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg mb-6">
                      <div className="bg-green-100 p-4 rounded-lg">
                        <p className="font-bold text-green-800">🌱 Plantas Encontradas</p>
                        <p className="text-2xl text-green-600">
                          {palabrasEncontradas.length}/{nivelSeleccionado.palabras}
                        </p>
                      </div>
                      <div className="bg-blue-100 p-4 rounded-lg">
                        <p className="font-bold text-blue-800">⏱️ Tiempo</p>
                        <p className="text-2xl text-blue-600">{formatearTiempo(tiempo)}</p>
                      </div>
                      <div className="bg-yellow-100 p-4 rounded-lg">
                        <p className="font-bold text-yellow-800">⭐ Puntos</p>
                        <p className="text-2xl text-yellow-600">{calcularPuntosFinal()}</p>
                      </div>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg mb-6">
                      <p className="font-bold text-purple-800">📊 Nivel</p>
                      <p className="text-2xl text-purple-600">
                        {nivelSeleccionado.icono} {nivelSeleccionado.nombre}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => iniciarJuego(nivelSeleccionado)}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3"
                    >
                      <RotateCcw className="mr-2 h-5 w-5" />
                      Jugar de Nuevo
                    </Button>
                    <Button
                      onClick={volverASeleccionNivel}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3"
                    >
                      <Target className="mr-2 h-5 w-5" />
                      Cambiar Nivel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-red-100">
        <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold">🔍 Sopa de Letras BCS</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className="bg-white text-orange-600 text-lg px-3 py-1">
                  <Clock className="mr-1 h-4 w-4" />
                  {formatearTiempo(tiempo)}
                </Badge>
                <Badge className="bg-white text-orange-600 text-lg px-3 py-1">{puntuacion} pts</Badge>
                <Badge className="bg-white text-orange-600 text-lg px-3 py-1">
                  {nivelSeleccionado.icono} {nivelSeleccionado.nombre}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Grilla de Sopa de Letras */}
            <div className="lg:col-span-2">
              <Card className="bg-white shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-center">
                  <CardTitle className="text-xl font-bold">
                    🔍 Grilla {nivelSeleccionado.tamaño}x{nivelSeleccionado.tamaño}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <p className="text-lg font-bold text-gray-800">
                      Plantas encontradas: {palabrasEncontradas.length}/{nivelSeleccionado.palabras}
                    </p>
                    <Progress
                      value={(palabrasEncontradas.length / nivelSeleccionado.palabras) * 100}
                      className="mt-2"
                    />
                  </div>

                  {/* GRILLA CORREGIDA */}
                  <div
                    className="grid gap-1 mx-auto"
                    style={{
                      gridTemplateColumns: `repeat(${nivelSeleccionado.tamaño}, 1fr)`,
                      maxWidth: "600px",
                    }}
                  >
                    {grilla.map((fila, i) =>
                      fila.map((celda, j) => (
                        <div
                          key={`${i}-${j}`}
                          className={`aspect-square flex items-center justify-center text-sm font-bold border-2 cursor-pointer transition-all duration-200 ${celda.encontrada
                            ? "bg-green-200 border-green-400 text-green-800"
                            : celda.seleccionada
                              ? "bg-yellow-200 border-yellow-400 text-yellow-800"
                              : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200"
                            }`}
                          onClick={() => manejarCeldaClick(i, j)}
                          style={{
                            fontSize: nivelSeleccionado.tamaño > 12 ? "10px" : "12px",
                          }}
                        >
                          {celda.letra}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p>💡 Haz clic en la primera y en la última letra para seleccionar una palabra</p>
                    <p>🔄 Las palabras pueden estar en cualquier dirección: horizontal, vertical o diagonal</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Palabras */}
            <div>
              <Card className="bg-white shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-center">
                  <CardTitle className="text-xl font-bold">🌱 Plantas a Encontrar</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {palabrasObjetivo.map((palabra, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 flex items-center justify-between ${palabra.encontrada
                          ? "bg-green-100 border-green-300 text-green-800"
                          : "bg-gray-100 border-gray-300 text-gray-800"
                          }`}
                      >
                        <div className="flex items-center space-x-2">
                          {palabra.encontrada && <CheckCircle className="h-5 w-5 text-green-600" />}
                          <span className={`font-bold ${palabra.encontrada ? "line-through" : ""}`}>
                            {palabra.palabra}
                          </span>
                        </div>
                        <div className="text-2xl">
                          {plantasDelJuego.find((p) => p.nombre === palabra.palabra)?.emoji}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-bold text-orange-800 mb-2">📊 Estadísticas</h4>
                      <div className="text-sm text-orange-700 space-y-1">
                        <p>⏱️ Tiempo: {formatearTiempo(tiempo)}</p>
                        <p>⭐ Puntos: {puntuacion}</p>
                        <p>
                          🎯 Progreso: {Math.round((palabrasEncontradas.length / nivelSeleccionado.palabras) * 100)}%
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => iniciarJuego(nivelSeleccionado)}
                      variant="outline"
                      className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      <RotateCcw className="mr-2 h-5 w-5" />
                      Reiniciar Juego
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
