import { useState } from 'react'

const categorias = ['Comida', 'Ocio', 'Facturas', 'Transporte', 'Otros']

const estadoInicial = {
  descripcion: '',
  monto: '',
  categoria: 'Comida',
  fecha: new Date().toISOString().slice(0, 10),
}

function FormularioGasto({ onAgregarGasto }) {
  const [formulario, setFormulario] = useState(estadoInicial)
  const [error, setError] = useState('')

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target
    setFormulario((estadoActual) => ({
      ...estadoActual,
      [name]: value,
    }))
  }

  const manejarEnvio = (evento) => {
    evento.preventDefault()

    const descripcionLimpia = formulario.descripcion.trim()
    const montoNumerico = Number(formulario.monto)

    if (!descripcionLimpia || !formulario.fecha || montoNumerico <= 0) {
      setError('Completa todos los campos con datos validos.')
      return
    }

    onAgregarGasto({
      id: crypto.randomUUID(),
      descripcion: descripcionLimpia,
      monto: montoNumerico,
      categoria: formulario.categoria,
      fecha: formulario.fecha,
    })

    setFormulario(estadoInicial)
    setError('')
  }

  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Seccion A
        </p>
        <h2 className="mt-2 font-['Fraunces'] text-2xl font-semibold text-slate-950">
          Gestion de gastos
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Registra un gasto nuevo para mantener tu panel siempre actualizado.
        </p>
      </div>

      <form className="space-y-4" onSubmit={manejarEnvio}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Descripcion
          </span>
          <input
            type="text"
            name="descripcion"
            value={formulario.descripcion}
            onChange={actualizarCampo}
            placeholder="Ej. Supermercado semanal"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Monto
            </span>
            <input
              type="number"
              name="monto"
              min="0"
              step="0.01"
              value={formulario.monto}
              onChange={actualizarCampo}
              placeholder="0.00"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Categoria
            </span>
            <select
              name="categoria"
              value={formulario.categoria}
              onChange={actualizarCampo}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            >
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Fecha
          </span>
          <input
            type="date"
            name="fecha"
            value={formulario.fecha}
            onChange={actualizarCampo}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </label>

        {error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Anadir gasto
        </button>
      </form>
    </section>
  )
}

export default FormularioGasto
