<?php 
require __DIR__.'/../config/database.php';
$config = require __DIR__.'/../config/config.php';
define('BASE_URL', $config['base_url']);
define('ASSETS_URL', $config['assets_url']);

function getCareers() 
{
    $pdo = getPDO();

    try{
        $sql = "SELECT name, abbreviation FROM careers";
        $stmt = $pdo->query($sql);
        $careers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $careers;
    }catch (PDOException $e){
        error_log("Error al consultar la base de datos". $e->getMessage());
        return [];
    }
}

function getCareerData($career = null){

    if($career == null && isset($_GET['career'])){
        $career = filter_input(INPUT_GET, 'career', FILTER_SANITIZE_STRING);
    }

    if ($career === null) {
        return [];
    }

    $pdo = getPDO();

    try {
        $sql = "SELECT * FROM careers WHERE abbreviation = :career LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['career' => $career]);
        $careerData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$careerData) {
            return []; // Carrera no encontrada
        }

        return $careerData;
    } catch (PDOException $e) {
        error_log("Error al consultar la base de datos: " . $e->getMessage());
        return [];
    }

}