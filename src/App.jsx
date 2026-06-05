import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  BellRing,
  Eye,
  EyeOff,
  Landmark,
  LineChart,
  PiggyBank,
  Printer,
  Ticket,
  Wallet,
} from 'lucide-react'

const CLAVES = {
  transacciones: 'financeflow-pro-transacciones',
  categorias: 'financeflow-pro-categorias',
  inversiones: 'financeflow-pro-inversiones',
  alertas: 'financeflow-pro-alertas',
  privacidad: 'financeflow-pro-privacidad',
  pestana: 'financeflow-pro-pestana',
  filtro: 'financeflow-pro-filtro',
  planificador: 'financeflow-pro-planificador',
}

const MERCADO_BASE = {
  AAPL: { simbolo: 'AAPL', nombre: 'Apple', tipo: 'Accion', precio: 214.28, apertura: 214.28 },
  NVDA: { simbolo: 'NVDA', nombre: 'Nvidia', tipo: 'Accion', precio: 1213.4, apertura: 1213.4 },
  TSLA: { simbolo: 'TSLA', nombre: 'Tesla', tipo: 'Accion', precio: 186.75, apertura: 186.75 },
  BTC: { simbolo: 'BTC', nombre: 'Bitcoin', tipo: 'Cripto', precio: 68420.0, apertura: 68420.0 },
  ETH: { simbolo: 'ETH', nombre: 'Ethereum', tipo: 'Cripto', precio: 3542.15, apertura: 3542.15 },
}

const PLANIFICADOR_INICIAL = {
  aportacionInicial: 5000,
  aportacionMensual: 350,
  anos: 15,
  tasaAnual: 7,
}

function leerStorage(clave, valorInicial) {
  if (typeof window === 'undefined') {
    return valorInicial
  }

  const valorGuardado = window.localStorage.getItem(clave)

  if (!valorGuardado) {
    window.localStorage.setItem(clave, JSON.stringify(valorInicial))
    return valorInicial
  }

  try {
    return JSON.parse(valorGuardado)
  } catch {
    window.localStorage.setItem(clave, JSON.stringify(valorInicial))
    return valorInicial
  }
}

function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
}

function formatearFecha(fecha) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

function formatearPorcentaje(valor) {
  const signo = valor > 0 ? '+' : ''
  return `${signo}${valor.toFixed(2)}%`
}

function generarId() {
  return crypto.randomUUID()
}

function claseBarraPresupuesto(porcentaje) {
  if (porcentaje > 100) {
    return 'bg-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.55)]'
  }

  if (porcentaje > 85) {
    return 'bg-violet-400 shadow-[0_0_16px_rgba(167,139,250,0.5)]'
  }

  return 'bg-violet-500'
}

function claseSuperficiePresupuesto(porcentaje) {
  if (porcentaje > 100) {
    return 'bg-rose-500/10 shadow-[0_0_0_1px_rgba(113,113,122,0.35),0_0_40px_rgba(244,63,94,0.12)]'
  }

  if (porcentaje > 85) {
    return 'shadow-[0_0_0_1px_rgba(113,113,122,0.35),0_0_30px_rgba(139,92,246,0.10)]'
  }

  return 'shadow-[0_0_0_1px_rgba(113,113,122,0.28)]'
}

function obtenerInicioMes(fecha) {
  const inicio = new Date(fecha)
  inicio.setDate(1)
  inicio.setHours(0, 0, 0, 0)
  return inicio
}

function estaEnUltimosDias(fechaIso, dias) {
  const fecha = new Date(fechaIso)
  const limite = new Date()
  limite.setHours(0, 0, 0, 0)
  limite.setDate(limite.getDate() - dias)
  return fecha >= limite
}

function calcularCambioDia(activo) {
  return ((activo.precio - activo.apertura) / activo.apertura) * 100
}

function valorPrivado(texto, isPrivate) {
  return isPrivate ? '••••€' : texto
}

function calcularInteresCompuesto({
  aportacionInicial,
  aportacionMensual,
  anos,
  tasaAnual,
}) {
  const p = aportacionInicial
  const pmt = aportacionMensual
  const t = anos
  const r = tasaAnual / 100
  const n = 12

  if (r === 0) {
    return p + pmt * 12 * t
  }

  const factor = Math.pow(1 + r / n, n * t)
  return p * factor + pmt * ((factor - 1) / (r / n))
}

