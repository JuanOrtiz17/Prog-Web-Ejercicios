<?php
// asignar_puntos.php o en tu controlador correspondiente

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Obtener el ID del usuario desde el POST
$input = json_decode(file_get_contents('php://input'), true);
$id_usuario = $input['id_usuario'] ?? null;

if (!$id_usuario) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de usuario requerido']);
    exit;
}

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'tu_base_de_datos';
$username = 'tu_usuario';
$password = 'tu_contraseña';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Valores fijos para cada juego exitoso
    $xp_a_asignar = 12;
    $puntos_a_asignar = 12;
    
    // Actualizar XP y puntos del usuario
    $sql = "UPDATE usuarios SET 
            xp = xp + :xp_nuevo, 
            puntos = puntos + :puntos_nuevos 
            WHERE id_usuario = :id_usuario";
    
    $stmt = $pdo->prepare($sql);
    $resultado = $stmt->execute([
        ':xp_nuevo' => $xp_a_asignar,
        ':puntos_nuevos' => $puntos_a_asignar,
        ':id_usuario' => $id_usuario
    ]);
    
    if ($resultado && $stmt->rowCount() > 0) {
        // Obtener los nuevos valores
        $sql_select = "SELECT xp, puntos FROM usuarios WHERE id_usuario = :id_usuario";
        $stmt_select = $pdo->prepare($sql_select);
        $stmt_select->execute([':id_usuario' => $id_usuario]);
        $usuario = $stmt_select->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'XP y puntos asignados correctamente',
            'xp_asignado' => $xp_a_asignar,
            'puntos_asignados' => $puntos_a_asignar,
            'xp_total' => $usuario['xp'],
            'puntos_total' => $usuario['puntos']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Usuario no encontrado o no se pudo actualizar'
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
}
?>