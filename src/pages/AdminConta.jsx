import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ConfirmarAcaoDialogo, Interruptor, SelosConta, SenhaProvisoriaDialogo } from '../components/AdminParts'
import { dataCurta, DEPENDEM_DE_TAREFAS, mensagemAdmin, nomeDaConta, useContasAdmin } from '../lib/admin'
import { Aviso } from '../components/AuthParts'
import { IconeSetaEsquerda } from '../components/icones'
import { chamarAdmin, FUNCOES } from '../lib/conta'
import { t } from '../i18n/pt-BR'
import './admin.css'

const ad = t.admin

// Uma conta: funções liberadas e as ações sobre a conta.
export default function AdminConta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { estado, usuarios, carregar, setUsuarios } = useContasAdmin()
  const [confirmar, setConfirmar] = useState(null) // 'novaSenha' | 'removerAutenticador' | 'suspender' | 'reativar' | 'excluir'
  const [senhaNova, setSenhaNova] = useState(null)
  const [statusFuncoes, setStatusFuncoes] = useState(null) // { tipo: 'ok' | 'erro', texto }
  const [salvando, setSalvando] = useState(false)

  const conta = usuarios.find((u) => u.id === id)

  const voltar = (
    <Link to="/admin" className="link-btn admin__voltar">
      <IconeSetaEsquerda />
      {ad.conta.voltar}
    </Link>
  )

  if (estado !== 'pronto' || !conta) {
    return (
      <main className="admin">
        {voltar}
        {estado === 'carregando' ? (
          <p className="label">{ad.carregando}</p>
        ) : estado === 'erro' ? (
          <div className="admin__erro">
            <Aviso>{ad.erro}</Aviso>
            <button type="button" className="btn btn--compacto" onClick={carregar}>
              {ad.tentar}
            </button>
          </div>
        ) : (
          <p className="admin__vazio">{ad.conta.naoEncontrada}</p>
        )}
      </main>
    )
  }

  // Salva na hora (otimista) e desfaz se o servidor recusar.
  async function mudarFuncao(funcao, ligar) {
    let funcoes = ligar ? [...new Set([...conta.funcoes, funcao])] : conta.funcoes.filter((f) => f !== funcao)
    if (funcao === 'tarefas' && !ligar) funcoes = funcoes.filter((f) => !DEPENDEM_DE_TAREFAS.includes(f))
    const antes = conta.funcoes
    setUsuarios((lista) => lista.map((u) => (u.id === conta.id ? { ...u, funcoes } : u)))
    setStatusFuncoes(null)
    // Um salvamento por vez: outro clique no meio desfaria o anterior se o servidor recusasse.
    setSalvando(true)
    try {
      await chamarAdmin('funcoes', { id: conta.id, funcoes })
      setStatusFuncoes({ tipo: 'ok', texto: ad.funcoes.salvo })
    } catch (e) {
      setUsuarios((lista) => lista.map((u) => (u.id === conta.id ? { ...u, funcoes: antes } : u)))
      setStatusFuncoes({ tipo: 'erro', texto: mensagemAdmin(e) })
    } finally {
      setSalvando(false)
    }
  }

  async function executar(acao, confirmacao) {
    const nomes = { novaSenha: 'nova_senha', removerAutenticador: 'remover_autenticador' }
    const r = await chamarAdmin(nomes[acao] ?? acao, { id: conta.id, confirmacao })
    if (acao === 'excluir') {
      navigate('/admin', { replace: true })
      return
    }
    if (acao === 'novaSenha') setSenhaNova({ email: conta.email, senha: r.senha })
    await carregar()
  }

  const temTarefas = conta.funcoes.includes('tarefas')

  return (
    <>
      <main className="admin">
        {voltar}

        <header className="admin-conta__cabeca">
          <h1 className="main__titulo">{nomeDaConta(conta)}</h1>
          {conta.nome && <p className="admin-conta__email">{conta.email}</p>}
          <SelosConta conta={conta} />
        </header>

        <section className="panel admin-painel" aria-labelledby="admin-funcoes">
          <h2 id="admin-funcoes" className="label">
            {ad.funcoes.titulo}
          </h2>
          <ul className="admin-funcoes">
            {FUNCOES.map((f) => {
              const bloqueada = DEPENDEM_DE_TAREFAS.includes(f) && !temTarefas
              return (
                <li key={f} className="admin-funcao" data-bloqueada={bloqueada}>
                  <span className="admin-funcao__texto">
                    <span className="admin-funcao__nome">{ad.funcoes.nomes[f]}</span>
                    <span className="hint">{ad.funcoes.descricoes[f]}</span>
                  </span>
                  <Interruptor
                    ligado={conta.funcoes.includes(f)}
                    rotulo={ad.funcoes.nomes[f]}
                    descricao={ad.funcoes.descricoes[f]}
                    disabled={bloqueada || salvando}
                    onMudar={(ligar) => mudarFuncao(f, ligar)}
                  />
                </li>
              )
            })}
          </ul>
          <p className="hint admin-painel__status" role="status" data-erro={statusFuncoes?.tipo === 'erro'}>
            {statusFuncoes?.texto ?? ''}
          </p>
        </section>

        <section className="panel admin-painel" aria-labelledby="admin-conta">
          <h2 id="admin-conta" className="label">
            {ad.conta.titulo}
          </h2>
          <dl className="admin-conta__dados">
            <div>
              <dt className="hint">{ad.conta.criadaEm}</dt>
              <dd>{dataCurta(conta.criado_em)}</dd>
            </div>
            <div>
              <dt className="hint">{ad.conta.ultimoAcesso}</dt>
              <dd>{conta.ultimo_acesso ? dataCurta(conta.ultimo_acesso) : ad.conta.nunca}</dd>
            </div>
          </dl>

          {conta.eu ? (
            <p className="hint">{ad.conta.propria}</p>
          ) : (
            <>
              <div className="admin-conta__acoes">
                <button type="button" className="botao-contorno" onClick={() => setConfirmar('novaSenha')}>
                  {ad.conta.novaSenha}
                </button>
                {conta.autenticador && (
                  <button type="button" className="botao-contorno" onClick={() => setConfirmar('removerAutenticador')}>
                    {ad.conta.removerAutenticador}
                  </button>
                )}
                <button
                  type="button"
                  className="botao-contorno"
                  onClick={() => setConfirmar(conta.suspenso ? 'reativar' : 'suspender')}
                >
                  {conta.suspenso ? ad.conta.reativar : ad.conta.suspender}
                </button>
              </div>
              <button type="button" className="dialogo__excluir admin-conta__excluir" onClick={() => setConfirmar('excluir')}>
                {ad.conta.excluir}
              </button>
            </>
          )}
        </section>
      </main>

      {confirmar && (
        <ConfirmarAcaoDialogo
          acao={confirmar}
          conta={conta}
          onConfirmar={(confirmacao) => executar(confirmar, confirmacao)}
          onFechar={() => setConfirmar(null)}
        />
      )}
      {senhaNova && <SenhaProvisoriaDialogo email={senhaNova.email} senha={senhaNova.senha} onFechar={() => setSenhaNova(null)} />}
    </>
  )
}
