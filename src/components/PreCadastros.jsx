import { useState } from 'react'
import { Check, X, User, Phone, Mail, MapPin, Briefcase, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

const ORIGEM_ICON = {
  'Indicação':'🤝','Instagram':'📸','Facebook':'👥',
  'Tráfego Pago':'📢','Google':'🔍','Site':'🌐','Outros':'✨'
}

function Campo({ icon: Icon, label, value }) {
  if (!value && value !== false) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <Icon size={13} style={{ color: '#a0c8b8', marginTop: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: '#374151' }}><strong style={{ color: '#6b9e8a' }}>{label}:</strong> {value}</span>
    </div>
  )
}

export default function PreCadastros({ onClose }) {
  const { data, addItem, editItem } = useApp()
  const [expandido, setExpandido] = useState(null)
  const [processando, setProcessando] = useState(null)

  const pendentes = (data.pre_cadastros || []).filter(p => p.status === 'pendente')
  const historico = (data.pre_cadastros || []).filter(p => p.status !== 'pendente')

  const aprovar = (pc) => {
    setProcessando(pc.id)
    const convenios = data.convenios || []
    const conv = convenios.find(c => c.nome === pc.convenio)
    addItem('pacientes', {
      nome: pc.nome, telefone: pc.telefone, email: pc.email,
      data_nascimento: pc.data_nascimento, convenio_id: conv?.id || '',
      estado_civil: pc.estado_civil, conjuge_nome: pc.conjuge_nome,
      conjuge_idade: pc.conjuge_idade, filhos: pc.filhos || [],
      profissao: pc.profissao, trabalhando: pc.trabalhando,
      endereco: pc.endereco, cidade: pc.cidade, estado: pc.estado,
      origem: pc.origem, obs: pc.obs, ativo: true, plano_sessoes: 0,
    })
    editItem('pre_cadastros', pc.id, { status: 'aprovado' })
    setProcessando(null)
    setExpandido(null)
  }

  const recusar = (pc) => {
    editItem('pre_cadastros', pc.id, { status: 'recusado' })
    setExpandido(null)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      className="md:items-center md:p-4">
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: '#fff', width: '100%', maxWidth: 560,
        borderRadius: '20px 20px 0 0', maxHeight: '88vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }} className="md:rounded-2xl">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f0f5f2' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#0f1a14' }}>Pré-cadastros</p>
            <p style={{ fontSize: 12, color: '#6b9e8a', marginTop: 2 }}>
              {pendentes.length} aguardando aprovação
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0c8b8', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* ── PENDENTES ── */}
          {pendentes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#a0c8b8' }}>
              <User size={28} style={{ margin: '0 auto 10px', opacity: .3 }} />
              <p style={{ fontSize: 13 }}>Nenhum cadastro aguardando.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: historico.length ? 24 : 0 }}>
            {pendentes.map(pc => {
              const aberto = expandido === pc.id
              return (
                <div key={pc.id} style={{ border: '1.5px solid #d1f0e4', borderRadius: 14, overflow: 'hidden', background: '#fafdfb' }}>
                  {/* Linha resumo */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
                    onClick={() => setExpandido(aberto ? null : pc.id)}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#e1f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#3a9175', flexShrink: 0 }}>
                      {pc.nome?.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f1a14' }}>{pc.nome}</p>
                      <p style={{ fontSize: 11, color: '#6b9e8a', marginTop: 2 }}>
                        {pc.telefone}{pc.origem ? ` · ${ORIGEM_ICON[pc.origem] || ''} ${pc.origem}` : ''}
                      </p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: '#fef9ec', color: '#854f0b', flexShrink: 0 }}>
                      PENDENTE
                    </span>
                    {aberto ? <ChevronUp size={14} color="#a0c8b8" /> : <ChevronDown size={14} color="#a0c8b8" />}
                  </div>

                  {/* Detalhes expandidos */}
                  {aberto && (
                    <div style={{ borderTop: '1px solid #e8f0ec', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, background: '#fff' }}>
                      <Campo icon={Phone}    label="Telefone"     value={pc.telefone} />
                      <Campo icon={Mail}     label="E-mail"       value={pc.email} />
                      <Campo icon={Briefcase} label="Profissão"   value={pc.profissao ? `${pc.profissao}${pc.trabalhando !== null ? (pc.trabalhando ? ' · Trabalhando' : ' · Sem trabalho') : ''}` : null} />
                      <Campo icon={Users}    label="Estado civil" value={pc.estado_civil ? `${pc.estado_civil}${pc.conjuge_nome ? ` · Cônjuge: ${pc.conjuge_nome}` : ''}` : null} />
                      {pc.filhos?.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ fontSize: 12, marginTop: 1 }}>👶</span>
                          <span style={{ fontSize: 12, color: '#374151' }}>
                            <strong style={{ color: '#6b9e8a' }}>Filhos:</strong>{' '}
                            {pc.filhos.map((f, i) => `${f.nome}${f.idade ? ` (${f.idade} anos)` : ''}`).join(', ')}
                          </span>
                        </div>
                      )}
                      <Campo icon={MapPin}   label="Cidade"       value={[pc.cidade, pc.estado].filter(Boolean).join(' · ')} />
                      {pc.convenio && (
                        <p style={{ fontSize: 12, color: '#374151' }}>
                          <strong style={{ color: '#6b9e8a' }}>Convênio:</strong> {pc.convenio}
                        </p>
                      )}
                      {pc.obs && (
                        <div style={{ background: '#f6faf8', borderRadius: 8, padding: '8px 12px', marginTop: 4 }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: '#6b9e8a', marginBottom: 4 }}>Observações / Queixa</p>
                          <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{pc.obs}</p>
                        </div>
                      )}

                      {/* Ações */}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={() => recusar(pc)} style={{
                          flex: 1, padding: '9px', borderRadius: 10, border: '1.5px solid #fca5a5',
                          background: '#fff', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}>
                          <X size={13} /> Recusar
                        </button>
                        <button onClick={() => aprovar(pc)} disabled={processando === pc.id} style={{
                          flex: 2, padding: '9px', borderRadius: 10, border: 'none',
                          background: '#3a9175', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}>
                          <Check size={13} /> {processando === pc.id ? 'Aprovando...' : 'Aprovar e criar paciente'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ── HISTÓRICO ── */}
          {historico.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#a0c8b8', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 10 }}>Histórico</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {historico.map(pc => (
                  <div key={pc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid #f0f5f2', borderRadius: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#9ca3af' }}>
                      {pc.nome?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{pc.nome}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af' }}>{pc.telefone}</p>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: pc.status === 'aprovado' ? '#e1f5ee' : '#f3f4f6',
                      color: pc.status === 'aprovado' ? '#0f6e56' : '#9ca3af',
                    }}>{pc.status === 'aprovado' ? 'APROVADO' : 'RECUSADO'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
