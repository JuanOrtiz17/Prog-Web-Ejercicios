"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Brain, Clock, Star, CheckCircle, XCircle, Target } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface NivelDificultad {
  nombre: string
  preguntas: number
  descripcion: string
  color: string
  icono: string
}

const nivelesDificultad: NivelDificultad[] = [
  {
    nombre: "Fácil",
    preguntas: 5,
    descripcion: "5 preguntas básicas sobre plantas de BCS",
    color: "from-green-400 to-emerald-500",
    icono: "🌱",
  },
  {
    nombre: "Medio",
    preguntas: 10,
    descripcion: "10 preguntas de nivel intermedio",
    color: "from-yellow-400 to-orange-500",
    icono: "🌿",
  },
  {
    nombre: "Difícil",
    preguntas: 15,
    descripcion: "15 preguntas para expertos botánicos",
    color: "from-red-400 to-pink-500",
    icono: "🌺",
  },
]

export default function TriviaPage() {
  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelDificultad | null>(null)
  const [preguntasTrivia, setPreguntasTrivia] = useState<any[]>([])
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null)
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const [puntuacion, setPuntuacion] = useState(0)
  const [tiempo, setTiempo] = useState(0)
  const [juegoTerminado, setJuegoTerminado] = useState(false)
  const [juegoIniciado, setJuegoIniciado] = useState(false)
  const [respuestasCorrectas, setRespuestasCorrectas] = useState(0)
  const { usuario, guardarProgresoJuego, actualizarEstadisticasJuego, desbloquearLogro } = useAuth()

  const puntosActualizados = useRef(false)

  const iniciarJuego = async (nivel: NivelDificultad) => {
    const res = await fetch(`http://localhost/plantas/app/Backend/get_trivia.php?cantidad=${nivel.preguntas}`)
    const data = await res.json()
    if (!data.exito) {
      alert("No se pudieron obtener las preguntas de trivia.")
      return
    }
    const preguntasConOpciones = data.preguntas.map((pregunta: any) => {
      const opciones = [...pregunta.opciones]
      // Mezclar opciones
      for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[opciones[i], opciones[j]] = [opciones[j], opciones[i]]
      }
      // Busca el índice de la opción correcta (la correcta siempre es la primera en la base)
      const respuestaCorrectaIndex = opciones.indexOf(pregunta.opciones[0])
      return {
        ...pregunta,
        opciones,
        respuestaCorrecta: respuestaCorrectaIndex,
        explicacion: `La respuesta correcta es: ${pregunta.opciones[0]}`
      }
    })
    setPreguntasTrivia(preguntasConOpciones)
    setNivelSeleccionado(nivel)
    setJuegoIniciado(true)
    setPreguntaActual(0)
    setRespuestaSeleccionada(null)
    setMostrarResultado(false)
    setPuntuacion(0)
    setTiempo(0)
    setJuegoTerminado(false)
    setRespuestasCorrectas(0)
    puntosActualizados.current = false
  }

  const volverASeleccionNivel = () => {
    setNivelSeleccionado(null)
    setJuegoIniciado(false)
    setJuegoTerminado(false)
    setPreguntasTrivia([])
    puntosActualizados.current = false
  }

  useEffect(() => {
    let intervalo: NodeJS.Timeout
    if (juegoIniciado && !juegoTerminado) {
      intervalo = setInterval(() => setTiempo((prev) => prev + 1), 1000)
    }
    return () => clearInterval(intervalo)
  }, [juegoIniciado, juegoTerminado])

  useEffect(() => {
    if (usuario && juegoTerminado && nivelSeleccionado && !puntosActualizados.current) {
      const multiplicadorDificultad =
        nivelSeleccionado.preguntas === 5 ? 1 : nivelSeleccionado.preguntas === 10 ? 1.5 : 2
      const puntosGanados = Math.floor(puntuacion * multiplicadorDificultad)
      const experienciaGanada = Math.floor(puntosGanados / 10)

      // Si no tienes la columna planta.id, simplemente usa []
      const plantasDescubiertasIds: any[] = []

      guardarProgresoJuego("Trivia", {
        puntos: puntosGanados,
        experiencia: experienciaGanada,
        tiempo: formatearTiempo(tiempo),
        resultado: `${respuestasCorrectas}/${nivelSeleccionado.preguntas} correctas`,
        nivel: nivelSeleccionado.nombre,
        tiempoJugadoMinutos: Math.ceil(tiempo / 60),
        plantasDescubiertas: plantasDescubiertasIds,
      })

      const estadisticasActuales = usuario.estadisticasJuegos?.trivia || {
        partidasJugadas: 0,
        respuestasCorrectas: 0,
        respuestasIncorrectas: 0,
        mejorPuntuacion: 0,
      }

      actualizarEstadisticasJuego("trivia", {
        partidasJugadas: estadisticasActuales.partidasJugadas + 1,
        respuestasCorrectas: estadisticasActuales.respuestasCorrectas + respuestasCorrectas,
        respuestasIncorrectas:
          estadisticasActuales.respuestasIncorrectas + (nivelSeleccionado.preguntas - respuestasCorrectas),
        mejorPuntuacion: Math.max(estadisticasActuales.mejorPuntuacion, puntosGanados),
      })

      if (estadisticasActuales.respuestasCorrectas + respuestasCorrectas >= 50) {
        desbloquearLogro(3)
      }
      if (respuestasCorrectas >= nivelSeleccionado.preguntas * 0.9) {
        desbloquearLogro(6)
      }

      puntosActualizados.current = true
    }
  }, [juegoTerminado, nivelSeleccionado, puntuacion, tiempo, respuestasCorrectas, preguntasTrivia])

  const seleccionarRespuesta = (indice: number) => {
    if (respuestaSeleccionada !== null) return
    setRespuestaSeleccionada(indice)
    setMostrarResultado(true)

    const pregunta = preguntasTrivia[preguntaActual]
    if (indice === pregunta.respuestaCorrecta) {
      const puntosGanados = Math.max(100 - tiempo, 50)
      setPuntuacion((prev) => prev + puntosGanados)
      setRespuestasCorrectas((prev) => prev + 1)
    }
  }

  const siguientePregunta = () => {
    if (preguntaActual < preguntasTrivia.length - 1) {
      setPreguntaActual((prev) => prev + 1)
      setRespuestaSeleccionada(null)
      setMostrarResultado(false)
    } else {
      setJuegoTerminado(true)
    }
  }

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const obtenerNivelConocimiento = () => {
    if (!nivelSeleccionado) return { nivel: "Aprendiz", emoji: "🌿", color: "text-gray-600" }
    const porcentaje = (respuestasCorrectas / nivelSeleccionado.preguntas) * 100
    if (porcentaje >= 90) return { nivel: "Maestro Botánico", emoji: "🏆", color: "text-yellow-600" }
    if (porcentaje >= 70) return { nivel: "Experto en Flora", emoji: "🌟", color: "text-green-600" }
    if (porcentaje >= 50) return { nivel: "Explorador Verde", emoji: "🌱", color: "text-blue-600" }
    return { nivel: "Aprendiz de Plantas", emoji: "🌿", color: "text-gray-600" }
  }

  const nivel = obtenerNivelConocimiento()

  if (!nivelSeleccionado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
        <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold">🧠 Trivia Botánica BCS</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Card className="max-w-4xl mx-auto bg-white shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                <CardTitle className="text-3xl font-bold">🌺 ¡Trivia de Plantas BCS! 🌵</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="mb-8">
                  <Brain className="h-20 w-20 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">¿Qué tanto sabes sobre las plantas de BCS?</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Cada nivel genera preguntas aleatorias sobre diferentes plantas nativas
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {nivelesDificultad.map((nivel) => (
                    <Card
                      key={nivel.nombre}
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-300"
                      onClick={() => iniciarJuego(nivel)}
                    >
                      <div className={`h-4 bg-gradient-to-r ${nivel.color}`}></div>
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-4">{nivel.icono}</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{nivel.nombre}</h3>
                        <p className="text-gray-600 mb-4">{nivel.descripcion}</p>
                        <div className="bg-gray-100 rounded-lg p-3 mb-4">
                          <p className="font-bold text-gray-700">{nivel.preguntas} preguntas</p>
                          <p className="text-sm text-gray-600">Plantas aleatorias</p>
                        </div>
                        <Button className={`w-full bg-gradient-to-r ${nivel.color} text-white font-bold`}>
                          <Brain className="mr-2 h-4 w-4" />
                          Comenzar {nivel.nombre}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-bold text-blue-800 mb-3">Características de la Trivia:</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <p>
                        🎯 <strong>Preguntas dinámicas:</strong> Generadas aleatoriamente
                      </p>
                      <p>
                        ⏱️ <strong>Tiempo:</strong> Sin límite, ¡pero más rápido = más puntos!
                      </p>
                    </div>
                    <div>
                      <p>
                        🌱 <strong>Aprende:</strong> Cada respuesta incluye datos curiosos
                      </p>
                      <p>
                        🏆 <strong>Meta:</strong> Conviértete en un Maestro Botánico
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (juegoTerminado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
        <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold">🧠 Trivia Botánica BCS</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Card className="max-w-2xl mx-auto bg-white shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <CardTitle className="text-3xl font-bold">🎉 ¡Trivia Completada! 🎉</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="text-6xl mb-4">{nivel.emoji}</div>
                  <h2 className={`text-2xl font-bold mb-4 ${nivel.color}`}>{nivel.nivel}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg mb-6">
                    <div className="bg-green-100 p-4 rounded-lg">
                      <p className="font-bold text-green-800">✅ Correctas</p>
                      <p className="text-2xl text-green-600">
                        {respuestasCorrectas}/{nivelSeleccionado.preguntas}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg">
                      <p className="font-bold text-blue-800">⏱️ Tiempo</p>
                      <p className="text-2xl text-blue-600">{formatearTiempo(tiempo)}</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg">
                      <p className="font-bold text-yellow-800">⭐ Puntos</p>
                      <p className="text-2xl text-yellow-600">
                        {Math.floor(
                          puntuacion *
                            (nivelSeleccionado.preguntas === 5 ? 1 : nivelSeleccionado.preguntas === 10 ? 1.5 : 2)
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="bg-purple-100 p-4 rounded-lg mb-6">
                    <p className="font-bold text-purple-800">📊 Precisión</p>
                    <p className="text-2xl text-purple-600">
                      {Math.round((respuestasCorrectas / nivelSeleccionado.preguntas) * 100)}%
                    </p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-lg">
                    <p className="font-bold text-green-800">🌱 Nivel: {nivelSeleccionado.nombre}</p>
                    <p className="text-green-600">{nivelSeleccionado.preguntas} preguntas sobre plantas aleatorias</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => iniciarJuego(nivelSeleccionado)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3"
                  >
                    🔄 Jugar de Nuevo
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
    )
  }

  const pregunta = preguntasTrivia[preguntaActual]
  const progreso = ((preguntaActual + 1) / preguntasTrivia.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold">🧠 Trivia Botánica BCS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-white text-blue-600 text-lg px-3 py-1">
                <Clock className="mr-1 h-4 w-4" />
                {formatearTiempo(tiempo)}
              </Badge>
              <Badge className="bg-white text-blue-600 text-lg px-3 py-1">{puntuacion} pts</Badge>
              <Badge className="bg-white text-blue-600 text-lg px-3 py-1">
                {nivelSeleccionado?.icono} {nivelSeleccionado?.nombre}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-bold text-gray-700">
                Pregunta {preguntaActual + 1} de {preguntasTrivia.length}
              </span>
              <span className="text-lg font-bold text-gray-700">{Math.round(progreso)}%</span>
            </div>
            <Progress value={progreso} className="h-3" />
          </div>

          {/* Question Card */}
          <Card className="bg-white shadow-2xl mb-6">
            <CardHeader className="bg-gradient-to-r from-blue-400 to-purple-500 text-white text-center">
              <div className="text-4xl mb-2">🌱</div>
              <CardTitle className="text-xl md:text-2xl font-bold">{pregunta.pregunta}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4">
                {pregunta.opciones.map((opcion: string, indice: number) => (
                  <Button
                    key={indice}
                    onClick={() => seleccionarRespuesta(indice)}
                    disabled={respuestaSeleccionada !== null}
                    className={`p-4 text-left text-lg h-auto justify-start ${
                      respuestaSeleccionada === null
                        ? "bg-gray-100 hover:bg-blue-100 text-gray-800 border-2 border-gray-300 hover:border-blue-400"
                        : respuestaSeleccionada === indice
                          ? indice === pregunta.respuestaCorrecta
                            ? "bg-green-500 text-white border-green-600"
                            : "bg-red-500 text-white border-red-600"
                          : indice === pregunta.respuestaCorrecta
                            ? "bg-green-500 text-white border-green-600"
                            : "bg-gray-200 text-gray-600 border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      {respuestaSeleccionada !== null && (
                        <div className="mr-3">
                          {indice === pregunta.respuestaCorrecta ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : respuestaSeleccionada === indice ? (
                            <XCircle className="h-6 w-6" />
                          ) : null}
                        </div>
                      )}
                      <span className="font-bold mr-3">{String.fromCharCode(65 + indice)}.</span>
                      {opcion}
                    </div>
                  </Button>
                ))}
              </div>

              {mostrarResultado && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🌱</div>
                    <div>
                      <p className="font-bold text-blue-800 mb-2">
                        {respuestaSeleccionada === pregunta.respuestaCorrecta ? "¡Correcto!" : "¡Aprende algo nuevo!"}
                      </p>
                      <p className="text-blue-700">{pregunta.explicacion}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <Button
                      onClick={siguientePregunta}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3"
                    >
                      {preguntaActual < preguntasTrivia.length - 1 ? "Siguiente Pregunta" : "Ver Resultados"}
                      <Star className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
