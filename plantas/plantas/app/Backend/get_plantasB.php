<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conexion = new mysqli("localhost", "root", "", "plantas");
if ($conexion->connect_error) {
    echo json_encode(["exito" => false, "mensaje" => "Error de conexión"]);
    exit;
}

$sql = "SELECT id, nombre, nombre_cientifico, familia, descripcion, imagen, uso FROM plantas";
$res = $conexion->query($sql);

$plantas = [];
while ($row = $res->fetch_assoc()) {
    // Si la imagen es un BLOB, conviértela a base64
    $imagenBase64 = base64_encode($row["imagen"]);
    $plantas[] = [
        "id" => $row["id"],
        "nombre" => $row["nombre"],
        "nombre_cientifico" => $row["nombre_cientifico"],
        "familia" => $row["familia"],
        "descripcion" => $row["descripcion"],
        "imagen" => $imagenBase64,
        "uso" => $row["uso"], // En frontend: data:image/jpeg;base64,...
    ];
}

echo json_encode([
    "exito" => true,
    "plantas" => $plantas
]);
?>
