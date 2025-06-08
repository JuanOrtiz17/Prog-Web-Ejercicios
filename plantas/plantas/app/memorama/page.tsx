"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RotateCcw, Trophy, Clock, Star, Target } from "lucide-react"
// import { plantasBCS } from "@/lib/plantas-data" // Ya NO la usas, todo sale del backend
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"

interface Carta {
  id: number
  plantaId: number
  nombre: string
  imagen: string        // Ahora sí, para la imagen de la planta en base64 o url
  emoji: string         // Valor por defecto: ""
  color: string         // Valor por defecto: "bg-green-600"
  volteada: boolean
  emparejada: boolean
}

interface NivelDificultad {
  nombre: string
  parejas: number
  descripcion: string
  color: string
  icono: string
}

const nivelesDificultad: NivelDificultad[] = [
  {
    nombre: "Fácil",
    parejas: 8,
    descripcion: "8 parejas de plantas - Perfecto para comenzar",
    color: "from-green-400 to-emerald-500",
    icono: "🌱",
  },
  {
    nombre: "Medio",
    parejas: 14,
    descripcion: "14 parejas de plantas - Un desafío intermedio",
    color: "from-yellow-400 to-orange-500",
    icono: "🌿",
  },
  {
    nombre: "Difícil",
    parejas: 20,
    descripcion: "20 parejas de plantas - Para expertos botánicos",
    color: "from-red-400 to-pink-500",
    icono: "🌺",
  },
]

