import { useState } from 'react'
import { X, DollarSign, Bell, BellOff, RefreshCw } from 'lucide-react'
import { addDays, addWeeks, format, parseISO } from 'date-fns'

const FREQ = [
  { value: 'semanal',    label: 'Semanal',    dias: 7  },
  { value: 'quinzenal',  label: 'Quinzenal',  dias: 14 },
  { value: 'mensal',     label: 'Mensal',     dias: 30 },
]

export default function ModalAgendamento({ agendamento, pacientes, profissionais, tipos, onSave, onClose, onStatus, onPago, STATUS }) {
  const isNew = !agendamento.id
  const [form, setForm] = useState({
    paciente_id:    agendamento.paciente_id    || '',
    profissional_id:agendamento.profissional_id|| (profissionais[0]?.id || ''),
    tipo_id:        agendamento.tipo_id        || (tipos[0]?.id || ''),
    data:           agendamento.data           || '',
    hora:           agendamento.hora           || '09:00',
    status:         agendamento.status         || 'aguardando',
    valor:          agendamento.valor          || '',
    pago:           agendamento.pago           || false,
    obs:            agendamento.obs            || '',
    lembrete:       agendamento.lembrete       ?? true,
  })
  const [recorrente, setRecorrente] = useState(false)
  const [freq, setFreq]             = useState('semanal')
  const [repeticoes, setRepeticoes] = useState(8)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.paciente_id || !form.data || !form.hora) return

    if (isNew && recorrente) {
      const freqDias = FREQ.find(f => f.value === freq)?.dias || 7
      const sessoes = []
      for (let i = 0; i < repeticoes; i++) {
        const data = format(addDays(parseISO(form.data), freqDias * i), 'yyyy-MM-dd')
        sessoes.push({ ...form, data, recorrencia_grupo: Date.now().toString() })
      }
      onSave(sessoes)
    } else {
      onSave(isNew ? form : { ...agendamento, ...form })
    }
  }

  const sel = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300'

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-semibold text-gray-900">{isNew ? 'Novo Agendamento' : 'Editar Agendamento'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Paciente */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Paciente *</label>
            <select value={form.paciente_id} onChange={e => set('paciente_id', e.target.value)} className={sel}>
              <option value="">Selecione...</option>
              {pacientes.filter(p => p.ativo).map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          {/* Tipo + Profissional */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo</label>
              <select value={form.tipo_id} onChange={e => set('tipo_id', e.target.value)} className={sel}>
                {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Profissional</label>
              <select value={form.profissional_id} onChange={e => set('profissional_id', e.target.value)} className={sel}>
                {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          </div>

          {/* Data + Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Data *</label>
              <input type="date" value={form.data} onChange={e => set('data', e.target.value)} className={sel} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Horário *</label>
              <input type="time" value={form.hora} onChange={e => set('hora', e.target.value)} className={sel} />
            </div>
          </div>

          {/* Status (só edição) */}
          {!isNew && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS).map(([key, s]) => (
                  <button key={key} onClick={() => set('status', key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${form.status === key ? s.color + ' border-transparent' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Valor + Pago */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Valor (R$)</label>
              <input type="number" value={form.valor} onChange={e => set('valor', e.target.value)} placeholder="180" className={sel} />
            </div>
            <button onClick={() => set('pago', !form.pago)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${form.pago ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              <DollarSign size={14} />
              {form.pago ? 'Pago' : 'A receber'}
            </button>
          </div>

          {/* Lembrete */}
          <button onClick={() => set('lembrete', !form.lembrete)}
            style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 14px', borderRadius:12, border:`1px solid ${form.lembrete?'#c8e0d5':'#e5e7eb'}`, background: form.lembrete?'#f0f9f4':'#fafafa', cursor:'pointer', transition:'all .15s' }}>
            {form.lembrete ? <Bell size={14} color="#3a9175"/> : <BellOff size={14} color="#9ca3af"/>}
            <div style={{ textAlign:'left', flex:1 }}>
              <p style={{ fontSize:12, fontWeight:600, color: form.lembrete?'#0f6e56':'#6b7280' }}>
                {form.lembrete ? 'Lembrete ativado' : 'Lembrete desativado'}
              </p>
              <p style={{ fontSize:10, color:'#9ca3af', marginTop:1 }}>Notificação 24h antes da sessão via WhatsApp/e-mail</p>
            </div>
            <div style={{ width:36, height:20, borderRadius:10, background: form.lembrete?'#3a9175':'#d1d5db', position:'relative', transition:'background .2s', flexShrink:0 }}>
              <div style={{ position:'absolute', top:2, left: form.lembrete?'calc(100% - 18px)':2, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }}/>
            </div>
          </button>

          {/* Recorrência (só novo) */}
          {isNew && (
            <div>
              <button onClick={() => setRecorrente(r => !r)}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 14px', borderRadius:12, border:`1px solid ${recorrente?'#c8e0d5':'#e5e7eb'}`, background: recorrente?'#f0f9f4':'#fafafa', cursor:'pointer', transition:'all .15s', marginBottom: recorrente?10:0 }}>
                <RefreshCw size={14} color={recorrente?'#3a9175':'#9ca3af'}/>
                <div style={{ textAlign:'left', flex:1 }}>
                  <p style={{ fontSize:12, fontWeight:600, color: recorrente?'#0f6e56':'#6b7280' }}>Agendamento recorrente</p>
                  <p style={{ fontSize:10, color:'#9ca3af', marginTop:1 }}>Cria múltiplas sessões automaticamente</p>
                </div>
                <div style={{ width:36, height:20, borderRadius:10, background: recorrente?'#3a9175':'#d1d5db', position:'relative', transition:'background .2s', flexShrink:0 }}>
                  <div style={{ position:'absolute', top:2, left: recorrente?'calc(100% - 18px)':2, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }}/>
                </div>
              </button>

              {recorrente && (
                <div style={{ background:'#f0f9f4', border:'1px solid #c8e0d5', borderRadius:12, padding:'14px', display:'flex', flexDirection:'column', gap:12 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:6 }}>Frequência</label>
                    <div style={{ display:'flex', gap:6 }}>
                      {FREQ.map(f => (
                        <button key={f.value} onClick={() => setFreq(f.value)} style={{ flex:1, padding:'8px 6px', borderRadius:10, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background: freq===f.value?'#3a9175':'#e1f5ee', color: freq===f.value?'#fff':'#3a9175' }}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:6 }}>
                      Número de sessões: <strong style={{ color:'#0f6e56' }}>{repeticoes}</strong>
                    </label>
                    <input type="range" min={2} max={24} value={repeticoes} onChange={e => setRepeticoes(Number(e.target.value))}
                      style={{ width:'100%', accentColor:'#3a9175' }}/>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#a0c8b8', marginTop:2 }}>
                      <span>2</span><span>24 sessões</span>
                    </div>
                  </div>
                  <div style={{ background:'#e1f5ee', borderRadius:9, padding:'9px 12px' }}>
                    <p style={{ fontSize:11, color:'#0f6e56', fontWeight:500 }}>
                      ✓ Serão criadas <strong>{repeticoes} sessões</strong> {FREQ.find(f=>f.value===freq)?.label.toLowerCase()}s a partir de {form.data || '—'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Observações</label>
            <textarea value={form.obs} onChange={e => set('obs', e.target.value)} rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
              placeholder="Observações opcionais..." />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors">
            {isNew && recorrente ? `Criar ${repeticoes} sessões` : isNew ? 'Agendar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
