import { useState } from 'react'
import { format, addDays, subDays, addWeeks, subWeeks, subMonths, addMonths,
         startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Clock, AlertCircle, Ban } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import ModalAgendamento from '../components/ModalAgendamento'

const STATUS = {
  confirmado: { label: 'Confirmado', bg: '#e1f5ee', color: '#0f6e56', icon: CheckCircle2 },
  aguardando: { label: 'Aguardando', bg: '#faeeda', color: '#854f0b', icon: Clock },
  realizado:  { label: 'Realizado',  bg: '#eaf3de', color: '#3b6d11', icon: CheckCircle2 },
  faltou:     { label: 'Faltou',     bg: '#fcebeb', color: '#a32d2d', icon: AlertCircle },
  cancelado:  { label: 'Cancelado',  bg: '#f3f4f6', color: '#9ca3af', icon: Ban },
}

const fmt = (n) => `R$ ${n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`

const dateStr = d =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

function AppointmentRow({ ag, getPaciente, getTipo, getConvenio, onClick }) {
  const paciente = getPaciente(ag.paciente_id)
  const tipo     = getTipo(ag.tipo_id)
  const convenio = paciente ? getConvenio(paciente.convenio_id) : null
  const s        = STATUS[ag.status] || STATUS.aguardando
  const SIcon    = s.icon
  return (
    <div onClick={() => onClick(ag)} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
      cursor: 'pointer', transition: 'background .1s', borderRadius: 10
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#f6faf8'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div style={{ width: 36, flexShrink: 0, textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#245d4c' }}>{ag.hora}</p>
      </div>
      <div style={{ width: 3, height: 34, borderRadius: 2, background: tipo?.cor || '#3a9175', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f1a14', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {paciente?.nome || 'Paciente'}
        </p>
        <p style={{ fontSize: 11, color: '#6b9e8a', marginTop: 2 }}>
          {tipo?.nome}{convenio ? ` · ${convenio.nome}` : ''}
        </p>
      </div>
      <span style={{
        display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
        padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500,
        background: s.bg, color: s.color
      }}>
        <SIcon size={9} /> {s.label}
      </span>
      {ag.valor > 0 && (
        <span style={{ fontSize: 11, fontWeight: 600, flexShrink: 0, color: ag.pago ? '#3b6d11' : '#6b9e8a' }}>
          {ag.pago ? '✓ ' : ''}R$ {ag.valor}
        </span>
      )}
    </div>
  )
}

export default function Agenda() {
  const { data, addItem, editItem } = useApp()
  const [view, setView] = useState('dia')
  const [date, setDate] = useState(new Date())
  const [modal, setModal] = useState(null)

  const agendamentos  = data.agendamentos || []
  const pacientes     = data.pacientes || []
  const profissionais = data.profissionais || []
  const tipos         = data.tipos_atendimento || []
  const convenios     = data.convenios || []

  const getPaciente = id => pacientes.find(p => p.id === id)
  const getTipo     = id => tipos.find(t => t.id === id)
  const getConvenio = id => convenios.find(c => c.id === id)

  const navPrev = () => {
    if (view === 'dia')    setDate(d => subDays(d, 1))
    else if (view === 'semana') setDate(d => subWeeks(d, 1))
    else                   setDate(d => subMonths(d, 1))
  }
  const navNext = () => {
    if (view === 'dia')    setDate(d => addDays(d, 1))
    else if (view === 'semana') setDate(d => addWeeks(d, 1))
    else                   setDate(d => addMonths(d, 1))
  }

  const agForDay = d => agendamentos.filter(a => a.data === dateStr(d)).sort((a,b) => a.hora.localeCompare(b.hora))

  const todayItems = agForDay(date)
  const recebido   = todayItems.filter(a => a.pago).reduce((s,a) => s+(a.valor||0), 0)
  const aReceber   = todayItems.filter(a => !a.pago && a.status !== 'cancelado').reduce((s,a) => s+(a.valor||0), 0)
  const realizados = todayItems.filter(a => a.status === 'realizado').length
  const totalHoje  = todayItems.filter(a => a.status !== 'cancelado').length

  const handleSave = ag => {
    if (Array.isArray(ag)) { ag.forEach(a => addItem('agendamentos', a)) }
    else if (ag.id) editItem('agendamentos', ag.id, ag)
    else addItem('agendamentos', ag)
    setModal(null)
  }

  const headerLabel = view === 'dia'
    ? format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : view === 'semana'
      ? `${format(startOfWeek(date,{weekStartsOn:0}), "d MMM", { locale: ptBR })} – ${format(endOfWeek(date,{weekStartsOn:0}), "d MMM yyyy", { locale: ptBR })}`
      : format(date, "MMMM 'de' yyyy", { locale: ptBR })

  // Week view days
  const weekDays = view === 'semana'
    ? eachDayOfInterval({ start: startOfWeek(date,{weekStartsOn:0}), end: endOfWeek(date,{weekStartsOn:0}) })
    : []

  // Month view
  const monthStart = startOfMonth(date)
  const monthEnd   = endOfMonth(date)
  const calStart   = startOfWeek(monthStart, { weekStartsOn:0 })
  const calEnd     = endOfWeek(monthEnd, { weekStartsOn:0 })
  const calDays    = view === 'mes' ? eachDayOfInterval({ start: calStart, end: calEnd }) : []
  const todayStr   = dateStr(new Date())

  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0f1a14', margin: 0 }}>Agenda</h1>
          <p style={{ fontSize: 12, color: '#6b9e8a', marginTop: 3, textTransform: 'capitalize' }}>{headerLabel}</p>
        </div>
        <button onClick={() => setModal('new')} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: '#3a9175', color: '#fff', border: 'none',
          borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
        }}>
          <Plus size={15} /> Novo agendamento
        </button>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: '#fff', border: '1px solid #e8f0ec', borderRadius: 10, padding: '4px 6px' }}>
          <button onClick={navPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b9e8a', padding: '4px 8px', borderRadius: 6 }}><ChevronLeft size={15} /></button>
          <button onClick={() => setDate(new Date())} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#3a9175', padding: '4px 10px', borderRadius: 6 }}>Hoje</button>
          <button onClick={navNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b9e8a', padding: '4px 8px', borderRadius: 6 }}><ChevronRight size={15} /></button>
        </div>
        <div style={{ display: 'flex', background: '#fff', border: '1px solid #e8f0ec', borderRadius: 10, padding: 3, gap: 2 }}>
          {[['dia','Dia'],['semana','Semana'],['mes','Mês']].map(([key, label]) => (
            <button key={key} onClick={() => setView(key)} style={{
              padding: '5px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
              background: view === key ? '#0f1a14' : 'transparent',
              color: view === key ? '#fff' : '#6b9e8a',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* KPIs — só na visão dia */}
      {view === 'dia' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Agendamentos', value: totalHoje, sub: 'hoje', valColor: '#0f1a14' },
            { label: 'Realizados', value: realizados, sub: `de ${totalHoje}`, valColor: '#3b6d11' },
            { label: 'Recebido', value: fmt(recebido), sub: 'confirmado', valColor: '#0f6e56' },
            { label: 'A receber', value: fmt(aReceber), sub: 'pendente', valColor: '#185fa5' },
          ].map(({ label, value, sub, valColor }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e8f0ec', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#6b9e8a', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
              <p style={{ fontSize: 20, fontWeight: 600, color: valColor, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 11, color: '#a0c8b8', marginTop: 4 }}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* VISÃO DIA */}
      {view === 'dia' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8f0ec', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f5f2' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0f1a14' }}>Sessões do dia</p>
            <p style={{ fontSize: 11, color: '#a0c8b8' }}>{todayItems.length} agendamento{todayItems.length !== 1 ? 's' : ''}</p>
          </div>
          {todayItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#a0c8b8' }}>
              <p style={{ fontSize: 13, marginBottom: 8 }}>Nenhum agendamento para este dia.</p>
              <button onClick={() => setModal('new')} style={{ background: 'none', border: 'none', color: '#3a9175', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>+ Adicionar agendamento</button>
            </div>
          )}
          <div style={{ padding: '8px' }}>
            {todayItems.map(ag => (
              <AppointmentRow key={ag.id} ag={ag} getPaciente={getPaciente} getTipo={getTipo} getConvenio={getConvenio} onClick={setModal} />
            ))}
          </div>
        </div>
      )}

      {/* VISÃO SEMANA */}
      {view === 'semana' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {weekDays.map(day => {
            const items = agForDay(day)
            const ds    = dateStr(day)
            const isToday = ds === todayStr
            return (
              <div key={ds} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${isToday ? '#3a9175' : '#e8f0ec'}`, overflow: 'hidden' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px', borderBottom: '1px solid #f0f5f2',
                  background: isToday ? '#f0f9f4' : 'transparent'
                }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isToday ? '#0f6e56' : '#0f1a14', textTransform: 'capitalize' }}>
                    {format(day, "EEEE, d 'de' MMM", { locale: ptBR })}
                    {isToday && <span style={{ marginLeft: 8, fontSize: 10, background: '#3a9175', color: '#fff', padding: '2px 7px', borderRadius: 20 }}>Hoje</span>}
                  </p>
                  <span style={{ fontSize: 11, color: '#a0c8b8' }}>{items.length} sessão{items.length !== 1 ? 'ões' : ''}</span>
                </div>
                {items.length === 0
                  ? <p style={{ fontSize: 12, color: '#c0d8ce', padding: '12px 16px' }}>Sem agendamentos</p>
                  : <div style={{ padding: '6px 0' }}>
                      {items.map(ag => (
                        <AppointmentRow key={ag.id} ag={ag} getPaciente={getPaciente} getTipo={getTipo} getConvenio={getConvenio} onClick={setModal} />
                      ))}
                    </div>
                }
              </div>
            )
          })}
        </div>
      )}

      {/* VISÃO MÊS */}
      {view === 'mes' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8f0ec', overflow: 'hidden' }}>
          {/* Cabeçalho dias da semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid #f0f5f2' }}>
            {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
              <div key={d} style={{ textAlign: 'center', padding: '10px 4px', fontSize: 10, fontWeight: 600, color: '#6b9e8a', letterSpacing: '.04em' }}>{d}</div>
            ))}
          </div>
          {/* Células */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
            {calDays.map(day => {
              const ds      = dateStr(day)
              const items   = agForDay(day)
              const isToday = ds === todayStr
              const inMonth = isSameMonth(day, date)
              const isSelected = ds === dateStr(date)
              return (
                <div key={ds} onClick={() => { setDate(day); setView('dia') }} style={{
                  minHeight: 68, padding: '6px 6px 4px', cursor: 'pointer',
                  borderRight: '1px solid #f5f8f6', borderBottom: '1px solid #f5f8f6',
                  background: isSelected ? '#f0f9f4' : isToday ? '#fffbf0' : 'transparent',
                  transition: 'background .1s'
                }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fbf9' }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? '#f0f9f4' : isToday ? '#fffbf0' : 'transparent' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 4, fontSize: 11, fontWeight: isToday ? 700 : 400,
                    background: isToday ? '#3a9175' : 'transparent',
                    color: isToday ? '#fff' : inMonth ? '#0f1a14' : '#c0d8ce'
                  }}>{day.getDate()}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {items.slice(0, 3).map(ag => {
                      const tipo = getTipo(ag.tipo_id)
                      return (
                        <div key={ag.id} style={{
                          fontSize: 9, fontWeight: 500, padding: '1px 4px', borderRadius: 3,
                          background: tipo?.cor ? `${tipo.cor}22` : '#e1f5ee',
                          color: tipo?.cor || '#0f6e56',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {ag.hora} {getPaciente(ag.paciente_id)?.nome?.split(' ')[0]}
                        </div>
                      )
                    })}
                    {items.length > 3 && (
                      <div style={{ fontSize: 9, color: '#a0c8b8', paddingLeft: 4 }}>+{items.length - 3} mais</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {modal && (
        <ModalAgendamento
          agendamento={modal === 'new' ? { data: dateStr(date) } : modal}
          pacientes={pacientes} profissionais={profissionais} tipos={tipos}
          onSave={handleSave} onClose={() => setModal(null)}
          onStatus={(id, status) => editItem('agendamentos', id, { status })}
          onPago={(id, pago) => editItem('agendamentos', id, { pago })}
          STATUS={STATUS}
        />
      )}
    </div>
  )
}
