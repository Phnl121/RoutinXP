import { useState } from 'react'
import { Link } from 'react-router'
import { NovaContaDialogo, SelosConta, SenhaProvisoriaDialogo } from '../components/AdminParts'
import { dataCurta, nomeDaConta, ordenarContas, useContasAdmin } from '../lib/admin'
import { Aviso } from '../components/AuthParts'
import { IconeLupa, IconeMais, IconeSetaDireita } from '../components/icones'
import { t } from '../i18n/pt-BR'
import './admin.css'

const ad = t.admin

const semAcento = (texto) =>
  (texto ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

// Painel de administração: quem tem conta e em que situação; a conta abre na própria página.
export default function Admin() {
  const { estado, usuarios, registro, carregar } = useContasAdmin()
  const [aba, setAba] = useState('contas')
  const [busca, setBusca] = useState('')
  const [dlgNova, setDlgNova] = useState(false)
  const [senhaNova, setSenhaNova] = useState(null) // { email, senha }

  const termo = semAcento(busca.trim())
  const contas = ordenarContas(usuarios).filter((u) => !termo || semAcento(`${u.nome ?? ''} ${u.email ?? ''}`).includes(termo))

  let conteudo
  if (estado === 'carregando') {
    conteudo = <p className="label">{ad.carregando}</p>
  } else if (estado === 'erro') {
    conteudo = (
      <div className="admin__erro">
        <Aviso>{ad.erro}</Aviso>
        <button type="button" className="btn btn--compacto" onClick={carregar}>
          {ad.tentar}
        </button>
      </div>
    )
  } else if (aba === 'contas') {
    conteudo = (
      <>
        <div className="filtros__busca admin__busca">
          <IconeLupa />
          <input
            className="input"
            type="search"
            aria-label={ad.busca}
            placeholder={ad.busca}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        {contas.length === 0 ? (
          <p className="admin__vazio">{ad.vazio}</p>
        ) : (
          <ul className="admin-lista">
            {contas.map((u) => (
              <li key={u.id}>
                <Link className="admin-linha" to={`/admin/${u.id}`} aria-label={ad.abrir(nomeDaConta(u))}>
                  <span className="admin-linha__quem">
                    <span className="admin-linha__nome">
                      {nomeDaConta(u)}
                      {u.eu && <span className="admin-linha__voce">{ad.voce}</span>}
                    </span>
                    {u.nome && <span className="admin-linha__email">{u.email}</span>}
                  </span>
                  <SelosConta conta={u} />
                  <span className="admin-linha__acesso">
                    {u.ultimo_acesso ? ad.ultimoAcesso(dataCurta(u.ultimo_acesso)) : ad.nuncaAcessou}
                  </span>
                  <IconeSetaDireita />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </>
    )
  } else {
    conteudo =
      registro.length === 0 ? (
        <p className="admin__vazio">{ad.registro.vazio}</p>
      ) : (
        <ol className="admin-registro">
          {registro.map((r) => (
            <li key={r.id} className="admin-registro__item">
              <span>{ad.registro.acoes[r.acao]?.(r.alvo_email ?? '—') ?? r.acao}</span>
              <time className="admin-registro__hora" dateTime={r.created_at}>
                {dataCurta(r.created_at, true)}
              </time>
            </li>
          ))}
        </ol>
      )
  }

  return (
    <>
      <main className="admin">
        <header className="admin__cabeca">
          <h1 className="main__titulo">{ad.titulo}</h1>
          <button type="button" className="btn btn--compacto" onClick={() => setDlgNova(true)}>
            <IconeMais />
            {ad.novaConta}
          </button>
        </header>

        <div className="tabs admin__abas" role="group" aria-label={ad.abas.rotulo}>
          <button type="button" aria-pressed={aba === 'contas'} onClick={() => setAba('contas')}>
            {ad.abas.contas}
          </button>
          <button type="button" aria-pressed={aba === 'registro'} onClick={() => setAba('registro')}>
            {ad.abas.registro}
          </button>
        </div>

        {conteudo}
      </main>

      {dlgNova && (
        <NovaContaDialogo
          onFechar={() => setDlgNova(false)}
          onCriada={(r) => {
            setSenhaNova({ email: r.email, senha: r.senha })
            carregar()
          }}
        />
      )}
      {senhaNova && <SenhaProvisoriaDialogo email={senhaNova.email} senha={senhaNova.senha} onFechar={() => setSenhaNova(null)} />}
    </>
  )
}
