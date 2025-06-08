"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  User,
  Edit,
  Save,
  X,
  Camera,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Mail,
  UserCheck,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"

// Definir tipos para los datos del usuario
interface DatosUsuario {
  id?: string | number;
  nombre?: string;
  apellido?: string;
  nombreUsuario?: string;
  nombre_usuario?: string;
  email?: string;
  genero?: string;
  fecha_nacimiento?: string;
  fecha_registro?: string;
  imagenPerfil?: string;
}

interface DatosEdicion {
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  genero: string;
}

interface PasswordData {
  actual: string;
  nueva: string;
  confirmar: string;
}

interface MostrarPasswords {
  actual: boolean;
  nueva: boolean;
  confirmar: boolean;
  eliminar: boolean;
}

interface Mensaje {
  tipo: string;
  texto: string;
}

export default function PerfilPage() {
  const { usuario, actualizarPerfil, cambiarPassword, eliminarCuenta, cerrarSesion } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [editandoPassword, setEditandoPassword] = useState(false)
  const [mostrandoEliminar, setMostrandoEliminar] = useState(false)
  const [cargandoDatos, setCargandoDatos] = useState(true)
  const [datosUsuario, setDatosUsuario] = useState<DatosUsuario | null>(null)

  const [datosEdicion, setDatosEdicion] = useState<DatosEdicion>({
    nombre: "",
    apellido: "",
    nombreUsuario: "",
    genero: "",
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    actual: "",
    nueva: "",
    confirmar: "",
  })

  const [passwordEliminar, setPasswordEliminar] = useState("")
  const [mostrarPasswords, setMostrarPasswords] = useState<MostrarPasswords>({
    actual: false,
    nueva: false,
    confirmar: false,
    eliminar: false,
  })

  const [mensaje, setMensaje] = useState<Mensaje>({ tipo: "", texto: "" })
  const [cargando, setCargando] = useState(false)

  // Función para obtener datos del usuario desde la base de datos
  const obtenerDatosUsuario = async () => {
    if (!usuario?.id) return

    try {
      setCargandoDatos(true)

      const response = await fetch("http://localhost/plantas/app/Backend/obtener-usuarios.php", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: usuario.id
        })
      })

      const data = await response.json()

      if (data.exito && data.usuario) {
        setDatosUsuario(data.usuario)
        setDatosEdicion({
          nombre: data.usuario.nombre || "",
          apellido: data.usuario.apellido || "",
          nombreUsuario: data.usuario.nombreUsuario || data.usuario.nombre_usuario || "",
          genero: data.usuario.genero || "",
        })
      } else {
        mostrarMensaje("error", data.mensaje || "Error al cargar los datos del usuario")
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error)
      mostrarMensaje("error", "Error de conexión al obtener los datos del usuario")
    } finally {
      setCargandoDatos(false)
    }
  }

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (usuario?.id) {
      obtenerDatosUsuario()
    }
  }, [usuario?.id])

  const mostrarMensaje = (tipo: string, texto: string) => {
    setMensaje({ tipo, texto })
    // Scroll hacia arriba para mostrar el mensaje
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => setMensaje({ tipo: "", texto: "" }), 5000)
  }

  const handleImagenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imagenBase64 = e.target?.result as string
        // Aquí podrías hacer una llamada a tu API para actualizar la imagen
        // Por ahora solo mostramos el mensaje
        mostrarMensaje("success", "Imagen de perfil actualizada correctamente")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGuardarPerfil = async () => {
    setCargando(true)
    try {
      // Aquí harías la llamada a tu API para actualizar el perfil
      const response = await fetch("http://localhost/plantas/app/Backend/actualizar-perfil.php", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: usuario?.id,
          ...datosEdicion
        })
      })

      const text = await response.text()
      console.log("🧾 Respuesta cruda del backend:", text)

      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error("❌ JSON inválido:", e)
        mostrarMensaje("error", "El servidor devolvió una respuesta no válida")
        return
      }

      if (data.exito) {
        setEditandoPerfil(false)
        setDatosUsuario(prev => prev ? ({
          ...prev,
          ...datosEdicion
        }) : null)
        mostrarMensaje("success", "Perfil actualizado correctamente")
      } else {
        mostrarMensaje("error", data.mensaje || "Error al actualizar el perfil")
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      mostrarMensaje("error", "Error de conexión al actualizar el perfil")
    } finally {
      setCargando(false)
    }
  }

  const handleCambiarPassword = async () => {
    // Validaciones
    if (passwordData.nueva !== passwordData.confirmar) {
      mostrarMensaje("error", "Las contraseñas nuevas no coinciden")
      return
    }

    if (passwordData.nueva.length < 6) {
      mostrarMensaje("error", "La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    setCargando(true)
    try {
      const response = await fetch("http://localhost/plantas/app/Backend/cambiar-password.php", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: usuario?.id,
          password_actual: passwordData.actual,
          password_nueva: passwordData.nueva
        })
      })

      const text = await response.text()
      console.log("🧾 Respuesta cruda del backend (cambiar password):", text)

      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error("❌ JSON inválido:", e)
        mostrarMensaje("error", "El servidor devolvió una respuesta no válida")
        return
      }

      console.log("🔍 Datos parseados:", data)

      if (data.exito) {
        setEditandoPassword(false)
        setPasswordData({ actual: "", nueva: "", confirmar: "" })
        setMostrarPasswords(prev => ({
          ...prev,
          actual: false,
          nueva: false,
          confirmar: false
        }))
        mostrarMensaje("success", "Contraseña cambiada correctamente")
      } else {
        mostrarMensaje("error", data.mensaje || "Error al cambiar la contraseña")
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      mostrarMensaje("error", "Error de conexión al cambiar la contraseña")
    } finally {
      setCargando(false)
    }
  }

  const handleEliminarCuenta = async () => {
    setCargando(true)
    try {
      const response = await fetch("http://localhost/plantas/app/Backend/eliminar-cuenta.php", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: usuario?.id,
          password: passwordEliminar
        })
      })

      // Usar el mismo patrón de manejo de respuesta
      const text = await response.text()
      console.log("🧾 Respuesta cruda del backend (eliminar cuenta):", text)

      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error("❌ JSON inválido:", e)
        mostrarMensaje("error", "El servidor devolvió una respuesta no válida")
        return
      }

      if (data.exito) {
        mostrarMensaje("success", "Cuenta eliminada correctamente")
        setTimeout(() => {
          cerrarSesion()
          router.push("/login")
        }, 2000)
      } else {
        mostrarMensaje("error", data.mensaje || "Error al eliminar la cuenta")
      }
    } catch (error) {
      console.error('Error al eliminar cuenta:', error)
      mostrarMensaje("error", "Error de conexión al eliminar la cuenta")
    } finally {
      setCargando(false)
    }
  }

  const calcularEdad = (fechaNacimiento: string) => {
    if (!fechaNacimiento) return "No especificada"

    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  // Componente de Alerta mejorado
  const AlertaPersonalizada = ({ tipo, texto }: { tipo: string; texto: string }) => (
    <div className={`mb-6 p-4 rounded-lg border-l-4 shadow-sm ${
      tipo === "success" 
        ? "bg-green-50 border-green-400 text-green-800" 
        : "bg-red-50 border-red-400 text-red-800"
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {tipo === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {tipo === "success" ? "Éxito" : "Error"}
          </p>
          <p className="text-sm mt-1">{texto}</p>
        </div>
      </div>
    </div>
  )

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">👤 Mi Perfil</h1>
                <p className="text-blue-100">Gestiona tu información personal y configuración</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Mensaje de estado mejorado */}
          {mensaje.texto && (
            <AlertaPersonalizada tipo={mensaje.tipo} texto={mensaje.texto} />
          )}

          {/* Información del Perfil */}
          <Card className="shadow-lg max-w-4xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <User className="mr-2 h-6 w-6" />
                  Información Personal
                </div>
                {!editandoPerfil && !cargandoDatos && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setEditandoPerfil(true)}
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {cargandoDatos ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Cargando información del perfil...</p>
                </div>
              ) : (
                <>
                  {/* Imagen de Perfil */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                        {datosUsuario?.imagenPerfil ? (
                          <img
                            src={datosUsuario.imagenPerfil}
                            alt="Perfil"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-16 w-16 text-white" />
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full bg-white"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImagenChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {editandoPerfil ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nombre">Nombre</Label>
                          <Input
                            id="nombre"
                            value={datosEdicion.nombre}
                            onChange={(e) => setDatosEdicion({ ...datosEdicion, nombre: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="apellido">Apellido</Label>
                          <Input
                            id="apellido"
                            value={datosEdicion.apellido}
                            onChange={(e) => setDatosEdicion({ ...datosEdicion, apellido: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="nombreUsuario">Nombre de Usuario</Label>
                        <Input
                          id="nombreUsuario"
                          value={datosEdicion.nombreUsuario}
                          onChange={(e) => setDatosEdicion({ ...datosEdicion, nombreUsuario: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="genero">Género</Label>
                        <Select
                          value={datosEdicion.genero}
                          onValueChange={(value) => setDatosEdicion({ ...datosEdicion, genero: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu género" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="femenino">Femenino</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                            <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleGuardarPerfil} disabled={cargando} className="flex-1">
                          <Save className="mr-2 h-4 w-4" />
                          {cargando ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditandoPerfil(false)
                            setDatosEdicion({
                              nombre: datosUsuario?.nombre || "",
                              apellido: datosUsuario?.apellido || "",
                              nombreUsuario: datosUsuario?.nombreUsuario || datosUsuario?.nombre_usuario || "",
                              genero: datosUsuario?.genero || "",
                            })
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-gray-600">Nombre</p>
                          <p className="text-lg text-gray-800">{datosUsuario?.nombre || "No especificado"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-gray-600">Apellido</p>
                          <p className="text-lg text-gray-800">{datosUsuario?.apellido || "No especificado"}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-gray-600 flex items-center">
                          <UserCheck className="mr-1 h-4 w-4" />
                          Nombre de Usuario
                        </p>
                        <p className="text-lg text-gray-800">@{datosUsuario?.nombreUsuario || datosUsuario?.nombre_usuario || "No especificado"}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-gray-600 flex items-center">
                          <Mail className="mr-1 h-4 w-4" />
                          Email
                        </p>
                        <p className="text-lg text-gray-800">{datosUsuario?.email || "No especificado"}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-gray-600">Género</p>
                          <p className="text-lg text-gray-800 capitalize">{datosUsuario?.genero || "No especificado"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-gray-600 flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            Edad
                          </p>
                          <p className="text-lg text-gray-800">
                            {datosUsuario?.fecha_nacimiento ? `${calcularEdad(datosUsuario.fecha_nacimiento)} años` : "No especificada"}
                          </p>
                        </div>
                      </div>
                      {datosUsuario?.fecha_registro && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-gray-600 flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            Miembro desde
                          </p>
                          <p className="text-lg text-gray-800">
                            {new Date(datosUsuario.fecha_registro).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card className="mt-8 shadow-lg max-w-4xl mx-auto">
            <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-6 w-6" />
                Seguridad y Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Cambiar Contraseña */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Cambiar Contraseña</h3>
                  {editandoPassword ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="passwordActual">Contraseña Actual</Label>
                        <div className="relative">
                          <Input
                            id="passwordActual"
                            type={mostrarPasswords.actual ? "text" : "password"}
                            value={passwordData.actual}
                            onChange={(e) => setPasswordData({ ...passwordData, actual: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() =>
                              setMostrarPasswords({ ...mostrarPasswords, actual: !mostrarPasswords.actual })
                            }
                          >
                            {mostrarPasswords.actual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="passwordNueva">Nueva Contraseña</Label>
                        <div className="relative">
                          <Input
                            id="passwordNueva"
                            type={mostrarPasswords.nueva ? "text" : "password"}
                            value={passwordData.nueva}
                            onChange={(e) => setPasswordData({ ...passwordData, nueva: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setMostrarPasswords({ ...mostrarPasswords, nueva: !mostrarPasswords.nueva })}
                          >
                            {mostrarPasswords.nueva ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="passwordConfirmar">Confirmar Nueva Contraseña</Label>
                        <div className="relative">
                          <Input
                            id="passwordConfirmar"
                            type={mostrarPasswords.confirmar ? "text" : "password"}
                            value={passwordData.confirmar}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmar: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() =>
                              setMostrarPasswords({ ...mostrarPasswords, confirmar: !mostrarPasswords.confirmar })
                            }
                          >
                            {mostrarPasswords.confirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCambiarPassword} disabled={cargando} className="flex-1">
                          <Save className="mr-2 h-4 w-4" />
                          {cargando ? "Cambiando..." : "Cambiar"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditandoPassword(false)
                            setPasswordData({ actual: "", nueva: "", confirmar: "" })
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => setEditandoPassword(true)} className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Cambiar Contraseña
                    </Button>
                  )}
                </div>

                {/* Eliminar Cuenta */}
                <div>
                  <h3 className="text-lg font-bold text-red-600 mb-4">Zona Peligrosa</h3>
                  {mostrandoEliminar ? (
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">¡Atención!</h3>
                            <p className="text-sm text-red-700 mt-1">
                              Esta acción no se puede deshacer. Se eliminarán todos tus datos permanentemente.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="passwordEliminar">Confirma tu contraseña para eliminar la cuenta</Label>
                        <div className="relative">
                          <Input
                            id="passwordEliminar"
                            type={mostrarPasswords.eliminar ? "text" : "password"}
                            value={passwordEliminar}
                            onChange={(e) => setPasswordEliminar(e.target.value)}
                            placeholder="Tu contraseña actual"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() =>
                              setMostrarPasswords({ ...mostrarPasswords, eliminar: !mostrarPasswords.eliminar })
                            }
                          >
                            {mostrarPasswords.eliminar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={handleEliminarCuenta}
                          disabled={cargando || !passwordEliminar}
                          className="flex-1"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {cargando ? "Eliminando..." : "Eliminar Cuenta"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setMostrandoEliminar(false)
                            setPasswordEliminar("")
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="destructive" onClick={() => setMostrandoEliminar(true)} className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar Cuenta
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}