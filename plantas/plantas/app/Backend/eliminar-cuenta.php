<?php
// Configuración de CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["exito" => false, "mensaje" => "Método no permitido"]);
    exit;
}

try {
    $conexion = new mysqli("localhost", "root", "", "plantas");

    if ($conexion->connect_error) {
        throw new Exception("Error de conexión: " . $conexion->connect_error);
    }

    $conexion->set_charset("utf8");

    // Leer JSON
    $raw = trim(file_get_contents("php://input"));
    if (empty($raw)) throw new Exception("No se recibieron datos");

    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON no válido: " . json_last_error_msg());
    }

    if (!isset($data["id_usuario"], $data["puntos"], $data["xp"])) {
        throw new Exception("Faltan datos obligatorios");
    }

    $id_usuario = (int)$data["id_usuario"];
    $puntos = (int)$data["puntos"];
    $xp = (int)$data["xp"];

    // Insertar si no existe
    $stmt_insert = $conexion->prepare("INSERT IGNORE INTO progreso (id_usuario, puntos, xp) VALUES (?, 0, 0)");
    $stmt_insert->bind_param("i", $id_usuario);
    $stmt_insert->execute();
    $stmt_insert->close();

    // Sumar puntos y XP
    $stmt_update = $conexion->prepare("UPDATE progreso SET puntos = puntos + ?, xp = xp + ? WHERE id_usuario = ?");
    $stmt_update->bind_param("iii", $puntos, $xp, $id_usuario);
    if (!$stmt_update->execute()) {
        throw new Exception("Error al asignar recompensa: " . $stmt_update->error);
    }

    echo json_encode(["exito" => true, "mensaje" => "Recompensa asignada correctamente"]);
    $stmt_update->close();

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["exito" => false, "mensaje" => $e->getMessage()]);
} finally {
    if (isset($conexion)) $conexion->close();
}
