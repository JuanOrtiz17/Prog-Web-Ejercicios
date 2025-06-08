<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conexion = new mysqli("localhost", "root", "", "plantas");
if ($conexion->connect_error) {
    echo json_encode(["exito" => false, "mensaje" => "Error de conexión"]);
    exit;
}

$cantidad = isset($_GET["cantidad"]) ? intval($_GET["cantidad"]) : 8;

// Selecciona plantas al azar
$query = "SELECT id, nombre, imagen FROM plantas ORDER BY RAND() LIMIT ?";
$stmt = $conexion->prepare($query);
$stmt->bind_param("i", $cantidad);
$stmt->execute();
$resultado = $stmt->get_result();

$plantas = [];
while ($row = $resultado->fetch_assoc()) {
    $base64 = base64_encode($row["imagen"]);
    $plantas[] = [
        "id" => $row["id"],
        "nombre" => $row["nombre"],
        "imagen" => "data:image/png;base64," . $base64 // << CAMBIA JPEG por PNG
    ];
}


echo json_encode(["exito" => true, "plantas" => $plantas]);
$stmt->close();
$conexion->close();
?>
