"use client"
import Cookies from "js-cookie";
import { useRouter } from "next/navigation"
import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface EstadisticasJuego {
  memorama: {
    partidasJugadas: number
    partidasGanadas: number
    mejorTiempo: number
    totalMovimientos: number
  }
  trivia: {
    partidasJugadas: number
    respuestasCorrectas: number
    respuestasIncorrectas: number
    mejorPuntuacion: number
  }
  sopaLetras: {
    partidasJugadas: number
    partidasGanadas: number
    mejorTiempo: number
    palabrasEncontradas: number
  }
}

interface Usuario {
  id: string
  nombre: string
  apellido: string
  nombreUsuario: string
  email: string
  fechaNacimiento: string
  genero: string
  fechaRegistro: string
  experiencia: number
  nivel: number
  puntosTotal: number
  plantasDescubiertas: number[]
  juegosFavorito: string
  tiempoJugado: number
  racha: number
  ultimaVisita: string
  imagenPerfil?: string
  estadisticasJuegos: EstadisticasJuego
  historialJuegos: Array<{
    fecha: string
    juego: string
    puntos: number
    tiempo: string
    resultado: string
    nivel?: string
  }>
  logrosDesbloqueados: number[]
  configuracion: {
    sonidosActivados: boolean
    notificacionesActivadas: boolean
    temaOscuro: boolean
  }
}

interface AuthContextType {
  usuario: Usuario | null
  estaAutenticado: boolean
  iniciarSesion: (email: string, password: string) => Promise<boolean>
  registrarUsuario: (datosUsuario: any) => Promise<boolean>
  cerrarSesion: () => void
  actualizarUsuario: (datosActualizados: Partial<Usuario>) => void
  actualizarPerfil: (datosActualizados: Partial<Usuario>) => Promise<boolean>
  cambiarPassword: (passwordActual: string, passwordNueva: string) => Promise<boolean>
  eliminarCuenta: (password: string) => Promise<boolean>
  guardarProgresoJuego: (tipoJuego: string, datosJuego: any) => void
  actualizarEstadisticasJuego: (tipoJuego: keyof EstadisticasJuego, estadisticas: any) => void
  desbloquearLogro: (logroId: number) => void
  cargando: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const router = useRouter()

 useEffect(() => {
  const usuarioGuardado = Cookies.get("usuario_plantas_bcs")
  if (usuarioGuardado) {
    setUsuario(JSON.parse(usuarioGuardado))
  }
  setCargando(false)
}, [])


