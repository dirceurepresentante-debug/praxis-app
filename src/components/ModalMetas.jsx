import { useState } from 'react'
import { X, Plus, Check, Target, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_META = {
  em_andamento: { label:'Em andamento', cor:'#2563eb', bg:'#eff6ff' },
  alcancada:    { label:'Alcançada',    cor:'#16a34a', bg:'#f0fdf4' },
  pausada:      { label:'Pausada',      cor:'#9ca3af', bg:'#f9fafb' },
  abandonada:   { label:'Abandonada',  cor:'#ef4444', bg:'#fef2f2' },
}

const META_VAZIA = { titulo:'', descricao:'', status:'em_andamento', data_inicio: format(new Date(),'yyyy-MM-dd'), data_conclusao:'' }

export default function ModalMetas({ metas, onSave, onClose }) {
  const [lista, setLista] = useState(metas || [])
  const [editando, setEditando] = useState(null) // null | 'nova' | index
  const [form, setForm] = useState(META_VAZIA)

  const set = (k,v) => setForm(f => ({ ...f, [k]: v }))

  const abrirNova = () => { setForm(META_VAZIA); setEditando('nova') }
  const abrirEditar = (i) => { setForm({ ...lista[i] }); setEditando(i) }

  const salvarMeta = () => {
    if (!form.titulo.trim()) return
    if (editando === 'nova') {
      setLista(l => [...l, { ...form, id: Date.now().toString() }])
    } else {
      setLista(l => l.map((m,i) => i === editando ? { ...form } : m))
    }
    setEditando(null)
  }

  const remover = (i) => setLista(l => l.filter((_,idx) => idx !== i))
  const ciclarStatus = (i) => {
    const ordem = Object.keys(STATUS_META)
    setLista(l => l.map((m, idx) => {
      if (idx !== i) return m
      const next = ordem[(ordem.indexOf(m.status) + 1) % ordem.length]
      return { ...m, status: next, data_conclusao: next === 'alcancada' ? format(new Date(),'yyyy-MM-dd') : m.data_conclusao }
    }))
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:70, display:'flex', alignItems:'flex-end', justifyContent:'center' }} className="md:items-center md:p-4">
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)' }} onClick={onClose}/>
      <div style={{ position:'relative', background:'#fff', width:'100%', maxWidth:560, borderRadius:'20px 20px 0 0', maxHeight:'92vh', display:'flex', flexDirection:'column' }} className="md:rounded-2xl">

        <div style={{ padding:'16px 22px', borderBottom:'1px solid #f0f5f2', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#0f1a14' }}>Metas Terapêuticas</h2>
            <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>{lista.filter(m=>m.status==='alcancada').length} de {lista.length} alcançadas</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={abrirNova} style={{ display:'flex', alignItems:'center', gap:5, background:'#3a9175', color:'#fff', border:'none', borderRadius:8, padding:'7px 12px', fontSize:11, fontWeight:600, cursor:'pointer' }}><Plus size={12}/>Nova meta</button>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}><X size={16}/></button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'16px 22px' }}>

          {/* Formulário inline */}
          {editando !== null && (
            <div style={{ background:'#f0f9f4', border:'1px solid #c8e0d5', borderRadius:16, padding:'16px', marginBottom:16 }}>
              <p style={{ fontSize:12, fontWeight:700, color:'#0f6e56', marginBottom:12 }}>{editando==='nova'?'Nova meta':'Editar meta'}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <input value={form.titulo} onChange={e=>set('titulo',e.target.value)} placeholder="Título da meta (ex: Melhorar qualidade do sono)" style={{ border:'1px solid #c8e0d5', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box', width:'100%' }}/>
                <textarea value={form.descricao} onChange={e=>set('descricao',e.target.value)} placeholder="Descrição e estratégias..." rows={2} style={{ border:'1px solid #c8e0d5', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box', width:'100%', resize:'vertical' }}/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div>
                    <label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:4 }}>Status</label>
                    <select value={form.status} onChange={e=>set('status',e.target.value)} style={{ width:'100%', border:'1px solid #c8e0d5', borderRadius:10, padding:'8px 10px', fontSize:12, outline:'none', background:'#fff' }}>
                      {Object.entries(STATUS_META).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:4 }}>Data início</label>
                    <input type="date" value={form.data_inicio} onChange={e=>set('data_inicio',e.target.value)} style={{ width:'100%', border:'1px solid #c8e0d5', borderRadius:10, padding:'8px 10px', fontSize:12, outline:'none', boxSizing:'border-box' }}/>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setEditando(null)} style={{ flex:1, padding:'9px', borderRadius:10, border:'1px solid #c8e0d5', background:'transparent', fontSize:12, cursor:'pointer', color:'#6b9e8a' }}>Cancelar</button>
                  <button onClick={salvarMeta} style={{ flex:2, padding:'9px', borderRadius:10, border:'none', background:'#3a9175', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}><Check size={12} style={{ display:'inline', marginRight:5 }}/>Salvar</button>
                </div>
              </div>
            </div>
          )}

          {/* Lista */}
          {lista.length === 0 && editando === null && (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#a0c8b8' }}>
              <Target size={28} style={{ margin:'0 auto 10px', opacity:.3 }}/>
              <p style={{ fontSize:13 }}>Nenhuma meta registrada.</p>
              <button onClick={abrirNova} style={{ marginTop:8, background:'none', border:'none', cursor:'pointer', color:'#3a9175', fontSize:12 }}>+ Definir primeira meta</button>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {lista.map((meta, i) => {
              const st = STATUS_META[meta.status] || STATUS_META.em_andamento
              return (
                <div key={i} style={{ border:'1px solid #e8f0ec', borderRadius:14, overflow:'hidden' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'13px 14px' }}>
                    <button onClick={() => ciclarStatus(i)} title="Clique para mudar status" style={{ flexShrink:0, marginTop:1, width:22, height:22, borderRadius:'50%', border:`2px solid ${st.cor}`, background: meta.status==='alcancada'?st.cor:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      {meta.status==='alcancada' && <Check size={11} color="#fff"/>}
                    </button>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:600, color: meta.status==='alcancada'?'#9ca3af':'#0f1a14', textDecoration: meta.status==='alcancada'?'line-through':'none' }}>{meta.titulo}</p>
                      {meta.descricao && <p style={{ fontSize:11, color:'#6b9e8a', marginTop:3, lineHeight:1.5 }}>{meta.descricao}</p>}
                      <div style={{ display:'flex', gap:8, marginTop:6, alignItems:'center' }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:st.bg, color:st.cor }}>{st.label}</span>
                        {meta.data_inicio && <span style={{ fontSize:10, color:'#c0d8ce' }}>desde {meta.data_inicio}</span>}
                        {meta.data_conclusao && meta.status==='alcancada' && <span style={{ fontSize:10, color:'#16a34a' }}>✓ {meta.data_conclusao}</span>}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                      <button onClick={() => abrirEditar(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'#c0d8ce', padding:4 }}><Target size={12}/></button>
                      <button onClick={() => remover(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'#fca5a5', padding:4 }}><Trash2 size={12}/></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ padding:'14px 22px', borderTop:'1px solid #f0f5f2', flexShrink:0 }}>
          <button onClick={() => onSave(lista)} style={{ width:'100%', padding:'13px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#3a9175,#1b5c42)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            Salvar metas
          </button>
        </div>
      </div>
    </div>
  )
}
