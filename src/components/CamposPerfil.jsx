import { t } from '../i18n/pt-BR'

const p = t.perfil.campos

// Campos do perfil (cadastro e página Perfil). Controlado: `valores` + `aoMudar(campo, valor)`.
export function CamposPerfil({ valores, aoMudar, id }) {
  const campo = (nome) => (evento) => aoMudar(nome, evento.target.value)
  return (
    <>
      <div className="campos-duplos">
        <div className="field">
          <label className="label" htmlFor={`${id}-nome`}>
            {p.primeiroNome}
          </label>
          <input
            id={`${id}-nome`}
            className="input"
            autoComplete="given-name"
            required
            maxLength={50}
            value={valores.primeiro_nome}
            onChange={campo('primeiro_nome')}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor={`${id}-sobrenome`}>
            {p.sobrenome}
          </label>
          <input
            id={`${id}-sobrenome`}
            className="input"
            autoComplete="family-name"
            required
            maxLength={80}
            value={valores.sobrenome}
            onChange={campo('sobrenome')}
          />
        </div>
      </div>
      <div className="campos-duplos">
        <div className="field">
          <label className="label" htmlFor={`${id}-nascimento`}>
            {p.nascimento}
          </label>
          <input
            id={`${id}-nascimento`}
            className="input"
            type="date"
            autoComplete="bday"
            required
            min="1900-01-01"
            value={valores.data_nascimento}
            onChange={campo('data_nascimento')}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor={`${id}-ocupacao`}>
            {p.ocupacao}
          </label>
          <span className="select">
            <select id={`${id}-ocupacao`} className="input" required value={valores.ocupacao} onChange={campo('ocupacao')}>
              <option value="" disabled>
                {p.escolha}
              </option>
              {t.perfil.ocupacoes.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.rotulo}
                </option>
              ))}
            </select>
          </span>
        </div>
      </div>
    </>
  )
}
