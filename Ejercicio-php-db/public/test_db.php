<?php
require '../src/config/database.php';

try {
    $pdo = getPDO();
    echo "¡Conexión exitosa a la base de datos!";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
