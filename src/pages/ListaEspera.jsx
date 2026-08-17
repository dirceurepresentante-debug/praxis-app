import { useState } from 'react'
import { Plus, X, Clock, Phone, Mail, Check, Trash2, Bell } from 'lucide-react'
import { format } from 'date-fns'
import { useApp } from '../contexts/AppContext'

const DIAS = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
const TURNOS = ['Manhã (8h–12h)','Tarde (12h–18h)','Noite (18h–21h)']
const PRIORIDADES = { normal:'Normal', urgente:'Urgente', encaminhamento:'Encaminhamento' }
const PRI_COR = { normal:'#6b9e8a', urgente:'#dc2626', encaminhamento:'#2563eb' }
const PRI_BG  = { normal:'#f0f9f4', urgente:'#fef2f2', encaminhamento:'#eff6ff' }

const VAZIO = { nome:'', telefone:'', email:'', queixa:'', dias_preferencia:[], turno_preferencia:'', prioridade:'normal', data_entrada: format(new Date(),'yyyy-MM-dd'), obs:'' }

export default function ListaEspera() {
  const { data, addItem, editItem, removeItem } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(VAZIO)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')

  const lista = (data.lista_espera || [])
    .filter(p => filtro === 'todos' || p.prioridade === filtro)
    .filter(p => !busca || p.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a,b) => {
      const pri = { urgente:0, encaminhamento:1, normal:2 }
      return (pri[a.prioridade]??2) - (pri[b.prioridade]??2) || a.data_entrada.localeCompare(b.data_entrada)
    })

  const set = (k,v) => setForm(f => ({ ...f, [k]: v }))
  const toggleDia = (d) => set('dias_preferencia', form.dias_preferencia.includes(d) ? form.dias_preferencia.filter(x=>x!==d) : [...form.dias_preferencia, d])

  const abrirNovo = () => { setForm(VAZIO); setEditando(null); setShowModal(true) }
  const abrirEditar = (item) => { setForm({ ...item }); setEditando(item.id); setShowModal(true) }

  const salvar = () => {
    if (!form.nome.trim()) return
    if (editando) editItem('lista_espera', editando, form)
    else addItem('lista_espera', form)
    setShowModal(false)
  }

  const remover = (id) => { if (confirm('Remover da lista de espera?')) removeItem('lista_espera', id) }
  const promover = (item) => {
    editItem('lista_espera', item.id, { ...item, status: 'contatado' })
  }

  const total = (data.lista_espera || []).length
  const urgentes = (data.lista_espera || []).filter(p=>p.prioridade==='urgente').length

  return (
    <div style={{ padding:'20px 16px', maxWidth:680, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:17, fontWeight:700, color:'#0f1a14' }}>Lista de Espera</h1>
          <p style={{ fontSize:12, color:'#6b9e8a', marginTop:3 }}>
            {total} aguardando{urgentes > 0 ? ` · ${urgentes} urgente${urgentes!==1?'s':''}` : ''}
          </p>
        </div>
        <button onClick={abrirNovo} style={{ display:'flex', alignItems:'center', gap:7, background:'linear-gradient(135deg,#3a9175,#1b5c42)', color:'#fff', border:'none', borderRadius:12, padding:'10px 16px', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <Plus size={15}/> Adicionar
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:18 }}>
        {[
          { label:'Total na fila', value:total, cor:'#0f6e56', bg:'#e1f5ee' },
          { label:'Urgentes', value:urgentes, cor:'#dc2626', bg:'#fef2f2' },
          { label:'Contatados', value:(data.lista_espera||[]).filter(p=>p.status==='contatado').length, cor:'#2563eb', bg:'#eff6ff' },
        ].map(k => (
          <div key={k.label} style={{ background:k.bg, borderRadius:14, padding:'14px', textAlign:'center' }}>
            <p style={{ fontSize:22, fontWeight:800, color:k.cor }}>{k.value}</p>
            <p style={{ fontSize:10, color:k.cor, marginTop:2, fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display:'flex', gap:8, marginBottom:14, alignItems:'center' }}>
        <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar por nome..." style={{ flex:1, border:'1px solid #e8f0ec', borderRadius:10, padding:'8px 12px', fontSize:13, outline:'none' }}/>
        {['todos','urgente','encaminhamento','normal'].map(f => (
          <button key={f} onClick={()=>setFiltro(f)} style={{ padding:'7px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, whiteSpace:'nowrap', background: filtro===f?'#3a9175':'#f0f5f2', color: filtro===f?'#fff':'#6b9e8a' }}>
            {f==='todos'?'Todos':PRIORIDADES[f]}
          </button>
        ))}
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#c0d8ce' }}>
          <Clock size={32} style={{ margin:'0 auto 12px', opacity:.4 }}/>
          <p style={{ fontSize:14 }}>Nenhum paciente na lista de espera.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {lista.map((item, idx) => (
            <div key={item.id} style={{ background:'#fff', border:`1px solid ${item.prioridade==='urgente'?'#fca5a5':item.status==='contatado'?'#a5b4fc':'#e8f0ec'}`, borderRadius:16, overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px' }}>
                {/* Posição */}
                <div style={{ width:28, height:28, borderRadius:'50%', background: item.status==='contatado'?'#eff6ff':PRI_BG[item.prioridade], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:800, color: item.status==='contatado'?'#2563eb':PRI_COR[item.prioridade] }}>
                  {item.status==='contatado'?'✓':idx+1}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <p style={{ fontSize:14, fontWeight:700, color:'#0f1a14' }}>{item.nome}</p>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:PRI_BG[item.prioridade], color:PRI_COR[item.prioridade] }}>{PRIORIDADES[item.prioridade]}</span>
                    {item.status==='contatado' && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:'#eff6ff', color:'#2563eb' }}>Contatado</span>}
                  </div>
                  {item.queixa && <p style={{ fontSize:12, color:'#6b9e8a', marginTop:3 }}>{item.queixa}</p>}
                  <div style={{ display:'flex', gap:12, marginTop:6, flexWrap:'wrap' }}>
                    {item.telefone && <a href={`tel:${item.telefone}`} style={{ fontSize:11, color:'#6b9e8a', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}><Phone size={10}/>{item.telefone}</a>}
                    {item.email && <a href={`mailto:${item.email}`} style={{ fontSize:11, color:'#6b9e8a', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}><Mail size={10}/>{item.email}</a>}
                    <span style={{ fontSize:11, color:'#c0d8ce', display:'flex', alignItems:'center', gap:4 }}><Clock size={10}/>desde {item.data_entrada}</span>
                  </div>
                  {item.dias_preferencia?.length > 0 && (
                    <p style={{ fontSize:11, color:'#a0c8b8', marginTop:4 }}>Prefere: {item.dias_preferencia.join(', ')}{item.turno_preferencia ? ` · ${item.turno_preferencia}` : ''}</p>
                  )}
                </div>
                <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                  {item.status !== 'contatado' && <button onClick={() => promover(item)} title="Marcar como contatado" style={{ background:'#eff6ff', border:'none', borderRadius:8, width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#2563eb' }}><Bell size={12}/></button>}
                  <button onClick={() => abrirEditar(item)} style={{ background:'#f0f5f2', border:'none', borderRadius:8, width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6b9e8a' }}><Clock size={12}/></button>
                  <button onClick={() => remover(item.id)} style={{ background:'#fef2f2', border:'none', borderRadius:8, width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#f87171' }}><Trash2 size={12}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'flex-end', justifyContent:'center' }} className="md:items-center md:p-4">
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.4)', backdropFilter:'blur(4px)' }} onClick={()=>setShowModal(false)}/>
          <div style={{ position:'relative', background:'#fff', width:'100%', maxWidth:480, borderRadius:'20px 20px 0 0', maxHeight:'90vh', display:'flex', flexDirection:'column' }} className="md:rounded-2xl">
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #f0f5f2', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:'#0f1a14' }}>{editando?'Editar':'Adicionar à lista de espera'}</h3>
              <button onClick={()=>setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}><X size={16}/></button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
              {[{k:'nome',l:'Nome completo *',t:'text'},{k:'telefone',l:'Telefone',t:'tel'},{k:'email',l:'E-mail',t:'email'}].map(f=>(
                <div key={f.k}><label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:4 }}>{f.l}</label>
                <input type={f.t} value={form[f.k]} onChange={e=>set(f.k,e.target.value)} style={{ width:'100%', border:'1px solid #d1f0e4', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}/></div>
              ))}
              <div><label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:4 }}>Queixa / motivo do contato</label>
              <textarea value={form.queixa} onChange={e=>set('queixa',e.target.value)} rows={2} style={{ width:'100%', border:'1px solid #d1f0e4', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box', resize:'vertical' }}/></div>
              <div><label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:6 }}>Prioridade</label>
              <div style={{ display:'flex', gap:6 }}>
                {Object.entries(PRIORIDADES).map(([k,v])=>(
                  <button key={k} onClick={()=>set('prioridade',k)} style={{ flex:1, padding:'8px', borderRadius:10, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background: form.prioridade===k?PRI_COR[k]:'#f0f5f2', color: form.prioridade===k?'#fff':PRI_COR[k] }}>{v}</button>
                ))}
              </div></div>
              <div><label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:6 }}>Dias de preferência</label>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                {DIAS.map(d=>(
                  <button key={d} onClick={()=>toggleDia(d)} style={{ padding:'5px 10px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, background: form.dias_preferencia.includes(d)?'#3a9175':'#f0f5f2', color: form.dias_preferencia.includes(d)?'#fff':'#6b9e8a' }}>{d}</button>
                ))}
              </div></div>
              <div><label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:4 }}>Turno preferido</label>
              <select value={form.turno_preferencia} onChange={e=>set('turno_preferencia',e.target.value)} style={{ width:'100%', border:'1px solid #d1f0e4', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', background:'#fff' }}>
                <option value="">Qualquer turno</option>
                {TURNOS.map(t=><option key={t}>{t}</option>)}
              </select></div>
            </div>
            <div style={{ padding:'14px 20px', borderTop:'1px solid #f0f5f2', flexShrink:0 }}>
              <button onClick={salvar} style={{ width:'100%', padding:'12px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#3a9175,#1b5c42)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <Check size={14}/>{editando?'Salvar alterações':'Adicionar à lista'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
