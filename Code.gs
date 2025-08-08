function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('App Elektra - Inventario y Ventas')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function buscarProducto(codigo) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Productos");
  if (!hoja) throw "No existe la hoja 'Productos'";
  var datos = hoja.getRange(2, 1, hoja.getLastRow()-1, 5).getValues();
  for (var i = 0; i < datos.length; i++) {
    if (String(datos[i][0]) === String(codigo)) {
      return {
        product_id: datos[i][0],
        marca: datos[i][1],
        modelo: datos[i][2],
        precio_normal: datos[i][3],
        precio_oferta: datos[i][4]
      };
    }
  }
  return null;
}

function crearActualizarProducto(producto) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Productos");
  var datos = hoja.getRange(2, 1, hoja.getLastRow()-1, 5).getValues();
  for (var i = 0; i < datos.length; i++) {
    if (String(datos[i][0]) === String(producto.product_id)) {
      // Actualiza fila existente
      hoja.getRange(i+2, 2, 1, 4).setValues([[producto.marca, producto.modelo, producto.precio_normal, producto.precio_oferta]]);
      return "actualizado";
    }
  }
  // Si no existe, agrega fila nueva
  hoja.appendRow([producto.product_id, producto.marca, producto.modelo, producto.precio_normal, producto.precio_oferta]);
  return "creado";
}

function registrarVenta(producto, tipoVenta, precioVenta, vendedor) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    tipoVenta === "credito" ? "Ventas_Credito" : "Ventas_Contado"
  );
  hoja.appendRow([
    new Date(),
    producto.product_id,
    producto.modelo,
    precioVenta,
    vendedor
  ]);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var accion = payload.accion || "venta"; // puede ser "venta", "inventario" o "consulta"
    var vendedor = payload.seller || "desconocido";

    if (accion === "consulta") {
      var producto = buscarProducto(payload.product_id);
      if (producto) {
        return ContentService.createTextOutput(JSON.stringify({status:"ok", producto: producto}))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({status:"no_encontrado"}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (accion === "inventario") {
      var producto = {
        product_id: payload.product_id,
        marca: payload.marca || "",
        modelo: payload.modelo || "",
        precio_normal: parseFloat(payload.precio_normal) || 0,
        precio_oferta: parseFloat(payload.precio_oferta) || 0
      };
      var res = crearActualizarProducto(producto);
      return ContentService.createTextOutput(JSON.stringify({status:"ok", mensaje: res})).setMimeType(ContentService.MimeType.JSON);
    }

    // Acción venta
    var codigo = payload.product_id;
    var tipoVenta = payload.tipo_venta || "contado";
    var producto = buscarProducto(codigo);

    if (!producto) {
      // Producto no encontrado, devolver para captura manual
      return ContentService.createTextOutput(JSON.stringify({status:"no_encontrado"})).setMimeType(ContentService.MimeType.JSON);
    }

    // Decide precio a usar (oferta si existe y es >0)
    var precioVenta = producto.precio_oferta > 0 ? producto.precio_oferta : producto.precio_normal;
    registrarVenta(producto, tipoVenta, precioVenta, vendedor);

    return ContentService.createTextOutput(JSON.stringify({status:"ok", producto: producto, precio_venta: precioVenta})).setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status:"error", message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('App Elektra - Inventario y Ventas')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}