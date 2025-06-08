<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Conexión a la base de datos
$conexion = new mysqli("localhost", "root", "", "plantas");

if ($conexion->connect_error) {
    echo json_encode(["exito" => false, "mensaje" => "Error de conexión"]);
    exit;
}

// Leer datos JSON del cuerpo de la solicitud
$data = json_decode(file_get_contents("php://input"), true);

// Validar si llegaron los datos
if (!$data || !isset(
    $data["nombre"],
    $data["apellido"],
    $data["user"],
    $data["correo"],
    $data["fecha_nacimiento"],
    $data["genero"],
    $data["password"]
)) {
    echo json_encode(["exito" => false, "mensaje" => "Faltan datos del formulario"]);
    exit;
}

// Asignar variables
$nombre = $data["nombre"];
$apellido = $data["apellido"];
$user = $data["user"];
$email = $data["correo"];
$fecha_nacimiento = $data["fecha_nacimiento"];
$genero = $data["genero"];
$pass = $data["password"];

// Verificar si ya existe correo o usuario
$verificar = $conexion->prepare("SELECT id FROM usuario WHERE correo = ? OR user = ?");
$verificar->bind_param("ss", $email, $user);
$verificar->execute();
$verificar->store_result();

if ($verificar->num_rows > 0) {
    echo json_encode(["exito" => false, "mensaje" => "Correo o usuario ya registrados"]);
    $verificar->close();
    $conexion->close();
    exit;
}
$verificar->close();

// Hashear contraseña
$passHash = password_hash($pass, PASSWORD_DEFAULT);

// Insertar nuevo usuario
$query = "INSERT INTO usuario (nombre, apellido, user, correo, password, fecha_nacimiento, genero) VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conexion->prepare($query);

if (!$stmt) {
    echo json_encode(["exito" => false, "mensaje" => "Error en la preparación de la consulta"]);
    exit;
}

$stmt->bind_param("sssssss", $nombre, $apellido, $user, $email, $passHash, $fecha_nacimiento, $genero);
$exito = $stmt->execute();

if ($exito) {
    // Enviar datos del usuario sin contraseña
    $usuario = [
        "id" => $stmt->insert_id,
        "nombre" => $nombre,
        "apellido" => $apellido,
        "user" => $user,
        "correo" => $email,
        "fecha_nacimiento" => $fecha_nacimiento,
        "genero" => $genero
    ];
    echo json_encode(["exito" => true, "usuario" => $usuario]);
} else {
    echo json_encode(["exito" => false, "mensaje" => "Error al registrar: " . $conexion->error]);
}

$stmt->close();
$conexion->close();
?>