function App() {
  const [transacciones, setTransacciones] = useState(() =>
    leerStorage(CLAVES.transacciones, []),
  )
  const [categorias, setCategorias] = useState(() => leerStorage(CLAVES.categorias, []))
  const [inversiones, setInversiones] = useState(() => leerStorage(CLAVES.inversiones, []))
  const [alertasPrecio, setAlertasPrecio] = useState(() => leerStorage(CLAVES.alertas, []))
  const [isPrivate, setIsPrivate] = useState(() => leerStorage(CLAVES.privacidad, false))
  const [pestanaActiva, setPestanaActiva] = useState(() =>
    leerStorage(CLAVES.pestana, 'billetera'),
  )
  const [filtroActividad, setFiltroActividad] = useState(() =>
    leerStorage(CLAVES.filtro, 'todo'),
  )
  const [planificador, setPlanificador] = useState(() =>
    leerStorage(CLAVES.planificador, PLANIFICADOR_INICIAL),
  )

  const [mercado, setMercado] = useState(MERCADO_BASE)
  const [toasts, setToasts] = useState([])
  const [sacudirFormulario, setSacudirFormulario] = useState(false)

  const [valorIngreso, setValorIngreso] = useState('')
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [limiteCategoria, setLimiteCategoria] = useState('')
  const [conceptoGasto, setConceptoGasto] = useState('')
  const [importeGasto, setImporteGasto] = useState('')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')

  const [activoSeleccionado, setActivoSeleccionado] = useState('NVDA')
  const [importeInversion, setImporteInversion] = useState('')
  const [tipoOperacion, setTipoOperacion] = useState('compra')
  const [alertaSimbolo, setAlertaSimbolo] = useState('BTC')
  const [alertaObjetivo, setAlertaObjetivo] = useState('')

  const temporizadoresToast = useRef({})
  const alertasDisparadasRef = useRef({})

  useEffect(() => {
    window.localStorage.setItem(CLAVES.transacciones, JSON.stringify(transacciones))
  }, [transacciones])

  useEffect(() => {
    window.localStorage.setItem(CLAVES.categorias, JSON.stringify(categorias))
  }, [categorias])

  useEffect(() => {
    window.localStorage.setItem(CLAVES.inversiones, JSON.stringify(inversiones))
  }, [inversiones])

  useEffect(() => {
    window.localStorage.setItem(CLAVES.alertas, JSON.stringify(alertasPrecio))
  }, [alertasPrecio])

  useEffect(() => {
    window.localStorage.setItem(CLAVES.privacidad, JSON.stringify(isPrivate))
  }, [isPrivate])

  useEffect(() => {
    window.localStorage.setItem(CLAVES.pestana, JSON.stringify(pestanaActiva))
  }, [pestanaActiva])

  useEffect(() => {
    window.localStorage.setItem(CLAVES.filtro, JSON.stringify(filtroActividad))
  }, [filtroActividad])

  useEffect(() => {
    window.localStorage.setItem(CLAVES.planificador, JSON.stringify(planificador))
  }, [planificador])

  useEffect(() => {
    const referenciaTemporizadores = temporizadoresToast

    return () => {
      Object.values(referenciaTemporizadores.current).forEach((temporizador) => {
        clearTimeout(temporizador)
      })
    }
  }, [])

  useEffect(() => {
    const intervalo = setInterval(() => {
      setMercado((estadoActual) => {
        const siguienteEstado = {}

        Object.entries(estadoActual).forEach(([simbolo, activo]) => {
          const variacion = (Math.random() - 0.5) * 0.01
          const nuevoPrecio = Number((activo.precio * (1 + variacion)).toFixed(2))

          siguienteEstado[simbolo] = {
            ...activo,
            precio: nuevoPrecio,
          }
        })

        return siguienteEstado
      })
    }, 3000)

    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    alertasPrecio.forEach((alerta) => {
      const activo = mercado[alerta.simbolo]

      if (!activo) {
        return
      }

      const cruzo = activo.precio >= alerta.objetivo

      if (cruzo && !alertasDisparadasRef.current[alerta.id]) {
        alertasDisparadasRef.current[alerta.id] = true
        const id = generarId()
        setToasts((estadoActual) => [
          ...estadoActual,
          {
            id,
            tipo: 'azul',
            mensaje: `Alerta de precio: ${alerta.simbolo} alcanzo ${formatearMoneda(activo.precio)}.`,
            parpadeante: true,
          },
        ])
        try {
          const AudioContextCompat =
            window.AudioContext || window.webkitAudioContext

          if (AudioContextCompat) {
            const contexto = new AudioContextCompat()
            const oscilador = contexto.createOscillator()
            const ganancia = contexto.createGain()

            oscilador.type = 'triangle'
            oscilador.frequency.setValueAtTime(880, contexto.currentTime)
            oscilador.frequency.exponentialRampToValueAtTime(
              1320,
              contexto.currentTime + 0.15,
            )

            ganancia.gain.setValueAtTime(0.0001, contexto.currentTime)
            ganancia.gain.exponentialRampToValueAtTime(0.05, contexto.currentTime + 0.01)
            ganancia.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + 0.25)

            oscilador.connect(ganancia)
            ganancia.connect(contexto.destination)
            oscilador.start()
            oscilador.stop(contexto.currentTime + 0.25)
          }
        } catch {
          // Silencio intencional si el navegador bloquea audio
        }
        temporizadoresToast.current[id] = setTimeout(() => {
          setToasts((estadoActual) => estadoActual.filter((item) => item.id !== id))
          delete temporizadoresToast.current[id]
        }, 3000)
      }

      if (!cruzo) {
        alertasDisparadasRef.current[alerta.id] = false
      }
    })
  }, [alertasPrecio, mercado])

  const categoriaActiva = useMemo(() => {
    if (categorias.length === 0) {
      return ''
    }

    const existe = categorias.some((categoria) => categoria.id === categoriaSeleccionada)
    return existe ? categoriaSeleccionada : categorias[0].id
  }, [categorias, categoriaSeleccionada])

  const ingresos = useMemo(
    () => transacciones.filter((movimiento) => movimiento.type === 'income'),
    [transacciones],
  )

  const gastos = useMemo(
    () => transacciones.filter((movimiento) => movimiento.type === 'expense'),
    [transacciones],
  )

  const transferenciasAhorro = useMemo(
    () => transacciones.filter((movimiento) => movimiento.type === 'transfer'),
    [transacciones],
  )

  const totalIngresos = useMemo(
    () => ingresos.reduce((acumulado, ingreso) => acumulado + ingreso.amount, 0),
    [ingresos],
  )

  const totalGastos = useMemo(
    () => gastos.reduce((acumulado, gasto) => acumulado + gasto.amount, 0),
    [gastos],
  )

  const totalAhorroAutomatico = useMemo(
    () =>
      ingresos.reduce(
        (acumulado, ingreso) => acumulado + (ingreso.ahorroAutomatico ?? 0),
        0,
      ),
    [ingresos],
  )

  const presupuestoLiquido = useMemo(
    () =>
      ingresos.reduce(
        (acumulado, ingreso) => acumulado + (ingreso.presupuestoLiquido ?? 0),
        0,
      ),
    [ingresos],
  )

  const totalBarridos = useMemo(
    () => transferenciasAhorro.reduce((acumulado, item) => acumulado + item.amount, 0),
    [transferenciasAhorro],
  )

  const compras = useMemo(
    () => inversiones.filter((movimiento) => movimiento.operation === 'buy'),
    [inversiones],
  )

  const ventas = useMemo(
    () => inversiones.filter((movimiento) => movimiento.operation === 'sell'),
    [inversiones],
  )

  const capitalInvertidoNeto = useMemo(
    () =>
      compras.reduce((acumulado, item) => acumulado + item.amount, 0) -
      ventas.reduce((acumulado, item) => acumulado + item.amount, 0),
    [compras, ventas],
  )

  const ahorrosBrutos = totalAhorroAutomatico + totalBarridos
  const ahorrosDisponibles = ahorrosBrutos - capitalInvertidoNeto
  const dineroLiquido = presupuestoLiquido - totalGastos - totalBarridos

  const resumenCategorias = useMemo(
    () =>
      categorias.map((categoria) => {
        const gastosCategoria = gastos.filter((gasto) => gasto.categoryId === categoria.id)
        const gastado = gastosCategoria.reduce(
          (acumulado, gasto) => acumulado + gasto.amount,
          0,
        )
        const porcentaje = categoria.limite > 0 ? (gastado / categoria.limite) * 100 : 0
        const restante = categoria.limite - gastado

        return {
          ...categoria,
          gastado,
          porcentaje,
          restante,
        }
      }),
    [categorias, gastos],
  )

  const insightCaja = useMemo(() => {
    const sumaLimites = categorias.reduce(
      (acumulado, categoria) => acumulado + categoria.limite,
      0,
    )

    if (sumaLimites > presupuestoLiquido && presupuestoLiquido > 0) {
      return {
        tono: 'text-amber-300 border-amber-500/20 bg-amber-500/10',
        mensaje:
          'Alerta: Tus limites configurados superan tus ingresos disponibles de este mes.',
      }
    }

    return {
      tono: 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10',
      mensaje: 'Planificacion eficiente: Tu presupuesto te permitira mantener el control.',
    }
  }, [categorias, presupuestoLiquido])

  const alertaPredictiva = useMemo(() => {
    const haceSieteDias = new Date()
    haceSieteDias.setDate(haceSieteDias.getDate() - 7)

    const candidatos = categorias
      .map((categoria) => {
        const gastosUltimosSieteDias = gastos.filter((gasto) => {
          const fecha = new Date(gasto.date)
          return gasto.categoryId === categoria.id && fecha >= haceSieteDias
        })

        const gastoSieteDias = gastosUltimosSieteDias.reduce(
          (acumulado, gasto) => acumulado + gasto.amount,
          0,
        )

        const gastoTotal = gastos
          .filter((gasto) => gasto.categoryId === categoria.id)
          .reduce((acumulado, gasto) => acumulado + gasto.amount, 0)

        const restante = categoria.limite - gastoTotal
        const gastoDiario = gastoSieteDias / 7

        if (gastoDiario <= 0 || restante <= 0) {
          return null
        }

        const diasRestantes = restante / gastoDiario

        if (diasRestantes >= 5) {
          return null
        }

        return {
          nombre: categoria.nombre,
          dias: diasRestantes,
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.dias - b.dias)

    return candidatos[0] ?? null
  }, [categorias, gastos])

  const activityFeed = useMemo(
    () =>
      [...transacciones].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [transacciones],
  )

  const actividadFiltrada = useMemo(() => {
    if (filtroActividad === 'todo') {
      return activityFeed
    }

    if (filtroActividad === '7dias') {
      return activityFeed.filter((item) => estaEnUltimosDias(item.date, 7))
    }

    const inicioMes = obtenerInicioMes(new Date())
    return activityFeed.filter((item) => new Date(item.date) >= inicioMes)
  }, [activityFeed, filtroActividad])

  const activosMercado = useMemo(
    () =>
      Object.values(mercado).map((activo) => ({
        ...activo,
        cambioDia: calcularCambioDia(activo),
      })),
    [mercado],
  )

  const posiciones = useMemo(() => {
    const agrupado = inversiones.reduce((acumulado, movimiento) => {
      if (!acumulado[movimiento.symbol]) {
        acumulado[movimiento.symbol] = {
          simbolo: movimiento.symbol,
          nombre: movimiento.assetName,
          tipo: movimiento.assetType,
          invertido: 0,
          unidades: 0,
        }
      }

      const signo = movimiento.operation === 'buy' ? 1 : -1
      acumulado[movimiento.symbol].invertido += signo * movimiento.amount
      acumulado[movimiento.symbol].unidades += signo * movementoUnidades(movimiento)
      return acumulado
    }, {})

    return Object.values(agrupado)
      .filter((posicion) => posicion.unidades > 0.0000001)
      .map((posicion) => {
        const activo = mercado[posicion.simbolo]
        const valorActual = activo ? posicion.unidades * activo.precio : posicion.invertido
        const rendimiento = valorActual - posicion.invertido
        const rendimientoPorcentaje =
          posicion.invertido > 0 ? (rendimiento / posicion.invertido) * 100 : 0

        return {
          ...posicion,
          valorActual,
          rendimiento,
          rendimientoPorcentaje,
        }
      })
  }, [inversiones, mercado])

  const valorTotalInversiones = useMemo(
    () => posiciones.reduce((acumulado, posicion) => acumulado + posicion.valorActual, 0),
    [posiciones],
  )

  const rendimientoNeto = useMemo(
    () => posiciones.reduce((acumulado, posicion) => acumulado + posicion.rendimiento, 0),
    [posiciones],
  )

  const resultadoPlanificador = useMemo(
    () => calcularInteresCompuesto(planificador),
    [planificador],
  )

  const seriesPlanificador = useMemo(() => {
    const lista = []

    for (let ano = 1; ano <= planificador.anos; ano += 1) {
      const valor = calcularInteresCompuesto({ ...planificador, anos: ano })
      lista.push({ ano, valor })
    }

    return lista
  }, [planificador])

  const maxSeriePlanificador = useMemo(
    () => Math.max(...seriesPlanificador.map((item) => item.valor), 1),
    [seriesPlanificador],
  )

  function movementoUnidades(movimiento) {
    return movimiento.units ?? 0
  }

  function crearToast(tipo, mensaje, parpadeante = false) {
    const id = generarId()

    setToasts((estadoActual) => [
      ...estadoActual,
      {
        id,
        tipo,
        mensaje,
        parpadeante,
      },
    ])

    if (parpadeante) {
      try {
        const AudioContextCompat =
          window.AudioContext || window.webkitAudioContext

        if (AudioContextCompat) {
          const contexto = new AudioContextCompat()
          const oscilador = contexto.createOscillator()
          const ganancia = contexto.createGain()

          oscilador.type = 'triangle'
          oscilador.frequency.setValueAtTime(880, contexto.currentTime)
          oscilador.frequency.exponentialRampToValueAtTime(
            1320,
            contexto.currentTime + 0.15,
          )

          ganancia.gain.setValueAtTime(0.0001, contexto.currentTime)
          ganancia.gain.exponentialRampToValueAtTime(0.05, contexto.currentTime + 0.01)
          ganancia.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + 0.25)

          oscilador.connect(ganancia)
          ganancia.connect(contexto.destination)
          oscilador.start()
          oscilador.stop(contexto.currentTime + 0.25)
        }
      } catch {
        // Silencio intencional si el navegador bloquea audio
      }
    }

    temporizadoresToast.current[id] = setTimeout(() => {
      setToasts((estadoActual) => estadoActual.filter((item) => item.id !== id))
      delete temporizadoresToast.current[id]
    }, 3000)
  }

  function dispararSacudida() {
    setSacudirFormulario(true)
    setTimeout(() => {
      setSacudirFormulario(false)
    }, 420)
  }

  function crearTransaccion(payload) {
    setTransacciones((estadoActual) => [
      {
        id: generarId(),
        date: new Date().toISOString(),
        ...payload,
      },
      ...estadoActual,
    ])
  }

  function manejarIngreso(evento) {
    evento.preventDefault()
    const monto = Number(valorIngreso)

    if (monto <= 0) {
      return
    }

    const ahorroAutomatico = monto * 0.5
    const presupuestoDisponible = monto - ahorroAutomatico

    crearTransaccion({
      type: 'income',
      title: 'Ingreso mensual',
      amount: monto,
      ahorroAutomatico,
      presupuestoLiquido: presupuestoDisponible,
    })

    crearToast(
      'violeta',
      `${formatearMoneda(monto)} anadidos, 50% enviado a ahorros.`,
    )
    setValorIngreso('')
  }

  function manejarCategoria(evento) {
    evento.preventDefault()
    const nombre = nombreCategoria.trim()
    const limite = Number(limiteCategoria)

    if (!nombre || limite <= 0) {
      return
    }

    const duplicada = categorias.some(
      (categoria) => categoria.nombre.toLowerCase() === nombre.toLowerCase(),
    )

    if (duplicada) {
      return
    }

    const nuevaCategoria = {
      id: generarId(),
      nombre,
      limite,
    }

    setCategorias((estadoActual) => [...estadoActual, nuevaCategoria])
    setCategoriaSeleccionada(nuevaCategoria.id)
    setNombreCategoria('')
    setLimiteCategoria('')
  }

  function manejarGasto(evento) {
    evento.preventDefault()
    const descripcion = conceptoGasto.trim()
    const monto = Number(importeGasto)

    if (!descripcion || !categoriaActiva || monto <= 0) {
      return
    }

    const categoria = resumenCategorias.find((item) => item.id === categoriaActiva)

    if (!categoria) {
      return
    }

    const exceso = monto - Math.max(categoria.restante, 0)

    crearTransaccion({
      type: 'expense',
      title: descripcion,
      amount: monto,
      categoryId: categoria.id,
      categoryName: categoria.nombre,
    })

    if (exceso > 0) {
      dispararSacudida()
      crearToast(
        'rojo',
        `Cuidado: has superado el presupuesto de ${categoria.nombre} por ${formatearMoneda(exceso)}.`,
      )
    }

    setConceptoGasto('')
    setImporteGasto('')
  }

  function cerrarMes() {
    if (dineroLiquido <= 0) {
      return
    }

    crearTransaccion({
      type: 'transfer',
      title: 'Barrido a caja de ahorros',
      amount: dineroLiquido,
    })

    crearToast(
      'violeta',
      `${formatearMoneda(dineroLiquido)} transferidos a tu caja de ahorros.`,
    )
  }

  function manejarAlertaPrecio(evento) {
    evento.preventDefault()
    const objetivo = Number(alertaObjetivo)

    if (!alertaSimbolo || objetivo <= 0) {
      return
    }

    setAlertasPrecio((estadoActual) => [
      ...estadoActual,
      {
        id: generarId(),
        simbolo: alertaSimbolo,
        objetivo,
      },
    ])

    setAlertaObjetivo('')
  }

  function manejarOperacionInversion(evento) {
    evento.preventDefault()
    const monto = Number(importeInversion)
    const activo = mercado[activoSeleccionado]

    if (!activo || monto <= 0) {
      return
    }

    if (tipoOperacion === 'compra' && monto > ahorrosDisponibles) {
      crearToast(
        'rojo',
        `Saldo insuficiente: necesitas ${formatearMoneda(monto - ahorrosDisponibles)} adicionales en ahorros.`,
      )
      return
    }

    const posicionActual = posiciones.find((item) => item.simbolo === activo.simbolo)

    if (tipoOperacion === 'venta') {
      if (!posicionActual || monto > posicionActual.valorActual) {
        crearToast('rojo', `No tienes suficiente posicion disponible en ${activo.simbolo}.`)
        return
      }
    }

    const unidades = monto / activo.precio

    setInversiones((estadoActual) => [
      {
        id: generarId(),
        symbol: activo.simbolo,
        assetName: activo.nombre,
        assetType: activo.tipo,
        amount: monto,
        units: unidades,
        operation: tipoOperacion === 'compra' ? 'buy' : 'sell',
        price: activo.precio,
        date: new Date().toISOString(),
      },
      ...estadoActual,
    ])

    crearTransaccion({
      type: 'investment',
      title: `${tipoOperacion === 'compra' ? 'Compra' : 'Venta'} ${activo.simbolo}`,
      amount: monto,
      symbol: activo.simbolo,
      operation: tipoOperacion,
    })

    crearToast(
      'azul',
      `${tipoOperacion === 'compra' ? 'Compra' : 'Venta'} ejecutada en ${activo.simbolo} por ${formatearMoneda(monto)}.`,
    )
    setImporteInversion('')
  }

  function iconoActividad(tipo) {
    if (tipo === 'income') {
      return <ArrowUpRight className="h-4 w-4 text-emerald-400" />
    }

    if (tipo === 'expense') {
      return <Ticket className="h-4 w-4 text-zinc-100" />
    }

    if (tipo === 'investment') {
      return <LineChart className="h-4 w-4 text-sky-400" />
    }

    return <Landmark className="h-4 w-4 text-violet-400" />
  }

  function tonoActividad(item) {
    if (item.type === 'income') {
      return 'text-emerald-400'
    }

    if (item.type === 'investment') {
      return 'text-sky-400'
    }

    if (item.type === 'transfer') {
      return 'text-violet-400'
    }

    return 'text-zinc-100'
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 print:bg-white print:text-black">
      <style>{`
        @keyframes aparecerSuave {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sacudir {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }

        @keyframes parpadear {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        .animar-salida {
          animation: aparecerSuave 0.45s ease-out both;
        }

        .animar-sacudida {
          animation: sacudir 0.42s ease-in-out;
        }

        .animar-parpadeo {
          animation: parpadear 0.9s ease-in-out infinite;
        }

        @media print {
          body {
            background: white !important;
          }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden print:hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-emerald-400/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              FinanceFlow Pro
            </p>
            <h1 className="mt-2 text-lg font-medium text-zinc-100">
              Ecosistema financiero total
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <nav className="flex rounded-2xl border border-zinc-800 bg-zinc-900/50 p-1 backdrop-blur-xl">
              {[
                { id: 'billetera', etiqueta: 'Billetera', icono: Wallet },
                { id: 'inversiones', etiqueta: 'Inversiones', icono: LineChart },
                { id: 'planificador', etiqueta: 'Planificador', icono: PiggyBank },
              ].map((pestana) => {
                const IconoPestana = pestana.icono

                return (
                  <button
                    key={pestana.id}
                    type="button"
                    onClick={() => setPestanaActiva(pestana.id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      pestanaActiva === pestana.id
                        ? 'bg-violet-500 text-white'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    <IconoPestana className="h-4 w-4" />
                    {pestana.etiqueta}
                  </button>
                )
              })}
            </nav>

            <button
              type="button"
              onClick={() => setIsPrivate((estadoActual) => !estadoActual)}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:border-violet-500 hover:text-violet-300"
            >
              <span className="flex items-center gap-2">
                {isPrivate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Modo incognito
              </span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:border-violet-500 hover:text-violet-300"
            >
              <span className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Exportar PDF
              </span>
            </button>
          </div>
        </header>

        {pestanaActiva === 'billetera' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <aside
              className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-xl print:hidden lg:sticky lg:top-6 lg:col-span-4 lg:h-[calc(100vh-8rem)] lg:overflow-auto"
              style={{ animation: 'aparecerSuave 0.45s ease-out both' }}
            >
              <div className="space-y-5">
                <div className="border-b border-zinc-800 pb-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                    Control
                  </p>
                </div>

                <form onSubmit={manejarIngreso} className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400">
                    Ingreso
                  </p>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={valorIngreso}
                    onChange={(evento) => setValorIngreso(evento.target.value)}
                    placeholder="Anadir ingreso mensual"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-violet-500 focus:bg-zinc-900"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-violet-400"
                  >
                    Guardar ingreso
                  </button>
                </form>

                <form onSubmit={manejarCategoria} className="space-y-3 border-t border-zinc-800 pt-5">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
                    Categoria
                  </p>
                  <input
                    type="text"
                    value={nombreCategoria}
                    onChange={(evento) => setNombreCategoria(evento.target.value)}
                    placeholder="Nombre de categoria"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-violet-500 focus:bg-zinc-900"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={limiteCategoria}
                    onChange={(evento) => setLimiteCategoria(evento.target.value)}
                    placeholder="Limite mensual en EUR"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-violet-500 focus:bg-zinc-900"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-100 transition-all duration-300 hover:border-violet-500 hover:text-violet-300"
                  >
                    Crear categoria
                  </button>
                </form>

                <form
                  onSubmit={manejarGasto}
                  className={`space-y-3 border-t border-zinc-800 pt-5 ${sacudirFormulario ? 'animar-sacudida' : ''}`}
                >
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
                    Gasto
                  </p>
                  <input
                    type="text"
                    value={conceptoGasto}
                    onChange={(evento) => setConceptoGasto(evento.target.value)}
                    placeholder="Concepto del gasto"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-violet-500 focus:bg-zinc-900"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={importeGasto}
                    onChange={(evento) => setImporteGasto(evento.target.value)}
                    placeholder="Importe en EUR"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-violet-500 focus:bg-zinc-900"
                  />
                  <select
                    value={categoriaActiva}
                    onChange={(evento) => setCategoriaSeleccionada(evento.target.value)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none transition-all duration-300 focus:border-violet-500 focus:bg-zinc-900"
                  >
                    {categorias.length === 0 ? (
                      <option value="">Sin categorias</option>
                    ) : (
                      categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))
                    )}
                  </select>
                  <button
                    type="submit"
                    disabled={categorias.length === 0}
                    className="w-full rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                  >
                    Registrar gasto
                  </button>
                </form>
              </div>
            </aside>

            <section
              className="space-y-6 lg:col-span-5"
              style={{ animation: 'aparecerSuave 0.55s ease-out both' }}
            >
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-xl print:border-zinc-300 print:bg-white">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Caja de ahorros
                    </p>
                    <h2 className="mt-2 text-sm font-medium text-zinc-100 print:text-black">
                      Regla del 50%
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={cerrarMes}
                    disabled={dineroLiquido <= 0}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm font-medium text-zinc-100 transition-all duration-300 hover:border-violet-500 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-40 print:hidden"
                  >
                    Cerrar mes
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 print:border-zinc-300 print:bg-white">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Dinero liquido
                    </p>
                    <p className={`mt-4 break-words font-mono text-4xl font-semibold text-zinc-50 print:text-black ${isPrivate ? 'blur-md select-none' : ''}`}>
                      {valorPrivado(formatearMoneda(dineroLiquido), isPrivate)}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 print:border-zinc-300 print:bg-white">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Fondos en ahorros
                    </p>
                    <p className={`mt-4 break-words font-mono text-4xl font-semibold text-emerald-400 print:text-black ${isPrivate ? 'blur-md select-none' : ''}`}>
                      {valorPrivado(formatearMoneda(ahorrosDisponibles), isPrivate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl border p-4 text-sm ${insightCaja.tono} print:border-zinc-300 print:bg-white print:text-black`}>
                {insightCaja.mensaje}
              </div>

              {alertaPredictiva ? (
                <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200 print:border-zinc-300 print:bg-white print:text-black">
                  Al ritmo actual, agotaras el presupuesto de {alertaPredictiva.nombre} en{' '}
                  {alertaPredictiva.dias.toFixed(1)} dias.
                </div>
              ) : null}

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                    Presupuestos
                  </p>
                  <p className="text-xs text-zinc-600">
                    {categorias.length} {categorias.length === 1 ? 'categoria' : 'categorias'}
                  </p>
                </div>

                {resumenCategorias.length === 0 ? (
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-500 backdrop-blur-xl print:border-zinc-300 print:bg-white">
                    Sin categorias todavia
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {resumenCategorias.map((categoria, indice) => {
                      const porcentajeVisible = Math.min(categoria.porcentaje, 100)

                      return (
                        <article
                          key={categoria.id}
                          className={`rounded-3xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900/80 print:border-zinc-300 print:bg-white ${claseSuperficiePresupuesto(categoria.porcentaje)}`}
                          style={{
                            animation: 'aparecerSuave 0.45s ease-out both',
                            animationDelay: `${indice * 60}ms`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="truncate text-sm font-medium text-zinc-200 print:text-black">
                              {categoria.nombre}
                            </p>
                            <p className="shrink-0 font-mono text-xs text-zinc-500">
                              {categoria.porcentaje.toFixed(0)}%
                            </p>
                          </div>

                          <p className={`mt-5 break-words font-mono text-2xl font-semibold text-zinc-50 print:text-black ${isPrivate ? 'blur-md select-none' : ''}`}>
                            {valorPrivado(formatearMoneda(categoria.gastado), isPrivate)}
                          </p>
                          <p className={`mt-1 truncate font-mono text-xs text-zinc-500 ${isPrivate ? 'blur-md select-none' : ''}`}>
                            {isPrivate
                              ? '••••€ / ••••€'
                              : `/ ${formatearMoneda(categoria.limite)}`}
                          </p>

                          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-zinc-800 print:bg-zinc-200">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${claseBarraPresupuesto(categoria.porcentaje)}`}
                              style={{ width: `${porcentajeVisible}%` }}
                            />
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>

            <section
              className="space-y-6 lg:col-span-3"
              style={{ animation: 'aparecerSuave 0.65s ease-out both' }}
            >
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-xl print:border-zinc-300 print:bg-white">
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                  Balance
                </p>
                <p className={`mt-4 break-words font-mono text-5xl font-semibold tracking-tight text-zinc-50 print:text-black ${isPrivate ? 'blur-md select-none' : ''}`}>
                  {valorPrivado(formatearMoneda(dineroLiquido), isPrivate)}
                </p>

                <div className="mt-8 space-y-4 border-t border-zinc-800 pt-4 print:border-zinc-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Ingresos
                    </span>
                    <span className={`truncate font-mono text-sm font-semibold text-emerald-400 print:text-black ${isPrivate ? 'blur-md select-none' : ''}`}>
                      {valorPrivado(formatearMoneda(totalIngresos), isPrivate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Gastos
                    </span>
                    <span className={`truncate font-mono text-sm font-semibold text-zinc-200 print:text-black ${isPrivate ? 'blur-md select-none' : ''}`}>
                      {valorPrivado(formatearMoneda(totalGastos), isPrivate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Ahorros
                    </span>
                    <span className={`truncate font-mono text-sm font-semibold text-emerald-400 print:text-black ${isPrivate ? 'blur-md select-none' : ''}`}>
                      {valorPrivado(formatearMoneda(ahorrosDisponibles), isPrivate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-xl print:border-zinc-300 print:bg-white">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                    Activity Feed
                  </p>
                  <p className="text-xs text-zinc-600">{actividadFiltrada.length}</p>
                </div>

                <div className="mb-4 flex gap-2 print:hidden">
                  {[
                    { id: 'mes', etiqueta: 'Este mes' },
                    { id: '7dias', etiqueta: 'Ultimos 7 dias' },
                    { id: 'todo', etiqueta: 'Todo' },
                  ].map((opcion) => (
                    <button
                      key={opcion.id}
                      type="button"
                      onClick={() => setFiltroActividad(opcion.id)}
                      className={`rounded-full px-3 py-2 text-xs font-medium transition-all duration-300 ${
                        filtroActividad === opcion.id
                          ? 'bg-violet-500 text-white'
                          : 'border border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      {opcion.etiqueta}
                    </button>
                  ))}
                </div>

                {actividadFiltrada.length === 0 ? (
                  <div className="py-6 text-sm text-zinc-500">Sin actividad</div>
                ) : (
                  <div className="space-y-1">
                    {actividadFiltrada.map((item, indice) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 border-b border-zinc-800/80 py-3 last:border-b-0 print:border-zinc-200"
                        style={{
                          animation: 'aparecerSuave 0.35s ease-out both',
                          animationDelay: `${indice * 35}ms`,
                        }}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 print:bg-zinc-200">
                          {iconoActividad(item.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-100 print:text-black">
                            {item.title}
                          </p>
                          <p className="truncate text-[11px] text-zinc-500">
                            {formatearFecha(item.date)}
                          </p>
                        </div>

                        <p className={`shrink-0 truncate font-mono text-sm font-semibold print:text-black ${tonoActividad(item)} ${isPrivate ? 'blur-md select-none' : ''}`}>
                          {item.type === 'expense'
                            ? `-${valorPrivado(formatearMoneda(item.amount), isPrivate)}`
                            : `+${valorPrivado(formatearMoneda(item.amount), isPrivate)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : null}

        {pestanaActiva === 'inversiones' ? (
          <div
            className="grid grid-cols-1 gap-6 lg:grid-cols-12"
            style={{ animation: 'aparecerSuave 0.45s ease-out both' }}
          >
            <section className="space-y-6 lg:col-span-8">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-xl">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                      Valor total de inversiones
                    </p>
                    <p className={`mt-3 break-words font-mono text-5xl font-semibold tracking-tight text-zinc-50 ${isPrivate ? 'blur-md select-none' : ''}`}>
                      {valorPrivado(formatearMoneda(valorTotalInversiones), isPrivate)}
                    </p>
                    <p className={`mt-3 font-mono text-sm ${rendimientoNeto >= 0 ? 'text-emerald-400' : 'text-rose-400'} ${isPrivate ? 'blur-md select-none' : ''}`}>
                      Rendimiento neto: {rendimientoNeto >= 0 ? '+' : ''}
                      {valorPrivado(formatearMoneda(rendimientoNeto), isPrivate)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                        Ahorros disponibles
                      </p>
                      <p className={`mt-3 break-words font-mono text-2xl font-semibold text-emerald-400 ${isPrivate ? 'blur-md select-none' : ''}`}>
                        {valorPrivado(formatearMoneda(ahorrosDisponibles), isPrivate)}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                        Capital invertido
                      </p>
                      <p className={`mt-3 break-words font-mono text-2xl font-semibold text-zinc-50 ${isPrivate ? 'blur-md select-none' : ''}`}>
                        {valorPrivado(formatearMoneda(capitalInvertidoNeto), isPrivate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                    Mercado en tiempo real
                  </p>
                  <p className="text-xs text-zinc-600">Actualiza cada 3s</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {activosMercado.map((activo) => (
                    <article
                      key={activo.simbolo}
                      className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="truncate text-sm font-medium text-zinc-100">
                            {activo.nombre}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                            {activo.simbolo} · {activo.tipo}
                          </p>
                        </div>
                        <p className={`font-mono text-sm ${activo.cambioDia >= 0 ? 'text-emerald-400' : 'text-rose-400'} ${isPrivate ? 'blur-md select-none' : ''}`}>
                          {isPrivate ? '••••%' : formatearPorcentaje(activo.cambioDia)}
                        </p>
                      </div>

                      <p className={`mt-6 break-words font-mono text-3xl font-semibold text-zinc-50 ${isPrivate ? 'blur-md select-none' : ''}`}>
                        {valorPrivado(formatearMoneda(activo.precio), isPrivate)}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                    Portafolio
                  </p>
                  <p className="text-xs text-zinc-600">{posiciones.length}</p>
                </div>

                {posiciones.length === 0 ? (
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 text-sm text-zinc-500">
                    Sin posiciones abiertas
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {posiciones.map((posicion) => (
                      <article
                        key={posicion.simbolo}
                        className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="truncate text-sm font-medium text-zinc-100">
                              {posicion.nombre}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                              {posicion.simbolo}
                            </p>
                          </div>
                          <p className={`font-mono text-sm ${posicion.rendimiento >= 0 ? 'text-emerald-400' : 'text-rose-400'} ${isPrivate ? 'blur-md select-none' : ''}`}>
                            {isPrivate
                              ? '••••%'
                              : `${posicion.rendimiento >= 0 ? '+' : ''}${formatearPorcentaje(posicion.rendimientoPorcentaje)}`}
                          </p>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                              Invertido
                            </p>
                            <p className={`mt-2 break-words font-mono text-lg font-semibold text-zinc-50 ${isPrivate ? 'blur-md select-none' : ''}`}>
                              {valorPrivado(formatearMoneda(posicion.invertido), isPrivate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                              Valor actual
                            </p>
                            <p className={`mt-2 break-words font-mono text-lg font-semibold text-zinc-50 ${isPrivate ? 'blur-md select-none' : ''}`}>
                              {valorPrivado(formatearMoneda(posicion.valorActual), isPrivate)}
                            </p>
                          </div>
                        </div>

                        <p className={`mt-4 break-words font-mono text-sm ${posicion.rendimiento >= 0 ? 'text-emerald-400' : 'text-rose-400'} ${isPrivate ? 'blur-md select-none' : ''}`}>
                          {posicion.rendimiento >= 0 ? 'Ganancia' : 'Perdida'}:{' '}
                          {valorPrivado(formatearMoneda(posicion.rendimiento), isPrivate)}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-6 lg:col-span-4">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-xl">
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                  Broker
                </p>

                <form onSubmit={manejarOperacionInversion} className="mt-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoOperacion('compra')}
                      className={`rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                        tipoOperacion === 'compra'
                          ? 'bg-violet-500 text-white'
                          : 'border border-zinc-800 bg-zinc-950/60 text-zinc-400'
                      }`}
                    >
                      Comprar
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoOperacion('venta')}
                      className={`rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                        tipoOperacion === 'venta'
                          ? 'bg-sky-500 text-white'
                          : 'border border-zinc-800 bg-zinc-950/60 text-zinc-400'
                      }`}
                    >
                      Vender
                    </button>
                  </div>

                  <select
                    value={activoSeleccionado}
                    onChange={(evento) => setActivoSeleccionado(evento.target.value)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none transition-all duration-300 focus:border-violet-500 focus:bg-zinc-900"
                  >
                    {activosMercado.map((activo) => (
                      <option key={activo.simbolo} value={activo.simbolo}>
                        {activo.simbolo} - {activo.nombre}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={importeInversion}
                    onChange={(evento) => setImporteInversion(evento.target.value)}
                    placeholder="Cantidad en EUR"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-violet-500 focus:bg-zinc-900"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-violet-400"
                  >
                    {tipoOperacion === 'compra' ? 'Invertir' : 'Vender'}
                  </button>
                </form>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                    Alertas de precio
                  </p>
                  <BellRing className="h-4 w-4 text-violet-400" />
                </div>

                <form onSubmit={manejarAlertaPrecio} className="space-y-3">
                  <select
                    value={alertaSimbolo}
                    onChange={(evento) => setAlertaSimbolo(evento.target.value)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none transition-all duration-300 focus:border-violet-500 focus:bg-zinc-900"
                  >
                    {activosMercado.map((activo) => (
                      <option key={activo.simbolo} value={activo.simbolo}>
                        {activo.simbolo}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={alertaObjetivo}
                    onChange={(evento) => setAlertaObjetivo(evento.target.value)}
                    placeholder="Precio objetivo"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-violet-500 focus:bg-zinc-900"
                  />

                  <button
                    type="submit"
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm font-semibold text-zinc-100 transition-all duration-300 hover:border-violet-500 hover:text-violet-300"
                  >
                    Guardar alerta
                  </button>
                </form>

                <div className="mt-4 space-y-2">
                  {alertasPrecio.length === 0 ? (
                    <p className="text-sm text-zinc-500">Sin alertas activas</p>
                  ) : (
                    alertasPrecio.map((alerta) => (
                      <div
                        key={alerta.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/50 px-3 py-2"
                      >
                        <p className="text-sm text-zinc-100">
                          {alerta.simbolo}
                        </p>
                        <p className={`font-mono text-sm text-zinc-400 ${isPrivate ? 'blur-md select-none' : ''}`}>
                          {valorPrivado(formatearMoneda(alerta.objetivo), isPrivate)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        ) : null}

        {pestanaActiva === 'planificador' ? (
          <div
            className="grid grid-cols-1 gap-6 lg:grid-cols-12"
            style={{ animation: 'aparecerSuave 0.45s ease-out both' }}
          >
            <section className="space-y-6 lg:col-span-4">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-xl">
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                  Simulador
                </p>

                <div className="mt-5 space-y-5">
                  {[
                    {
                      clave: 'aportacionInicial',
                      etiqueta: 'Aportacion inicial',
                      minimo: 0,
                      maximo: 100000,
                      paso: 500,
                    },
                    {
                      clave: 'aportacionMensual',
                      etiqueta: 'Aportacion mensual',
                      minimo: 0,
                      maximo: 5000,
                      paso: 50,
                    },
                    {
                      clave: 'anos',
                      etiqueta: 'Anos',
                      minimo: 1,
                      maximo: 40,
                      paso: 1,
                    },
                    {
                      clave: 'tasaAnual',
                      etiqueta: 'Tasa anual (%)',
                      minimo: 1,
                      maximo: 20,
                      paso: 0.5,
                    },
                  ].map((campo) => (
                    <label key={campo.clave} className="block">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm text-zinc-300">{campo.etiqueta}</span>
                        <span className={`font-mono text-sm text-zinc-100 ${isPrivate ? 'blur-md select-none' : ''}`}>
                          {campo.clave === 'anos'
                            ? planificador[campo.clave]
                            : valorPrivado(
                                campo.clave === 'tasaAnual'
                                  ? `${planificador[campo.clave]}%`
                                  : formatearMoneda(planificador[campo.clave]),
                                isPrivate,
                              )}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={campo.minimo}
                        max={campo.maximo}
                        step={campo.paso}
                        value={planificador[campo.clave]}
                        onChange={(evento) =>
                          setPlanificador((estadoActual) => ({
                            ...estadoActual,
                            [campo.clave]: Number(evento.target.value),
                          }))
                        }
                        className="w-full accent-violet-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-6 lg:col-span-8">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-xl">
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                  Resultado final
                </p>
                <p className={`mt-4 break-words font-mono text-5xl font-semibold tracking-tight text-emerald-400 ${isPrivate ? 'blur-md select-none' : ''}`}>
                  {valorPrivado(formatearMoneda(resultadoPlanificador), isPrivate)}
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                    Proyeccion anual
                  </p>
                  <p className="text-xs text-zinc-600">{planificador.anos} anos</p>
                </div>

                <div className="space-y-3">
                  {seriesPlanificador.map((item) => (
                    <div key={item.ano} className="grid grid-cols-[48px_1fr_120px] items-center gap-3">
                      <p className="text-xs text-zinc-500">Ano {item.ano}</p>
                      <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,_#8b5cf6_0%,_#34d399_100%)] transition-all duration-300"
                          style={{ width: `${(item.valor / maxSeriePlanificador) * 100}%` }}
                        />
                      </div>
                      <p className={`truncate text-right font-mono text-sm text-zinc-100 ${isPrivate ? 'blur-md select-none' : ''}`}>
                        {valorPrivado(formatearMoneda(item.valor), isPrivate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3 px-4 print:hidden">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl animar-salida ${
              toast.parpadeante ? 'animar-parpadeo' : ''
            } ${
              toast.tipo === 'rojo'
                ? 'border-rose-500/30 bg-rose-500/15 text-rose-100'
                : toast.tipo === 'azul'
                  ? 'border-sky-500/30 bg-sky-500/15 text-sky-100'
                  : 'border-violet-500/30 bg-violet-500/15 text-violet-100'
            }`}
          >
            {toast.mensaje}
          </div>
        ))}
      </div>
    </main>
  )
}

export default App
