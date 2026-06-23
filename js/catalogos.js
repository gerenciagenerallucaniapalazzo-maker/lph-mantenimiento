// ============================================================
// Catálogos de la app (ítems y estados posibles para cada observación)
// Editable: agregar/quitar ítems acá si hace falta.
// ============================================================
const ITEMS = [
  "TV",
  "Frigobar",
  "Aire Acondicionado",
  "Cama / Sommier",
  "Colchón",
  "Mueble / Placard",
  "Escritorio / Silla",
  "Cortinas / Persianas",
  "Pared / Pintura",
  "Marco de Ventana",
  "Vidrios / Ventanales",
  "Baño / Sanitarios",
  "Grifería",
  "Tope de Puerta",
  "Cerradura / Llave",
  "Alfombra / Piso",
  "Balcón",
  "Iluminación",
  "Ropa de cama / Blancos",
  "Otro",
];

const ESTADOS = [
  "Roto / no funciona",
  "Necesita reparación",
  "Necesita reemplazo",
  "Falta (no hay)",
  "Desgaste estético",
  "Óxido / corrosión",
  "Falta pintar",
  "Funciona pero con observación",
  "Otro",
];

const PRIORIDADES = ["Baja", "Media", "Alta", "Urgente"];

// Sugerencias de "Detalle" según el ítem elegido (placeholders del input, no son obligatorios)
const DETALLE_PLACEHOLDER = {
  "TV": "Ej: modelo, si es LCD o más viejo, tamaño...",
  "Frigobar": "Ej: marca/modelo, no enfría, hace ruido...",
  "Aire Acondicionado": "Ej: marca/modelo, no enfría/calienta, pierde agua...",
  "Cama / Sommier": "Ej: rechina, base rota, falta una pata...",
  "Colchón": "Ej: hundido, mancha, hace ruido de resortes...",
  "Mueble / Placard": "Ej: puerta no cierra, bisagra rota, falta cajón...",
  "Escritorio / Silla": "Ej: pata floja, silla rota...",
  "Cortinas / Persianas": "Ej: no corre, riel roto, tela rota...",
  "Pared / Pintura": "Ej: humedad, descascarado, mancha...",
  "Marco de Ventana": "Ej: óxido, no cierra bien...",
  "Vidrios / Ventanales": "Ej: rayado, trizado, mosquitero roto...",
  "Baño / Sanitarios": "Ej: inodoro, ducha, mampara...",
  "Grifería": "Ej: pierde agua, mucha presión/poca presión...",
  "Tope de Puerta": "Ej: falta, roto...",
  "Cerradura / Llave": "Ej: traba, no entra la tarjeta...",
  "Alfombra / Piso": "Ej: mancha, despegado, roto...",
  "Balcón": "Ej: baranda floja, piso roto...",
  "Iluminación": "Ej: lámpara quemada, no prende...",
  "Ropa de cama / Blancos": "Ej: manchado, roto, falta juego...",
  "Otro": "Describir brevemente...",
};
