"use client"

import type React from "react"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Lock } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { estaAutenticado, cargando } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!cargando && !estaAutenticado) {
      router.push("/login")
    }
  }, [estaAutenticado, cargando, router])

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-500 mb-4" />
            <p className="text-lg font-semibold text-gray-700">Cargando...</p>
            <p className="text-sm text-gray-500 mt-2">Verificando tu sesión</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!estaAutenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Lock className="h-8 w-8 text-red-500 mb-4" />
            <p className="text-lg font-semibold text-gray-700">Acceso Restringido</p>
            <p className="text-sm text-gray-500 mt-2">Redirigiendo al login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