export default function MemoramaPage() {
  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelDificultad | null>(null)
  const [plantasDelJuego, setPlantasDelJuego] = useState<any[]>([])
  const [cartas, setCartas] = useState<Carta[]>([])
  const [cartasSeleccionadas, setCartasSeleccionadas] = useState<number[]>([])
  const [parejasEncontradas, setParejasEncontradas] = useState(0)
  const [movimientos, setMovimientos] = useState(0)
  const [tiempo, setTiempo] = useState(0)
  const [juegoTerminado, setJuegoTerminado] = useState(false)
  const [juegoIniciado, setJuegoIniciado] = useState(false)
  const { usuario, guardarProgresoJuego, actualizarEstadisticasJuego, desbloquearLogro } = useAuth()

  // Usar useRef para evitar múltiples actualizaciones
  const puntosActualizados = useRef(false)

  // Pedir las plantas al backend
  const obtenerPlantasAleatorias = async (cantidad: number) => {
    try {
      const res = await fetch(`http://localhost/plantas/app/Backend/get_plantas.php?cantidad=${cantidad}`);
      const data = await res.json();
      if (data.exito) {
        return data.plantas; // [{id, nombre, imagen}]
      }
      return [];
    } catch (err) {
      console.error("Error al obtener plantas:", err);
      return [];
    }
  };

  // Inicializar el juego con el nivel seleccionado
  const inicializarJuego = async (nivel: NivelDificultad) => {
    const plantasAleatorias = await obtenerPlantasAleatorias(nivel.parejas);

    const cartasDobles: Carta[] = [...plantasAleatorias, ...plantasAleatorias].map((planta, index) => ({
      id: index,
      plantaId: planta.id,
      nombre: planta.nombre,
      imagen: planta.imagen, // base64 o url
      volteada: false,
      emparejada: false,
      emoji: "",              // por defecto vacío
      color: "bg-green-600",  // puedes personalizar según familia, etc.
    }));

    const cartasMezcladas = cartasDobles.sort(() => Math.random() - 0.5);
    setCartas(cartasMezcladas);
    setCartasSeleccionadas([]);
    setParejasEncontradas(0);
    setMovimientos(0);
    setTiempo(0);
    setJuegoTerminado(false);
    setJuegoIniciado(true);
    setNivelSeleccionado(nivel);
    puntosActualizados.current = false;
    setPlantasDelJuego(plantasAleatorias);
  };

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

  // Actualizar puntos solo una vez cuando el juego termine
  useEffect(() => {
    if (usuario && juegoTerminado && nivelSeleccionado && !puntosActualizados.current) {
      const multiplicadorDificultad = nivelSeleccionado.parejas === 8 ? 1 : nivelSeleccionado.parejas === 14 ? 1.5 : 2
      const puntos = Math.max(1000 - movimientos * 10 - tiempo * 2, 100) * multiplicadorDificultad
      const experienciaGanada = Math.floor(puntos / 10)

      // Obtener IDs de plantas descubiertas en este juego
      const plantasDescubiertasIds = plantasDelJuego.map((planta) => planta.id)

      // Guardar progreso del juego
      guardarProgresoJuego("Memorama", {
        puntos: Math.floor(puntos),
        experiencia: experienciaGanada,
        tiempo: formatearTiempo(tiempo),
        resultado: `Victoria ${nivelSeleccionado.parejas}/${nivelSeleccionado.parejas}`,
        nivel: nivelSeleccionado.nombre,
        tiempoJugadoMinutos: Math.ceil(tiempo / 60),
        plantasDescubiertas: plantasDescubiertasIds,
      })

      // Actualizar estadísticas específicas del memorama
      const estadisticasActuales = usuario.estadisticasJuegos?.memorama || {
        partidasJugadas: 0,
        partidasGanadas: 0,
        mejorTiempo: 0,
        totalMovimientos: 0,
      }

      actualizarEstadisticasJuego("memorama", {
        partidasJugadas: estadisticasActuales.partidasJugadas + 1,
        partidasGanadas: estadisticasActuales.partidasGanadas + 1,
        mejorTiempo:
          estadisticasActuales.mejorTiempo === 0 ? tiempo : Math.min(estadisticasActuales.mejorTiempo, tiempo),
        totalMovimientos: estadisticasActuales.totalMovimientos + movimientos,
      })

      // Verificar logros
      if (movimientos <= nivelSeleccionado.parejas * 2) {
        desbloquearLogro(4) // Memoria de Elefante
      }
      if (estadisticasActuales.partidasJugadas + 1 >= 7) {
        desbloquearLogro(5) // Explorador Verde
      }

      puntosActualizados.current = true
    }
  }, [juegoTerminado, nivelSeleccionado, movimientos, tiempo, plantasDelJuego])

  // Manejar clic en carta
  const manejarClicCarta = (cartaId: number) => {
    if (cartasSeleccionadas.length === 2) return
    if (cartas[cartaId].volteada || cartas[cartaId].emparejada) return

    const nuevasCartas = [...cartas]
    nuevasCartas[cartaId].volteada = true
    setCartas(nuevasCartas)

    const nuevasSeleccionadas = [...cartasSeleccionadas, cartaId]
    setCartasSeleccionadas(nuevasSeleccionadas)

    if (nuevasSeleccionadas.length === 2) {
      setMovimientos((prev) => prev + 1)
      const [primera, segunda] = nuevasSeleccionadas

      if (cartas[primera].plantaId === cartas[segunda].plantaId) {
        // ¡Pareja encontrada!
        setTimeout(() => {
          const cartasActualizadas = [...nuevasCartas]
          cartasActualizadas[primera].emparejada = true
          cartasActualizadas[segunda].emparejada = true
          setCartas(cartasActualizadas)
          setParejasEncontradas((prev) => prev + 1)
          setCartasSeleccionadas([])

          if (parejasEncontradas + 1 === nivelSeleccionado?.parejas) {
            setJuegoTerminado(true)
          }
        }, 1000)
      } else {
        // No es pareja, voltear de nuevo
        setTimeout(() => {
          const cartasActualizadas = [...nuevasCartas]
          cartasActualizadas[primera].volteada = false
          cartasActualizadas[segunda].volteada = false
          setCartas(cartasActualizadas)
          setCartasSeleccionadas([])
        }, 1000)
      }
    }
  }

  const volverASeleccionNivel = () => {
    setNivelSeleccionado(null)
    setJuegoIniciado(false)
    setJuegoTerminado(false)
    setCartas([])
    setPlantasDelJuego([])
    // Resetear el flag de puntos actualizados
    puntosActualizados.current = false
  }

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const calcularPuntos = () => {
    if (!nivelSeleccionado) return 0
    const multiplicadorDificultad = nivelSeleccionado.parejas === 8 ? 1 : nivelSeleccionado.parejas === 14 ? 1.5 : 2
    return Math.floor(Math.max(1000 - movimientos * 10 - tiempo * 2, 100) * multiplicadorDificultad)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold">🧠 Memorama de Plantas BCS</h1>
              </div>
              {juegoIniciado && (
                <div className="flex items-center space-x-4">
                  <Badge className="bg-white text-green-600 text-lg px-3 py-1">
                    <Clock className="mr-1 h-4 w-4" />
                    {formatearTiempo(tiempo)}
                  </Badge>
                  <Badge className="bg-white text-green-600 text-lg px-3 py-1">Movimientos: {movimientos}</Badge>
                  <Badge className="bg-white text-green-600 text-lg px-3 py-1">
                    {nivelSeleccionado?.icono} {nivelSeleccionado?.nombre}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {!nivelSeleccionado ? (
            // Selección de dificultad
            <div className="text-center">
              <Card className="max-w-4xl mx-auto bg-white shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                  <CardTitle className="text-3xl font-bold">🌵 ¡Memorama de Plantas BCS! 🌺</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Elige tu nivel de dificultad</h2>
                    <p className="text-lg text-gray-600 mb-6">
                      Cada nivel usa plantas diferentes seleccionadas aleatoriamente de las 42 especies nativas de BCS
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {nivelesDificultad.map((nivel) => (
                      <Card
                        key={nivel.nombre}
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-green-300"
                        onClick={() => inicializarJuego(nivel)}
                      >
                        <div className={`h-4 bg-gradient-to-r ${nivel.color}`}></div>
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl mb-4">{nivel.icono}</div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">{nivel.nombre}</h3>
                          <p className="text-gray-600 mb-4">{nivel.descripcion}</p>
                          <div className="bg-gray-100 rounded-lg p-3 mb-4">
                            <p className="font-bold text-gray-700">{nivel.parejas} parejas</p>
                            <p className="text-sm text-gray-600">{nivel.parejas * 2} cartas total</p>
                          </div>
                          <Button className={`w-full bg-gradient-to-r ${nivel.color} text-white font-bold`}>
                            <Target className="mr-2 h-4 w-4" />
                            Jugar {nivel.nombre}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-800 mb-3">¿Cómo jugar?</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                      <div>
                        <p>
                          🎯 <strong>Objetivo:</strong> Encuentra todas las parejas de plantas
                        </p>
                        <p>
                          🔄 <strong>Reglas:</strong> Voltea dos cartas por turno
                        </p>
                      </div>
                      <div>
                        <p>
                          🌱 <strong>Meta:</strong> Memoriza dónde están las plantas iguales
                        </p>
                        <p>
                          ⭐ <strong>Puntos:</strong> Menos movimientos = más puntos
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : juegoTerminado ? (
            // Pantalla de victoria
            <div className="text-center">
              <Card className="max-w-2xl mx-auto bg-white shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  <CardTitle className="text-3xl font-bold">🎉 ¡Felicidades, Guardián de la Flora! 🎉</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-6">
                    <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      ¡Completaste el nivel {nivelSeleccionado.nombre}!
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-lg mb-4">
                      <div className="bg-blue-100 p-4 rounded-lg">
                        <p className="font-bold text-blue-800">⏱️ Tiempo</p>
                        <p className="text-2xl text-blue-600">{formatearTiempo(tiempo)}</p>
                      </div>
                      <div className="bg-green-100 p-4 rounded-lg">
                        <p className="font-bold text-green-800">🎯 Movimientos</p>
                        <p className="text-2xl text-green-600">{movimientos}</p>
                      </div>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg mb-4">
                      <p className="font-bold text-yellow-800">⭐ Puntos Ganados</p>
                      <p className="text-3xl text-yellow-600">{calcularPuntos()}</p>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg">
                      <p className="font-bold text-purple-800">🌱 Plantas Aprendidas</p>
                      <p className="text-lg text-purple-600">{nivelSeleccionado.parejas} especies nuevas</p>
                    </div>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => inicializarJuego(nivelSeleccionado)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3"
                    >
                      <RotateCcw className="mr-2 h-5 w-5" />
                      Jugar de Nuevo
                    </Button>
                    <Button
                      onClick={volverASeleccionNivel}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3"
                    >
                      <Target className="mr-2 h-5 w-5" />
                      Cambiar Nivel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Juego en progreso
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Parejas encontradas: {parejasEncontradas}/{nivelSeleccionado.parejas}
                </h2>
                <div className="flex justify-center space-x-2">
                  {Array.from({ length: nivelSeleccionado.parejas }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${i < parejasEncontradas ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>

              <div
                className={`grid gap-4 max-w-6xl mx-auto ${nivelSeleccionado.parejas === 8
                  ? "grid-cols-4"
                  : nivelSeleccionado.parejas === 14
                    ? "grid-cols-7"
                    : "grid-cols-8"
                  }`}
              >
                {cartas.map((carta, index) => (
                  <Card
                    key={carta.id}
                    className={`aspect-square flex flex-col justify-between items-center cursor-pointer transition-all duration-300 hover:scale-105 ${carta.volteada || carta.emparejada
                        ? carta.color
                        : "bg-gradient-to-br from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700"
                      } ${carta.emparejada ? "ring-4 ring-yellow-400" : ""}`}
                    onClick={() => manejarClicCarta(index)}
                  >
                    <CardContent className="flex flex-col items-center justify-center h-full w-full p-2">
                      {carta.volteada || carta.emparejada ? (
                        <>
                          <img
                            src={carta.imagen}
                            alt={carta.nombre}
                            className="w-full max-h-[70%] rounded shadow-lg object-cover mb-2"
                            style={{ aspectRatio: "1/1" }}
                          />
                          <p className="w-full text-center mt-2 font-bold text-white text-base break-words" style={{ lineHeight: "1.1" }}>{carta.nombre}</p>
                        </>
                      ) : (
                        <div className="text-center text-white flex flex-col items-center justify-center h-full w-full">
                          <div className={`${nivelSeleccionado.parejas === 20 ? "text-2xl" : "text-4xl"}`}>🌿</div>
                          <p className={`${nivelSeleccionado.parejas === 20 ? "text-xs" : "text-sm"} font-bold`}>?</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                ))}
              </div>

              <div className="text-center mt-8 space-x-4">
                <Button
                  onClick={() => inicializarJuego(nivelSeleccionado)}
                  variant="outline"
                  className="border-2 border-green-500 text-green-600 hover:bg-green-50"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Reiniciar Juego
                </Button>
                <Button
                  onClick={volverASeleccionNivel}
                  variant="outline"
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Cambiar Nivel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
