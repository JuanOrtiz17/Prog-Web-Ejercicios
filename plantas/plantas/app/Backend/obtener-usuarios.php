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
    
    if (empty($raw)) {
        throw new Exception("No se recibieron datos");
    }

    $data = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON no válido: " . json_last_error_msg());
    }

    // Validar que se recibió el ID del usuario
    if (!isset($data["id_usuario"]) || empty($data["id_usuario"])) {
        throw new Exception("ID de usuario requerido");
    }

    $id_usuario = $data["id_usuario"];

    // Consultar datos del usuario (ajustado a los nombres reales de la base de datos)
    $stmt = $conexion->prepare("SELECT id, nombre, apellido, user, correo, genero, fecha_nacimiento FROM usuario WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Error al preparar la consulta: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_usuario);
    
    if (!$stmt->execute()) {
        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
    }

    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows === 0) {
        throw new Exception("Usuario no encontrado");
    }

    $usuario = $resultado->fetch_assoc();
    
    // Preparar respuesta con los nombres correctos
    $respuesta = [
        "exito" => true,
        "mensaje" => "Datos del usuario obtenidos correctamente",
        "usuario" => [
            "id" => $usuario["id"],
            "nombre" => $usuario["nombre"],
            "apellido" => $usuario["apellido"],
            "nombreUsuario" => $usuario["user"],
            "nombre_usuario" => $usuario["user"], // Para compatibilidad
            "email" => $usuario["correo"],
            "genero" => $usuario["genero"],
            "fecha_nacimiento" => $usuario["fecha_nacimiento"],
            "fecha_registro" => null, // No existe en tu tabla
            "imagenPerfil" => null    // No existe en tu tabla
        ]
    ];

    echo json_encode($respuesta);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "exito" => false,
        "mensaje" => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($conexion)) {
        $conexion->close();
    }
}
?>
