"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Home,
  BookOpen,
  Gamepad2,
  TrendingUp,
  LogOut,
  Star,
  Trophy,
  Zap,
  Leaf,
  Brain,
  Grid3X3,
  Menu,
  X,
  Crown,
  Medal,
  User,
  ArrowLeft,
  Search,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"

// Tipos TypeScript para el ranking
interface JugadorRanking {
  posicion: number;
  id_usuario: number;
  nombre: string;
  nombreUsuario?: string;
  puntos: number;
  avatar: string;
}

interface RespuestaRanking {
  exito: boolean;
  mensaje: string;
  ranking: JugadorRanking[];
  total_jugadores?: number;
}

export default function MinijuegosPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ranking, setRanking] = useState<JugadorRanking[]>([]) // ✅ Tipo específico
  const [cargandoRanking, setCargandoRanking] = useState(true)
  const { usuario, cerrarSesion, estaAutenticado, cargando } = useAuth()
  const router = useRouter()

  // Función para obtener el ranking desde la API
  const obtenerRanking = async () => {
    try {
      setCargandoRanking(true)
      const response = await fetch("http://localhost/plantas/app/Backend/ranking.php", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data: RespuestaRanking = await response.json()
      console.log('Respuesta del ranking:', data)
      
      if (data.exito && data.ranking) {
        setRanking(data.ranking)
      } else {
        console.error('Error al obtener ranking:', data.mensaje)
        setRanking([])
      }
    } catch (error) {
      console.error('Error de conexión:', error)
      setRanking([])
    } finally {
      setCargandoRanking(false)
    }
  }

  // Verificar autenticación y redirigir si es necesario
  useEffect(() => {
    if (!cargando && !estaAutenticado) {
      router.push("/login")
    }
  }, [estaAutenticado, cargando, router])

  // Cargar ranking cuando el usuario esté autenticado
  useEffect(() => {
    if (estaAutenticado) {
      obtenerRanking()
    }
  }, [estaAutenticado])

  // Show loading state while checking authentication
  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin text-6xl mb-4">🌱</div>
            <p className="text-lg font-semibold text-gray-700">Cargando...</p>
            <p className="text-sm text-gray-500 mt-2">Verificando tu sesión</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state while redirecting unauthenticated users
  if (!estaAutenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin text-6xl mb-4">🔒</div>
            <p className="text-lg font-semibold text-gray-700">Redirigiendo...</p>
            <p className="text-sm text-gray-500 mt-2">Acceso no autorizado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const minijuegos = [
    {
      id: 1,
      titulo: "Memorama de Plantas",
      descripcion:
        "¡Encuentra las parejas de plantas nativas de BCS! Ejercita tu memoria mientras aprendes sobre la flora local.",
      icono: Grid3X3,
      color: "from-green-400 to-emerald-500",
      imagen: "/M1.jpg?height=200&width=300",
      ruta: "/memorama",
    },
    {
      id: 2,
      titulo: "Trivia Botánica",
      descripcion:
        "¡Responde preguntas súper divertidas sobre las plantas de Baja California Sur y demuestra cuánto sabes!",
      icono: Brain,
      color: "from-blue-400 to-cyan-500",
      imagen: "/T1.webp?height=200&width=300",
      ruta: "/trivia",
    },
    {
      id: 3,
      titulo: "Sopa de Letras BCS",
      descripcion: "¡Encuentra los nombres de plantas escondidos en la grilla! Busca en todas las direcciones.",
      icono: Search,
      color: "from-orange-400 to-red-500",
      imagen: "/S1.png?height=200&width=300",
      ruta: "/sopa-letras",
    },
  ]

  const handleSignOut = async () => {
    cerrarSesion()
    router.push("/login")
  }

  const menuItems = [
    { nombre: "Inicio", icono: Home, activo: false, ruta: "/" },
    { nombre: "Mi Perfil", icono: User, activo: false, ruta: "/perfil" },
    { nombre: "Biblioteca de Plantas", icono: BookOpen, activo: false, ruta: "/biblioteca" },
    { nombre: "Minijuegos", icono: Gamepad2, activo: true, ruta: "/minijuegos" },
    { nombre: "Mi Progreso", icono: TrendingUp, activo: false, ruta: "/progreso" },
    {
      nombre: "Cerrar sesión",
      icono: LogOut,
      activo: false,
      ruta: "/",
      onClick: handleSignOut,
    },
  ]

  // Componente para la sección del ranking
  const RankingSection = () => (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg">
      <CardHeader className="text-center bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
        <CardTitle className="text-2xl font-bold flex items-center justify-center">
          <Crown className="mr-2 h-6 w-6" />🏆 Ranking de Guardianes de la Flora 🏆
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {cargandoRanking ? (
          <div className="text-center py-8">
            <div className="animate-spin text-4xl mb-4">🌱</div>
            <p className="text-lg font-semibold text-gray-700">Cargando ranking...</p>
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🌿</div>
            <p className="text-lg font-semibold text-gray-700">¡No hay jugadores aún!</p>
            <p className="text-sm text-gray-500">Juega para ser el primero en el ranking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ranking.map((jugador: JugadorRanking, index: number) => (
              <div
                key={jugador.id_usuario || index}
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  jugador.posicion === 1
                    ? "bg-gradient-to-r from-yellow-200 to-yellow-300 border-2 border-yellow-400 shadow-lg"
                    : jugador.posicion === 2
                      ? "bg-gradient-to-r from-gray-200 to-gray-300 border-2 border-gray-400 shadow-md"
                      : jugador.posicion === 3
                        ? "bg-gradient-to-r from-orange-200 to-orange-300 border-2 border-orange-400 shadow-md"
                        : "bg-white border-2 border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                      jugador.posicion === 1
                        ? "bg-yellow-500"
                        : jugador.posicion === 2
                          ? "bg-gray-500"
                          : jugador.posicion === 3
                            ? "bg-orange-500"
                            : "bg-blue-500"
                    }`}
                  >
                    {jugador.posicion <= 3 ? <Medal className="h-6 w-6" /> : jugador.posicion}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">
                      {jugador.avatar || '🌱'} {jugador.nombre}
                    </p>
                    <p className="text-sm text-gray-600">
                      Guardián Nivel {Math.min(jugador.posicion + 2, 10)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-gray-800">
                    {(jugador.puntos || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">puntos</p>
                </div>
              </div>
            ))}
            {ranking.length > 0 && (
              <div className="text-center pt-4">
                <button 
                  onClick={obtenerRanking}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
                >
                  🔄 Actualizar ranking
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                </Link>
                <div className="bg-white rounded-full p-3">
                  <Gamepad2 className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">🎮 Minijuegos de Plantas BCS</h1>
                  <p className="text-green-100 text-sm md:text-base">
                    ¡Hola {usuario?.nombreUsuario || usuario?.nombre}! Elige tu aventura botánica favorita
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/20"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className={`bg-white shadow-md ${sidebarOpen ? "block" : "hidden"} md:block`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:space-x-8 py-4">
              {menuItems.map((item, index) => (
                <div key={index}>
                  {item.onClick ? (
                    <Button
                      onClick={item.onClick}
                      variant={item.activo ? "default" : "ghost"}
                      className={`justify-start mb-2 md:mb-0 text-lg w-full ${
                        item.activo
                          ? "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                          : "text-gray-700 hover:text-green-600"
                      }`}
                    >
                      <item.icono className="mr-2 h-5 w-5" />
                      {item.nombre}
                    </Button>
                  ) : (
                    <Link href={item.ruta}>
                      <Button
                        variant={item.activo ? "default" : "ghost"}
                        className={`justify-start mb-2 md:mb-0 text-lg w-full ${
                          item.activo
                            ? "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                            : "text-gray-700 hover:text-green-600"
                        }`}
                      >
                        <item.icono className="mr-2 h-5 w-5" />
                        {item.nombre}
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <main className="flex-1">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">¡Elige tu Aventura Botánica!</h2>
                <p className="text-lg text-gray-600">
                  Selecciona un minijuego y comienza a explorar las maravillosas plantas de BCS
                </p>
              </div>

              {/* Game Cards */}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {minijuegos.map((juego) => (
                  <Card
                    key={juego.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-yellow-300"
                  >
                    <div className={`h-4 bg-gradient-to-r ${juego.color}`}></div>
                    <CardHeader className="text-center pb-4">
                      <div
                        className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${juego.color} flex items-center justify-center mb-4`}
                      >
                        <juego.icono className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-800">{juego.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="mb-4">
                        <img
                          src={juego.imagen || "/placeholder.svg"}
                          alt={juego.titulo}
                          className="w-full h-40 object-cover rounded-lg border-4 border-yellow-200"
                        />
                      </div>
                      <CardDescription className="text-gray-600 mb-6 text-base leading-relaxed">
                        {juego.descripcion}
                      </CardDescription>
                      <Link href={juego.ruta}>
                        <Button
                          className={`w-full text-lg font-bold py-3 bg-gradient-to-r ${juego.color} hover:scale-105 transition-transform duration-200 shadow-lg`}
                        >
                          <Gamepad2 className="mr-2 h-5 w-5" />
                          ¡Jugar!
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Ranking Section */}
              <RankingSection />
            </main>
          </div>

          {/* Motivational Message */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-white border-none shadow-2xl">
              <CardContent className="py-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-white rounded-full p-3 mr-4">
                    <Gamepad2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold">
                    ¡Sigue jugando y conviértete en el Guardián de la Flora BCS!
                  </h3>
                </div>
                <p className="text-lg md:text-xl text-green-100">
                  Cada juego te acerca más a conocer las increíbles plantas de nuestra región
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}