  const iniciarSesion = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("http://uabcsdasc1748551968551.2390069.misitiohostgator.com/plantas/app/Backend/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.exito && data.usuario) {
        const usuarioAutenticado: Usuario = {
          id: data.usuario.id,
          nombre: data.usuario.nombre,
          apellido: data.usuario.apellido,
          nombreUsuario: data.usuario.user,
          email: data.usuario.correo,
          fechaNacimiento: data.usuario.fecha_nacimiento || "",
          genero: data.usuario.genero || "",
          fechaRegistro: new Date().toISOString(),
          experiencia: 0,
          nivel: 1,
          puntosTotal: 0,
          plantasDescubiertas: [],
          juegosFavorito: "",
          tiempoJugado: 0,
          racha: 0,
          ultimaVisita: new Date().toISOString(),
          estadisticasJuegos: {
            memorama: { partidasJugadas: 0, partidasGanadas: 0, mejorTiempo: 0, totalMovimientos: 0 },
            trivia: { partidasJugadas: 0, respuestasCorrectas: 0, respuestasIncorrectas: 0, mejorPuntuacion: 0 },
            sopaLetras: { partidasJugadas: 0, partidasGanadas: 0, mejorTiempo: 0, palabrasEncontradas: 0 },
          },
          historialJuegos: [],
          logrosDesbloqueados: [],
          configuracion: {
            sonidosActivados: true,
            notificacionesActivadas: true,
            temaOscuro: false,
          },
        };

        setUsuario(usuarioAutenticado);
        Cookies.set("usuario_plantas_bcs", JSON.stringify(usuarioAutenticado), { expires: 7 }) // 7 días
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error en iniciarSesion:", error);
      return false;
    }
  };

  const registrarUsuario = async (datos: any): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost/plantas/app/Backend/registro.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: datos.nombre,
          apellido: datos.apellido,
          user: datos.nombreUsuario,
          correo: datos.email,
          fecha_nacimiento: datos.fechaNacimiento,
          genero: datos.genero,
          password: datos.password
        })
      });

      const data = await res.json();

      if (data.exito) {
        const loginOk = await iniciarSesion(datos.email, datos.password);
        if (loginOk) {
          router.push("/");
          return true;
        }
      }

      return false;
    } catch (err) {
      console.error("Error en registrarUsuario:", err);
      return false;
    }
  };

  const cerrarSesion = () => {
    setUsuario(null)
  }

  const actualizarUsuario = (datosActualizados: Partial<Usuario>) => {
    if (usuario) {
      const usuarioActualizado = { ...usuario, ...datosActualizados }
      setUsuario(usuarioActualizado)
    }
  }

  const actualizarPerfil = async (datosActualizados: Partial<Usuario>): Promise<boolean> => {
    try {
      if (!usuario) return false
      actualizarUsuario(datosActualizados)
      return true
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      return false
    }
  }

  const cambiarPassword = async (): Promise<boolean> => {
    return false
  }

  const eliminarCuenta = async (): Promise<boolean> => {
    return false
  }

  const guardarProgresoJuego = (tipoJuego: string, datosJuego: any) => {
    if (!usuario) return

    const nuevoHistorial = {
      fecha: new Date().toISOString().split("T")[0],
      juego: tipoJuego,
      puntos: datosJuego.puntos || 0,
      tiempo: datosJuego.tiempo || "0:00",
      resultado: datosJuego.resultado || "",
      nivel: datosJuego.nivel || "",
    }

    const historialActualizado = [nuevoHistorial, ...usuario.historialJuegos].slice(0, 20)
    const plantasActualizadas = [...usuario.plantasDescubiertas]
    if (datosJuego.plantasDescubiertas) {
      datosJuego.plantasDescubiertas.forEach((plantaId: number) => {
        if (!plantasActualizadas.includes(plantaId)) {
          plantasActualizadas.push(plantaId)
        }
      })
    }

    const nuevaExperiencia = usuario.experiencia + (datosJuego.experiencia || 0)
    const nuevoNivel = Math.floor(nuevaExperiencia / 500) + 1

    actualizarUsuario({
      historialJuegos: historialActualizado,
      plantasDescubiertas: plantasActualizadas,
      experiencia: nuevaExperiencia,
      nivel: nuevoNivel,
      tiempoJugado: usuario.tiempoJugado + (datosJuego.tiempoJugadoMinutos || 0),
    })
  }

  const actualizarEstadisticasJuego = (tipoJuego: keyof EstadisticasJuego, estadisticas: any) => {
    if (!usuario) return

    const estadisticasActuales = { ...usuario.estadisticasJuegos }

    if (!estadisticasActuales[tipoJuego]) {
      console.warn(`Tipo de juego no válido: ${tipoJuego}`)
      return
    }

    estadisticasActuales[tipoJuego] = {
      ...estadisticasActuales[tipoJuego],
      ...estadisticas,
    }

    actualizarUsuario({ estadisticasJuegos: estadisticasActuales })
  }

  const desbloquearLogro = (logroId: number) => {
    if (!usuario || usuario.logrosDesbloqueados.includes(logroId)) return
    const logrosActualizados = [...usuario.logrosDesbloqueados, logroId]
    actualizarUsuario({ logrosDesbloqueados: logrosActualizados })
  }

  const value: AuthContextType = {
    usuario,
    estaAutenticado: !!usuario,
    iniciarSesion,
    registrarUsuario,
    cerrarSesion,
    actualizarUsuario,
    actualizarPerfil,
    cambiarPassword,
    eliminarCuenta,
    guardarProgresoJuego,
    actualizarEstadisticasJuego,
    desbloquearLogro,
    cargando,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
