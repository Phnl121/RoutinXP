import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// Método pomodoro da página Foco.
// O relógio guarda a hora de término, não uma contagem: não atrasa com a aba em segundo plano
// e sobrevive a recarregar a página. O estado fica no navegador (uma chave por usuário) e as
// abas abertas se acompanham pelo evento `storage`.

export const MINUTO = 60000
export const CONFIG_PADRAO = { foco: 25, pausa: 5, pausaLonga: 15, ciclos: 4 }
export const ATALHOS = [
  { id: '25-5', foco: 25, pausa: 5, pausaLonga: 15, ciclos: 4 },
  { id: '50-10', foco: 50, pausa: 10, pausaLonga: 20, ciclos: 3 },
]
export const LIMITES = { foco: [5, 120], pausa: [1, 30], pausaLonga: [5, 60], ciclos: [2, 8] }

const ESTADO_INICIAL = {
  config: CONFIG_PADRAO,
  tarefaIds: [],
  fase: 'parado', // 'parado' | 'foco' | 'pausa' | 'pausaLonga'
  ciclo: 1,
  rodando: false,
  fimEm: null, // ms: hora de término da fase, quando rodando
  restante: null, // ms: tempo que falta, quando pausado
  blocoId: null, // id do bloco de foco atual (vira a chave da linha no banco)
}

export const duracao = (config, fase) =>
  (fase === 'pausa' ? config.pausa : fase === 'pausaLonga' ? config.pausaLonga : config.foco) * MINUTO

const ATALHOS_CAMPOS = ['foco', 'pausa', 'pausaLonga', 'ciclos']
export const atalhoDe = (config) => ATALHOS.find((a) => ATALHOS_CAMPOS.every((c) => a[c] === config[c]))?.id ?? 'personalizado'

// Minutos dentro dos limites (campo vazio ou fora do intervalo volta ao limite mais próximo).
export function ajustarConfig(config) {
  return Object.fromEntries(
    ATALHOS_CAMPOS.map((campo) => {
      const [min, max] = LIMITES[campo]
      const n = Math.round(Number(config[campo]))
      return [campo, Number.isFinite(n) ? Math.min(Math.max(n, min), max) : CONFIG_PADRAO[campo]]
    }),
  )
}

// Tempo que falta na fase, em ms.
export function restanteDe(estado, agora) {
  if (estado.rodando) return Math.max(estado.fimEm - agora, 0)
  return estado.restante ?? duracao(estado.config, estado.fase === 'parado' ? 'foco' : estado.fase)
}

// Próxima pausa depois do foco de número `ciclo`: a longa fecha cada rodada de ciclos.
const pausaDepois = (estado) => (estado.ciclo % estado.config.ciclos === 0 ? 'pausaLonga' : 'pausa')

// Avança as fases que já venceram. Devolve o novo estado, os focos completos (para registrar)
// e as trocas de fase (para o aviso). A pausa começa sozinha; o foco seguinte espera o Iniciar.
export function avancar(estado, agora) {
  let e = estado
  const focos = []
  const trocas = []
  while (e.rodando && e.fimEm <= agora) {
    if (e.fase === 'foco') {
      focos.push({ id: e.blocoId, minutos: e.config.foco })
      const fase = pausaDepois(e)
      trocas.push(fase)
      e = { ...e, fase, fimEm: e.fimEm + duracao(e.config, fase), restante: null, blocoId: null }
    } else {
      const ciclo = e.fase === 'pausaLonga' ? 1 : e.ciclo + 1
      trocas.push('foco')
      e = { ...e, fase: 'foco', ciclo, rodando: false, fimEm: null, restante: duracao(e.config, 'foco'), blocoId: null }
    }
  }
  return { estado: e, focos, trocas }
}

function ler(chave) {
  try {
    const salvo = JSON.parse(localStorage.getItem(chave))
    if (salvo && typeof salvo === 'object') return { ...ESTADO_INICIAL, ...salvo, config: ajustarConfig({ ...CONFIG_PADRAO, ...salvo.config }) }
  } catch {
    /* sem armazenamento ou valor inválido: começa do zero */
  }
  return ESTADO_INICIAL
}

function gravar(chave, estado) {
  try {
    localStorage.setItem(chave, JSON.stringify(estado))
  } catch {
    /* sem armazenamento: vale só nesta aba */
  }
}

// ---------- Aviso de fim de fase: som curto, vibração e notificação ----------

let audio = null

// Chamado num clique (Iniciar): o navegador só libera áudio depois de um gesto do usuário.
export function prepararAviso() {
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') audio.resume()
  } catch {
    audio = null
  }
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
}

function tocarSom() {
  if (!audio) return
  const inicio = audio.currentTime
  // Dois toques curtos, do grave para o agudo.
  ;[523.25, 783.99].forEach((freq, i) => {
    const osc = audio.createOscillator()
    const volume = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t0 = inicio + i * 0.22
    volume.gain.setValueAtTime(0.0001, t0)
    volume.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02)
    volume.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5)
    osc.connect(volume).connect(audio.destination)
    osc.start(t0)
    osc.stop(t0 + 0.55)
  })
}

async function notificar(titulo, corpo) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const opcoes = { body: corpo, icon: '/marca/routinxp-icone.svg', tag: 'routinxp-foco' }
  try {
    // No celular só o service worker mostra notificação; no computador as duas formas servem.
    const registro = await navigator.serviceWorker?.getRegistration()
    if (registro) await registro.showNotification(titulo, opcoes)
    else new Notification(titulo, opcoes)
  } catch {
    /* navegador sem suporte: fica o som */
  }
}

// ---------- Hook e contexto ----------

export const FocoContexto = createContext(null)
export const useFocoApp = () => useContext(FocoContexto)

