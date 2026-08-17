import { useState } from 'react'
import { Heart, CreditCard, AlertTriangle, LogOut } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useNavigate } from 'react-router-dom'

export default function PagamentoPendente() {
  const { profissional, logout, iniciarCheckout } = useApp()
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const inadimplente = profissional?.status === 'inadimplente'

  const handlePagar = async () => {
    setCarregando(true); setErro('')
    try {
      const url = await iniciarCheckout()
      if (url) window.location.href = url
      else setErro('Não foi possível gerar o link de pagamento. Tente novamente.')
    } catch {
      setErro('Erro ao conectar com o sistema de pagamento.')
    } finally {
      setCarregando(false)
    }
  }

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1510 0%, #0f1a14 50%, #162219 100%)',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 460, background: '#fff', borderRadius: 20, padding: '48px 40px', textAlign: 'center' }}>

        <div style={{ width: 56, height: 56, borderRadius: 16, background: inadimplente ? '#fef3f2' : '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          {inadimplente
            ? <AlertTriangle size={24} color="#a32d2d" />
            : <Heart size={24} color="#3a9175" />}
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f1a14', marginBottom: 10 }}>
          {inadimplente ? 'Pagamento em atraso' : 'Ative sua assinatura'}
        </h1>

        <p style={{ fontSize: 14, color: '#6b9e8a', lineHeight: 1.7, marginBottom: 32 }}>
          {inadimplente
            ? 'Identificamos um problema com o seu pagamento. Atualize seu cartão para continuar acessando o Praxis.'
            : 'Para acessar o sistema, conclua a ativação da sua assinatura. O processo leva menos de 2 minutos.'}
        </p>

        <div style={{ background: '#f6faf8', border: '1px solid #e2ede9', borderRadius: 14, padding: '20px 24px', marginBottom: 28, textAlign: 'left' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#6b9e8a', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Seu plano</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0f1a14' }}>Praxis Mensal</p>
              <p style={{ fontSize: 12, color: '#6b9e8a', marginTop: 2 }}>Acesso completo a todas as funcionalidades</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#3a9175' }}>R$ 99<span style={{ fontSize: 13 }}>,90</span></p>
              <p style={{ fontSize: 11, color: '#a0c8b8' }}>por mês</p>
            </div>
          </div>
        </div>

        {erro && <p style={{ fontSize: 12, color: '#a32d2d', background: '#fcebeb', padding: '8px 12px', borderRadius: 8, marginBottom: 16 }}>{erro}</p>}

        <button onClick={handlePagar} disabled={carregando} style={{
          width: '100%', padding: '14px', borderRadius: 12, border: 'none',
          background: carregando ? '#7aaa95' : '#3a9175', color: '#fff',
          fontSize: 14, fontWeight: 600, cursor: carregando ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14,
        }}>
          <CreditCard size={16} />
          {carregando ? 'Aguarde…' : inadimplente ? 'Atualizar forma de pagamento' : 'Ativar assinatura agora'}
        </button>

        <button onClick={handleLogout} style={{
          width: '100%', padding: '10px', borderRadius: 12, border: '1px solid #e2ede9',
          background: 'transparent', color: '#6b9e8a', fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <LogOut size={14} /> Sair da conta
        </button>

        <p style={{ marginTop: 24, fontSize: 11, color: '#a0c8b8' }}>
          Pagamento seguro via Pagar.me · Cancele quando quiser
        </p>
      </div>
    </div>
  )
}
