import { formatearMoneda } from '../utils/formateadores'

const categorias = ['Comida', 'Ocio', 'Facturas', 'Transporte', 'Otros']

function ResumenMetricas({ gastos }) {
  const totalGastado = gastos.reduce((acumulado, gasto) => acumulado + gasto.monto, 0)

  const mayorGasto =
    gastos.length > 0
      ? gastos.reduce((gastoMayor, gastoActual) =>
          gastoActual.monto > gastoMayor.monto ? gastoActual : gastoMayor,
        )
      : null

  const resumenPorCategoria = categorias.map((categoria) => {
    const totalCategoria = gastos
      .filter((gasto) => gasto.categoria === categoria)
      .reduce((acumulado, gasto) => acumulado + gasto.monto, 0)

    const porcentaje = totalGastado > 0 ? (totalCategoria / totalGastado) * 100 : 0

    return {
      categoria,
      total: totalCategoria,
      porcentaje,
    }
  })

  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Seccion B
        </p>
        <h2 className="mt-2 font-['Fraunces'] text-2xl font-semibold text-slate-950">
          Resumen de metricas
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
            Total gastado
          </p>
          <p className="mt-4 text-3xl font-semibold">
            {formatearMoneda(totalGastado)}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Suma acumulada de todos los gastos registrados.
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Mayor gasto
          </p>
          <p className="mt-4 text-2xl font-semibold text-slate-950">
            {mayorGasto ? formatearMoneda(mayorGasto.monto) : 'EUR 0,00'}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {mayorGasto
              ? `${mayorGasto.descripcion} en ${mayorGasto.categoria}.`
              : 'Todavia no hay un gasto destacado.'}
          </p>
        </article>

        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Estado actual
          </p>
          <p className="mt-4 text-2xl font-semibold text-slate-950">
            {gastos.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {gastos.length === 1
              ? 'Movimiento registrado en el dashboard.'
              : 'Movimientos registrados en el dashboard.'}
          </p>
        </article>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Desglose por categorias
            </h3>
            <p className="text-sm text-slate-500">
              Vista rapida del peso de cada categoria en tu gasto total.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Base total: {formatearMoneda(totalGastado)}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          {resumenPorCategoria.map((item) => (
            <div key={item.categoria}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-slate-700">
                  {item.categoria}
                </span>
                <span className="text-sm text-slate-500">
                  {formatearMoneda(item.total)} · {item.porcentaje.toFixed(0)}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,_#0f172a_0%,_#475569_100%)] transition-all duration-500"
                  style={{ width: `${item.porcentaje}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ResumenMetricas
