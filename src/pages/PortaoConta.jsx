import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ContaContexto, lerMinhaConta, nivelDeVerificacao } from '../lib/conta'
import { emPrevia, contaPrevia } from '../dev/previa'
import { Aviso } from '../components/AuthParts'
import { Logo } from '../components/Logo'
import Shell from './Shell'
import { carregarPagina } from '../lib/carregarPagina'
// Só quem ainda não verificou ou tem senha provisória baixa estas telas.
const Verificacao = carregarPagina(() => import('./Verificacao'))
const RedefinirSenha = carregarPagina(() => import('./RedefinirSenha'))
import { t } from '../i18n/pt-BR'
import './auth.css'

// Em que ponto a conta está: { etapa, conta? }.
async function situacaoDaConta() {
  try {
    const nivel = await nivelDeVerificacao()
    if (nivel.currentLevel !== 'aal2') return { etapa: nivel.nextLevel === 'aal2' ? 'codigo' : 'autenticador' }
    const conta = await lerMinhaConta()
    // Sem linha em contas_app a conta não tem o que abrir: mostra o erro com Tentar de novo.
    if (!conta) return { etapa: 'erro' }
    // Sessão encerrada pelo painel (suspensão, senha nova, autenticador removido): volta ao login.
    if (conta.sessao_ativa === false) {
      await supabase.auth.signOut({ scope: 'local' })
      return { etapa: 'carregando' }
    }
    return { etapa: conta?.senha_provisoria ? 'senha' : 'liberada', conta }
  } catch {
    return { etapa: 'erro' }
  }
}

// Entre o login e o app: verificação em duas etapas (cadastrar o autenticador ou digitar o
// código) e, para contas criadas pelo painel, a troca da senha provisória. Só depois abre a
// casca, já sabendo o papel e as funções da conta.
export default function PortaoConta({ session }) {
  // carregando | autenticador | codigo | senha | liberada | erro
  // Na pré-visualização, ?etapa=autenticador|codigo|senha mostra a tela correspondente.
  const [etapa, setEtapa] = useState(
    import.meta.env.DEV && emPrevia ? (new URLSearchParams(window.location.search).get('etapa') ?? 'liberada') : 'carregando',
  )
  const [conta, setConta] = useState(import.meta.env.DEV && emPrevia ? contaPrevia : null)

  const aplicar = useCallback(({ etapa: proxima, conta: minha }) => {
    if (minha) setConta(minha)
    setEtapa(proxima)
  }, [])

  const conferir = useCallback(() => {
    if (!(import.meta.env.DEV && emPrevia)) situacaoDaConta().then(aplicar)
  }, [aplicar])

  // A cada token novo (login, código confirmado, sessão renovada) confere de novo.
  const token = session.access_token
  useEffect(() => {
    if (import.meta.env.DEV && emPrevia) return undefined
    let ativo = true
    situacaoDaConta().then((r) => ativo && aplicar(r))
    return () => {
      ativo = false
    }
  }, [aplicar, token])

  if (etapa === 'liberada' && conta) {
    return (
      <ContaContexto.Provider value={conta}>
        <Shell session={session} />
      </ContaContexto.Provider>
    )
  }

  if (etapa === 'autenticador' || etapa === 'codigo') {
    return <Verificacao key={etapa} modo={etapa} aoVerificar={conferir} />
  }

  if (etapa === 'senha') {
    return <RedefinirSenha session={session} provisoria aoConcluir={conferir} />
  }

  if (etapa === 'erro') {
    return (
      <main className="auth-simples">
        <div className="auth-simples__col">
          <Logo />
          <div className="panel auth-simples__painel" role="alert">
            <h1 className="auth__title">{t.acesso.erroTitulo}</h1>
            <Aviso>{t.acesso.erroTexto}</Aviso>
            <div className="form__foot">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setEtapa('carregando')
                  conferir()
                }}
              >
                {t.acesso.tentar}
              </button>
              <button type="button" className="link-btn" onClick={() => supabase.auth.signOut()}>
                {t.verificacao.sair}
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="carregando" aria-busy="true">
      <span className="label">{t.app.carregando}</span>
    </div>
  )
}
