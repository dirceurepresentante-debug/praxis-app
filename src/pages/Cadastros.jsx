import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import { useApp } from '../contexts/AppContext'

const s = (extra={}) => ({
  background:'#fff', border:'1px solid #e8f0ec', borderRadius:12, ...extra
})

function InlineEdit({ value, onSave, onCancel }) {
  const [v, setV] = useState(value)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
      <input value={v} onChange={e=>setV(e.target.value)} autoFocus
        style={{ flex:1, padding:'6px 10px', fontSize:12, border:'1.5px solid #3a9175', borderRadius:8, outline:'none', color:'#0f1a14' }} />
      <button onClick={()=>onSave(v)} style={{ background:'none', border:'none', cursor:'pointer', color:'#3b6d11', padding:4 }}><Check size={14}/></button>
      <button onClick={onCancel} style={{ background:'none', border:'none', cursor:'pointer', color:'#a0c8b8', padding:4 }}><X size={14}/></button>
    </div>
  )
}

function ModalProfissional({ profissional, onSave, onClose }) {
  const [form, setForm] = useState({
    nome: profissional?.nome||'', especialidade: profissional?.especialidade||'',
    registro: profissional?.registro||'', duracao_minutos: profissional?.duracao_minutos||50, ativo: profissional?.ativo??true,
  })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const inp = { width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #e8f0ec', fontSize:13, outline:'none', color:'#0f1a14', background:'#fafcfb' }
  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center' }} className="md:items-center md:p-4">
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.4)', backdropFilter:'blur(4px)' }} onClick={onClose}/>
      <div style={{ position:'relative', background:'#fff', width:'100%', maxWidth:440, borderRadius:'20px 20px 0 0', boxShadow:'0 -4px 40px rgba(0,0,0,.12)' }} className="md:rounded-2xl">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 20px', borderBottom:'1px solid #f0f5f2' }}>
          <p style={{ fontSize:15, fontWeight:600, color:'#0f1a14' }}>{profissional ? 'Editar profissional' : 'Novo profissional'}</p>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#a0c8b8', padding:4 }}><X size={16}/></button>
        </div>
        <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:14 }}>
          <div><label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3a9175', marginBottom:6 }}>Nome completo *</label>
            <input value={form.nome} onChange={e=>set('nome',e.target.value)} placeholder="Nome do profissional" style={inp} /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3a9175', marginBottom:6 }}>Especialidade</label>
              <input value={form.especialidade} onChange={e=>set('especialidade',e.target.value)} style={inp} /></div>
            <div><label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3a9175', marginBottom:6 }}>Registro</label>
              <input value={form.registro} onChange={e=>set('registro',e.target.value)} placeholder="CRP 00/00000" style={inp} /></div>
          </div>
          <div><label style={{ display:'block', fontSize:11, fontWeight:600, color:'#3a9175', marginBottom:6 }}>Duração da sessão (min)</label>
            <input type="number" value={form.duracao_minutos} onChange={e=>set('duracao_minutos',parseInt(e.target.value))} style={{...inp, maxWidth:120}} /></div>
        </div>
        <div style={{ display:'flex', gap:10, padding:'16px 20px', borderTop:'1px solid #f0f5f2' }}>
          <button onClick={onClose} style={{ flex:1, padding:'11px', borderRadius:10, border:'1.5px solid #e8f0ec', background:'transparent', fontSize:13, color:'#6b9e8a', cursor:'pointer' }}>Cancelar</button>
          <button onClick={()=>onSave(profissional?{...profissional,...form}:form)} style={{ flex:1, padding:'11px', borderRadius:10, background:'#3a9175', border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Salvar</button>
        </div>
      </div>
    </div>
  )
}

