<?php
// Configuración de CORS más completa
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["exito" => false, "mensaje" => "Método no permitido"]);
    exit;
}

try {
    // Conexión a la base de datos
    $conexion = new mysqli("localhost", "root", "", "plantas");
    
    if ($conexion->connect_error) {
        throw new Exception("Error de conexión a la base de datos: " . $conexion->connect_error);
    }
    
    $conexion->set_charset("utf8");
    
    // DESHABILITAR VERIFICACIONES DE LLAVES FORÁNEAS
    $conexion->query("SET FOREIGN_KEY_CHECKS = 0");

    // Leer y procesar el JSON
    $raw = trim(file_get_contents("php://input"));
    
    if (empty($raw)) {
        throw new Exception("No se recibieron datos");
    }

    $data = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON no válido: " . json_last_error_msg());
    }

    // Validar que se recibió el ID del usuario
    if (!isset($data["id_usuario"]) || empty($data["id_usuario"])) {
        throw new Exception("Falta el ID del usuario");
    }

    $id_usuario = intval($data["id_usuario"]);
    
    if ($id_usuario <= 0) {
        throw new Exception("ID de usuario no válido");
    }

    // Primero verificar si el usuario existe en la tabla usuarios
    $verificarUsuario = "SELECT id FROM usuario WHERE id = ?";
    $stmtVerificar = $conexion->prepare($verificarUsuario);
    
    if (!$stmtVerificar) {
        throw new Exception("Error preparando verificación de usuario: " . $conexion->error);
    }
    
    $stmtVerificar->bind_param("i", $id_usuario);
    $stmtVerificar->execute();
    $resultadoUsuario = $stmtVerificar->get_result();
    
    if ($resultadoUsuario->num_rows === 0) {
        $stmtVerificar->close();
        throw new Exception("El usuario con ID $id_usuario no existe en la base de datos");
    }
    $stmtVerificar->close();

    // Consultar progreso existente
    $query = "SELECT * FROM progreso WHERE id_usuario = ?";
    $stmt = $conexion->prepare($query);
    
    if (!$stmt) {
        throw new Exception("Error preparando consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($fila = $resultado->fetch_assoc()) {
        // Progreso encontrado - limpiar datos
        $progreso_limpio = [
            "id_usuario" => (int)$fila["id_usuario"],
            "nivel" => (int)($fila["nivel"] ?? 0),
            "plantas_descubiertas" => (int)($fila["plantas_descubiertas"] ?? 0),
            "racha_dias_jugados" => (int)($fila["racha_dias_jugados"] ?? 0),
            "tiempo_jugado" => (int)($fila["tiempo_jugado"] ?? 0),
            "juego_favorito" => $fila["juego_favorito"] ?? "Ninguno",
            "logro" => (int)($fila["logro"] ?? 0),
            "xp" => (int)($fila["xp"] ?? 0),
            "puntos" => (int)($fila["puntos"] ?? 0)
        ];
        
        echo json_encode([
            "exito" => true, 
            "progreso" => $progreso_limpio,
            "mensaje" => "Progreso encontrado"
        ]);
    } else {
        // NO existe progreso para este usuario - crear nuevo
        $insertQuery = "INSERT INTO progreso (
            id_usuario, nivel, plantas_descubiertas, racha_dias_jugados,
            tiempo_jugado, juego_favorito, logro, xp, puntos
        ) VALUES (?, 0, 0, 0, 0, 'Ninguno', 0, 0, 0)";
        
        $insertStmt = $conexion->prepare($insertQuery);
        
        if (!$insertStmt) {
            throw new Exception("Error preparando inserción: " . $conexion->error);
        }

        $insertStmt->bind_param("i", $id_usuario);

        if ($insertStmt->execute()) {
            if ($insertStmt->affected_rows > 0) {
                $nuevoProgreso = [
                    "id_usuario" => $id_usuario,
                    "nivel" => 0,
                    "plantas_descubiertas" => 0,
                    "racha_dias_jugados" => 0,
                    "tiempo_jugado" => 0,
                    "juego_favorito" => "Ninguno",
                    "logro" => 0,
                    "xp" => 0,
                    "puntos" => 0
                ];
                
                // Log para debugging
                error_log("NUEVO PROGRESO CREADO - Usuario ID: $id_usuario - " . date('Y-m-d H:i:s'));
                
                echo json_encode([
                    "exito" => true, 
                    "progreso" => $nuevoProgreso,
                    "mensaje" => "Nuevo progreso creado exitosamente para el usuario"
                ]);
            } else {
                throw new Exception("No se pudo insertar el progreso. Affected rows: " . $insertStmt->affected_rows);
            }
        } else {
            throw new Exception("Error ejecutando inserción: " . $insertStmt->error);
        }

        $insertStmt->close();
    }

    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "exito" => false, 
        "mensaje" => $e->getMessage(),
        "timestamp" => date('Y-m-d H:i:s')
    ]);
} finally {
    if (isset($conexion)) {
        // REACTIVAR VERIFICACIONES DE LLAVES FORÁNEAS antes de cerrar
        $conexion->query("SET FOREIGN_KEY_CHECKS = 1");
        $conexion->close();
    }
}
?>