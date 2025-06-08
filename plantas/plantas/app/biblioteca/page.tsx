"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Leaf, BookOpen } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"

interface Planta {
  id: number
  nombre: string
  nombre_cientifico: string
  familia: string
  descripcion: string
  imagen: string
  uso: string
}

export default function BibliotecaPage() {
  const [busqueda, setBusqueda] = useState("")
  const [plantaSeleccionada, setPlantaSeleccionada] = useState<Planta | null>(null)
  const [plantas, setPlantas] = useState<Planta[]>([])

  useEffect(() => {
    fetch("http://localhost/plantas/app/Backend/get_plantasB.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.exito) {
          setPlantas(data.plantas)
        }
      })
      .catch((err) => console.error("Error al obtener plantas:", err))
  }, [])

  const plantasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase()
    return plantas.filter((planta) => {
      return (
        (planta.nombre?.toLowerCase().includes(texto) ?? false) ||
        (planta.nombre_cientifico?.toLowerCase().includes(texto) ?? false) ||
        (planta.familia?.toLowerCase().includes(texto) ?? false) ||
        (planta.uso?.toLowerCase().includes(texto) ?? false)
      )
    })
  }, [busqueda, plantas])

  const totalFamilias = useMemo(() => {
    return new Set(plantas.map((p) => p.familia)).size
  }, [plantas])

  if (plantaSeleccionada) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50">
          <header className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white shadow-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setPlantaSeleccionada(null)}>
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="bg-white rounded-full p-3">
                  <Leaf className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{plantaSeleccionada.nombre}</h1>
                  <p className="text-green-100 text-sm md:text-base italic">{plantaSeleccionada.nombre_cientifico}</p>
                </div>
              </div>
            </div>
          </header>
          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                    <img
                      src={`data:image/jpeg;base64,${plantaSeleccionada.imagen}` || "/placeholder.svg"}
                      alt={plantaSeleccionada.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Familia</p>
                    <Badge variant="outline" className="text-sm">{plantaSeleccionada.familia}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Descripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{plantaSeleccionada.descripcion}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Usos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{plantaSeleccionada.uso}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-green-50 to-yellow-50">
        <header className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </Link>
              <div className="bg-white rounded-full p-3">
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Biblioteca de Plantas de BCS</h1>
                <p className="text-green-100 text-sm md:text-base">
                  Descubre la increíble flora nativa de Baja California Sur
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre común, científico, familia o uso..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">40</div>
                <div className="text-sm text-gray-600">Plantas Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{plantasFiltradas.length}</div>
                <div className="text-sm text-gray-600">Resultados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{totalFamilias}</div>
                <div className="text-sm text-gray-600">Familias</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plantasFiltradas.map((planta) => (
              <Card
                key={planta.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-green-300"
                onClick={() => setPlantaSeleccionada(planta)}
              >
                <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                  <img
                    src={`data:image/jpeg;base64,${planta.imagen}` || "/placeholder.svg"}
                    alt={planta.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-gray-800 line-clamp-1">{planta.nombre}</CardTitle>
                  <CardDescription className="text-sm italic text-gray-600 line-clamp-1">
                    {planta.nombre_cientifico}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="outline" className="text-xs mb-2">{planta.familia}</Badge>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{planta.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {plantasFiltradas.length === 0 && (
            <Card className="mt-8">
              <CardContent className="p-12 text-center">
                <Leaf className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron plantas</h3>
                <p className="text-gray-500">Intenta escribir otra palabra clave relacionada.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
