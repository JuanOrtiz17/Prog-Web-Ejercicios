"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Trophy, Volume2, RotateCcw, Target } from "lucide-react"
import { plantasBCS } from "@/lib/plantas-data"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"

interface NivelDificultad {
  nombre: string
  filas: number
  columnas: number
  descripcion: string
  color: string
  icono: string
}

const nivelesDificultad: NivelDificultad[] = [
  {
    nombre: "Fácil",
    filas: 3,
    columnas: 3,
    descripcion: "Tabla 3x3 - 9 plantas para empezar",
    color: "from-green-400 to-emerald-500",
    icono: "🌱",
  },
  {
    nombre: "Medio",
    filas: 4,
    columnas: 4,
    descripcion: "Tabla 4x4 - 16 plantas de nivel intermedio",
    color: "from-yellow-400 to-orange-500",
    icono: "🌿",
  },
  {
    nombre: "Difícil",
    filas: 5,
    columnas: 5,
    descripcion: "Tabla 5x5 - 25 plantas para expertos",
    color: "from-red-400 to-pink-500",
    icono: "🌺",
  },
]

export default function LoteriaPage() {
  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelDificultad | null>(null)
  const [plantasDelJuego, setPlantasDelJuego] = useState<any[]>([])
  const [tablaJugador, setTablaJugador] = useState<number[]>([])
  const [cartaActual, setCartaActual] = useState<number | null>(null)
  const [cartasCantadas, setCartasCantadas] = useState<number[]>([])
  const [casillasSeleccionadas, setCasillasSeleccionadas] = useState<number[]>([])
  const [juegoIniciado, setJuegoIniciado] = useState(false)
  const [juegoTerminado, setJuegoTerminado] = useState(false)
  const [cantandoCarta, setCantandoCarta] = useState(false)
  const [puntuacion, setPuntuacion] = useState(0)
  const [lineasCompletas, setLineasCompletas] = useState(0)
  const { usuario, actualizarUsuario } = useAuth()

  // Seleccionar plantas aleatorias según el nivel
  const seleccionarPlantasAleatorias = (cantidad: number) => {
    const plantasDisponibles = [...plantasBCS]
    const plantasSeleccionadas = []

    for (let i = 0; i < cantidad; i++) {
      const indiceAleatorio = Math.floor(Math.random() * plantasDisponibles.length)
      plantasSeleccionadas.push(plantasDisponibles[indiceAleatorio])
      plantasDisponibles.splice(indiceAleatorio, 1)
    }

    return plantasSeleccionadas
  }

  // Generar tabla aleatoria según el nivel
  const generarTabla = (nivel: NivelDificultad) => {
    const totalCasillas = nivel.filas * nivel.columnas
    const plantasAleatorias = seleccionarPlantasAleatorias(totalCasillas)
    setPlantasDelJuego(plantasAleatorias)

    const plantasIds = plantasAleatorias.map((planta) => planta.id)
    setTablaJugador(plantasIds)
  }

  const iniciarJuego = (nivel: NivelDificultad) => {
    setNivelSeleccionado(nivel)
    generarTabla(nivel)
    setCartasCantadas([])
    setCasillasSeleccionadas([])
    setCartaActual(null)
    setJuegoIniciado(true)
    setJuegoTerminado(false)
    setCantandoCarta(false)
    setPuntuacion(0)
    setLineasCompletas(0)
  }

  const volverASeleccionNivel = () => {
    setNivelSeleccionado(null)
    setJuegoIniciado(false)
    setJuegoTerminado(false)
    setPlantasDelJuego([])
    setTablaJugador([])
  }

  const cantarCarta = () => {
    if (cantandoCarta || juegoTerminado) return

    const cartasDisponibles = plantasDelJuego.map((p) => p.id).filter((id) => !cartasCantadas.includes(id))

    if (cartasDisponibles.length === 0) {
      setJuegoTerminado(true)
      return
    }

    setCantandoCarta(true)
    const cartaAleatoria = cartasDisponibles[Math.floor(Math.random() * cartasDisponibles.length)]

    setTimeout(() => {
      setCartaActual(cartaAleatoria)
      setCartasCantadas((prev) => [...prev, cartaAleatoria])
      setCantandoCarta(false)
    }, 1000)
  }

  const seleccionarCasilla = (plantaId: number) => {
    if (!tablaJugador.includes(plantaId) || !cartasCantadas.includes(plantaId)) return

    if (!casillasSeleccionadas.includes(plantaId)) {
      setCasillasSeleccionadas((prev) => [...prev, plantaId])
      setPuntuacion((prev) => prev + 10)
    }
  }

  const verificarLineas = () => {
    if (!nivelSeleccionado) return 0

    const { filas, columnas } = nivelSeleccionado
    const lineas = []

    // Horizontales
    for (let i = 0; i < filas; i++) {
      const linea = []
      for (let j = 0; j < columnas; j++) {
        linea.push(i * columnas + j)
      }
      lineas.push(linea)
    }

    // Verticales
    for (let j = 0; j < columnas; j++) {
      const linea = []
      for (let i = 0; i < filas; i++) {
        linea.push(i * columnas + j)
      }
      lineas.push(linea)
    }

    // Diagonales (solo si es cuadrada)
    if (filas === columnas) {
      // Diagonal principal
      const diagonal1 = []
      for (let i = 0; i < filas; i++) {
        diagonal1.push(i * columnas + i)
      }
      lineas.push(diagonal1)

      // Diagonal secundaria
      const diagonal2 = []
      for (let i = 0; i < filas; i++) {
        diagonal2.push(i * columnas + (columnas - 1 - i))
      }
      lineas.push(diagonal2)
    }

    let lineasCompletas = 0
    lineas.forEach((linea) => {
      const casillasLinea = linea.map((index) => tablaJugador[index])
      const lineaCompleta = casillasLinea.every((plantaId) => casillasSeleccionadas.includes(plantaId))
      if (lineaCompleta) lineasCompletas++
    })

    return lineasCompletas
  }

  const gritarLoteria = () => {
    const lineasActuales = verificarLineas()
    if (lineasActuales > lineasCompletas) {
      setLineasCompletas(lineasActuales)
      setPuntuacion((prev) => prev + 100 * lineasActuales)

      const totalCasillas = nivelSeleccionado ? nivelSeleccionado.filas * nivelSeleccionado.columnas : 0
      if (casillasSeleccionadas.length === totalCasillas) {
        setJuegoTerminado(true)
        const multiplicadorDificultad = nivelSeleccionado?.filas === 3 ? 1 : nivelSeleccionado?.filas === 4 ? 1.5 : 2
        const puntosFinales = Math.floor((puntuacion + 500) * multiplicadorDificultad)

        // Actualizar experiencia y puntos del usuario
        if (usuario) {
          actualizarUsuario({
            puntosTotal: (usuario.puntosTotal || 0) + puntosFinales,
            experiencia: (usuario.experiencia || 0) + Math.floor(puntosFinales / 10),
          })
        }
      }
    }
  }

  const obtenerPlanta = (id: number) => {
    return plantasDelJuego.find((p) => p.id === id)
  }

  useEffect(() => {
    if (juegoIniciado && !juegoTerminado) {
      const lineasActuales = verificarLineas()
      if (lineasActuales > lineasCompletas) {
        setLineasCompletas(lineasActuales)
      }
    }
  }, [casillasSeleccionadas])

  if (!nivelSeleccionado) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-red-100">
          <header className="bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold">⭐ Lotería Sudcaliforniana</h1>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <Card className="max-w-4xl mx-auto bg-white shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
                  <CardTitle className="text-3xl font-bold">🎲 ¡Lotería de Plantas BCS! 🌺</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-8">
                    <Star className="h-20 w-20 text-purple-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">¡El juego tradicional con plantas de BCS!</h2>
                    <p className="text-lg text-gray-600 mb-6">
                      Cada nivel usa plantas diferentes seleccionadas aleatoriamente
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {nivelesDificultad.map((nivel) => (
                      <Card
                        key={nivel.nombre}
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-300"
                        onClick={() => iniciarJuego(nivel)}
                      >
                        <div className={`h-4 bg-gradient-to-r ${nivel.color}`}></div>
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl mb-4">{nivel.icono}</div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{nivel.nombre}</h3>
                          <p className="text-gray-600 mb-4">{nivel.descripcion}</p>
                          <div className="bg-gray-100 rounded-lg p-3 mb-4">
                            <p className="font-bold text-gray-700">
                              Tabla {nivel.filas}x{nivel.columnas}
                            </p>
                            <p className="text-sm text-gray-600">{nivel.filas * nivel.columnas} casillas</p>
                          </div>
                          <Button className={`w-full bg-gradient-to-r ${nivel.color} text-white font-bold`}>
                            <Star className="mr-2 h-4 w-4" />
                            Jugar {nivel.nombre}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="font-bold text-purple-800 mb-3">¿Cómo jugar?</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-700">
                      <div>
                        <p>
                          🎯 <strong>Objetivo:</strong> Completa líneas en tu tabla de plantas
                        </p>
                        <p>
                          🎪 <strong>Mecánica:</strong> Escucha las cartas y marca tu tabla
                        </p>
                      </div>
                      <div>
                        <p>
                          🌱 <strong>Aprende:</strong> Conoce las plantas mientras juegas
                        </p>
                        <p>
                          🏆 <strong>Gana:</strong> Grita "¡LOTERÍA!" cuando completes una línea
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
    const totalCasillas = nivelSeleccionado.filas * nivelSeleccionado.columnas
    const multiplicadorDificultad = nivelSeleccionado.filas === 3 ? 1 : nivelSeleccionado.filas === 4 ? 1.5 : 2
    const puntosFinales = Math.floor((puntuacion + 500) * multiplicadorDificultad)

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-red-100">
          <header className="bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold">⭐ Lotería Sudcaliforniana</h1>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <Card className="max-w-2xl mx-auto bg-white shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <CardTitle className="text-3xl font-bold">🎉 ¡LOTERÍA! 🎉</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-6">
                    <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Felicidades, ganaste la lotería!</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg mb-6">
                      <div className="bg-purple-100 p-4 rounded-lg">
                        <p className="font-bold text-purple-800">📏 Líneas Completas</p>
                        <p className="text-2xl text-purple-600">{lineasCompletas}</p>
                      </div>
                      <div className="bg-yellow-100 p-4 rounded-lg">
                        <p className="font-bold text-yellow-800">⭐ Puntos Totales</p>
                        <p className="text-2xl text-yellow-600">{puntosFinales}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-100 p-4 rounded-lg">
                        <p className="font-bold text-green-800">🌱 Plantas Aprendidas</p>
                        <p className="text-2xl text-green-600">
                          {casillasSeleccionadas.length}/{totalCasillas}
                        </p>
                      </div>
                      <div className="bg-blue-100 p-4 rounded-lg">
                        <p className="font-bold text-blue-800">📊 Nivel</p>
                        <p className="text-2xl text-blue-600">
                          {nivelSeleccionado.icono} {nivelSeleccionado.nombre}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => iniciarJuego(nivelSeleccionado)}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-red-100">
        <header className="bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold">⭐ Lotería Sudcaliforniana</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Badge className="bg-white text-purple-600 text-lg px-3 py-1">Líneas: {lineasCompletas}</Badge>
                <Badge className="bg-white text-purple-600 text-lg px-3 py-1">{puntuacion} pts</Badge>
                <Badge className="bg-white text-purple-600 text-lg px-3 py-1">
                  {nivelSeleccionado.icono} {nivelSeleccionado.nombre}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Carta Actual */}
            <div className="text-center">
              <Card className="bg-white shadow-2xl mb-6">
                <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
                  <CardTitle className="text-xl font-bold">🎪 Carta Actual</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {cantandoCarta ? (
                    <div className="text-center">
                      <div className="animate-spin text-6xl mb-4">🎲</div>
                      <p className="text-xl font-bold text-gray-600">Cantando carta...</p>
                    </div>
                  ) : cartaActual ? (
                    <div className="text-center">
                      <div className="text-8xl mb-4">{obtenerPlanta(cartaActual)?.emoji}</div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {obtenerPlanta(cartaActual)?.nombre_comun}
                      </h3>
                      <p className="text-lg text-gray-600 mb-4">{obtenerPlanta(cartaActual)?.descripcion}</p>
                      <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
                        Carta #{cartasCantadas.length}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎯</div>
                      <p className="text-xl text-gray-600">¡Presiona "Cantar Carta" para comenzar!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Button
                  onClick={cantarCarta}
                  disabled={cantandoCarta || juegoTerminado}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-xl py-4"
                >
                  <Volume2 className="mr-2 h-6 w-6" />
                  {cantandoCarta ? "Cantando..." : "Cantar Carta"}
                </Button>

                <Button
                  onClick={gritarLoteria}
                  disabled={casillasSeleccionadas.length === 0}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white text-xl py-4"
                >
                  <Star className="mr-2 h-6 w-6" />
                  ¡LOTERÍA!
                </Button>
              </div>
            </div>

            {/* Tabla del Jugador */}
            <div>
              <Card className="bg-white shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-500 text-white text-center">
                  <CardTitle className="text-xl font-bold">
                    🎯 Mi Tabla {nivelSeleccionado.filas}x{nivelSeleccionado.columnas}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div
                    className={`grid gap-3 ${
                      nivelSeleccionado.filas === 3
                        ? "grid-cols-3"
                        : nivelSeleccionado.filas === 4
                          ? "grid-cols-4"
                          : "grid-cols-5"
                    }`}
                  >
                    {tablaJugador.map((plantaId, index) => {
                      const planta = obtenerPlanta(plantaId)
                      const estaSeleccionada = casillasSeleccionadas.includes(plantaId)
                      const estaCantada = cartasCantadas.includes(plantaId)

                      return (
                        <Button
                          key={index}
                          onClick={() => seleccionarCasilla(plantaId)}
                          disabled={!estaCantada || estaSeleccionada}
                          className={`aspect-square p-2 text-center transition-all duration-300 ${
                            estaSeleccionada
                              ? "bg-green-500 text-white border-4 border-green-600 transform scale-95"
                              : estaCantada
                                ? "bg-yellow-200 text-gray-800 border-4 border-yellow-400 hover:bg-yellow-300 animate-pulse"
                                : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className={`${nivelSeleccionado.filas === 5 ? "text-lg" : "text-2xl"} mb-1`}>
                              {planta?.emoji}
                            </div>
                            <div
                              className={`${nivelSeleccionado.filas === 5 ? "text-xs" : "text-xs"} font-bold leading-tight`}
                            >
                              {planta?.nombre_comun}
                            </div>
                          </div>
                        </Button>
                      )
                    })}
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Casillas marcadas: {casillasSeleccionadas.length}/
                      {nivelSeleccionado.filas * nivelSeleccionado.columnas}
                    </p>
                    <div className="flex justify-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-200 border-2 border-yellow-400 mr-2"></div>
                        <span>Cantada</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 border-2 border-green-600 mr-2"></div>
                        <span>Marcada</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cartas Cantadas */}
          {cartasCantadas.length > 0 && (
            <Card className="mt-8 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-400 to-gray-500 text-white text-center">
                <CardTitle className="text-lg font-bold">📋 Cartas Cantadas ({cartasCantadas.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {cartasCantadas.map((plantaId) => {
                    const planta = obtenerPlanta(plantaId)
                    return (
                      <div key={plantaId} className="text-center p-2 bg-gray-100 rounded-lg border">
                        <div className="text-lg">{planta?.emoji}</div>
                        <div className="text-xs text-gray-600">{planta?.nombre_comun}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
