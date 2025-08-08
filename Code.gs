function doGet(e) {
  const hojaProductos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Productos");
  const { action, codigo } = e.parameter;

  if (action === "buscar") {
    const datos = hojaProductos.getDataRange().getValues();
    let existe = datos.some(fila => fila[0] == codigo);
    return ContentService.createTextOutput(JSON.stringify({ existe }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const hojaProductos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Productos");
  const hojaCredito = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ventas_Credito");
  const hojaContado = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ventas_Contado");

  if (data.action === "guardarProducto") {
    hojaProductos.appendRow([data.codigo, data.nombre, data.precio]);
    return ContentService.createTextOutput("Producto guardado");
  }

  if (data.action === "registrarVenta") {
    const fecha = new Date();
    if (data.tipo === "credito") {
      hojaCredito.appendRow([fecha, data.codigo]);
    } else {
      hojaContado.appendRow([fecha, data.codigo]);
    }
    return ContentService.createTextOutput("Venta registrada");
  }
}