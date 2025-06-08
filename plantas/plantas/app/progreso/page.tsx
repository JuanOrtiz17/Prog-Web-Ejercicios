"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Trophy,
  Star,
  Target,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  Brain,
  Grid3X3,
  BookOpen,
  Clock,
  Medal,
  Crown,
  Leaf,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ProgresoPage() {
  const { usuario, cargando } = useAuth()
  const [estadisticasGenerales, setEstadisticasGenerales] = useState({
    nivel: 0,
    experiencia: 0,
    experienciaSiguienteNivel: 500,
    puntosTotal: 0,
    plantasDescubiertas: 0,
    totalPlantas: 40,
    juegosFavorito: "Ninguno",
    tiempoJugado: "0h 0m",
    racha: 0,
  })
useEffect(() => {
  if (!usuario || !usuario.id) {
    console.warn("No hay usuario o ID de usuario indefinido")
    return
  }

  console.log("Enviando ID al backend:", usuario.id)

  fetch("http://localhost/plantas/app/Backend/get_progreso.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_usuario: usuario.id }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Respuesta del backend:", data)
      if (data.exito) {
        const progreso = data.progreso
        
        // Función para formatear el tiempo correctamente
        const formatearTiempo = (minutos: number | null | undefined): string => {
          // Convertir a número si es posible, sino usar 0
          const minutosNumero = Number(minutos) || 0
          
          if (minutosNumero === 0 || isNaN(minutosNumero)) {
            return "0h 0m"
          }
          
          const horas = Math.floor(minutosNumero / 60)
          const mins = minutosNumero % 60
          return `${horas}h ${mins}m`
        }
        
        setEstadisticasGenerales({
          nivel: progreso.nivel || 0,
          experiencia: progreso.xp || 0,
          experienciaSiguienteNivel: 500,
          puntosTotal: progreso.puntos || 0,
          plantasDescubiertas: progreso.plantas_descubiertas || 0,
          totalPlantas: 42,
          juegosFavorito: progreso.juego_favorito || "Ninguno",
          tiempoJugado: formatearTiempo(progreso.tiempo_jugado),
          racha: progreso.racha_dias_jugados || 0,
        })
      } else {
        console.warn("No se pudo obtener el progreso:", data.mensaje)
      }
    })
    .catch((err) => console.error("Error al obtener progreso:", err))
}, [usuario])



  const obtenerColorNivel = (nivel: number) => {
    if (nivel >= 10) return "from-purple-500 to-pink-500"
    if (nivel >= 7) return "from-blue-500 to-cyan-500"
    if (nivel >= 4) return "from-green-500 to-emerald-500"
    return "from-yellow-500 to-orange-500"
  }

  const obtenerTituloNivel = (nivel: number) => {
    if (nivel >= 10) return "Maestro Botánico"
    if (nivel >= 7) return "Experto en Flora"
    if (nivel >= 4) return "Explorador Verde"
    return "Aprendiz de Plantas"
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin text-6xl mb-4">🌱</div>
            <p className="text-lg font-semibold text-gray-700">Cargando...</p>
            <p className="text-sm text-gray-500 mt-2">Obteniendo tu progreso</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100">
        <header className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">📊 Mi Progreso</h1>
                <p className="text-green-100">Revisa tu aventura de aprendizaje</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className={`bg-gradient-to-r ${obtenerColorNivel(estadisticasGenerales.nivel)} text-white shadow-lg`}>
              <CardContent className="p-6 text-center">
                <Crown className="h-12 w-12 mx-auto mb-3" />
                <h3 className="text-2xl font-bold">Nivel {estadisticasGenerales.nivel}</h3>
                <p className="text-sm opacity-90">{obtenerTituloNivel(estadisticasGenerales.nivel)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 mx-auto mb-3" />
                <h3 className="text-2xl font-bold">{estadisticasGenerales.puntosTotal.toLocaleString()}</h3>
                <p className="text-sm opacity-90">Puntos Totales</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg">
              <CardContent className="p-6 text-center">
                <Leaf className="h-12 w-12 mx-auto mb-3" />
                <h3 className="text-2xl font-bold">
                  {estadisticasGenerales.plantasDescubiertas}/{estadisticasGenerales.totalPlantas}
                </h3>
                <p className="text-sm opacity-90">Plantas Descubiertas</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 mx-auto mb-3" />
                <h3 className="text-2xl font-bold">{estadisticasGenerales.racha} días</h3>
                <p className="text-sm opacity-90">Racha Actual</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-6 w-6" />
                Progreso de Nivel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-700">Nivel {estadisticasGenerales.nivel}</span>
                  <span className="text-sm text-gray-600">
                    {estadisticasGenerales.experiencia}/{estadisticasGenerales.experienciaSiguienteNivel} XP
                  </span>
                </div>
                <Progress
                  value={(estadisticasGenerales.experiencia / estadisticasGenerales.experienciaSiguienteNivel) * 100}
                  className="h-4"
                />
                <p className="text-sm text-gray-600 mt-2">
                  {estadisticasGenerales.experienciaSiguienteNivel - estadisticasGenerales.experiencia} XP para el siguiente nivel
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-bold text-blue-800">Tiempo Jugado</p>
                  <p className="text-blue-600">{estadisticasGenerales.tiempoJugado}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-bold text-green-800">Juego Favorito</p>
                  <p className="text-green-600">{estadisticasGenerales.juegosFavorito}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

