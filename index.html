<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>App Elektra</title>
<script src="https://unpkg.com/html5-qrcode"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js"></script>
<style>
  body { font-family: Arial, sans-serif; padding: 20px; }
  #scanner, #scanner2 { width: 300px; margin: auto; }
  .hidden { display: none; }
</style>
</head>
<body>

<h2>Registro de Ventas</h2>
<div id="scanner"></div>
<video id="scanner2" class="hidden" autoplay></video>
<p id="status">Esperando escaneo...</p>

<div id="form-nuevo" class="hidden">
  <h3>Nuevo Producto</h3>
  <label>Nombre: <input type="text" id="nombre"></label><br>
  <label>Precio: <input type="number" id="precio"></label><br>
  <button onclick="guardarProducto()">Guardar Producto</button>
</div>

<script>
const scriptURL = "AQUÍ_VA_TU_URL_DEL_APPS_SCRIPT"; // Pega tu URL de GAS

let codigoActual = "";

function iniciarEscaneoHtml5() {
  const html5QrCode = new Html5Qrcode("scanner");
  Html5Qrcode.getCameras().then(cameras => {
    if (cameras.length) {
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        onScanSuccess,
        err => { console.warn("Error escaneo:", err); }
      ).catch(() => {
        document.getElementById("scanner").classList.add("hidden");
        iniciarEscaneoQuagga();
      });
    } else {
      iniciarEscaneoQuagga();
    }
  });
}

function iniciarEscaneoQuagga() {
  const scanner2 = document.getElementById("scanner2");
  scanner2.classList.remove("hidden");

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: scanner2
    },
    decoder: { readers: ["ean_reader", "code_128_reader", "qr_reader"] }
  }, err => {
    if (err) { console.error(err); return; }
    Quagga.start();
  });

  Quagga.onDetected(data => {
    onScanSuccess(data.codeResult.code);
    Quagga.stop();
  });
}

function onScanSuccess(decodedText) {
  codigoActual = decodedText;
  document.getElementById("status").innerText = "Código detectado: " + decodedText;
  buscarProducto(decodedText);
}

function buscarProducto(codigo) {
  fetch(scriptURL + "?action=buscar&codigo=" + encodeURIComponent(codigo))
    .then(res => res.json())
    .then(data => {
      if (data.existe) {
        let tipoPago = confirm("¿Venta a crédito? (Aceptar = Crédito, Cancelar = Contado)") ? "credito" : "contado";
        registrarVenta(codigo, tipoPago);
      } else {
        document.getElementById("form-nuevo").classList.remove("hidden");
      }
    })
    .catch(err => alert("Error en búsqueda: " + err));
}

function registrarVenta(codigo, tipo) {
  fetch(scriptURL, {
    method: "POST",
    body: JSON.stringify({ action: "registrarVenta", codigo, tipo })
  })
    .then(res => res.text())
    .then(txt => alert(txt))
    .catch(err => alert("Error al registrar venta: " + err));
}

function guardarProducto() {
  let nombre = document.getElementById("nombre").value;
  let precio = document.getElementById("precio").value;
  fetch(scriptURL, {
    method: "POST",
    body: JSON.stringify({ action: "guardarProducto", codigo: codigoActual, nombre, precio })
  })
    .then(res => res.text())
    .then(txt => {
      alert(txt);
      document.getElementById("form-nuevo").classList.add("hidden");
    })
    .catch(err => alert("Error al guardar producto: " + err));
}

iniciarEscaneoHtml5();
</script>
</body>
</html>