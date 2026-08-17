import { NavLink, useNavigate } from 'react-router-dom'
import { Calendar, Users, Settings, BarChart2, LogOut, Menu, X, Heart, UserPlus, DollarSign, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import PreCadastros from './PreCadastros'

const nav = [
  { to: '/', icon: Calendar, label: 'Agenda' },
  { to: '/pacientes', icon: Users, label: 'Pacientes' },
  { to: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  { to: '/lista-espera', icon: Clock, label: 'Lista de Espera' },
  { to: '/relatorios', icon: BarChart2, label: 'Relatórios' },
  { to: '/cadastros', icon: Settings, label: 'Cadastros' },
]

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

export default function Layout({ children }) {
  const { user, logout, DEMO_MODE, pendentesCount } = useApp()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [showPreCadastros, setShowPreCadastros] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.nome?.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase() || 'P'

  const sidebarContent = (
    <>
      <div style={{ padding: '20px 18px 18px', borderBottom: '1px solid #1d2e22' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#3a9175,#1b3d33)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Heart size={14} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#e8f5f0', lineHeight: 1.2 }}>Praxis</p>
            <p style={{ fontSize: 10, color: '#5a8a78', marginTop: 1 }}>Gestão Clínica</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px' }}>
        <p style={{ fontSize: 9, fontWeight: 600, color: '#3a6655', letterSpacing: '.08em', textTransform: 'uppercase', padding: '10px 8px 6px' }}>Principal</p>
        {nav.slice(0, 3).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px',
              borderRadius: 8, fontSize: 12, fontWeight: 500, textDecoration: 'none',
              marginBottom: 2, transition: 'background .15s',
              background: isActive ? 'rgba(58,145,117,.18)' : 'transparent',
              color: isActive ? '#5dae92' : '#7aaa95',
              borderRight: isActive ? '2px solid #5dae92' : '2px solid transparent',
            })}>
            <Icon size={15} />{label}
          </NavLink>
        ))}
        <p style={{ fontSize: 9, fontWeight: 600, color: '#3a6655', letterSpacing: '.08em', textTransform: 'uppercase', padding: '14px 8px 6px' }}>Configuração</p>
        {nav.slice(3).map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px',
              borderRadius: 8, fontSize: 12, fontWeight: 500, textDecoration: 'none',
              marginBottom: 2, transition: 'background .15s',
              background: isActive ? 'rgba(58,145,117,.18)' : 'transparent',
              color: isActive ? '#5dae92' : '#7aaa95',
              borderRight: isActive ? '2px solid #5dae92' : '2px solid transparent',
            })}>
            <Icon size={15} />{label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '0 10px 8px' }}>
        <button onClick={() => { setShowPreCadastros(true); setOpen(false) }} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '8px 10px', borderRadius: 8, background: 'transparent',
          border: 'none', cursor: 'pointer', color: '#7aaa95', fontSize: 12, fontWeight: 500,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={14} /> Pré-cadastros
          </span>
          {pendentesCount > 0 && (
            <span style={{ background: '#3a9175', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 20 }}>
              {pendentesCount}
            </span>
          )}
        </button>
      </div>

      <div style={{ padding: '14px 16px', borderTop: '1px solid #1d2e22' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1d4d3a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#5dae92', flexShrink: 0 }}>{initials}</div>
          <div>
            <p style={{ fontSize: 11, color: '#e8f5f0', fontWeight: 500 }}>{user?.nome}</p>
            <p style={{ fontSize: 10, color: '#5a8a78' }}>Admin</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 7, width: '100%',
          padding: '7px 8px', borderRadius: 8, background: 'transparent', border: 'none',
          fontSize: 11, color: '#4d7862', cursor: 'pointer',
        }}>
          <LogOut size={13} /> Sair
        </button>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Header mobile — faz parte do fluxo, não é fixo */}
        <div style={{ background: '#0f1a14', borderBottom: '1px solid #1d2e22', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: '#3a9175', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={11} color="#fff" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e8f5f0' }}>Praxis</span>
          </div>
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: '#7aaa95', cursor: 'pointer', padding: 4 }}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu mobile — sobrepõe o conteúdo */}
        {open && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#0f1a14', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #1d2e22', flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e8f5f0' }}>Praxis</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#7aaa95', cursor: 'pointer', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              {sidebarContent}
            </div>
          </div>
        )}

        <main style={{ flex: 1, overflowY: 'auto', background: '#f6f8f7' }}>
          {DEMO_MODE && (
            <div style={{ background: '#fef9ec', borderBottom: '1px solid #faeeda', padding: '8px 16px', fontSize: 11, color: '#854f0b', textAlign: 'center' }}>
              Modo demonstração — dados fictícios.
            </div>
          )}
          {children}
        </main>

        {showPreCadastros && <PreCadastros onClose={() => setShowPreCadastros(false)} />}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{ width: 200, background: '#0f1a14', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid #1d2e22' }}>
        {sidebarContent}
      </aside>

      {showPreCadastros && <PreCadastros onClose={() => setShowPreCadastros(false)} />}

      <main style={{ flex: 1, overflowY: 'auto', background: '#f6f8f7' }}>
        {DEMO_MODE && (
          <div style={{ background: '#fef9ec', borderBottom: '1px solid #faeeda', padding: '8px 16px', fontSize: 11, color: '#854f0b', textAlign: 'center' }}>
            Modo demonstração — dados fictícios. Configure o Supabase para usar dados reais.
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
