import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')
    const ok = await login(email, senha)
    if (ok) navigate('/')
    else { setErro('E-mail ou senha incorretos.'); setCarregando(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0a1510 0%, #0f1a14 50%, #162219 100%)'
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40
      }} className="hidden md:flex">
        <div style={{ maxWidth: 400 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg,#3a9175,#1b3d33)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32
          }}>
            <Heart size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: '#e8f5f0', lineHeight: 1.2, marginBottom: 12 }}>
            Praxis
          </h1>
          <p style={{ fontSize: 15, color: '#5a8a78', lineHeight: 1.7 }}>
            Gestão clínica completa para terapeutas e médicos — agenda, prontuários e financeiro em um só lugar.
          </p>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '📅', text: 'Agenda inteligente com visão diária, semanal e mensal' },
              { icon: '📋', text: 'Prontuário clínico com evolução de humor por sessão' },
              { icon: '💰', text: 'Controle financeiro e relatórios por convênio' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <p style={{ fontSize: 13, color: '#4d7862', lineHeight: 1.5 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{
        width: '100%', maxWidth: 420, background: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px'
      }}>
        {/* Mobile logo */}
        <div className="md:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: '#3a9175',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
          }}>
            <Heart size={20} color="#fff" />
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#0f1a14' }}>Praxis</p>
          <p style={{ fontSize: 12, color: '#7aaa95', marginTop: 2 }}>Gestão Clínica</p>
        </div>

        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#0f1a14', marginBottom: 6 }}>Bem-vinda de volta</h2>
          <p style={{ fontSize: 13, color: '#6b9e8a', marginBottom: 28 }}>Entre com suas credenciais para acessar.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#245d4c', marginBottom: 6 }}>E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '1.5px solid #e2ede9', fontSize: 13, outline: 'none',
                  transition: 'border-color .15s', background: '#fafcfb', color: '#0f1a14'
                }}
                onFocus={e => e.target.style.borderColor = '#3a9175'}
                onBlur={e => e.target.style.borderColor = '#e2ede9'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#245d4c', marginBottom: 6 }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSenha ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••" required
                  style={{
                    width: '100%', padding: '11px 40px 11px 14px', borderRadius: 10,
                    border: '1.5px solid #e2ede9', fontSize: 13, outline: 'none',
                    transition: 'border-color .15s', background: '#fafcfb', color: '#0f1a14'
                  }}
                  onFocus={e => e.target.style.borderColor = '#3a9175'}
                  onBlur={e => e.target.style.borderColor = '#e2ede9'}
                />
                <button type="button" onClick={() => setShowSenha(!showSenha)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#6b9e8a', cursor: 'pointer', padding: 2
                }}>
                  {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {erro && <p style={{ fontSize: 12, color: '#a32d2d', background: '#fcebeb', padding: '8px 12px', borderRadius: 8 }}>{erro}</p>}

            <button type="submit" disabled={carregando} style={{
              width: '100%', padding: '12px', borderRadius: 10,
              background: carregando ? '#7aaa95' : '#3a9175', color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 600, cursor: carregando ? 'default' : 'pointer', marginTop: 4,
              transition: 'background .15s'
            }}
              onMouseEnter={e => { if (!carregando) e.target.style.background = '#2b745d' }}
              onMouseLeave={e => { if (!carregando) e.target.style.background = '#3a9175' }}>
              {carregando ? 'Entrando…' : 'Acessar painel'}
            </button>
          </form>

        </div>

        <p style={{ marginTop: 32, fontSize: 11, color: '#a0c8b8', textAlign: 'center' }}>
          Desenvolvido por DANV · Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
