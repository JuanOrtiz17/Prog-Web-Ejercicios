export async function darRecompensa(id_usuario: number, puntos = 12, xp = 12) {
  try {
    const res = await fetch("http://localhost/plantas/app/Backend/asignar_puntos.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario, puntos, xp }),
    });

    const data = await res.json();
    if (!data.exito) {
      console.error("❌", data.mensaje);
    } else {
      console.log("✅", data.mensaje);
    }
  } catch (err) {
    console.error("❌ Error al conectar con el backend", err);
  }
}
