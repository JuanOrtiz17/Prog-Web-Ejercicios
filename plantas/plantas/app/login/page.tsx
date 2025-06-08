"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Leaf, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)

  const { iniciarSesion, estaAutenticado } = useAuth()
  const router = useRouter()

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (estaAutenticado) {
      router.push("/")
    }
  }, [estaAutenticado, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setCargando(true)

    if (!email || !password) {
      setError("Por favor completa todos los campos")
      setCargando(false)
      return
    }

    try {
      const loginExitoso = await iniciarSesion(email, password)

      if (loginExitoso) {
        router.push("/")
      } else {
        setError("Email o contraseña incorrectos")
      }
    } catch (error) {
      setError("Ocurrió un error al iniciar sesión. Intenta de nuevo.")
    } finally {
      setCargando(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
          <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-4">
            <Leaf className="h-10 w-10 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">¡Bienvenido de vuelta!</CardTitle>
          <CardDescription className="text-green-100">
            Inicia sesión para continuar tu aventura botánica
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="mt-1"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3"
              disabled={cargando}
            >
              {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">o</span>
              </div>
            </div>

           
          </div>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link href="/registro" className="text-green-600 hover:text-green-700 font-semibold">
                Regístrate aquí
              </Link>
            </p>

            <div className="bg-white-50  border-white-200 rounded-lg p-5 mt-4">

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
