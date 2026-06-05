import { useEffect, useState } from 'react'
import FormularioGasto from './components/FormularioGasto'
import ListaGastos from './components/ListaGastos'
import ResumenMetricas from './components/ResumenMetricas'
import MonitorDivisas from './components/MonitorDivisas'

const CLAVE_GASTOS = 'financeflow-gastos'

function obtenerGastosIniciales() {
  if (typeof window === 'undefined') {
    return []
  }

  const gastosGuardados = window.localStorage.getItem(CLAVE_GASTOS)

  if (!gastosGuardados) {
    window.localStorage.setItem(CLAVE_GASTOS, JSON.stringify([]))
    return []
  }

  try {
    return JSON.parse(gastosGuardados)
  } catch {
    window.localStorage.setItem(CLAVE_GASTOS, JSON.stringify([]))
    return []
  }
}

function App() {
  const [gastos, setGastos] = useState(obtenerGastosIniciales)

  useEffect(() => {
    window.localStorage.setItem(CLAVE_GASTOS, JSON.stringify(gastos))
  }, [gastos])

  const agregarGasto = (nuevoGasto) => {
    setGastos((gastosActuales) => [nuevoGasto, ...gastosActuales])
  }

  const eliminarGasto = (idGasto) => {
    setGastos((gastosActuales) =>
      gastosActuales.filter((gasto) => gasto.id !== idGasto),
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur xl:p-8">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[linear-gradient(135deg,_rgba(15,23,42,0)_0%,_rgba(30,41,59,0.08)_100%)] md:block" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-slate-300/80 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600">
                FinanceFlow
              </span>
              <h1 className="mt-4 font-['Fraunces'] text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Dashboard personal de control financiero
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Registra tus gastos, entiende en que categorias se mueve tu
                dinero y sigue una referencia simple del mercado de divisas y
                cripto en una sola vista.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Enfoque
                </p>
                <p className="mt-2 text-sm font-medium">Control diario</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Persistencia
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  LocalStorage
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Vista
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  Una sola pagina
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-1">
            <FormularioGasto onAgregarGasto={agregarGasto} />
            <MonitorDivisas />
          </div>

          <div className="space-y-6 md:col-span-2">
            <ResumenMetricas gastos={gastos} />
            <ListaGastos gastos={gastos} onEliminarGasto={eliminarGasto} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
