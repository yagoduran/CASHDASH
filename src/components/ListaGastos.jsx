import { formatearFecha, formatearMoneda } from '../utils/formateadores'

function ListaGastos({ gastos, onEliminarGasto }) {
  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Registro
          </p>
          <h2 className="mt-2 font-['Fraunces'] text-2xl font-semibold text-slate-950">
            Lista de gastos
          </h2>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {gastos.length} {gastos.length === 1 ? 'movimiento' : 'movimientos'}
        </div>
      </div>

      {gastos.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">
            Aun no hay gastos registrados.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Cuando anadas tu primer gasto, aparecera aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {gastos.map((gasto) => (
            <article
              key={gasto.id}
              className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-semibold text-slate-900">
                    {gasto.descripcion}
                  </h3>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                    {gasto.categoria}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {formatearFecha(gasto.fecha)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <p className="text-lg font-semibold text-slate-950">
                  {formatearMoneda(gasto.monto)}
                </p>
                <button
                  type="button"
                  onClick={() => onEliminarGasto(gasto.id)}
                  className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default ListaGastos
