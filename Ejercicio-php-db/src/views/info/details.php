<?php 

include_once  __DIR__ .'/../layouts/header.php';
$career = getCareerData();
?>
<?php if($career != null): ?>
<h2><?=$career['name']?> (<?=$career['abbreviation']?> - <?=$career['year']?>)</h2>
<?php else: ?>
    <h2>No se encontró la carrera seleccionada.</h2>
    <a href="<?=BASE_URL?>">Volver al inicio</a>
<?php endif; ?>

<?php
include_once  __DIR__ .'/../layouts/footer.php';
?>