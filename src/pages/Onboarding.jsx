import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Stethoscope } from 'lucide-react'

export default function Onboarding() {
  const { completeOnboarding, iniciarCheckout } = useApp()
  const [form, setForm] = useState({ nome: '', especialidade: '', registro: '', duracao_minutos: 50 })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [etapa, setEtapa] = useState('perfil') // 'perfil' | 'checkout'

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nome.trim()) { setErro('Informe seu nome completo.'); return }
    setSalvando(true)
    try {
      await completeOnboarding(form)
      setEtapa('checkout')
      // Redireciona para checkout do Pagar.me
      const url = await iniciarCheckout()
      if (url) window.location.href = url
    } catch (err) {
      setErro('Erro ao salvar perfil. Tente novamente.')
      setSalvando(false)
    }
  }

  const IN = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: '1.5px solid #e2ede9', fontSize: 13, outline: 'none',
    background: '#fafcfb', color: '#0f1a14', fontFamily: 'inherit',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1510 0%, #0f1a14 50%, #162219 100%)',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 460, background: '#fff', borderRadius: 16, padding: '40px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 15, background: '#3a9175',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px'
          }}>
            <Stethoscope size={22} color="#fff" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f1a14', marginBottom: 6 }}>Configure seu perfil</h1>
          <p style={{ fontSize: 13, color: '#6b9e8a' }}>Essas informações aparecerão nos documentos gerados pelo sistema.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#245d4c', marginBottom: 6 }}>Nome completo *</label>
            <input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Dr. João Silva" required style={IN}
              onFocus={e => e.target.style.borderColor = '#3a9175'} onBlur={e => e.target.style.borderColor = '#e2ede9'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#245d4c', marginBottom: 6 }}>Especialidade</label>
            <input value={form.especialidade} onChange={e => set('especialidade', e.target.value)} placeholder="Psicologia Clínica, Clínico Geral…" style={IN}
              onFocus={e => e.target.style.borderColor = '#3a9175'} onBlur={e => e.target.style.borderColor = '#e2ede9'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#245d4c', marginBottom: 6 }}>Registro profissional</label>
            <input value={form.registro} onChange={e => set('registro', e.target.value)} placeholder="CRP 00/00000 · CRM 000000 · CREFITO…" style={IN}
              onFocus={e => e.target.style.borderColor = '#3a9175'} onBlur={e => e.target.style.borderColor = '#e2ede9'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#245d4c', marginBottom: 6 }}>Duração padrão da sessão (minutos)</label>
            <input type="number" min={15} max={180} value={form.duracao_minutos} onChange={e => set('duracao_minutos', Number(e.target.value))} style={IN}
              onFocus={e => e.target.style.borderColor = '#3a9175'} onBlur={e => e.target.style.borderColor = '#e2ede9'} />
          </div>

          {erro && <p style={{ fontSize: 12, color: '#a32d2d', background: '#fcebeb', padding: '8px 12px', borderRadius: 8 }}>{erro}</p>}

          <button type="submit" disabled={salvando} style={{
            marginTop: 8, padding: '12px', borderRadius: 10, border: 'none',
            background: salvando ? '#7aaa95' : '#3a9175', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: salvando ? 'default' : 'pointer',
          }}>
            {etapa === 'checkout' ? 'Redirecionando para pagamento…' : salvando ? 'Salvando…' : 'Continuar para pagamento →'}
          </button>
        </form>
      </div>
    </div>
  )
}