export default function Cadastros() {
  const { data, addItem, editItem, removeItem } = useApp()
  const [tab, setTab] = useState('profissionais')
  const [modalProf, setModalProf] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [novoNome, setNovoNome] = useState('')
  const [novaCor, setNovaCor] = useState('#3a9175')
  const tabs = [
    { key:'profissionais', label:'Profissionais' },
    { key:'convenios', label:'Convênio' },
    { key:'tipos_atendimento', label:'Tipos de Atendimento' },
  ]
  const inp = { flex:1, padding:'10px 12px', borderRadius:10, border:'1.5px solid #e8f0ec', fontSize:13, outline:'none', color:'#0f1a14', background:'#fafcfb' }

  const handleAddSimple = (entity, extra={}) => {
    if (!novoNome.trim()) return
    addItem(entity, { nome:novoNome.trim(), ativo:true, ...extra })
    setNovoNome(''); setNovaCor('#3a9175')
  }

  return (
    <div style={{ padding:'24px', maxWidth:800, margin:'0 auto' }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:600, color:'#0f1a14', margin:0 }}>Cadastros</h1>
        <p style={{ fontSize:12, color:'#6b9e8a', marginTop:3 }}>Profissionais, convênios e tipos de atendimento.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', background:'#fff', border:'1px solid #e8f0ec', borderRadius:12, padding:4, gap:4, marginBottom:20, overflowX:'auto' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} style={{
            flexShrink:0, padding:'9px 16px', borderRadius:9, border:'none', fontSize:12, fontWeight:500,
            cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap',
            background: tab===t.key ? '#0f1a14' : 'transparent',
            color: tab===t.key ? '#fff' : '#6b9e8a',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Profissionais */}
      {tab==='profissionais' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button onClick={()=>setModalProf({})} style={{
            display:'flex', alignItems:'center', gap:8, width:'100%', padding:'13px 16px',
            borderRadius:12, border:'2px dashed #c8e0d5', background:'transparent',
            fontSize:13, color:'#3a9175', cursor:'pointer', fontWeight:500, justifyContent:'center'
          }}>
            <Plus size={15}/> Novo profissional
          </button>
          {(data.profissionais||[]).map(p => (
            <div key={p.id} style={{ ...s(), padding:'16px 18px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'#f0f9f4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#3a9175', flexShrink:0 }}>
                {p.nome?.charAt(0)}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>{p.nome}</p>
                <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>{p.especialidade}{p.registro ? ` · ${p.registro}` : ''}{p.duracao_minutos ? ` · ${p.duracao_minutos}min` : ''}</p>
              </div>
              <span style={{ fontSize:9, fontWeight:600, padding:'3px 8px', borderRadius:20, background: p.ativo?'#e1f5ee':'#f3f4f6', color: p.ativo?'#0f6e56':'#9ca3af' }}>{p.ativo?'ATIVO':'INATIVO'}</span>
              <button onClick={()=>setModalProf(p)} style={{ background:'none', border:'none', cursor:'pointer', color:'#a0c8b8', padding:6, borderRadius:8 }}
                onMouseEnter={e=>e.currentTarget.style.background='#f0f5f2'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                <Edit2 size={13}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Convênios */}
      {tab==='convenios' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', gap:8 }}>
            <input value={novoNome} onChange={e=>setNovoNome(e.target.value)}
              placeholder="Nome do convênio..." onKeyDown={e=>e.key==='Enter'&&handleAddSimple('convenios')}
              style={inp} onFocus={e=>e.target.style.borderColor='#3a9175'} onBlur={e=>e.target.style.borderColor='#e8f0ec'} />
            <button onClick={()=>handleAddSimple('convenios')} style={{ padding:'10px 16px', borderRadius:10, background:'#3a9175', border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              <Plus size={15}/>Adicionar
            </button>
          </div>
          {(data.convenios||[]).map(c => (
            <div key={c.id} style={{ ...s(), padding:'14px 18px', display:'flex', alignItems:'center', gap:10 }}>
              {editingId===c.id
                ? <InlineEdit value={c.nome} onSave={v=>{editItem('convenios',c.id,{nome:v});setEditingId(null)}} onCancel={()=>setEditingId(null)}/>
                : <>
                  <p style={{ flex:1, fontSize:13, fontWeight:500, color:'#0f1a14' }}>{c.nome}</p>
                  <button onClick={()=>setEditingId(c.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#a0c8b8', padding:6, borderRadius:8 }}><Edit2 size={13}/></button>
                  <button onClick={()=>removeItem('convenios',c.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#f09595', padding:6, borderRadius:8 }}><Trash2 size={13}/></button>
                </>}
            </div>
          ))}
        </div>
      )}

      {/* Tipos */}
      {tab==='tipos_atendimento' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', gap:8 }}>
            <input type="color" value={novaCor} onChange={e=>setNovaCor(e.target.value)}
              style={{ width:42, height:42, borderRadius:10, border:'1.5px solid #e8f0ec', padding:3, cursor:'pointer' }}/>
            <input value={novoNome} onChange={e=>setNovoNome(e.target.value)}
              placeholder="Nome do tipo de atendimento..." onKeyDown={e=>e.key==='Enter'&&handleAddSimple('tipos_atendimento',{cor:novaCor})}
              style={inp} onFocus={e=>e.target.style.borderColor='#3a9175'} onBlur={e=>e.target.style.borderColor='#e8f0ec'}/>
            <button onClick={()=>handleAddSimple('tipos_atendimento',{cor:novaCor})} style={{ padding:'10px 16px', borderRadius:10, background:'#3a9175', border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
              Adicionar
            </button>
          </div>
          {(data.tipos_atendimento||[]).map(t => (
            <div key={t.id} style={{ ...s(), padding:'14px 18px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:12, height:12, borderRadius:4, background:t.cor||'#3a9175', flexShrink:0 }}/>
              {editingId===t.id
                ? <InlineEdit value={t.nome} onSave={v=>{editItem('tipos_atendimento',t.id,{nome:v});setEditingId(null)}} onCancel={()=>setEditingId(null)}/>
                : <>
                  <p style={{ flex:1, fontSize:13, fontWeight:500, color:'#0f1a14' }}>{t.nome}</p>
                  <button onClick={()=>setEditingId(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#a0c8b8', padding:6, borderRadius:8 }}><Edit2 size={13}/></button>
                  <button onClick={()=>removeItem('tipos_atendimento',t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#f09595', padding:6, borderRadius:8 }}><Trash2 size={13}/></button>
                </>}
            </div>
          ))}
        </div>
      )}

      {modalProf!==null && (
        <ModalProfissional
          profissional={modalProf.id ? modalProf : undefined}
          onSave={p=>{ p.id ? editItem('profissionais',p.id,p) : addItem('profissionais',p); setModalProf(null) }}
          onClose={()=>setModalProf(null)}/>
      )}
    </div>
  )
}
