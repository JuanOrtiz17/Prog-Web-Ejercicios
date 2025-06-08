<?php
// Configuración de CORS
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

    // Leer y procesar el JSON
    $raw = trim(file_get_contents("php://input"));
    
    // Debug: Log de los datos recibidos
    error_log("Datos recibidos en cambiar-password.php: " . $raw);
    
    if (empty($raw)) {
        throw new Exception("No se recibieron datos");
    }

    $data = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON no válido: " . json_last_error_msg());
    }

    // Debug: Log de los datos parseados
    error_log("Datos parseados: " . print_r($data, true));

    // Validar datos requeridos
    if (!isset($data["id_usuario"]) || empty($data["id_usuario"])) {
        throw new Exception("ID de usuario requerido");
    }

    if (!isset($data["password_actual"]) || empty($data["password_actual"])) {
        throw new Exception("Contraseña actual requerida");
    }

    if (!isset($data["password_nueva"]) || empty($data["password_nueva"])) {
        throw new Exception("Nueva contraseña requerida");
    }

    $id_usuario = $data["id_usuario"];
    $password_actual = $data["password_actual"];
    $password_nueva = $data["password_nueva"];

    // Debug: Log del ID de usuario
    error_log("ID de usuario: " . $id_usuario);

    // Validar longitud de la nueva contraseña
    if (strlen($password_nueva) < 6) {
        throw new Exception("La nueva contraseña debe tener al menos 6 caracteres");
    }

    // Obtener la contraseña actual del usuario
    $stmt = $conexion->prepare("SELECT password FROM usuario WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_usuario);
    
    if (!$stmt->execute()) {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }

    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows === 0) {
        error_log("Usuario no encontrado con ID: " . $id_usuario);
        throw new Exception("Usuario no encontrado");
    }

    $usuario = $resultado->fetch_assoc();
    $password_hash_actual = $usuario["password"];

    // Debug: Log de verificación de contraseña
    error_log("Verificando contraseña para usuario ID: " . $id_usuario);

    // Verificar la contraseña actual
    if (!password_verify($password_actual, $password_hash_actual)) {
        error_log("Contraseña actual incorrecta para usuario ID: " . $id_usuario);
        throw new Exception("La contraseña actual es incorrecta");
    }

    error_log("Contraseña actual verificada correctamente");

    // Generar hash de la nueva contraseña
    $password_nueva_hash = password_hash($password_nueva, PASSWORD_DEFAULT);

    // Actualizar la contraseña
    $stmt_update = $conexion->prepare("UPDATE usuario SET password = ? WHERE id = ?");
    
    if (!$stmt_update) {
        throw new Exception("Error al preparar la actualización: " . $conexion->error);
    }

    $stmt_update->bind_param("si", $password_nueva_hash, $id_usuario);
    
    if (!$stmt_update->execute()) {
        throw new Exception("Error al actualizar la contraseña: " . $stmt_update->error);
    }

    if ($stmt_update->affected_rows === 0) {
        error_log("No se afectaron filas al actualizar contraseña para usuario ID: " . $id_usuario);
        throw new Exception("No se pudo actualizar la contraseña");
    }

    error_log("Contraseña actualizada correctamente para usuario ID: " . $id_usuario);

    $respuesta = [
        "exito" => true,
        "mensaje" => "Contraseña cambiada correctamente"
    ];

    echo json_encode($respuesta);

} catch (Exception $e) {
    error_log("Error en cambiar-password.php: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "exito" => false,
        "mensaje" => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($stmt_update)) {
        $stmt_update->close();
    }
    if (isset($conexion)) {
        $conexion->close();
    }
}
?>