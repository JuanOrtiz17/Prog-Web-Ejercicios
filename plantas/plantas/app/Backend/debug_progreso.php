<?php
// Script de debug para verificar la inserción
header("Content-Type: application/json");

$conexion = new mysqli("localhost", "root", "", "plantas");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Obtener ID de usuario desde GET para testing
$id_usuario = isset($_GET['id']) ? intval($_GET['id']) : 1;

echo "<h2>Debug - Progreso Usuario ID: $id_usuario</h2>";

// 1. Verificar si el usuario existe
$queryUsuario = "SELECT * FROM usuarios WHERE id = ?";
$stmtUsuario = $conexion->prepare($queryUsuario);
$stmtUsuario->bind_param("i", $id_usuario);
$stmtUsuario->execute();
$resultadoUsuario = $stmtUsuario->get_result();

echo "<h3>1. Verificación de Usuario:</h3>";
if ($filaUsuario = $resultadoUsuario->fetch_assoc()) {
    echo "<p>✅ Usuario encontrado:</p>";
    echo "<pre>" . json_encode($filaUsuario, JSON_PRETTY_PRINT) . "</pre>";
} else {
    echo "<p>❌ Usuario NO encontrado con ID: $id_usuario</p>";
}

// 2. Verificar progreso existente
$queryProgreso = "SELECT * FROM progreso WHERE id_usuario = ?";
$stmtProgreso = $conexion->prepare($queryProgreso);
$stmtProgreso->bind_param("i", $id_usuario);
$stmtProgreso->execute();
$resultadoProgreso = $stmtProgreso->get_result();

echo "<h3>2. Verificación de Progreso:</h3>";
if ($filaProgreso = $resultadoProgreso->fetch_assoc()) {
    echo "<p>✅ Progreso encontrado:</p>";
    echo "<pre>" . json_encode($filaProgreso, JSON_PRETTY_PRINT) . "</pre>";
} else {
    echo "<p>❌ Progreso NO encontrado. Intentando crear...</p>";
    
    // 3. Intentar crear progreso
    $insertQuery = "INSERT INTO progreso (
        id_usuario, nivel, plantas_descubiertas, racha_dias_jugados,
        tiempo_jugado, juego_favorito, logro, xp, puntos
    ) VALUES (?, 0, 0, 0, 0, 'Ninguno', 0, 0, 0)";
    
    $insertStmt = $conexion->prepare($insertQuery);
    $insertStmt->bind_param("i", $id_usuario);
    
    if ($insertStmt->execute()) {
        echo "<p>✅ Progreso creado exitosamente!</p>";
        echo "<p>Filas afectadas: " . $insertStmt->affected_rows . "</p>";
        
        // Verificar la inserción
        $stmtProgreso->execute();
        $resultadoProgreso = $stmtProgreso->get_result();
        if ($nuevaFila = $resultadoProgreso->fetch_assoc()) {
            echo "<p>✅ Verificación post-inserción:</p>";
            echo "<pre>" . json_encode($nuevaFila, JSON_PRETTY_PRINT) . "</pre>";
        }
    } else {
        echo "<p>❌ Error creando progreso: " . $insertStmt->error . "</p>";
    }
}

// 4. Mostrar estructura de tabla progreso
echo "<h3>3. Estructura de tabla 'progreso':</h3>";
$describe = $conexion->query("DESCRIBE progreso");
if ($describe) {
    echo "<table border='1'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
    while ($campo = $describe->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $campo['Field'] . "</td>";
        echo "<td>" . $campo['Type'] . "</td>";
        echo "<td>" . $campo['Null'] . "</td>";
        echo "<td>" . $campo['Key'] . "</td>";
        echo "<td>" . $campo['Default'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
}

// 5. Contar registros
$contarUsuarios = $conexion->query("SELECT COUNT(*) as total FROM usuarios")->fetch_assoc();
$contarProgreso = $conexion->query("SELECT COUNT(*) as total FROM progreso")->fetch_assoc();

echo "<h3>4. Conteos:</h3>";
echo "<p>Total usuarios: " . $contarUsuarios['total'] . "</p>";
echo "<p>Total registros progreso: " . $contarProgreso['total'] . "</p>";

$conexion->close();
?>