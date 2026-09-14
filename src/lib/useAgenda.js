import { useCallback, useEffect, useState } from 'react'
import * as apiReal from './agendaApi'
import * as apiPrevia from '../dev/previaAgenda'
import { emPrevia } from '../dev/previa'

const api = emPrevia ? apiPrevia : apiReal

// Eventos do período na tela. Muda o período, busca de novo; salvar e excluir atualizam a lista.
export function useAgenda(diaInicio, diaFim) {
  const [dados, setDados] = useState({ chave: null, eventos: [], erro: null })
  const [tentativa, setTentativa] = useState(0)
  const chave = `${diaInicio}|${diaFim}`

  useEffect(() => {
    let vivo = true
    api.listarEventos(diaInicio, diaFim).then(
      (eventos) => vivo && setDados({ chave, eventos, erro: null }),
      (erro) => vivo && setDados((d) => ({ ...d, chave, erro })),
    )
    return () => {
      vivo = false
    }
  }, [diaInicio, diaFim, chave, tentativa])

  const trocar = (salvo) =>
    setDados((d) => ({
      ...d,
      eventos: d.eventos.some((e) => e.id === salvo.id) ? d.eventos.map((e) => (e.id === salvo.id ? salvo : e)) : [...d.eventos, salvo],
    }))

  const salvar = useCallback(async (evento) => {
    const salvo = await api.salvarEvento(evento)
    trocar(salvo)
    return salvo
  }, [])

  const excluir = useCallback(async (id) => {
    await api.excluirEvento(id)
    setDados((d) => ({ ...d, eventos: d.eventos.filter((e) => e.id !== id) }))
  }, [])

  const excluirOcorrencia = useCallback(async (evento, dia) => {
    trocar(await api.excluirOcorrencia(evento, dia))
  }, [])

  return {
    eventos: dados.eventos,
    carregando: dados.chave !== chave && !dados.erro,
    erro: dados.chave === chave ? dados.erro : null,
    tentarDeNovo: () => setTentativa((n) => n + 1),
    salvar,
    excluir,
    excluirOcorrencia,
  }
}