// textos: { fimFoco, fimPausa, corpoFoco, corpoPausa } (i18n), registrar: (bloco) => Promise
export function useFoco(userId, registrar, textos) {
  const chave = `routinxp:foco:${userId}`
  const [estado, setEstado] = useState(() => ler(chave))
  const atual = useRef(estado)
  const registrarRef = useRef(registrar)
  const textosRef = useRef(textos)
  useEffect(() => {
    registrarRef.current = registrar
    textosRef.current = textos
  })

  // Troca o estado, grava e avisa as outras abas.
  const definir = useCallback(
    (proximo) => {
      atual.current = proximo
      gravar(chave, proximo)
      setEstado(proximo)
    },
    [chave],
  )

  const mudar = useCallback((fn) => definir(fn(atual.current)), [definir])

  // Processa as fases vencidas: registra os focos, toca o aviso e grava o novo estado.
  const processar = useCallback(() => {
    // Outra aba pode ter avançado primeiro: parte do que está gravado.
    const gravado = ler(chave)
    const base = gravado.fimEm === atual.current.fimEm && gravado.fase === atual.current.fase ? atual.current : gravado
    const { estado: proximo, focos, trocas } = avancar(base, Date.now())
    if (proximo === base) {
      if (base !== atual.current) definir(base)
      return
    }
    definir(proximo)
    focos.forEach((bloco) => registrarRef.current?.(bloco))
    const ultima = trocas[trocas.length - 1]
    if (ultima) {
      const txt = textosRef.current
      tocarSom()
      navigator.vibrate?.([180, 90, 180])
      if (document.hidden) notificar(ultima === 'foco' ? txt.fimPausa : txt.fimFoco, ultima === 'foco' ? txt.corpoPausa : txt.corpoFoco)
    }
  }, [chave, definir])

  // Agenda o fim da fase atual (e confere ao voltar para a aba, quando o navegador atrasou o timer).
  useEffect(() => {
    if (!estado.rodando) return undefined
    const espera = Math.max(estado.fimEm - Date.now(), 0)
    const timer = setTimeout(processar, espera + 30)
    const aoVoltar = () => document.visibilityState === 'visible' && processar()
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', aoVoltar)
    }
  }, [estado.rodando, estado.fimEm, processar])

  // Outra aba mudou o estado: acompanha sem gravar de volta.
  useEffect(() => {
    const aoMudar = (evento) => {
      if (evento.key !== chave) return
      const outro = ler(chave)
      atual.current = outro
      setEstado(outro)
    }
    window.addEventListener('storage', aoMudar)
    return () => window.removeEventListener('storage', aoMudar)
  }, [chave])

  const iniciar = useCallback(() => {
    prepararAviso()
    mudar((e) => {
      const fase = e.fase === 'parado' ? 'foco' : e.fase
      const restante = e.fase === 'parado' ? duracao(e.config, 'foco') : restanteDe(e, Date.now())
      return {
        ...e,
        fase,
        ciclo: e.fase === 'parado' ? 1 : e.ciclo,
        rodando: true,
        fimEm: Date.now() + restante,
        restante: null,
        blocoId: fase === 'foco' ? (e.blocoId ?? crypto.randomUUID()) : null,
      }
    })
  }, [mudar])

  const pausar = useCallback(
    () => mudar((e) => (e.rodando ? { ...e, rodando: false, restante: restanteDe(e, Date.now()), fimEm: null } : e)),
    [mudar],
  )

  // Pular: o foco pulado não conta; a pausa pulada leva ao próximo foco, que espera o Iniciar.
  const pular = useCallback(
    () =>
      mudar((e) => {
        if (e.fase === 'parado') return e
        if (e.fase === 'foco') {
          const fase = pausaDepois(e)
          return { ...e, fase, rodando: true, fimEm: Date.now() + duracao(e.config, fase), restante: null, blocoId: null }
        }
        const ciclo = e.fase === 'pausaLonga' ? 1 : e.ciclo + 1
        return { ...e, fase: 'foco', ciclo, rodando: false, fimEm: null, restante: duracao(e.config, 'foco'), blocoId: null }
      }),
    [mudar],
  )

  const encerrar = useCallback(
    () => mudar((e) => ({ ...e, fase: 'parado', ciclo: 1, rodando: false, fimEm: null, restante: null, blocoId: null })),
    [mudar],
  )

  // Desfazer "Encerrar sessão": volta ao estado guardado (se o tempo venceu nesse meio-tempo,
  // o agendamento processa a fase na hora).
  const restaurar = useCallback((anterior) => definir(anterior), [definir])

  const definirConfig = useCallback((config) => mudar((e) => ({ ...e, config: ajustarConfig(config) })), [mudar])

  const adicionarTarefas = useCallback(
    (ids) => mudar((e) => ({ ...e, tarefaIds: [...e.tarefaIds, ...ids.filter((id) => !e.tarefaIds.includes(id))] })),
    [mudar],
  )
  const removerTarefa = useCallback((id) => mudar((e) => ({ ...e, tarefaIds: e.tarefaIds.filter((x) => x !== id) })), [mudar])

  return { estado, iniciar, pausar, pular, encerrar, restaurar, definirConfig, adicionarTarefas, removerTarefa }
}

// Relógio para quem mostra o tempo: atualiza só enquanto a fase corre.
export function useAgora(ativo, intervalo = 250) {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    if (!ativo) return undefined
    const id = setInterval(() => setAgora(Date.now()), intervalo)
    return () => clearInterval(id)
  }, [ativo, intervalo])
  return agora
}

// 1500000 → "25:00"
export function formatarTempo(ms) {
  const total = Math.ceil(ms / 1000)
  const min = Math.floor(total / 60)
  const seg = total % 60
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`
}
