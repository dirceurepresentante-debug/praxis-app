import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'

const ORIGENS = ['Indicação', 'Instagram', 'Facebook', 'Tráfego Pago', 'Google', 'Site', 'Outros']

const ESTADOS_CIVIS = ['Solteiro(a)', 'Casado(a)', 'União Estável', 'Divorciado(a)', 'Viúvo(a)']

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

const CASADO = ['Casado(a)', 'União Estável']

export default function ModalPaciente({ paciente, convenios, onSave, onClose }) {
  const [form, setForm] = useState({
    nome:           paciente?.nome || '',
    telefone:       paciente?.telefone || '',
    email:          paciente?.email || '',
    data_nascimento:paciente?.data_nascimento || '',
    convenio_id:    paciente?.convenio_id || '',
    estado_civil:   paciente?.estado_civil || '',
    conjuge_nome:   paciente?.conjuge_nome || '',
    conjuge_idade:  paciente?.conjuge_idade || '',
    filhos:         paciente?.filhos || [],
    profissao:      paciente?.profissao || '',
    trabalhando:    paciente?.trabalhando ?? null,
    endereco:       paciente?.endereco || '',
    cidade:         paciente?.cidade || '',
    estado:         paciente?.estado || '',
    obs:            paciente?.obs || '',
    ativo:          paciente?.ativo ?? true,
    origem:         paciente?.origem || '',
    plano_sessoes:  paciente?.plano_sessoes || 0,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addFilho = () => set('filhos', [...form.filhos, { nome: '', idade: '' }])
  const setFilho = (i, k, v) => set('filhos', form.filhos.map((f, idx) => idx === i ? { ...f, [k]: v } : f))
  const removeFilho = (i) => set('filhos', form.filhos.filter((_, idx) => idx !== i))

  const handleSave = () => {
    if (!form.nome.trim()) return
    const data = { ...form }
    if (!CASADO.includes(data.estado_civil)) {
      data.conjuge_nome = ''
      data.conjuge_idade = ''
    }
    onSave(paciente ? { ...paciente, ...data } : data)
  }

  const inp = {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    border: '1.5px solid #e8f0ec', fontSize: 13, outline: 'none',
    background: '#fafcfb', color: '#0f1a14', boxSizing: 'border-box',
  }
  const lbl = { display: 'block', fontSize: 11, fontWeight: 600, color: '#3a9175', marginBottom: 5 }
  const section = { fontSize: 11, fontWeight: 700, color: '#3a6655', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10, marginTop: 4 }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      className="md:items-center md:p-4">
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: '#fff', width: '100%', maxWidth: 520,
        borderRadius: '20px 20px 0 0', boxShadow: '0 -4px 40px rgba(0,0,0,.12)',
        maxHeight: '92vh', overflowY: 'auto', display: 'flex', flexDirection: 'column'
      }} className="md:rounded-2xl">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f0f5f2', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#0f1a14' }}>{paciente ? 'Editar Paciente' : 'Novo Paciente'}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0c8b8', padding: 4 }}><X size={16} /></button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── IDENTIFICAÇÃO ── */}
          <p style={section}>Identificação</p>

          <div>
            <label style={lbl}>Nome completo *</label>
            <input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do paciente" style={inp} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Telefone</label>
              <input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(27) 99999-9999" style={inp} />
            </div>
            <div>
              <label style={lbl}>Data de nascimento</label>
              <input type="date" value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} style={inp} />
            </div>
          </div>

          <div>
            <label style={lbl}>E-mail</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@exemplo.com" style={inp} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Profissão</label>
              <input value={form.profissao} onChange={e => set('profissao', e.target.value)} placeholder="Ex: Professora" style={inp} />
            </div>
            <div>
              <label style={lbl}>Trabalhando?</label>
              <div style={{ display: 'flex', gap: 8, paddingTop: 2 }}>
                {['Sim', 'Não'].map(v => (
                  <button key={v} type="button" onClick={() => set('trabalhando', v === 'Sim')} style={{
                    flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                    border: '1.5px solid', cursor: 'pointer', transition: 'all .15s',
                    borderColor: form.trabalhando === (v === 'Sim') && form.trabalhando !== null ? '#3a9175' : '#e8f0ec',
                    background: form.trabalhando === (v === 'Sim') && form.trabalhando !== null ? '#f0f9f4' : '#fafcfb',
                    color: form.trabalhando === (v === 'Sim') && form.trabalhando !== null ? '#0f6e56' : '#6b7280',
                  }}>{v}</button>
                ))}
              </div>
            </div>
          </div>

          {/* ── FAMÍLIA ── */}
          <p style={section}>Família</p>

          <div>
            <label style={lbl}>Estado civil</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ESTADOS_CIVIS.map(ec => (
                <button key={ec} type="button" onClick={() => set('estado_civil', form.estado_civil === ec ? '' : ec)} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  border: '1.5px solid', cursor: 'pointer', transition: 'all .15s',
                  borderColor: form.estado_civil === ec ? '#3a9175' : '#e8f0ec',
                  background: form.estado_civil === ec ? '#f0f9f4' : '#fafcfb',
                  color: form.estado_civil === ec ? '#0f6e56' : '#6b7280',
                }}>{ec}</button>
              ))}
            </div>
          </div>

          {CASADO.includes(form.estado_civil) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
              <div>
                <label style={lbl}>Nome do cônjuge</label>
                <input value={form.conjuge_nome} onChange={e => set('conjuge_nome', e.target.value)} placeholder="Nome completo" style={inp} />
              </div>
              <div>
                <label style={lbl}>Idade</label>
                <input type="number" min={1} max={120} value={form.conjuge_idade} onChange={e => set('conjuge_idade', e.target.value)} placeholder="—" style={{ ...inp, width: 72, textAlign: 'center' }} />
              </div>
            </div>
          )}

          {/* Filhos */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ ...lbl, margin: 0 }}>Filhos</label>
              <button type="button" onClick={addFilho} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#3a9175', fontWeight: 600
              }}><Plus size={12} /> Adicionar</button>
            </div>
            {form.filhos.length === 0 && (
              <p style={{ fontSize: 12, color: '#a0c8b8', fontStyle: 'italic' }}>Nenhum filho cadastrado.</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.filhos.map((f, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'center' }}>
                  <input value={f.nome} onChange={e => setFilho(i, 'nome', e.target.value)}
                    placeholder={`Nome do filho ${i + 1}`} style={inp} />
                  <input type="number" min={0} max={99} value={f.idade} onChange={e => setFilho(i, 'idade', e.target.value)}
                    placeholder="Idade" style={{ ...inp, width: 64, textAlign: 'center' }} />
                  <button type="button" onClick={() => removeFilho(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f09595', padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── PLANO DE SAÚDE ── */}
          <p style={section}>Plano de Saúde</p>

          <div>
            <label style={lbl}>Convênio</label>
            <select value={form.convenio_id} onChange={e => set('convenio_id', e.target.value)} style={inp}>
              <option value="">Selecione...</option>
              {convenios.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          {/* ── ENDEREÇO ── */}
          <p style={section}>Endereço</p>

          <div>
            <label style={lbl}>Endereço</label>
            <input value={form.endereco} onChange={e => set('endereco', e.target.value)} placeholder="Rua, número, bairro..." style={inp} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
            <div>
              <label style={lbl}>Cidade</label>
              <input value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Ex: Aracruz" style={inp} />
            </div>
            <div>
              <label style={lbl}>Estado</label>
              <select value={form.estado} onChange={e => set('estado', e.target.value)} style={{ ...inp, width: 80 }}>
                <option value="">UF</option>
                {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>

          {/* ── COMO CHEGOU ── */}
          <p style={section}>Origem</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ORIGENS.map(o => (
              <button key={o} type="button" onClick={() => set('origem', form.origem === o ? '' : o)} style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: '1.5px solid', cursor: 'pointer', transition: 'all .15s',
                borderColor: form.origem === o ? '#3a9175' : '#e8f0ec',
                background: form.origem === o ? '#f0f9f4' : '#fafcfb',
                color: form.origem === o ? '#0f6e56' : '#6b7280',
              }}>{o}</button>
            ))}
          </div>

          {/* ── PLANO DE SESSÕES ── */}
          <p style={section}>Plano de Sessões</p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {[0, 4, 8, 12].map(n => (
              <button key={n} type="button" onClick={() => set('plano_sessoes', n)} style={{
                padding: '5px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                border: '1.5px solid', cursor: 'pointer', transition: 'all .15s',
                borderColor: form.plano_sessoes === n ? '#3a9175' : '#e8f0ec',
                background: form.plano_sessoes === n ? '#f0f9f4' : '#fafcfb',
                color: form.plano_sessoes === n ? '#0f6e56' : '#6b7280',
              }}>{n === 0 ? 'Sem plano' : `${n} sessões`}</button>
            ))}
            <input type="number" min={1} max={99} placeholder="Outro"
              value={[0,4,8,12].includes(form.plano_sessoes) ? '' : form.plano_sessoes || ''}
              onChange={e => set('plano_sessoes', parseInt(e.target.value) || 0)}
              style={{ width: 70, padding: '5px 10px', borderRadius: 10, border: '1.5px solid #e8f0ec', fontSize: 12, outline: 'none', textAlign: 'center' }} />
          </div>

          {/* ── OBSERVAÇÕES ── */}
          <div>
            <label style={lbl}>Observações</label>
            <textarea value={form.obs} onChange={e => set('obs', e.target.value)} rows={2}
              style={{ ...inp, resize: 'none' }} placeholder="Observações gerais..." />
          </div>

          {paciente && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.ativo} onChange={e => set('ativo', e.target.checked)} />
              Paciente ativo
            </label>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, padding: '16px 20px', borderTop: '1px solid #f0f5f2', position: 'sticky', bottom: 0, background: '#fff' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #e8f0ec', background: 'transparent', fontSize: 13, color: '#6b9e8a', cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleSave} style={{ flex: 1, padding: '11px', borderRadius: 10, background: '#3a9175', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Salvar</button>
        </div>
      </div>
    </div>
  )
}
