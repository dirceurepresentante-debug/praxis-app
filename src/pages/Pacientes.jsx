import { useState } from 'react'
import { Search, Plus, Phone, FileText, User } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import ModalPaciente from '../components/ModalPaciente'
import FichaPaciente from '../components/FichaPaciente'

export default function Pacientes() {
  const { data, addItem, editItem } = useApp()
  const [busca, setBusca] = useState('')
  const [convenioFiltro, setConvenioFiltro] = useState('')
  const [mostrarInativos, setMostrarInativos] = useState(false)
  const [modalNovo, setModalNovo] = useState(false)
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)

  const pacientes = data.pacientes || []
  const convenios = data.convenios || []
  const getConvenio = id => convenios.find(c => c.id === id)

  const filtrados = pacientes.filter(p => {
    if (!mostrarInativos && !p.ativo) return false
    if (convenioFiltro && p.convenio_id !== convenioFiltro) return false
    if (busca) {
      const q = busca.toLowerCase()
      return p.nome?.toLowerCase().includes(q) || p.cpf?.includes(q) || p.telefone?.includes(q)
    }
    return true
  })

  const handleSave = pac => {
    if (pac.id) editItem('pacientes', pac.id, pac)
    else addItem('pacientes', { ...pac, ativo: true })
    setModalNovo(false)
  }

  const initials = nome => nome?.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase() || '?'
  const convenioColor = { 'Particular': '#5f5e5a', 'ProVida - Aracruz': '#0f6e56' }
  const convenioBg   = { 'Particular': '#f3f4f6', 'ProVida - Aracruz': '#e1f5ee' }

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0f1a14', margin: 0 }}>Pacientes</h1>
          <p style={{ fontSize: 12, color: '#6b9e8a', marginTop: 3 }}>{filtrados.length} paciente{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModalNovo(true)} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: '#3a9175', color: '#fff', border: 'none',
          borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
        }}>
          <Plus size={15} /> Novo paciente
        </button>
      </div>

      {/* Filtros */}
      <div style={{ background: '#fff', border: '1px solid #e8f0ec', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a0c8b8' }} />
          <input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF ou telefone..."
            style={{
              width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10,
              border: '1.5px solid #e8f0ec', fontSize: 13, outline: 'none', background: '#fafcfb', color: '#0f1a14'
            }}
            onFocus={e => e.target.style.borderColor = '#3a9175'}
            onBlur={e => e.target.style.borderColor = '#e8f0ec'}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#6b9e8a', fontWeight: 500, whiteSpace: 'nowrap' }}>Convênio</span>
          {['', ...convenios.map(c => c.id)].map(id => {
            const conv = convenios.find(c => c.id === id)
            const label = conv ? conv.nome : 'Todos'
            const ativo = convenioFiltro === id
            return (
              <button key={id} onClick={() => setConvenioFiltro(id)} style={{
                padding: '5px 12px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: 500,
                cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
                background: ativo ? '#0f1a14' : '#f0f5f2',
                color: ativo ? '#fff' : '#6b9e8a',
              }}>{label}</button>
            )
          })}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', fontSize: 12, color: '#6b9e8a', cursor: 'pointer' }}>
            <input type="checkbox" checked={mostrarInativos} onChange={e => setMostrarInativos(e.target.checked)} style={{ accentColor: '#3a9175' }} />
            Mostrar inativos
          </label>
        </div>
      </div>

      {/* Grid */}
      {filtrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#a0c8b8' }}>
          <User size={32} style={{ margin: '0 auto 12px', opacity: .3 }} />
          <p style={{ fontSize: 13 }}>Nenhum paciente encontrado.</p>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
        {filtrados.map(p => {
          const conv = getConvenio(p.convenio_id)
          const sessoes = (data.agendamentos||[]).filter(a => a.paciente_id === p.id && a.status === 'realizado').length
          const cName = conv?.nome || 'Particular'
          return (
            <div key={p.id} onClick={() => setPacienteSelecionado(p)} style={{
              background: '#fff', border: '1px solid #e8f0ec', borderRadius: 14,
              padding: '16px 18px', cursor: 'pointer', transition: 'all .15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#3a9175'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(58,145,117,.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8f0ec'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: '#f0f9f4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#3a9175', flexShrink: 0
                }}>{initials(p.nome)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f1a14', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nome}</p>
                  {p.telefone && (
                    <p style={{ fontSize: 11, color: '#6b9e8a', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={10} /> {p.telefone}
                    </p>
                  )}
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 600, padding: '3px 7px', borderRadius: 20,
                  background: p.ativo ? '#e1f5ee' : '#f3f4f6',
                  color: p.ativo ? '#0f6e56' : '#9ca3af'
                }}>{p.ativo ? 'ATIVO' : 'INATIVO'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f0f5f2' }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                  background: convenioBg[cName] || '#f3f4f6',
                  color: convenioColor[cName] || '#6b9e8a'
                }}>{cName}</span>
                <span style={{ fontSize: 11, color: '#a0c8b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FileText size={10} /> {sessoes} sess{sessoes !== 1 ? 'ões' : 'ão'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {modalNovo && <ModalPaciente convenios={convenios} onSave={handleSave} onClose={() => setModalNovo(false)} />}
      {pacienteSelecionado && (
        <FichaPaciente
          paciente={pacienteSelecionado} convenios={convenios}
          onClose={() => setPacienteSelecionado(null)}
          onEdit={pac => { editItem('pacientes', pac.id, pac); setPacienteSelecionado(pac) }}
        />
      )}
    </div>
  )
}
