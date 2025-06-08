<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

$conexion = new mysqli("localhost", "root", "", "plantas");
$conexion->set_charset("utf8");

if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(["exito" => false, "mensaje" => "Error de conexión"]);
    exit;
}

try {
    // Obtener los IDs existentes en ranking
    $ranking = $conexion->query("SELECT id_usuario, puntaje FROM ranking");
    $usuarios = [];

    while ($fila = $ranking->fetch_assoc()) {
        $id = $fila["id_usuario"];
        $puntos = $fila["puntaje"];

        // Buscar el nombre del usuario
        $stmt = $conexion->prepare("SELECT user FROM usuario WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0) {
            $nombre = $resultado->fetch_assoc()["user"];
        } else {
            // Insertar el usuario faltante en ranking con 0 puntos
            $conexion->query("INSERT INTO ranking (id_usuario, puntaje) VALUES ($id, 0)");
            $nombre = "Desconocido";
            $puntos = 0;
        }

        $usuarios[] = [
            "nombre" => $nombre,
            "puntos" => (int) $puntos,
            "avatar" => "🌱" // o elige dinámicamente si quieres
        ];

        $stmt->close();
    }

    // Ordenar por puntos descendente
    usort($usuarios, fn($a, $b) => $b["puntos"] - $a["puntos"]);

    // Añadir posición
    foreach ($usuarios as $i => &$u) {
        $u["posicion"] = $i + 1;
    }

    echo json_encode(["exito" => true, "ranking" => $usuarios]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => $e->getMessage()]);
} finally {
    $conexion->close();
}
?>
