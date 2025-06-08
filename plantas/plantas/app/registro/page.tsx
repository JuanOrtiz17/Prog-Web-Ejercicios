"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Leaf, UserPlus, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    nombreUsuario: "",
    email: "",
    password: "",
    confirmPassword: "",
    fechaNacimiento: "",
    genero: "",
  })
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false)
  const [errores, setErrores] = useState<string[]>([])
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)

  const { registrarUsuario } = useAuth()
  const router = useRouter()

  const validarFormulario = () => {
    const nuevosErrores: string[] = []

    if (!formData.nombre.trim()) nuevosErrores.push("El nombre es requerido")
    if (!formData.apellido.trim()) nuevosErrores.push("El apellido es requerido")
    if (!formData.nombreUsuario.trim()) nuevosErrores.push("El nombre de usuario es requerido")
    if (formData.nombreUsuario.length < 3) nuevosErrores.push("El nombre de usuario debe tener al menos 3 caracteres")
    if (!formData.email.trim()) nuevosErrores.push("El email es requerido")
    if (!formData.email.includes("@")) nuevosErrores.push("El email debe ser válido")
    if (!formData.password) nuevosErrores.push("La contraseña es requerida")
    if (formData.password.length < 6) nuevosErrores.push("La contraseña debe tener al menos 6 caracteres")
    if (formData.password !== formData.confirmPassword) nuevosErrores.push("Las contraseñas no coinciden")
    if (!formData.fechaNacimiento) nuevosErrores.push("La fecha de nacimiento es requerida")
    if (!formData.genero) nuevosErrores.push("El género es requerido")

    setErrores(nuevosErrores)
    return nuevosErrores.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormulario()) return

    setCargando(true)
    setErrores([])

    try {
      const registroExitoso = await registrarUsuario(formData)

      if (registroExitoso) {
        setExito(true)
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        setErrores(["Este email o nombre de usuario ya está registrado. Intenta con otros datos."])
      }
    } catch (error) {
      setErrores(["Ocurrió un error al registrar el usuario. Intenta de nuevo."])
    } finally {
      setCargando(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar errores cuando el usuario empiece a escribir
    if (errores.length > 0) {
      setErrores([])
    }
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Registro Exitoso!</h2>
            <p className="text-gray-600 mb-4">Bienvenido {formData.nombre}. Tu cuenta ha sido creada exitosamente.</p>
            <p className="text-sm text-gray-500">Redirigiendo a la página principal...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <Link href="/login">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="bg-white rounded-full p-2">
              <Leaf className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold flex items-center justify-center">
            <UserPlus className="mr-2 h-6 w-6" />
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-green-100">¡Únete a la aventura botánica de BCS!</CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {errores.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {errores.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Tu nombre"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange("apellido", e.target.value)}
                  placeholder="Tu apellido"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nombreUsuario">Nombre de Usuario *</Label>
              <Input
                id="nombreUsuario"
                type="text"
                value={formData.nombreUsuario}
                onChange={(e) => handleInputChange("nombreUsuario", e.target.value)}
                placeholder="Elige un nombre único"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres, será visible para otros usuarios</p>
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="tu@email.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                >
                  {mostrarPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={mostrarConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Repite tu contraseña"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                >
                  {mostrarConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="genero">Género *</Label>
              <Select value={formData.genero} onValueChange={(value) => handleInputChange("genero", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona tu género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hombre">Hombre</SelectItem>
                  <SelectItem value="mujer">Mujer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3"
              disabled={cargando}
            >
              {cargando ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
