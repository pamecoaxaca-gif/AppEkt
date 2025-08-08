function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('App Elektra - Inventario y Ventas')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function buscarProducto(codigo) {
  var spreadsheetId = '1-g6CXuMlSHsF17MpeJ-BjQx2OcoYC-HJmam4NbPflGU'; // Reemplaza con el ID de tu hoja de cálculo
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var hoja = spreadsheet.getSheetByName("Productos");

  if (!hoja) throw "No existe la hoja 'Productos'";

  var datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, 5).getValues();
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
  if (!producto || !producto.product_id) {
    throw new Error("Falta el código del producto (product_id). Datos recibidos: " + JSON.stringify(producto));
  }

  var spreadsheetId = '1-g6CXuMlSHsF17MpeJ-BjQx2OcoYC-HJmam4NbPflGU'; // Reemplaza con el ID de tu hoja de cálculo
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var hoja = spreadsheet.getSheetByName("Productos");

  var datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, 5).getValues();
  for (var i = 0; i < datos.length; i++) {
    if (String(datos[i][0]) === String(producto.product_id)) {
      hoja.getRange(i + 2, 2, 1, 4).setValues([[producto.marca, producto.modelo, producto.precio_normal, producto.precio_oferta]]);
      return "actualizado";
    }
  }
  hoja.appendRow([producto.product_id, producto.marca, producto.modelo, producto.precio_normal, producto.precio_oferta]);
  return "creado";
}

function registrarVenta(producto, tipoVenta, precioVenta, vendedor) {
  if (!producto || !producto.product_id) {
    throw new Error("No se puede registrar venta: falta product_id.");
  }

  var spreadsheetId = 'TU_ID_DE_LA_HOJA'; // Reemplaza con el ID de tu hoja de cálculo
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var hoja = spreadsheet.getSheetByName(tipoVenta === "credito" ? "Ventas_Credito" : "Ventas_Contado");

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
    var payload = JSON.parse(e.postData.contents || "{}");
    Logger.log("Datos recibidos: " + JSON.stringify(payload));

    var accion = payload.accion || "venta";
    var vendedor = payload.seller || "desconocido";

    if (accion === "inventario") {
      var producto = {
        product_id: payload.product_id,
        marca: payload.marca || "",
        modelo: payload.modelo || "",
        precio_normal: parseFloat(payload.precio_normal) || 0,
        precio_oferta: parseFloat(payload.precio_oferta) || 0
      };
      var res = crearActualizarProducto(producto);
      return ContentService.createTextOutput(JSON.stringify({ status: "ok", mensaje: res }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Acción venta
    var codigo = payload.product_id;
    if (!codigo) throw new Error("Falta product_id para registrar venta.");

    var tipoVenta = payload.tipo_venta || "contado";
    var producto = buscarProducto(codigo);

    if (!producto) {
      // Si el producto no existe, lo creamos
      producto = {
        product_id: codigo,
        marca: payload.marca || "",
        modelo: payload.modelo || "",
        precio_normal: parseFloat(payload.precio_normal) || 0,
        precio_oferta: parseFloat(payload.precio_oferta) || 0
      };
      crearActualizarProducto(producto);
    }

    var precioVenta = producto.precio_oferta > 0 ? producto.precio_oferta : producto.precio_normal;
    registrarVenta(producto, tipoVenta, precioVenta, vendedor);

    return ContentService.createTextOutput(JSON.stringify({ status: "ok", mensaje: "Venta registrada" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error: " + err);
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
