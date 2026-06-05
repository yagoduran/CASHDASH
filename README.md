# ⚡ FinanceFlow Pro — Cyber-Fintech Dashboard

Análisis predictivo, automatización de ahorros (regla del 50%), bróker de inversión simulado en tiempo real con alertas y simulador de interés compuesto. Todo unificado en una SPA fluida de alto rendimiento.

El objetivo de este proyecto es demostrar el dominio de **React avanzado**, gestión de estados complejos e interconectados, flujos asíncronos en tiempo real (`setInterval`), persistencia de datos y optimización de UX/UI moderna en Modo Oscuro.

---

## 🚀 Características Principales

### 1. 💳 Billetera y Presupuestos Inteligentes
* **Regla de Ahorro del 50%:** Desvío automático e inmediato de la mitad de cada ingreso a la Caja de Ahorros.
* **Presupuestos Dinámicos (Bento Grid):** Creación de categorías personalizadas con límites mensuales autodefinidos.
* **Efecto Shake & Toasts:** Animaciones de alerta por CSS/Tailwind y notificaciones emergentes si un gasto supera el presupuesto de su categoría.
* **Barrido de Fin de Mes:** Botón de cierre mensual que transfiere automáticamente el dinero remanente (sobrante) a la sección de ahorros.

### 2. 📈 Bróker de Inversión (Tiempo Real)
* **Simulación de Mercado:** Fluctuación asíncrona de precios cada 3 segundos (AAPL, NVDA, TSLA, BTC, ETH) mediante efectos secundarios de React.
* **Webhooks de Alerta:** Configuración de alertas de precio con disparador visual dinámico y notificaciones sonoras nativas (Web Audio API).
* **Integración de Capital:** Compra y venta de activos financiada directamente desde los fondos acumulados en la Caja de Ahorros.

### 3. 🧮 Planificador Financiero
* **Calculadora de Interés Compuesto:** Simulación interactiva en tiempo real mediante sliders con renderizado proporcional del crecimiento futuro basado en fórmulas matemáticas financieras.

### 4. 🔒 UI/UX Premium y Seguridad
* **Modo Incógnito (Privacy Mode):** Ocultación instantánea de todos los saldos y métricas mediante filtros CSS de desenfoque (`backdrop-blur`) con un solo clic.
* **Feed de Actividad Unificado:** Registro tipo *Audit Log* que unifica ingresos, gastos, transferencias e inversiones con tipado y renderizado condicional.
* **Exportación PDF Limpia:** Optimización nativa con directivas de impresión CSS (`print:hidden`, etc.) para generar reportes financieros limpios usando `window.print()`.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React (Vite)
* **Estilos & Animaciones:** Tailwind CSS
* **Iconos:** Lucide React
* **Persistencia:** LocalStorage API (Sincronización total de estados)
* **Audio:** Web Audio API (Osciladores nativos para alertas sin dependencias)

---

## 📁 Estructura del Código

Para facilitar la portabilidad, el core de la lógica se encuentra optimizado en un archivo centralizado que orquesta diferentes submódulos de estado:

```text
src/
└── App.jsx       # Contiene el core del neobanco (Lógica de estados, useEffects y Layout)