"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Home,
  BookOpen,
  Gamepad2,
  TrendingUp,
  LogOut,
  Star,
  Zap,
  Leaf,
  Brain,
  Grid3X3,
  Menu,
  X,
  Crown,
  User,
  Play,
  Target,
  Calendar,
  Sparkles,
  ChevronRight,
  MapPin,
  Search,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { usuario, cerrarSesion, estaAutenticado, cargando } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!cargando && !estaAutenticado) {
      router.push("/login")
    }
  }, [estaAutenticado, cargando, router])

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

  const handleSignOut = async () => {
    cerrarSesion()
    router.push("/login")
  }

  const menuItems = [
    { nombre: "Inicio", icono: Home, activo: true, ruta: "/" },
    { nombre: "Mi Perfil", icono: User, activo: false, ruta: "/perfil" },
    { nombre: "Biblioteca de Plantas", icono: BookOpen, activo: false, ruta: "/biblioteca" },
    { nombre: "Minijuegos", icono: Gamepad2, activo: false, ruta: "/minijuegos" },
    { nombre: "Mi Progreso", icono: TrendingUp, activo: false, ruta: "/progreso" },
    {
      nombre: "Cerrar sesión",
      icono: LogOut,
      activo: false,
      ruta: "/",
      onClick: handleSignOut,
    },
  ]

  const accionesRapidas = [
    {
      titulo: "Jugar Minijuegos",
      descripcion: "Memorama, Trivia y Sopa de Letras",
      icono: Gamepad2,
      color: "from-green-400 to-emerald-500",
      ruta: "/minijuegos",
      emoji: "🎮",
    },
    {
      titulo: "Explorar Biblioteca",
      descripcion: "40 plantas de BCS",
      icono: BookOpen,
      color: "from-blue-400 to-cyan-500",
      ruta: "/biblioteca",
      emoji: "📚",
    },
    {
      titulo: "Ver Mi Progreso",
      descripcion: "Estadísticas y logros",
      icono: TrendingUp,
      color: "from-purple-400 to-pink-500",
      ruta: "/progreso",
      emoji: "📊",
    },
  ]

  const plantasDestacadas = [
    { nombre: "Cardón Barbón", emoji: "🌵", descripcion: "El gigante del desierto" },
    { nombre: "Pitaya Dulce", emoji: "🍓", descripcion: "Fruto delicioso del desierto" },
    { nombre: "Palo de Arco", emoji: "🌼", descripcion: "Flores amarillas brillantes" },
    { nombre: "Biznaga", emoji: "🌵", descripcion: "Cactus globoso resistente" },
  ]

  const obtenerSaludo = () => {
    const hora = new Date().getHours()
    if (hora < 12) return "¡Buenos días"
    if (hora < 18) return "¡Buenas tardes"
    return "¡Buenas noches"
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-full p-3">
                <Leaf className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Aprendo las Plantas de mi BCS</h1>
                <p className="text-green-100 text-sm md:text-base">
                  {obtenerSaludo()}, {usuario?.nombreUsuario || usuario?.nombre}! 🌿
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
            {/* Welcome Section */}
            <Card className="mb-8 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-white border-none shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">¡Bienvenido a tu aventura botánica! 🌺</h2>
                    <p className="text-lg md:text-xl text-green-100 mb-4">
                      Descubre las maravillosas plantas nativas de Baja California Sur
                    </p>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-white text-green-600 text-lg px-4 py-2">
                        <MapPin className="mr-1 h-4 w-4" />
                        Baja California Sur
                      </Badge>
                      <Badge className="bg-white text-blue-600 text-lg px-4 py-2">
                        <Sparkles className="mr-1 h-4 w-4" />
                        40 Especies 
                      </Badge>
                    </div>
                  </div>
                  <div className="hidden md:block text-8xl">🌵</div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Star className="mr-2 h-6 w-6 text-yellow-500" />
                ¿Qué quieres hacer hoy?
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {accionesRapidas.map((accion, index) => (
                  <Link key={index} href={accion.ruta}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-yellow-300 cursor-pointer">
                      <div className={`h-4 bg-gradient-to-r ${accion.color}`}></div>
                      <CardContent className="p-6 text-center">
                        <div className="text-6xl mb-4">{accion.emoji}</div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">{accion.titulo}</h4>
                        <p className="text-gray-600 mb-4">{accion.descripcion}</p>
                        <Button className={`w-full bg-gradient-to-r ${accion.color} text-white font-bold`}>
                          <Play className="mr-2 h-4 w-4" />
                          Comenzar
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured Plants */}
            <Card className="mb-8 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Leaf className="mr-2 h-6 w-6" />🌿 Plantas Destacadas de BCS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {plantasDestacadas.map((planta, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg border-2 border-green-200 text-center">
                      <div className="text-4xl mb-2">{planta.emoji}</div>
                      <h5 className="font-bold text-green-800 mb-1">{planta.nombre}</h5>
                      <p className="text-sm text-green-600">{planta.descripcion}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Link href="/biblioteca">
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Explorar Todas las Plantas
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Daily Challenge */}
         
          </main>

          
        </div>

        {/* Footer Message */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-white border-none shadow-2xl">
            <CardContent className="py-6">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-6 w-6 mr-2" />
                <h3 className="text-xl md:text-2xl font-bold">¡Cada día es una nueva oportunidad para aprender!</h3>
                <Sparkles className="h-6 w-6 ml-2" />
              </div>
              <p className="text-green-100">
                Explora, juega y conviértete en un experto de la flora sudcaliforniana 🌿
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
