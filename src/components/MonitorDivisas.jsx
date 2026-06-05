import { useEffect, useRef, useState } from 'react'

function generarCotizaciones() {
  return [
    {
      nombre: 'EUR/USD',
      valor: (1.07 + Math.random() * 0.04).toFixed(4),
      tipo: 'Par de divisas',
    },
    {
      nombre: 'Bitcoin (BTC)',
      valor: (62000 + Math.random() * 9000).toFixed(2),
      tipo: 'Criptoactivo',
    },
    {
      nombre: 'Ethereum (ETH)',
      valor: (2900 + Math.random() * 700).toFixed(2),
      tipo: 'Criptoactivo',
    },
  ]
}

function MonitorDivisas() {
  const [divisas, setDivisas] = useState([])
  const [cargando, setCargando] = useState(true)
  const temporizadorRef = useRef(null)

  const cargarDivisas = (mostrarCarga = true) => {
    if (mostrarCarga) {
      setCargando(true)
    }

    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current)
    }

    temporizadorRef.current = setTimeout(() => {
      setDivisas(generarCotizaciones())
      setCargando(false)
    }, 1000)
  }

  useEffect(() => {
    temporizadorRef.current = setTimeout(() => {
      setDivisas(generarCotizaciones())
      setCargando(false)
    }, 1000)

    return () => {
      if (temporizadorRef.current) {
        clearTimeout(temporizadorRef.current)
      }
    }
  }, [])

  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Seccion C
          </p>
          <h2 className="mt-2 font-['Fraunces'] text-2xl font-semibold text-slate-950">
            Monitor de divisas
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Simulacion de cotizaciones con una carga asincrona de 1 segundo.
          </p>
        </div>

        <button
          type="button"
          onClick={cargarDivisas}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Refrescar
        </button>
      </div>

      {cargando ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
            >
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-3 h-7 w-32 rounded bg-slate-300" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {divisas.map((divisa) => (
            <article
              key={divisa.nombre}
              className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {divisa.tipo}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">
                    {divisa.nombre}
                  </h3>
                </div>
                <p className="text-xl font-semibold text-slate-950">
                  {divisa.nombre === 'EUR/USD' ? divisa.valor : `$${divisa.valor}`}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default MonitorDivisas
