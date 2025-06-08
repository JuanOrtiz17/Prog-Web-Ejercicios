<?php
// Limpiar cualquier salida previa y configurar headers
ob_clean();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=utf-8");

// Función para logging (opcional - puedes comentarla en producción)
function logDebug($message, $data = null) {
    $log = date('Y-m-d H:i:s') . " - " . $message;
    if ($data !== null) {
        $log .= " - " . json_encode($data);
    }
    error_log($log);
}

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
    
    // Leer y procesar el JSON
    $raw = trim(file_get_contents("php://input"));
    logDebug("Datos recibidos RAW", $raw);
    
    if (empty($raw)) {
        throw new Exception("No se recibieron datos");
    }
    
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON no válido: " . json_last_error_msg());
    }
    
    logDebug("Datos parseados", $data);
    
    // Validar datos requeridos
    if (!isset($data["id_usuario"]) || empty($data["id_usuario"])) {
        throw new Exception("ID de usuario requerido");
    }
    
    $id_usuario = intval($data["id_usuario"]);
    $nombre = isset($data["nombre"]) ? trim($data["nombre"]) : null;
    $apellido = isset($data["apellido"]) ? trim($data["apellido"]) : null;
    $nombreUsuario = isset($data["user"]) ? trim($data["user"]) : null;
    $genero = isset($data["genero"]) ? trim($data["genero"]) : null;
    
    logDebug("Datos procesados", [
        'id_usuario' => $id_usuario,
        'nombre' => $nombre,
        'apellido' => $apellido,
        'nombreUsuario' => $nombreUsuario,
        'genero' => $genero
    ]);
    
    // Validaciones básicas
    if (!empty($nombre) && strlen($nombre) < 2) {
        throw new Exception("El nombre debe tener al menos 2 caracteres");
    }
    
    if (!empty($apellido) && strlen($apellido) < 2) {
        throw new Exception("El apellido debe tener al menos 2 caracteres");
    }
    
    if (!empty($nombreUsuario)) {
        if (strlen($nombreUsuario) < 3) {
            throw new Exception("El nombre de usuario debe tener al menos 3 caracteres");
        }
        
        // Verificar que el nombre de usuario no esté en uso por otro usuario
        $stmt_check = $conexion->prepare("SELECT id FROM usuario WHERE user = ? AND id != ?");
        if (!$stmt_check) {
            throw new Exception("Error al preparar consulta de verificación: " . $conexion->error);
        }
        
        $stmt_check->bind_param("si", $nombreUsuario, $id_usuario);
        $stmt_check->execute();
        $result_check = $stmt_check->get_result();
        
        if ($result_check->num_rows > 0) {
            $stmt_check->close();
            throw new Exception("El nombre de usuario ya está en uso");
        }
        $stmt_check->close();
    }
    
    // Verificar que el usuario existe
    $stmt_verify = $conexion->prepare("SELECT id FROM usuario WHERE id = ?");
    if (!$stmt_verify) {
        throw new Exception("Error al preparar consulta de verificación de usuario: " . $conexion->error);
    }
    
    $stmt_verify->bind_param("i", $id_usuario);
    $stmt_verify->execute();
    $result_verify = $stmt_verify->get_result();
    
    if ($result_verify->num_rows === 0) {
        $stmt_verify->close();
        throw new Exception("Usuario no encontrado");
    }
    $stmt_verify->close();
    
    // Preparar la consulta de actualización
    $campos_actualizar = [];
    $tipos = "";
    $valores = [];
    
    if (!empty($nombre)) {
        $campos_actualizar[] = "nombre = ?";
        $tipos .= "s";
        $valores[] = $nombre;
    }
    
    if (!empty($apellido)) {
        $campos_actualizar[] = "apellido = ?";
        $tipos .= "s";
        $valores[] = $apellido;
    }
    
    if (!empty($nombreUsuario)) {
        $campos_actualizar[] = "user = ?";
        $tipos .= "s";
        $valores[] = $nombreUsuario;
    }
    
    if (!empty($genero)) {
        $campos_actualizar[] = "genero = ?";
        $tipos .= "s";
        $valores[] = $genero;
    }
    
    if (empty($campos_actualizar)) {
        throw new Exception("No se proporcionaron campos para actualizar");
    }
    
    $tipos .= "i";
    $valores[] = $id_usuario;
    
    $sql = "UPDATE usuario SET " . implode(", ", $campos_actualizar) . " WHERE id = ?";
    logDebug("SQL generado", $sql);
    logDebug("Valores para binding", $valores);
    
    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }
    
    $stmt->bind_param($tipos, ...$valores);
    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el perfil: " . $stmt->error);
    }
    
    if ($stmt->affected_rows === 0) {
        logDebug("No se afectaron filas - posiblemente los datos son iguales");
        // No lanzar excepción, solo avisar
    }
    
    $stmt->close();
    
    // Obtener los datos actualizados del usuario
    $stmt_get = $conexion->prepare("SELECT nombre, apellido, user, genero FROM usuario WHERE id = ?");
    if (!$stmt_get) {
        throw new Exception("Error al preparar consulta de obtención: " . $conexion->error);
    }
    
    $stmt_get->bind_param("i", $id_usuario);
    $stmt_get->execute();
    $resultado = $stmt_get->get_result();
    $usuario_actualizado = $resultado->fetch_assoc();
    $stmt_get->close();
    
    if (!$usuario_actualizado) {
        throw new Exception("Error al obtener los datos actualizados");
    }
    
    $response = [
        "exito" => true,
        "mensaje" => "Perfil actualizado correctamente",
        "usuario" => $usuario_actualizado
    ];
    
    logDebug("Respuesta enviada", $response);
    echo json_encode($response);
    
} catch (Exception $e) {
    logDebug("Error capturado", $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "exito" => false,
        "mensaje" => $e->getMessage()
    ]);
} finally {
    if (isset($conexion) && $conexion instanceof mysqli) {
        $conexion->close();
    }
}
?>