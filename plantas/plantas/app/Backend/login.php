<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$conexion = new mysqli("localhost", "root", "", "plantas");

if ($conexion->connect_error) {
    echo json_encode(["exito" => false, "mensaje" => "Error de conexión con la base de datos"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$email = $data["email"];
$password = $data["password"];

$query = "SELECT * FROM usuario WHERE correo = ? OR user = ?";
$stmt = $conexion->prepare($query);
$stmt->bind_param("ss", $email, $email);
$stmt->execute();
$resultado = $stmt->get_result();
$usuario = $resultado->fetch_assoc();

if ($usuario && password_verify($password, $usuario["password"])) {
    unset($usuario["password"]); // nunca enviar el hash
    echo json_encode(["exito" => true, "usuario" => $usuario]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "Credenciales inválidas"]);
}

$stmt->close();
$conexion->close();
?>
