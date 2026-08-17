import { useState } from 'react'
import { Heart, Check, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'

// ─── Supabase (conecta automaticamente quando VITE_SUPABASE_URL estiver configurado) ───
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const DEMO_MODE    = !SUPABASE_URL

async function submitToSupabase(payload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pre_cadastros`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ ...payload, status: 'pendente' }),
  })
  if (!res.ok) throw new Error('Erro ao enviar cadastro')
}

const ORIGENS      = ['Indicação', 'Instagram', 'Facebook', 'Tráfego Pago', 'Google', 'Site', 'Outros']
const ESTADOS_CIVIS= ['Solteiro(a)', 'Casado(a)', 'União Estável', 'Divorciado(a)', 'Viúvo(a)']
const ESTADOS_BR   = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const CASADO       = ['Casado(a)', 'União Estável']
const CONVENIOS    = ['Particular', 'ProVida - Aracruz']

const inp = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  border: '1.5px solid #e8f0ec', fontSize: 14, outline: 'none',
  background: '#fafcfb', color: '#0f1a14', boxSizing: 'border-box',
  transition: 'border-color .15s',
}
const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#3a9175', marginBottom: 6 }

function Field({ label, children }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  )
}

export default function FormPublico() {
  const [form, setForm] = useState({
    nome: '', telefone: '', email: '', data_nascimento: '',
    convenio: '', estado_civil: '', conjuge_nome: '', conjuge_idade: '',
    filhos: [], profissao: '', trabalhando: null,
    endereco: '', cidade: '', estado: '', origem: '', obs: '',
  })
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const addFilho    = () => set('filhos', [...form.filhos, { nome: '', idade: '' }])
  const setFilho    = (i, k, v) => set('filhos', form.filhos.map((f, idx) => idx === i ? { ...f, [k]: v } : f))
  const removeFilho = (i) => set('filhos', form.filhos.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nome.trim() || !form.telefone.trim()) {
      setErro('Por favor, preencha nome e telefone.')
      return
    }
    setErro('')
    setEnviando(true)
    try {
      if (DEMO_MODE) {
        await new Promise(r => setTimeout(r, 800)) // simula envio
      } else {
        await submitToSupabase(form)
      }
      setEnviado(true)
    } catch (e) {
      setErro('Ocorreu um erro. Tente novamente ou entre em contato.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a1510,#0f1a14)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: '48px 36px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e1f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={28} color="#3a9175" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f1a14', marginBottom: 10 }}>Cadastro enviado!</h2>
          <p style={{ fontSize: 14, color: '#6b9e8a', lineHeight: 1.6 }}>
            Suas informações foram recebidas. A Bruna entrará em contato em breve para confirmar seu primeiro atendimento.
          </p>
          <p style={{ fontSize: 12, color: '#a0c8b8', marginTop: 24 }}>Obrigado pela confiança 💚</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a1510,#0f1a14)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#3a9175,#1b3d33)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Heart size={22} color="#fff" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e8f5f0', marginBottom: 6 }}>Ficha de Cadastro</h1>
          <p style={{ fontSize: 13, color: '#5a8a78' }}>Praxis · Gestão Clínica</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* ── DADOS PESSOAIS ── */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#3a6655', letterSpacing: '.06em', textTransform: 'uppercase' }}>Dados Pessoais</p>

            <Field label="Nome completo *">
              <input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Seu nome completo" style={inp} required
                onFocus={e => e.target.style.borderColor='#3a9175'} onBlur={e => e.target.style.borderColor='#e8f0ec'} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Telefone / WhatsApp *">
                <input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(27) 99999-9999" style={inp} required
                  onFocus={e => e.target.style.borderColor='#3a9175'} onBlur={e => e.target.style.borderColor='#e8f0ec'} />
              </Field>
              <Field label="Data de nascimento">
                <input type="date" value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} style={inp}
                  onFocus={e => e.target.style.borderColor='#3a9175'} onBlur={e => e.target.style.borderColor='#e8f0ec'} />
              </Field>
            </div>

            <Field label="E-mail">
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" style={inp}
                onFocus={e => e.target.style.borderColor='#3a9175'} onBlur={e => e.target.style.borderColor='#e8f0ec'} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Profissão">
                <input value={form.profissao} onChange={e => set('profissao', e.target.value)} placeholder="Ex: Professora" style={inp}
                  onFocus={e => e.target.style.borderColor='#3a9175'} onBlur={e => e.target.style.borderColor='#e8f0ec'} />
              </Field>
              <Field label="Trabalhando?">
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Sim','Não'].map(v => (
                    <button key={v} type="button" onClick={() => set('trabalhando', v === 'Sim')} style={{
                      flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                      border: '1.5px solid', cursor: 'pointer', transition: 'all .15s',
                      borderColor: form.trabalhando === (v==='Sim') && form.trabalhando !== null ? '#3a9175' : '#e8f0ec',
                      background: form.trabalhando === (v==='Sim') && form.trabalhando !== null ? '#f0f9f4' : '#fafcfb',
                      color: form.trabalhando === (v==='Sim') && form.trabalhando !== null ? '#0f6e56' : '#6b7280',
                    }}>{v}</button>
                  ))}
                </div>
              </Field>
            </div>

            {/* ── FAMÍLIA ── */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#3a6655', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 4 }}>Família</p>

            <Field label="Estado civil">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ESTADOS_CIVIS.map(ec => (
                  <button key={ec} type="button" onClick={() => set('estado_civil', form.estado_civil === ec ? '' : ec)} style={{
                    padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                    border: '1.5px solid', cursor: 'pointer', transition: 'all .15s',
                    borderColor: form.estado_civil === ec ? '#3a9175' : '#e8f0ec',
                    background: form.estado_civil === ec ? '#f0f9f4' : '#fafcfb',
                    color: form.estado_civil === ec ? '#0f6e56' : '#6b7280',
                  }}>{ec}</button>
                ))}
              </div>
            </Field>

            {CASADO.includes(form.estado_civil) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
                <Field label="Nome do cônjuge">
                  <input value={form.conjuge_nome} onChange={e => set('conjuge_nome', e.target.value)} placeholder="Nome completo" style={inp}
                    onFocus={e => e.target.style.borderColor='#3a9175'} onBlur={e => e.target.style.borderColor='#e8f0ec'} />
                </Field>
                <Field label="Idade">
                  <input type="number" min={1} max={120} value={form.conjuge_idade} onChange={e => set('conjuge_idade', e.target.value)}
                    placeholder="—" style={{ ...inp, width: 72, textAlign: 'center' }}
                    onFocus={e => e.target.style.borderColor='#3a9175'} onBlur={e => e.target.style.borderColor='#e8f0ec'} />
                </Field>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={lbl}>Filhos</label>
                <button type="button" onClick={addFilho} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#3a9175', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Plus size={12} /> Adicionar
                </button>
              </div>
              {form.filhos.length === 0 && <p style={{ fontSize: 12, color: '#a0c8b8', fontStyle: 'italic' }}>Nenhum filho cadastrado.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {form.filhos.map((f, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 72px auto', gap: 8, alignItems: 'center' }}>
                    <input value={f.nome} onChange={e => setFilho(i,'nome',e.target.value)} placeholder={`Nome do filho ${i+1}`} style={inp}
                      onFocus={e => e.target.style.borderColor='#3a9175'} onBlur={e => e.target.style.borderColor='#e8f0ec'} />
                    <input type="number" min={0} max={99} value={f.idade} onChange={e => setFilho(i,'idade',e.target.value)}
                      placeholder="Idade" style={{ ...inp, textAlign: 'center' }}
                      onFocus={e => e.target.style.borderColor='#3a9175'} onBlur={e => e.target.style.borderColor='#e8f0ec'} />
                    <button type="button" onClick={() => removeFilho(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f09595', padding: 4 }}><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── PLANO DE SAÚDE ── */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#3a6655', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 4 }}>Plano de Saúde</p>

            <Field label="Convênio">
              <div style={{ display: 'flex', gap: 8 }}>
                {CONVENIOS.map(c => (
                  <button key={c} type="button" onClick={() => set('convenio', form.convenio === c ? '' : c)} style={{
                    flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                    border: '1.5px solid', cursor: 'pointer', transition: 'all .15s',
                    borderColor: form.convenio === c ? '#3a9175' : '#e8f0ec',
                    background: form.convenio === c ? '#f0f9f4' : '#fafcfb',
                    color: form.convenio === c ? '#0f6e56' : '#6b7280',
                  }}>{c}</button>
                ))}
              </div>
            </Field>

            {/* ── ENDEREÇO ── */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#3a6655', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 4 }}>Endereço</p>

            <Field label="Endereço">
              <input value={form.endereco} onChange={e => set('endereco', e.target.value)} placeholder="Rua, número, bairro..." style={inp}
                onFocus={e => e.target.style.borderColor='#3a9175'} onBlur={e => e.target.style.borderColor='#e8f0ec'} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 88px', gap: 12 }}>
              <Field label="Cidade">
                <input value={form.cidade} onChange={e => set('cidade', e.target.value)} placeholder="Ex: Aracruz" style={inp}
                  onFocus={e => e.target.style.borderColor='#3a9175'} onBlur={e => e.target.style.borderColor='#e8f0ec'} />
              </Field>
              <Field label="Estado">
                <select value={form.estado} onChange={e => set('estado', e.target.value)} style={inp}>
                  <option value="">UF</option>
                  {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </Field>
            </div>

            {/* ── COMO CHEGOU ── */}
            <p style={{ fontSize: 11, fontWeight: 700, color: '#3a6655', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 4 }}>Como nos encontrou?</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ORIGENS.map(o => (
                <button key={o} type="button" onClick={() => set('origem', form.origem === o ? '' : o)} style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                  border: '1.5px solid', cursor: 'pointer', transition: 'all .15s',
                  borderColor: form.origem === o ? '#3a9175' : '#e8f0ec',
                  background: form.origem === o ? '#f0f9f4' : '#fafcfb',
                  color: form.origem === o ? '#0f6e56' : '#6b7280',
                }}>{o}</button>
              ))}
            </div>

            {/* ── OBSERVAÇÕES ── */}
            <Field label="Observações / Queixa principal">
              <textarea value={form.obs} onChange={e => set('obs', e.target.value)} rows={3}
                placeholder="Descreva brevemente o motivo pelo qual busca atendimento..." style={{ ...inp, resize: 'none' }}
                onFocus={e => e.target.style.borderColor='#3a9175'} onBlur={e => e.target.style.borderColor='#e8f0ec'} />
            </Field>

            {erro && (
              <p style={{ fontSize: 12, color: '#a32d2d', background: '#fcebeb', padding: '10px 14px', borderRadius: 10 }}>{erro}</p>
            )}

            {DEMO_MODE && (
              <p style={{ fontSize: 11, color: '#a0c8b8', background: '#f6faf8', padding: '8px 12px', borderRadius: 8, textAlign: 'center' }}>
                Modo demonstração — em produção os dados são salvos no sistema da terapeuta.
              </p>
            )}

            <button type="submit" disabled={enviando} style={{
              width: '100%', padding: '14px', borderRadius: 12, background: enviando ? '#6b9e8a' : '#3a9175',
              border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: enviando ? 'not-allowed' : 'pointer',
              transition: 'background .15s', marginTop: 4,
            }}>
              {enviando ? 'Enviando...' : 'Enviar cadastro'}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#3a6655', marginTop: 20 }}>
          Seus dados são confidenciais e protegidos · DANV
        </p>
      </div>
    </div>
  )
}
