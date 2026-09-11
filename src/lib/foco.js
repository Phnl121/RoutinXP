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
  aguardando: false, // a fase acabou e a próxima espera o usuário começar
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

// Avança a fase que venceu. Devolve o novo estado, os focos completos (para registrar) e as
// trocas de fase (para o aviso). Nada começa sozinho (pedido do usuário, 2026-09-11): no fim
// do foco o relógio para em "Hora da pausa" e espera "Iniciar pausa"; no fim da pausa, espera
// "Iniciar foco". Quem estava distraído não perde a pausa sem ver.
export function avancar(estado, agora) {
  let e = estado
  const focos = []
  const trocas = []
  if (e.rodando && e.fimEm <= agora) {
    if (e.fase === 'foco') {
      focos.push({ id: e.blocoId, minutos: e.config.foco })
      const fase = pausaDepois(e)
      trocas.push(fase)
      e = { ...e, fase, rodando: false, fimEm: null, restante: duracao(e.config, fase), blocoId: null, aguardando: true }
    } else {
      const ciclo = e.fase === 'pausaLonga' ? 1 : e.ciclo + 1
      trocas.push('foco')
      e = { ...e, fase: 'foco', ciclo, rodando: false, fimEm: null, restante: duracao(e.config, 'foco'), blocoId: null, aguardando: true }
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

// Chamado num clique (Iniciar): o navegador só libera áudio e o pedido de notificação depois
// de um gesto do usuário. aoPermitir roda quando a permissão é dada (inscreve o push).
export function prepararAviso(aoPermitir) {
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') audio.resume()
  } catch {
    audio = null
  }
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission()
      .then((p) => p === 'granted' && aoPermitir?.())
      .catch(() => {})
  }
}

// Botão "Ativar avisos" da página Foco. Devolve a permissão resultante.
export async function pedirPermissao() {
  if (typeof Notification === 'undefined') return 'indisponivel'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

// Três pares de toques (do grave para o agudo): audível mesmo com música, sem virar alarme.
function tocarSom(vezes = 3) {
  if (!audio) return
  if (audio.state === 'suspended') audio.resume().catch(() => {})
  const inicio = audio.currentTime + 0.05
  for (let r = 0; r < vezes; r++) {
    ;[523.25, 783.99].forEach((freq, i) => {
      const osc = audio.createOscillator()
      const volume = audio.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t0 = inicio + r * 0.9 + i * 0.22
      volume.gain.setValueAtTime(0.0001, t0)
      volume.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02)
      volume.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5)
      osc.connect(volume).connect(audio.destination)
      osc.start(t0)
      osc.stop(t0 + 0.55)
    })
  }
}

const ETIQUETA = 'routinxp-foco'

// A pessoa agiu no app (iniciou, pulou, encerrou): o aviso fixado na tela já não vale.
async function fecharAvisos() {
  try {
    const registro = await navigator.serviceWorker?.getRegistration()
    const abertos = (await registro?.getNotifications({ tag: ETIQUETA })) ?? []
    abertos.forEach((n) => n.close())
  } catch {
    /* sem service worker: nada fixado */
  }
}

// Notificação do sistema, sempre (a pessoa pode estar olhando para o caderno, não para a tela).
// Mesma etiqueta do push do servidor: se os dois chegarem, um substitui o outro, e o segundo
// não toca de novo quando o primeiro tem menos de 2 minutos.
async function notificar(titulo, corpo) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const opcoes = {
    body: corpo,
    icon: '/marca/routinxp-icone-192.png',
    tag: ETIQUETA,
    renotify: true,
    requireInteraction: true,
    data: { url: '/foco' },
  }
  try {
    // No celular só o service worker mostra notificação; no computador as duas formas servem.
    const registro = await navigator.serviceWorker?.getRegistration()
    if (registro) {
      const recentes = (await registro.getNotifications({ tag: ETIQUETA })).filter((n) => Date.now() - n.timestamp < 2 * MINUTO)
      await registro.showNotification(titulo, { ...opcoes, renotify: recentes.length === 0 })
    }
    else {
      const aviso = new Notification(titulo, opcoes)
      aviso.onclick = () => {
        window.focus()
        aviso.close()
      }
    }
  } catch {
    /* navegador sem suporte: fica o som */
  }
}

// ---------- Hook e contexto ----------

export const FocoContexto = createContext(null)
export const useFocoApp = () => useContext(FocoContexto)

// textos: { fimFoco, fimPausa, corpoFoco, corpoPausa } (i18n), registrar: (bloco) => Promise,
// aoPermitir: () => void (a pessoa acabou de liberar as notificações).
export function useFoco(userId, registrar, textos, aoPermitir) {
  const chave = `routinxp:foco:${userId}`
  const [estado, setEstado] = useState(() => ler(chave))
  const atual = useRef(estado)
  const registrarRef = useRef(registrar)
  const textosRef = useRef(textos)
  const aoPermitirRef = useRef(aoPermitir)
  useEffect(() => {
    registrarRef.current = registrar
    textosRef.current = textos
    aoPermitirRef.current = aoPermitir
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
      navigator.vibrate?.([300, 150, 300, 150, 300])
      notificar(ultima === 'foco' ? txt.fimPausa : txt.fimFoco, ultima === 'foco' ? txt.corpoPausa : txt.corpoFoco)
    }
  }, [chave, definir])

  // Esperando a próxima fase: lembra com o som a cada minuto (até 3 vezes) enquanto o app estiver aberto.
  useEffect(() => {
    if (!estado.aguardando || estado.rodando || estado.fase === 'parado') return undefined
    let vezes = 0
    const id = setInterval(() => {
      vezes += 1
      tocarSom(2)
      if (vezes >= 3) clearInterval(id)
    }, MINUTO)
    return () => clearInterval(id)
  }, [estado.aguardando, estado.rodando, estado.fase])

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
    prepararAviso(() => aoPermitirRef.current?.())
    fecharAvisos()
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
        aguardando: false,
      }
    })
  }, [mudar])

  const pausar = useCallback(
    () =>
      mudar((e) => (e.rodando ? { ...e, rodando: false, restante: restanteDe(e, Date.now()), fimEm: null, aguardando: false } : e)),
    [mudar],
  )

  // Pular o foco (a pessoa está ali): o foco pulado não conta e a pausa já começa.
  // Pular a pausa leva ao próximo foco, que espera o Iniciar.
  const pular = useCallback(() => {
    fecharAvisos()
    mudar((e) => {
      if (e.fase === 'parado') return e
      if (e.fase === 'foco') {
        const fase = pausaDepois(e)
        return { ...e, fase, rodando: true, fimEm: Date.now() + duracao(e.config, fase), restante: null, blocoId: null, aguardando: false }
      }
      const ciclo = e.fase === 'pausaLonga' ? 1 : e.ciclo + 1
      return { ...e, fase: 'foco', ciclo, rodando: false, fimEm: null, restante: duracao(e.config, 'foco'), blocoId: null, aguardando: true }
    })
  }, [mudar])

  const encerrar = useCallback(() => {
    fecharAvisos()
    mudar((e) => ({ ...e, fase: 'parado', ciclo: 1, rodando: false, fimEm: null, restante: null, blocoId: null, aguardando: false }))
  }, [mudar])

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
