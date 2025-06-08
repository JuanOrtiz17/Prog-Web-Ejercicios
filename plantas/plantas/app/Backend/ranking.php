<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $pdo = new PDO("mysql:host=localhost;dbname=plantas;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['id_usuario']) || !isset($data['puntos']) || !isset($data['xp'])) {
        throw new Exception("Datos incompletos");
    }

    $id_usuario = (int)$data['id_usuario'];
    $puntos = (int)$data['puntos'];
    $xp = (int)$data['xp'];

    // Asegurarse que el registro exista
    $pdo->prepare("INSERT IGNORE INTO progreso (id_usuario, puntos, xp) VALUES (:id, 0, 0)")
        ->execute([':id' => $id_usuario]);

    // Sumar puntos y xp
    $stmt = $pdo->prepare("UPDATE progreso SET puntos = puntos + :puntos, xp = xp + :xp WHERE id_usuario = :id");
    $stmt->execute([
        ':puntos' => $puntos,
        ':xp' => $xp,
        ':id' => $id_usuario
    ]);

    echo json_encode(["exito" => true, "mensaje" => "Recompensa asignada"]);
} catch (Exception $e) {
    echo json_encode(["exito" => false, "mensaje" => $e->getMessage()]);
}
?>
