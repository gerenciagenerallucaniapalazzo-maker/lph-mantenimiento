# App de Seguimiento de Mejoras de Habitaciones — Lucania Palazzo Hotel

App web para que mucamas, gobernantas y ama de llaves carguen observaciones de
mantenimiento por habitación (TV, frigobar, colchón, pintura, etc.), con autor
y fecha/hora automáticos. Después se pueden ver reportes agregados (cuántos
frigobares rotos, cuántos topes de puerta faltan, cuántas paredes hay que
pintar, etc.) y exportarlos a CSV/Excel.

No requiere instalar nada en los celulares: es una página web (funciona en
cualquier navegador, se puede "agregar a inicio" en el celular como un ícono).

Los datos se guardan en una Google Sheet (planilla de Google), para que se
sincronicen entre todos los dispositivos y vos puedas verlos en tiempo real.

## Qué hay en esta carpeta

```
lph-mantenimiento/
├── index.html              <- la app (lo que se publica)
├── css/style.css
├── js/
│   ├── config.js            <- ACÁ va la URL de tu Apps Script (paso 3)
│   ├── rooms-data.js         <- las 105 habitaciones reales (de tu Ficha Técnica)
│   ├── catalogos.js          <- lista de ítems y estados (editable)
│   └── api.js                <- comunicación con Google Sheets
├── apps-script/
│   └── Code.gs                <- código que va pegado en Google Apps Script
└── README.md (este archivo)
```

---

## PASO 1 — Crear la Google Sheet

1. Entrá a [sheets.google.com](https://sheets.google.com) con tu cuenta de Google y creá una planilla nueva.
2. Llamala, por ejemplo, **"LPH - Mantenimiento Habitaciones (datos)"**.
3. No hace falta crear las pestañas a mano — el script las crea solas la primera vez que se usan. Pero sí tenés que completar la pestaña **"Personal"** con la gente real (ver Paso 4).

## PASO 2 — Pegar el script (Apps Script)

1. En la Sheet, ir a **Extensiones > Apps Script**.
2. Te abre un editor con un archivo `Código.gs` vacío. Borrá todo el contenido.
3. Abrí el archivo `apps-script/Code.gs` de esta carpeta, copiá todo su contenido y pegalo ahí.
4. Guardá (ícono de disquete o Ctrl+S).

## PASO 3 — Publicar como aplicación web

1. Arriba a la derecha, click en **Implementar (Deploy) > Nueva implementación**.
2. En "Seleccionar tipo", elegí **Aplicación web**.
3. Configurá:
   - Ejecutar como: **Yo (tu cuenta)**
   - Quién tiene acceso: **Cualquier usuario** (Anyone) — así las mucamas pueden usarla sin loguearse con Google.
4. Click en **Implementar**. Te va a pedir autorizar permisos (es tu propia planilla, es seguro autorizar).
5. Te va a dar una **URL que termina en `/exec`**. Copiala.
6. Abrí `js/config.js` en esta carpeta y pegala en `APPS_SCRIPT_URL`, reemplazando el texto `"PEGAR_AQUI_LA_URL_DE_APPS_SCRIPT_/exec"`.

> Importante: cada vez que modifiques el código `Code.gs`, tenés que hacer
> **Implementar > Administrar implementaciones > ✏️ Editar > Nueva versión** para que los cambios se publiquen. Si solo guardás el archivo sin republicar, la app seguirá usando la versión vieja.

## PASO 4 — Completar la lista de personal

1. Volvé a la Google Sheet. Debería haberse creado sola una pestaña **"Personal"** la primera vez que la app la consultó (si todavía no existe, podés crearla vos a mano con esas columnas).
2. Completá una fila por persona, columnas **Nombre** y **Rol** (ej: "María González" / "Mucama", "Laura Pérez" / "Gobernanta", "Sandra Ruiz" / "Ama de Llaves"). Esa es la lista que va a aparecer en el menú desplegable de la app.
3. Podés agregar, editar o borrar personal en cualquier momento directamente en la Sheet, sin tocar código.

## PASO 5 — Subir la app a GitHub Pages

1. Creá un repositorio nuevo en GitHub (puede ser privado o público, ej. `lph-mantenimiento`).
2. Subí **todo el contenido** de esta carpeta (`index.html`, `css/`, `js/` — la carpeta `apps-script/` no es necesaria subirla pero no molesta si la subís) a la raíz del repo.
   - Más simple: arrastrá los archivos en la página del repo en github.com ("Add file > Upload files"), o usá `git push` si preferís la terminal.
3. Una vez subido, ir a **Settings > Pages** del repositorio.
4. En "Branch", elegí `main` (o `master`) y carpeta `/ (root)`. Guardar.
5. GitHub te va a dar un link tipo `https://tu-usuario.github.io/lph-mantenimiento/` — ese es el link que les compartís a las mucamas, gobernantas y ama de llaves (por WhatsApp, por ejemplo).
6. Tarda 1-2 minutos en activarse la primera vez.

## PASO 6 — Código de acceso (opcional pero recomendado)

La app pide un código simple antes de mostrar nada, para que no entre cualquiera
que encuentre el link por casualidad. Por defecto es `lucania2026`. Podés
cambiarlo en `js/config.js` (`ACCESS_CODE`) antes de subir a GitHub. **No es una
contraseña fuerte** — es solo un filtro básico, no hay datos de huéspedes
involucrados, así que alcanza para este uso.

---

## Cómo se usa la app

- **Cargar observación**: elegís la habitación (ya están las 105 reales, con piso y categoría), el ítem (TV, frigobar, cama, pared, etc.), el estado (roto, falta, necesita reparación...), un detalle libre opcional (ej. modelo de TV) y la prioridad. Al guardar, queda registrado automáticamente quién lo cargó y la fecha/hora exacta — no se pide manualmente.
- **Historial por habitación**: para ver todo lo cargado en una habitación puntual, y marcar ítems como "Resuelto" cuando Mantenimiento los soluciona.
- **Reportes**: agrupa todas las observaciones pendientes por ítem + estado (ej. "Frigobar — Roto/no funciona: 4", "Tope de Puerta — Falta: 12", "Pared/Pintura — Falta pintar: 7"), con filtro por piso o categoría, y botón para exportar todo a CSV (se abre directo en Excel).

## Nota sobre "Standard de Lujo"

Las 20 habitaciones de pisos 2 y 3 que en la ficha técnica original decían
"Standard de Lujo" están cargadas en `rooms-data.js` como **"Ejecutiva en
Suite"**, que es su categoría real (la separación anterior era de una prueba
piloto no aprobada, no una categoría real de habitación) — así quedan
unificadas con el resto de la categoría en los reportes.

## Modificaciones futuras

- Para agregar/quitar ítems o estados del formulario: editar `js/catalogos.js`.
- Para corregir datos de alguna habitación (piso, categoría, etc.): editar `js/rooms-data.js`.
- Los datos cargados (observaciones) viven siempre en la Google Sheet — nunca se pierden aunque cambies el código de la app.

## Pendiente / a tu criterio

- Si en algún momento agregan o quitan habitaciones reales, hay que actualizar `js/rooms-data.js` a mano (o pedirme que lo regenere desde una ficha técnica actualizada).
- Si más adelante querés fotos adjuntas a cada observación (ej. foto del frigobar roto), se puede agregar, pero requiere otro paso de configuración (Google Drive) — avisame si lo querés y lo armamos en una vuelta siguiente.
