import { NavLink, useNavigate } from 'react-router-dom'
import { Calendar, Users, Settings, BarChart2, LogOut, Menu, X, Heart, UserPlus, DollarSign, Clock } from 'lucide-react'
import { useState } from 'react'
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

export default function Layout({ children }) {
  const { user, logout, DEMO_MODE, pendentesCount } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showPreCadastros, setShowPreCadastros] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar desktop */}
      <aside style={{
        width: 200, background: '#0f1a14', display: 'flex', flexDirection: 'column',
        flexShrink: 0, borderRight: '1px solid #1d2e22'
      }} className="hidden md:flex">
        {/* Logo */}
        <div style={{ padding: '20px 18px 18px', borderBottom: '1px solid #1d2e22' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg,#3a9175,#1b3d33)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Heart size={14} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e8f5f0', lineHeight: 1.2 }}>Praxis</p>
              <p style={{ fontSize: 10, color: '#5a8a78', marginTop: 1 }}>Gestão Clínica</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          <p style={{ fontSize: 9, fontWeight: 600, color: '#3a6655', letterSpacing: '.08em', textTransform: 'uppercase', padding: '10px 8px 6px' }}>Principal</p>
          {nav.slice(0, 3).map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px',
                borderRadius: 8, fontSize: 12, fontWeight: 500, textDecoration: 'none',
                marginBottom: 2, transition: 'background .15s',
                background: isActive ? 'rgba(58,145,117,.18)' : 'transparent',
                color: isActive ? '#5dae92' : '#7aaa95',
                borderRight: isActive ? '2px solid #5dae92' : '2px solid transparent',
              })}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
          <p style={{ fontSize: 9, fontWeight: 600, color: '#3a6655', letterSpacing: '.08em', textTransform: 'uppercase', padding: '14px 8px 6px' }}>Configuração</p>
          {nav.slice(3).map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px',
                borderRadius: 8, fontSize: 12, fontWeight: 500, textDecoration: 'none',
                marginBottom: 2, transition: 'background .15s',
                background: isActive ? 'rgba(58,145,117,.18)' : 'transparent',
                color: isActive ? '#5dae92' : '#7aaa95',
                borderRight: isActive ? '2px solid #5dae92' : '2px solid transparent',
              })}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Pré-cadastros badge */}
        <div style={{ padding: '0 10px 8px' }}>
          <button onClick={() => setShowPreCadastros(true)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '8px 10px', borderRadius: 8, background: 'transparent',
            border: 'none', cursor: 'pointer', color: '#7aaa95', fontSize: 12, fontWeight: 500,
            transition: 'background .15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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

        {/* Footer */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid #1d2e22' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', background: '#1d4d3a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 600, color: '#5dae92', flexShrink: 0
            }}>{user?.nome?.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase() || 'P'}</div>
            <div>
              <p style={{ fontSize: 11, color: '#e8f5f0', fontWeight: 500 }}>{user?.nome}</p>
              <p style={{ fontSize: 10, color: '#5a8a78' }}>Admin</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 7, width: '100%',
            padding: '7px 8px', borderRadius: 8, background: 'transparent', border: 'none',
            fontSize: 11, color: '#4d7862', cursor: 'pointer', transition: 'all .15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = '#ff6b6b' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4d7862' }}>
            <LogOut size={13} /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
        background: '#0f1a14', borderBottom: '1px solid #1d2e22',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px'
      }}>
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden" style={{
          position: 'fixed', inset: 0, zIndex: 20, background: '#0f1a14', paddingTop: 56
        }}>
          <nav style={{ padding: '16px 12px' }}>
            {nav.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                onClick={() => setOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none',
                  marginBottom: 4,
                  background: isActive ? 'rgba(58,145,117,.18)' : 'transparent',
                  color: isActive ? '#5dae92' : '#7aaa95',
                })}>
                <Icon size={17} /> {label}
              </NavLink>
            ))}
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', marginTop: 16,
              padding: '12px 14px', borderRadius: 10, background: 'transparent', border: 'none',
              fontSize: 14, color: '#ff6b6b', cursor: 'pointer'
            }}>
              <LogOut size={17} /> Sair
            </button>
          </nav>
        </div>
      )}

      {showPreCadastros && <PreCadastros onClose={() => setShowPreCadastros(false)} />}

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', background: '#f6f8f7' }} className="md:pt-0 pt-14">
        {DEMO_MODE && (
          <div style={{
            background: '#fef9ec', borderBottom: '1px solid #faeeda',
            padding: '8px 16px', fontSize: 11, color: '#854f0b', textAlign: 'center'
          }}>
            Modo demonstração — dados fictícios. Configure o Supabase para usar dados reais.
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
