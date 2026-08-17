import { useState } from 'react'
import { X, Phone, Mail, Edit2, Plus, Heart, FileText, Calendar, TrendingUp, MapPin, Share2, Briefcase, Users, Check, Printer, Target, ClipboardCheck, BarChart2, Award } from 'lucide-react'
import { differenceInYears, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useApp } from '../contexts/AppContext'
import ModalPaciente from './ModalPaciente'
import ModalProntuario from './ModalProntuario'
import ModalAnamnese from './ModalAnamnese'
import ModalMapeamento from './ModalMapeamento'
import ModalTCLE from './ModalTCLE'
import ModalEscalas from './ModalEscalas'
import ModalMetas from './ModalMetas'
import ModalAlta from './ModalAlta'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const STATUS_COLORS = { realizado:'#16a34a', faltou:'#ef4444', cancelado:'#9ca3af', confirmado:'#2563eb', aguardando:'#d97706' }
const STATUS_BG     = { realizado:'#f0fdf4', faltou:'#fef2f2', cancelado:'#f9fafb', confirmado:'#eff6ff', aguardando:'#fffbeb' }
const STATUS_LABEL  = { realizado:'Realizado', faltou:'Faltou', cancelado:'Cancelado', confirmado:'Confirmado', aguardando:'Aguardando' }
const ORIGEM_ICON   = { 'Indicação':'🤝','Instagram':'📸','Facebook':'👥','Tráfego Pago':'📢','Google':'🔍','Site':'🌐','Outros':'✨' }

export default function FichaPaciente({ paciente, convenios, onClose, onEdit }) {
  const { data, addItem, editItem } = useApp()
  const [tab, setTab] = useState('resumo')
  const [editando, setEditando] = useState(false)
  const [novoProntuario, setNovoProntuario] = useState(false)
  const [prontuarioSessao, setProntuarioSessao] = useState(null)
  const [editAnamnese, setEditAnamnese] = useState(false)
  const [editMapeamento, setEditMapeamento] = useState(false)
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [showTCLE, setShowTCLE] = useState(false)
  const [showEscalas, setShowEscalas] = useState(false)
  const [showMetas, setShowMetas] = useState(false)
  const [showAlta, setShowAlta] = useState(false)

  // ── Abas customizáveis ──
  const STORAGE_KEY = 'bruna_tab_config'
  const DEFAULT_LABELS = {
    resumo:'Resumo', prontuario:'Prontuário', anamnese:'Anamnese',
    historico:'Sessões', financeiro:'Financeiro', mapeamento:'Mapeamento',
    tcle:'TCLE', escalas:'Escalas', metas:'Objetivos do Processo', alta:'Alta'
  }
  const [tabConfig, setTabConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { labels:{}, customTabs:[] } }
    catch { return { labels:{}, customTabs:[] } }
  })
  const [editingTab, setEditingTab] = useState(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [addingTab, setAddingTab] = useState(false)
  const [novaAba, setNovaAba] = useState('')
  const [customNotes, setCustomNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bruna_custom_notes')) || {} } catch { return {} }
  })

  const getLabel = (id) => tabConfig.labels[id] ?? DEFAULT_LABELS[id] ?? id
  const saveConfig = (cfg) => { setTabConfig(cfg); localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)) }
  const startEdit = (e, id) => { e.preventDefault(); setEditingTab(id); setEditingLabel(getLabel(id)) }
  const confirmEdit = () => {
    if (!editingLabel.trim()) { setEditingTab(null); return }
    saveConfig({ ...tabConfig, labels: { ...tabConfig.labels, [editingTab]: editingLabel.trim() } })
    setEditingTab(null)
  }
  const addTab = () => {
    if (!novaAba.trim()) { setAddingTab(false); setNovaAba(''); return }
    const id = `custom_${Date.now()}`
    saveConfig({ ...tabConfig, customTabs: [...(tabConfig.customTabs||[]), { id, label: novaAba.trim() }] })
    setNovaAba(''); setAddingTab(false); setTab(id)
  }
  const removeTab = (id) => {
    saveConfig({ ...tabConfig, customTabs: (tabConfig.customTabs||[]).filter(t => t.id !== id) })
    if (tab === id) setTab('resumo')
  }
  const saveCustomNote = (key, val) => {
    const notes = { ...customNotes, [key]: val }
    setCustomNotes(notes)
    localStorage.setItem('bruna_custom_notes', JSON.stringify(notes))
  }

  const copiarLinkMapeamento = () => {
    const link = `${window.location.origin}/mapeamento?pid=${paciente.id}`
    navigator.clipboard.writeText(link).then(() => { setLinkCopiado(true); setTimeout(() => setLinkCopiado(false), 2500) })
  }

  const agendamentos  = (data.agendamentos || []).filter(a => a.paciente_id === paciente.id).sort((a,b) => b.data.localeCompare(a.data))
  const prontuarios   = (data.prontuarios  || []).filter(p => p.paciente_id === paciente.id).sort((a,b) => b.data.localeCompare(a.data))
  const anamnese      = (data.anamneses    || []).find(a => a.paciente_id === paciente.id)
  const mapeamento    = (data.mapeamentos  || []).find(m => m.paciente_id === paciente.id)
  const tcle          = (data.tcles        || []).find(t => t.paciente_id === paciente.id)
  const escalas       = (data.escalas      || []).filter(e => e.paciente_id === paciente.id)
  const metasReg      = (data.metas        || []).find(m => m.paciente_id === paciente.id)
  const alta          = (data.altas        || []).find(a => a.paciente_id === paciente.id)
  const convenio      = convenios.find(c => c.id === paciente.convenio_id)

  const totalSessoes  = agendamentos.filter(a => a.status === 'realizado').length
  const totalFaltas   = agendamentos.filter(a => a.status === 'faltou').length
  const plano         = paciente.plano_sessoes || 0
  const planoRestante = plano > 0 ? Math.max(0, plano - totalSessoes) : null
  const planoPct      = plano > 0 ? Math.min(100, (totalSessoes / plano) * 100) : 0

  // Financeiro
  const pagamentos    = agendamentos.filter(a => a.valor > 0)
  const totalPago     = pagamentos.filter(a => a.pago).reduce((s,a) => s+(a.valor||0), 0)
  const totalAberto   = pagamentos.filter(a => !a.pago && a.status !== 'cancelado').reduce((s,a) => s+(a.valor||0), 0)

  const idade = paciente.data_nascimento ? differenceInYears(new Date(), parseISO(paciente.data_nascimento)) : null
  const humorData = prontuarios.filter(p => p.humor).slice(0,10).reverse().map((p,i) => ({ sessao: i+1, humor: p.humor }))

  const prontuarioDaSessao = (ag) => prontuarios.find(p => p.data === ag.data && (!p.agendamento_id || p.agendamento_id === ag.id))

  const tabs = [
    { id:'resumo',     label: getLabel('resumo') },
    { id:'prontuario', label: `${getLabel('prontuario')} (${prontuarios.length})` },
    { id:'anamnese',   label: getLabel('anamnese') },
    { id:'historico',  label: `${getLabel('historico')} (${agendamentos.length})` },
    { id:'financeiro', label: getLabel('financeiro') },
    { id:'mapeamento', label: mapeamento ? `🧠 ${getLabel('mapeamento')}` : getLabel('mapeamento') },
    { id:'tcle',       label: tcle?.assinado ? `✅ ${getLabel('tcle')}` : getLabel('tcle') },
    { id:'escalas',    label: `${getLabel('escalas')} (${escalas.length})` },
    { id:'metas',      label: metasReg ? `${getLabel('metas')} (${(metasReg.lista||[]).filter(m=>m.status==='alcancada').length}/${(metasReg.lista||[]).length})` : getLabel('metas') },
    { id:'alta',       label: alta ? `🏁 ${getLabel('alta')}` : getLabel('alta') },
    ...(tabConfig.customTabs||[]).map(t => ({ id: t.id, label: getLabel(t.id) || t.label, isCustom: true })),
  ]

  const handleSaveProntuario = (p) => {
    if (p.id) editItem('prontuarios', p.id, p)
    else addItem('prontuarios', { ...p, paciente_id: paciente.id, agendamento_id: prontuarioSessao?.agendamento_id || null, data: prontuarioSessao?.data || p.data })
    setNovoProntuario(false); setProntuarioSessao(null)
  }
  const handleSaveAnamnese = (a) => {
    if (anamnese) editItem('anamneses', anamnese.id, a)
    else addItem('anamneses', { ...a, paciente_id: paciente.id })
    setEditAnamnese(false)
  }
  const handleSaveMapeamento = (m) => {
    if (mapeamento) editItem('mapeamentos', mapeamento.id, m)
    else addItem('mapeamentos', { ...m, paciente_id: paciente.id })
    setEditMapeamento(false)
  }
  const handleSaveTCLE = (t) => {
    if (tcle) editItem('tcles', tcle.id, t)
    else addItem('tcles', { ...t, paciente_id: paciente.id })
    setShowTCLE(false)
  }
  const handleSaveEscala = (e) => {
    addItem('escalas', { ...e, paciente_id: paciente.id })
    setShowEscalas(false)
  }
  const handleSaveMetas = (lista) => {
    if (metasReg) editItem('metas', metasReg.id, { lista })
    else addItem('metas', { paciente_id: paciente.id, lista })
    setShowMetas(false)
  }
  const handleSaveAlta = (a) => {
    if (alta) editItem('altas', alta.id, a)
    else addItem('altas', { ...a, paciente_id: paciente.id })
    setShowAlta(false)
  }

  const exportarPDF = () => {
    const w = window.open('', '_blank')
    const hoje = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Prontuário — ${paciente.nome}</title>
    <style>
      body{font-family:Georgia,serif;max-width:700px;margin:40px auto;color:#1a1a1a;line-height:1.7;font-size:13px}
      h1{font-size:20px;color:#0f6e56;border-bottom:2px solid #3a9175;padding-bottom:8px}
      h2{font-size:13px;color:#3a9175;margin-top:22px;text-transform:uppercase;letter-spacing:.05em}
      .kpi{display:inline-block;background:#e1f5ee;border-radius:8px;padding:6px 14px;margin:4px;font-size:12px;color:#0f6e56;font-weight:bold}
      .sessao{border:1px solid #e8f0ec;border-radius:8px;padding:10px 14px;margin-bottom:8px}
      .tag{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:bold;margin-left:6px}
      @media print{body{margin:20px}}
    </style></head><body>
    <h1>Prontuário Clínico</h1>
    <p><b>Paciente:</b> ${paciente.nome}</p>
    <p><b>Gerado em:</b> ${hoje}</p>
    <div>
      <span class="kpi">${totalSessoes} sessões realizadas</span>
      <span class="kpi">R$ ${totalPago} pago</span>
      ${tcle?.assinado ? '<span class="kpi">✓ TCLE assinado</span>' : ''}
    </div>
    ${prontuarios.length > 0 ? `<h2>Prontuários (${prontuarios.length})</h2>` + prontuarios.map(p=>`<div class="sessao"><p><b>${p.data}</b>${p.humor?` · Humor ${p.humor}/5`:''}</p><p>${p.anotacoes}</p>${p.plano?`<p style="color:#0f6e56"><b>Plano:</b> ${p.plano}</p>`:''}</div>`).join('') : ''}
    ${metasReg?.lista?.length > 0 ? `<h2>Objetivos do Processo</h2><ul>${metasReg.lista.map(m=>`<li>${m.titulo} — <b>${m.status==='alcancada'?'✓ Alcançada':m.status}</b></li>`).join('')}</ul>` : ''}
    ${escalas.length > 0 ? `<h2>Escalas Clínicas</h2><ul>${escalas.map(e=>`<li>${e.tipo}: ${e.score} pts — ${e.classificacao} (${e.data})</li>`).join('')}</ul>` : ''}
    </body></html>`)
    w.document.close(); w.print()
  }
  const openProntuarioParaSessao = (ag) => {
    const existente = prontuarioDaSessao(ag)
    if (existente) setNovoProntuario(existente)
    else { setProntuarioSessao({ agendamento_id: ag.id, data: ag.data }); setNovoProntuario(true) }
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end', justifyContent:'center' }} className="md:items-center md:p-4">
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.4)', backdropFilter:'blur(4px)' }} onClick={onClose} />
      <div style={{ position:'relative', background:'#fff', width:'100%', maxWidth:680, borderRadius:'20px 20px 0 0', maxHeight:'92vh', display:'flex', flexDirection:'column' }} className="md:rounded-2xl">

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'18px 20px', borderBottom:'1px solid #f0f5f2', flexShrink:0 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', background:'#e1f5ee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#3a9175', flexShrink:0 }}>
            {paciente.nome?.charAt(0)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:15, fontWeight:600, color:'#0f1a14' }}>{paciente.nome}</p>
            <p style={{ fontSize:12, color:'#6b9e8a', marginTop:3 }}>
              {idade ? `${idade} anos` : ''}{idade && convenio ? ' · ' : ''}{convenio?.nome}
              {paciente.origem ? ` · ${ORIGEM_ICON[paciente.origem]||'📍'} ${paciente.origem}` : ''}
            </p>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={exportarPDF} title="Exportar prontuário" style={{ background:'none', border:'none', cursor:'pointer', color:'#a0c8b8', padding:6, borderRadius:8 }}><Printer size={14}/></button>
            <button onClick={() => setEditando(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'#a0c8b8', padding:6, borderRadius:8 }}><Edit2 size={14}/></button>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#a0c8b8', padding:6, borderRadius:8 }}><X size={14}/></button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:1, padding:'10px 20px 0', borderBottom:'1px solid #f0f5f2', overflowX:'auto', flexShrink:0, alignItems:'flex-end' }}>
          {tabs.map(t => (
            <div key={t.id} style={{ position:'relative', display:'flex', alignItems:'center', flexShrink:0 }}>
              {editingTab === t.id ? (
                <input
                  autoFocus
                  value={editingLabel}
                  onChange={e => setEditingLabel(e.target.value)}
                  onBlur={confirmEdit}
                  onKeyDown={e => { if(e.key==='Enter') confirmEdit(); if(e.key==='Escape') setEditingTab(null) }}
                  style={{ padding:'6px 8px', fontSize:12, fontWeight:500, border:'1px solid #3a9175', borderRadius:6, color:'#3a9175', background:'#f8fdfb', outline:'none', width: Math.max(80, editingLabel.length * 8) + 'px' }}
                />
              ) : (
                <button
                  onClick={() => setTab(t.id)}
                  onDoubleClick={e => startEdit(e, t.id)}
                  title="Duplo clique para renomear"
                  style={{
                    padding:'8px 12px', fontSize:12, fontWeight:500, whiteSpace:'nowrap', background:'none', border:'none',
                    borderBottom: tab===t.id ? '2px solid #3a9175' : '2px solid transparent',
                    color: tab===t.id ? '#3a9175' : '#6b7280', cursor:'pointer', transition:'all .15s',
                    paddingRight: t.isCustom ? 20 : 12
                  }}
                >{t.label}</button>
              )}
              {t.isCustom && editingTab !== t.id && (
                <button
                  onClick={() => removeTab(t.id)}
                  title="Remover aba"
                  style={{ position:'absolute', right:2, top:4, background:'#e5e7eb', border:'none', borderRadius:'50%', width:14, height:14, color:'#6b7280', fontSize:9, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1, padding:0 }}
                >×</button>
              )}
            </div>
          ))}
          {/* Botão adicionar aba */}
          {addingTab ? (
            <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 6px', flexShrink:0 }}>
              <input
                autoFocus
                value={novaAba}
                onChange={e => setNovaAba(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter') addTab(); if(e.key==='Escape'){ setAddingTab(false); setNovaAba('') } }}
                placeholder="Nome da aba..."
                style={{ padding:'4px 8px', fontSize:12, border:'1px solid #3a9175', borderRadius:6, outline:'none', width:100, color:'#374151' }}
              />
              <button onClick={addTab} style={{ background:'#3a9175', border:'none', borderRadius:6, color:'#fff', fontSize:11, padding:'4px 8px', cursor:'pointer' }}>OK</button>
              <button onClick={() => { setAddingTab(false); setNovaAba('') }} style={{ background:'none', border:'none', color:'#9ca3af', fontSize:16, cursor:'pointer', lineHeight:1 }}>×</button>
            </div>
          ) : (
            <button
              onClick={() => setAddingTab(true)}
              title="Adicionar nova aba"
              style={{ padding:'6px 10px', fontSize:18, fontWeight:300, background:'none', border:'none', color:'#c0d8d0', cursor:'pointer', lineHeight:1, flexShrink:0 }}
            >+</button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:'auto', padding:20 }}>

          {/* ── RESUMO — split layout ── */}
          {tab === 'resumo' && (
            <div style={{ display:'flex', gap:20 }}>

              {/* COLUNA ESQUERDA */}
              <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:14 }}>
                {/* Stats */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                  <div style={{ background:'#f0fdf4', borderRadius:12, padding:'10px 12px', textAlign:'center' }}>
                    <p style={{ fontSize:20, fontWeight:700, color:'#16a34a' }}>{totalSessoes}</p>
                    <p style={{ fontSize:10, color:'#16a34a', marginTop:2 }}>Sessões</p>
                  </div>
                  <div style={{ background:'#fef2f2', borderRadius:12, padding:'10px 12px', textAlign:'center' }}>
                    <p style={{ fontSize:20, fontWeight:700, color:'#ef4444' }}>{totalFaltas}</p>
                    <p style={{ fontSize:10, color:'#ef4444', marginTop:2 }}>Faltas</p>
                  </div>
                  <div style={{ background:'#f0f9f4', borderRadius:12, padding:'10px 12px', textAlign:'center' }}>
                    <p style={{ fontSize:16, fontWeight:700, color:'#0f6e56' }}>R${totalPago}</p>
                    <p style={{ fontSize:10, color:'#3a9175', marginTop:2 }}>Pago total</p>
                  </div>
                </div>

                {/* Plano */}
                {plano > 0 && (
                  <div style={{ background:'#f8fdfb', border:'1px solid #d1f0e4', borderRadius:12, padding:'12px 14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <p style={{ fontSize:11, fontWeight:600, color:'#0f6e56' }}>📋 Plano de {plano} sessões</p>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20, background: planoRestante===0 ? '#fef2f2' : planoRestante<=1 ? '#fef9ec' : '#e1f5ee', color: planoRestante===0 ? '#a32d2d' : planoRestante<=1 ? '#854f0b' : '#0f6e56' }}>
                        {planoRestante===0 ? 'Encerrado' : `${planoRestante} restante${planoRestante!==1?'s':''}`}
                      </span>
                    </div>
                    <div style={{ background:'#e1f5ee', borderRadius:99, height:6 }}>
                      <div style={{ height:'100%', borderRadius:99, width:`${planoPct}%`, background: planoPct>=100?'#a32d2d':planoPct>=75?'#854f0b':'#3a9175', transition:'width .4s' }} />
                    </div>
                    <p style={{ fontSize:10, color:'#6b9e8a', marginTop:5 }}>{totalSessoes} de {plano} utilizadas</p>
                  </div>
                )}

                {/* Gráfico humor */}
                {humorData.length > 1 && (
                  <div>
                    <p style={{ fontSize:11, fontWeight:600, color:'#6b9e8a', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                      <TrendingUp size={12}/> Evolução do humor
                    </p>
                    <div style={{ background:'#f8fdfb', borderRadius:12, padding:10, height:100 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={humorData}>
                          <XAxis dataKey="sessao" hide /><YAxis domain={[1,5]} hide />
                          <Tooltip formatter={v=>[`${v}/5`,'Humor']} labelFormatter={l=>`Sessão ${l}`} />
                          <Line type="monotone" dataKey="humor" stroke="#3a9175" strokeWidth={2} dot={{ fill:'#3a9175', r:3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Dados pessoais */}
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'#a0c8b8', letterSpacing:'.06em', textTransform:'uppercase' }}>Dados</p>
                  {paciente.telefone && <a href={`tel:${paciente.telefone}`} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#374151', textDecoration:'none' }}><Phone size={13} style={{ color:'#a0c8b8' }}/>{paciente.telefone}</a>}
                  {paciente.email && <a href={`mailto:${paciente.email}`} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#374151', textDecoration:'none' }}><Mail size={13} style={{ color:'#a0c8b8' }}/>{paciente.email}</a>}
                  {paciente.profissao && (
                    <p style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#374151' }}>
                      <Briefcase size={13} style={{ color:'#a0c8b8' }}/>
                      {paciente.profissao}
                      {paciente.trabalhando !== null && paciente.trabalhando !== undefined && (
                        <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:20, background: paciente.trabalhando?'#e1f5ee':'#f3f4f6', color: paciente.trabalhando?'#0f6e56':'#9ca3af' }}>
                          {paciente.trabalhando ? 'Trabalhando' : 'Sem trabalho'}
                        </span>
                      )}
                    </p>
                  )}
                  {paciente.estado_civil && (
                    <p style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#374151' }}>
                      <Users size={13} style={{ color:'#a0c8b8' }}/>
                      {paciente.estado_civil}
                      {paciente.conjuge_nome && <span style={{ color:'#9ca3af' }}>· {paciente.conjuge_nome}{paciente.conjuge_idade ? `, ${paciente.conjuge_idade} anos` : ''}</span>}
                    </p>
                  )}
                  {paciente.filhos?.length > 0 && (
                    <p style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:12, color:'#374151' }}>
                      <span style={{ marginTop:1 }}>👶</span>
                      <span>{paciente.filhos.length} filho{paciente.filhos.length!==1?'s':''}: {paciente.filhos.map((f,i) => `${f.nome}${f.idade?` (${f.idade} anos)`:''}`).join(', ')}</span>
                    </p>
                  )}
                  {(paciente.cidade || paciente.estado) && (
                    <p style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#374151' }}>
                      <MapPin size={13} style={{ color:'#a0c8b8' }}/>{[paciente.cidade, paciente.estado].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {paciente.origem && (
                    <p style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#374151' }}>
                      <Share2 size={13} style={{ color:'#a0c8b8' }}/>Veio por: <strong>{paciente.origem}</strong>
                    </p>
                  )}
                </div>

                {/* Última anotação */}
                {prontuarios[0] && (
                  <div style={{ background:'#f8fdfb', borderRadius:12, padding:'12px 14px' }}>
                    <p style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', marginBottom:6 }}>Última anotação</p>
                    <p style={{ fontSize:10, color:'#a0c8b8', marginBottom:4 }}>{prontuarios[0].data}</p>
                    <p style={{ fontSize:12, color:'#374151', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{prontuarios[0].anotacoes}</p>
                  </div>
                )}
              </div>

              {/* COLUNA DIREITA — Histórico financeiro (desktop) */}
              <div style={{ width:190, flexShrink:0, display:'flex', flexDirection:'column', gap:10 }} className="hidden md:flex md:flex-col">
                <div style={{ background:'#f0f9f4', borderRadius:12, padding:'12px 14px' }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'#3a9175', letterSpacing:'.05em', textTransform:'uppercase', marginBottom:10 }}>Financeiro</p>
                  <div>
                    <p style={{ fontSize:10, color:'#6b9e8a' }}>Total pago</p>
                    <p style={{ fontSize:18, fontWeight:700, color:'#0f6e56' }}>R$ {totalPago}</p>
                  </div>
                  <div style={{ height:1, background:'#d1f0e4', margin:'8px 0' }} />
                  <div>
                    <p style={{ fontSize:10, color:'#6b9e8a' }}>Em aberto</p>
                    <p style={{ fontSize:18, fontWeight:700, color: totalAberto>0?'#854f0b':'#9ca3af' }}>R$ {totalAberto}</p>
                  </div>
                </div>
                <p style={{ fontSize:9, fontWeight:700, color:'#a0c8b8', letterSpacing:'.05em', textTransform:'uppercase' }}>Últimos pagamentos</p>
                <div style={{ display:'flex', flexDirection:'column', gap:6, overflowY:'auto', flex:1 }}>
                  {pagamentos.length === 0 && <p style={{ fontSize:11, color:'#c0d8ce', fontStyle:'italic' }}>Nenhum registro.</p>}
                  {pagamentos.map(ag => (
                    <div key={ag.id} style={{ border:'1px solid #e8f0ec', borderRadius:10, padding:'8px 10px', background:'#fff' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                        <span style={{ fontSize:10, color:'#6b9e8a' }}>{ag.data}</span>
                        <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:20, background: ag.pago?'#e1f5ee':'#faeeda', color: ag.pago?'#0f6e56':'#854f0b' }}>
                          {ag.pago?'PAGO':'ABERTO'}
                        </span>
                      </div>
                      <p style={{ fontSize:13, fontWeight:700, color: ag.pago?'#0f6e56':'#0f1a14' }}>R$ {ag.valor}</p>
                      <p style={{ fontSize:10, color:'#a0c8b8' }}>{ag.hora}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PRONTUÁRIO ── */}
          {tab === 'prontuario' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <button onClick={() => { setNovoProntuario(true); setProntuarioSessao(null) }} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'12px', borderRadius:12, border:'2px dashed #c8e0d5', background:'transparent', fontSize:13, color:'#3a9175', cursor:'pointer', fontWeight:500 }}>
                <Plus size={15}/> Nova anotação de sessão
              </button>
              {prontuarios.length === 0 && <div style={{ textAlign:'center', padding:'40px 0', color:'#a0c8b8' }}><FileText size={28} style={{ margin:'0 auto 10px', opacity:.3 }}/><p style={{ fontSize:13 }}>Nenhuma anotação ainda.</p></div>}
              {prontuarios.map(p => (
                <div key={p.id} style={{ border:'1px solid #e8f0ec', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <span style={{ fontSize:11, color:'#6b9e8a', fontWeight:500 }}>{p.data}</span>
                    {p.humor && <div style={{ display:'flex', gap:3 }}>{[1,2,3,4,5].map(n => <div key={n} style={{ width:7, height:7, borderRadius:'50%', background: n<=p.humor?'#3a9175':'#e5e7eb' }}/>)}<span style={{ fontSize:10, color:'#a0c8b8', marginLeft:4 }}>{p.humor}/5</span></div>}
                  </div>
                  <p style={{ fontSize:13, color:'#374151', lineHeight:1.5 }}>{p.anotacoes}</p>
                  {p.plano && <p style={{ fontSize:11, color:'#0f6e56', background:'#e1f5ee', borderRadius:8, padding:'4px 10px', marginTop:8 }}>📋 {p.plano}</p>}
                </div>
              ))}
            </div>
          )}

          {/* ── ANAMNESE ── */}
          {tab === 'anamnese' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>Ficha de Anamnese</p>
                <button onClick={() => setEditAnamnese(true)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#3a9175', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
                  <Edit2 size={11}/> {anamnese ? 'Editar' : 'Preencher'}
                </button>
              </div>
              {!anamnese ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#a0c8b8' }}>
                  <Heart size={28} style={{ margin:'0 auto 10px', opacity:.3 }}/>
                  <p style={{ fontSize:13 }}>Anamnese não preenchida ainda.</p>
                  <button onClick={() => setEditAnamnese(true)} style={{ marginTop:8, background:'none', border:'none', cursor:'pointer', color:'#3a9175', fontSize:12 }}>+ Preencher agora</button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {[['Queixa Principal',anamnese.queixa_principal],['Histórico',anamnese.historico],['Medicamentos',anamnese.medicamentos],['Objetivos da Terapia',anamnese.objetivos]].map(([lbl,val]) => val && (
                    <div key={lbl}>
                      <p style={{ fontSize:11, fontWeight:600, color:'#6b9e8a', marginBottom:5 }}>{lbl}</p>
                      <p style={{ fontSize:13, color:'#374151', background:'#f8fdfb', borderRadius:10, padding:'10px 14px', lineHeight:1.5 }}>{val}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SESSÕES (histórico) ── */}
          {tab === 'historico' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {agendamentos.length === 0 && <div style={{ textAlign:'center', padding:'40px 0', color:'#a0c8b8' }}><Calendar size={28} style={{ margin:'0 auto 10px', opacity:.3 }}/><p style={{ fontSize:13 }}>Nenhum agendamento ainda.</p></div>}
              {agendamentos.map(ag => {
                const tipo = (data.tipos_atendimento||[]).find(t => t.id===ag.tipo_id)
                const nota = prontuarioDaSessao(ag)
                return (
                  <div key={ag.id} style={{ border:'1px solid #e8f0ec', borderRadius:12, overflow:'hidden' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px' }}>
                      <div style={{ width:3, height:36, borderRadius:2, background: tipo?.cor||'#3a9175', flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>{ag.data} às {ag.hora}</p>
                        <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>{tipo?.nome}</p>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20, background: STATUS_BG[ag.status]||'#f9fafb', color: STATUS_COLORS[ag.status]||'#9ca3af' }}>{STATUS_LABEL[ag.status]||ag.status}</span>
                        {ag.valor>0 && <p style={{ fontSize:11, color: ag.pago?'#16a34a':'#9ca3af', fontWeight:600, marginTop:3 }}>R$ {ag.valor}</p>}
                      </div>
                    </div>
                    {nota ? (
                      <div style={{ borderTop:'1px solid #f0f5f2', padding:'10px 14px', background:'#fafdfb' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:10, fontWeight:600, color:'#3a9175' }}>ANOTAÇÃO</span>
                          {nota.humor && <div style={{ display:'flex', gap:2 }}>{[1,2,3,4,5].map(n=><div key={n} style={{ width:5, height:5, borderRadius:'50%', background: n<=nota.humor?'#3a9175':'#d1d5db' }}/>)}</div>}
                        </div>
                        <p style={{ fontSize:12, color:'#374151', lineHeight:1.5 }}>{nota.anotacoes}</p>
                        {nota.plano && <p style={{ fontSize:11, color:'#0f6e56', background:'#e1f5ee', borderRadius:7, padding:'3px 8px', marginTop:6 }}>📋 {nota.plano}</p>}
                      </div>
                    ) : ag.status==='realizado' && (
                      <div style={{ borderTop:'1px solid #f0f5f2', padding:'7px 14px' }}>
                        <button onClick={() => openProntuarioParaSessao(ag)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#3a9175', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
                          <Plus size={11}/> Adicionar anotação
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── FINANCEIRO (aba completa, útil no mobile) ── */}
          {tab === 'financeiro' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                {[
                  { label:'Total pago',  value:`R$ ${totalPago}`,  color:'#0f6e56', bg:'#e1f5ee' },
                  { label:'Em aberto',   value:`R$ ${totalAberto}`, color: totalAberto>0?'#854f0b':'#9ca3af', bg: totalAberto>0?'#faeeda':'#f3f4f6' },
                  { label:'Sessões c/ valor', value:pagamentos.length, color:'#0f1a14', bg:'#f6faf8' },
                ].map(k=>(
                  <div key={k.label} style={{ background:k.bg, borderRadius:12, padding:'12px', textAlign:'center' }}>
                    <p style={{ fontSize:16, fontWeight:700, color:k.color }}>{k.value}</p>
                    <p style={{ fontSize:10, color:k.color, opacity:.75, marginTop:3 }}>{k.label}</p>
                  </div>
                ))}
              </div>
              {pagamentos.length === 0 && <p style={{ textAlign:'center', padding:'24px 0', fontSize:13, color:'#a0c8b8' }}>Nenhum registro financeiro ainda.</p>}
              {pagamentos.map(ag => {
                const tipo = (data.tipos_atendimento||[]).find(t => t.id===ag.tipo_id)
                return (
                  <div key={ag.id} style={{ display:'flex', alignItems:'center', gap:12, border:'1px solid #e8f0ec', borderRadius:12, padding:'12px 14px' }}>
                    <div style={{ width:3, height:36, borderRadius:2, background: tipo?.cor||'#3a9175', flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>{ag.data} às {ag.hora}</p>
                      <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>{tipo?.nome||'Sessão'}</p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <p style={{ fontSize:14, fontWeight:700, color: ag.pago?'#0f6e56':'#0f1a14' }}>R$ {ag.valor}</p>
                      <span style={{ display:'inline-block', fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:20, marginTop:3, background: ag.pago?'#e1f5ee': ag.status==='cancelado'?'#f3f4f6':'#faeeda', color: ag.pago?'#0f6e56': ag.status==='cancelado'?'#9ca3af':'#854f0b' }}>
                        {ag.pago?'PAGO': ag.status==='cancelado'?'CANCELADO':'EM ABERTO'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {/* ── TCLE ── */}
          {tab === 'tcle' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>Termo de Consentimento</p>
                  <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>TCLE — Resolução CFP 010/2000</p>
                </div>
                <button onClick={() => setShowTCLE(true)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#3a9175', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
                  <ClipboardCheck size={11}/>{tcle?.assinado ? 'Visualizar' : 'Assinar'}
                </button>
              </div>
              {tcle?.assinado ? (
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:14, padding:'18px 20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Check size={18} color="#16a34a"/>
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:'#15803d' }}>Termo assinado</p>
                      <p style={{ fontSize:11, color:'#16a34a' }}>{tcle.data_assinatura}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:12, color:'#374151' }}>Assinatura digital: <em style={{ color:'#15803d', fontFamily:'Georgia,serif' }}>{tcle.assinatura}</em></p>
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#a0c8b8' }}>
                  <ClipboardCheck size={28} style={{ margin:'0 auto 10px', opacity:.3 }}/>
                  <p style={{ fontSize:13 }}>Termo ainda não assinado.</p>
                  <button onClick={() => setShowTCLE(true)} style={{ marginTop:10, background:'#3a9175', border:'none', borderRadius:10, padding:'9px 18px', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>Assinar agora</button>
                </div>
              )}
            </div>
          )}

          {/* ── ESCALAS CLÍNICAS ── */}
          {tab === 'escalas' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>Escalas Clínicas</p>
                  <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>PHQ-9 · GAD-7</p>
                </div>
                <button onClick={() => setShowEscalas(true)} style={{ display:'flex', alignItems:'center', gap:5, background:'#3a9175', color:'#fff', border:'none', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                  <Plus size={11}/>Aplicar escala
                </button>
              </div>
              {escalas.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#a0c8b8' }}>
                  <BarChart2 size={28} style={{ margin:'0 auto 10px', opacity:.3 }}/>
                  <p style={{ fontSize:13 }}>Nenhuma escala aplicada ainda.</p>
                </div>
              ) : (
                <>
                  {['PHQ9','GAD7'].map(tipo => {
                    const hist = escalas.filter(e=>e.tipo===tipo).sort((a,b)=>b.data.localeCompare(a.data))
                    if (!hist.length) return null
                    const COR = { 'Mínimo':'#16a34a','Leve':'#65a30d','Moderado':'#d97706','Grave':'#ea580c','Muito grave':'#dc2626' }
                    return (
                      <div key={tipo}>
                        <p style={{ fontSize:11, fontWeight:700, color:'#6b9e8a', marginBottom:8 }}>{tipo==='PHQ9'?'PHQ-9 · Depressão':'GAD-7 · Ansiedade'}</p>
                        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
                          {hist.map((e,i) => {
                            const cor = COR[e.classificacao]||'#6b9e8a'
                            return (
                              <div key={i} style={{ flexShrink:0, background:`${cor}18`, border:`1px solid ${cor}44`, borderRadius:12, padding:'10px 14px', minWidth:100, textAlign:'center' }}>
                                <p style={{ fontSize:20, fontWeight:800, color:cor }}>{e.score}</p>
                                <p style={{ fontSize:10, fontWeight:700, color:cor }}>{e.classificacao}</p>
                                <p style={{ fontSize:10, color:'#9ca3af', marginTop:2 }}>{e.data}</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          )}

          {/* ── METAS TERAPÊUTICAS ── */}
          {tab === 'metas' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>Metas Terapêuticas</p>
                  <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>
                    {metasReg ? `${(metasReg.lista||[]).filter(m=>m.status==='alcancada').length} de ${(metasReg.lista||[]).length} alcançadas` : 'Nenhuma meta definida'}
                  </p>
                </div>
                <button onClick={() => setShowMetas(true)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#3a9175', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
                  <Target size={11}/>{metasReg ? 'Editar' : 'Definir metas'}
                </button>
              </div>
              {!metasReg || (metasReg.lista||[]).length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#a0c8b8' }}>
                  <Target size={28} style={{ margin:'0 auto 10px', opacity:.3 }}/>
                  <p style={{ fontSize:13 }}>Nenhuma meta definida.</p>
                  <button onClick={() => setShowMetas(true)} style={{ marginTop:10, background:'#3a9175', border:'none', borderRadius:10, padding:'9px 18px', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>+ Definir metas</button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {(metasReg.lista||[]).map((meta,i) => {
                    const ST = { em_andamento:{cor:'#2563eb',bg:'#eff6ff',l:'Em andamento'}, alcancada:{cor:'#16a34a',bg:'#f0fdf4',l:'Alcançada'}, pausada:{cor:'#9ca3af',bg:'#f9fafb',l:'Pausada'}, abandonada:{cor:'#ef4444',bg:'#fef2f2',l:'Abandonada'} }
                    const st = ST[meta.status]||ST.em_andamento
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, border:'1px solid #e8f0ec', borderRadius:12, padding:'12px 14px' }}>
                        <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${st.cor}`, background:meta.status==='alcancada'?st.cor:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                          {meta.status==='alcancada' && <Check size={10} color="#fff"/>}
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:13, fontWeight:600, color:meta.status==='alcancada'?'#9ca3af':'#0f1a14', textDecoration:meta.status==='alcancada'?'line-through':'none' }}>{meta.titulo}</p>
                          {meta.descricao && <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>{meta.descricao}</p>}
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:st.bg, color:st.cor, display:'inline-block', marginTop:4 }}>{st.l}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ALTA ── */}
          {tab === 'alta' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>Relatório de Alta</p>
                  <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>Encerramento do processo terapêutico</p>
                </div>
                <button onClick={() => setShowAlta(true)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#3a9175', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
                  <Award size={11}/>{alta ? 'Editar / Imprimir' : 'Registrar alta'}
                </button>
              </div>
              {!alta ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#a0c8b8' }}>
                  <Award size={28} style={{ margin:'0 auto 10px', opacity:.3 }}/>
                  <p style={{ fontSize:13 }}>Nenhuma alta registrada.</p>
                  <p style={{ fontSize:11, marginTop:4 }}>Use quando o processo terapêutico for concluído.</p>
                  <button onClick={() => setShowAlta(true)} style={{ marginTop:10, background:'#3a9175', border:'none', borderRadius:10, padding:'9px 18px', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>Registrar alta</button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:14, padding:'16px 18px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                      <Award size={20} color="#16a34a"/>
                      <p style={{ fontSize:14, fontWeight:700, color:'#15803d' }}>Alta registrada — {alta.data_alta}</p>
                    </div>
                    <p style={{ fontSize:12, color:'#374151' }}><b>Período:</b> {alta.data_inicio||'—'} até {alta.data_alta}</p>
                    <p style={{ fontSize:12, color:'#374151', marginTop:4 }}><b>Sessões:</b> {alta.total_sessoes}</p>
                  </div>
                  {alta.evolucao_clinica && <div style={{ border:'1px solid #e8f0ec', borderRadius:12, padding:'12px 14px' }}>
                    <p style={{ fontSize:10, fontWeight:600, color:'#a0c8b8', textTransform:'uppercase', marginBottom:5 }}>Evolução clínica</p>
                    <p style={{ fontSize:12, color:'#374151', lineHeight:1.6 }}>{alta.evolucao_clinica}</p>
                  </div>}
                  {alta.recomendacoes && <div style={{ border:'1px solid #e8f0ec', borderRadius:12, padding:'12px 14px' }}>
                    <p style={{ fontSize:10, fontWeight:600, color:'#a0c8b8', textTransform:'uppercase', marginBottom:5 }}>Recomendações</p>
                    <p style={{ fontSize:12, color:'#374151', lineHeight:1.6 }}>{alta.recomendacoes}</p>
                  </div>}
                </div>
              )}
            </div>
          )}

          {/* ── MAPEAMENTO PESSOAL ── */}
          {tab === 'mapeamento' && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>Mapeamento Pessoal</p>
                  <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>Neuropsicoterapia · autoconhecimento</p>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={copiarLinkMapeamento} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:8, border:'1px solid #d1f0e4', background: linkCopiado?'#e1f5ee':'#f8fdfb', color: linkCopiado?'#0f6e56':'#3a9175', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all .2s' }}>
                    {linkCopiado ? <><Check size={11}/>Link copiado!</> : <><Share2 size={11}/>Enviar link</>}
                  </button>
                  <button onClick={() => setEditMapeamento(true)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#3a9175', fontWeight:500, display:'flex', alignItems:'center', gap:4 }}>
                    <Edit2 size={11}/> {mapeamento ? 'Editar' : 'Preencher'}
                  </button>
                </div>
              </div>

              {!mapeamento ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#a0c8b8' }}>
                  <span style={{ fontSize:36, display:'block', marginBottom:10 }}>🧠</span>
                  <p style={{ fontSize:13 }}>Mapeamento não preenchido ainda.</p>
                  <p style={{ fontSize:11, marginTop:6, maxWidth:240, margin:'8px auto 0', lineHeight:1.6 }}>
                    Envie o link <strong style={{color:'#3a9175'}}>/mapeamento</strong> para o paciente preencher em casa, ou preencha aqui.
                  </p>
                  <button onClick={() => setEditMapeamento(true)} style={{ marginTop:14, background:'#3a9175', border:'none', borderRadius:10, padding:'9px 18px', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>+ Preencher agora</button>
                </div>
              ) : (
                (() => {
                  const SECOES_EXIB = [
                    { titulo:'🌟 Apresentação', campos:[{key:'apresentacao',label:'Apresentação'},{key:'cor_favorita',label:'Cor favorita'},{key:'musica_favorita',label:'Música favorita'},{key:'frase_vida',label:'Frase de vida'}] },
                    { titulo:'👨‍👩‍👧 Família', campos:[{key:'nome_pai',label:'Pai'},{key:'nome_mae',label:'Mãe'},{key:'filhos_desc',label:'Filhos'},{key:'conjuge',label:'Cônjuge'}] },
                    { titulo:'🧒 Infância', campos:[{key:'melhor_amigo_infancia',label:'Melhor amigo'},{key:'sonho_infancia',label:'Sonho de criança'},{key:'algo_para_gritar',label:'Queria gritar'}] },
                    { titulo:'🍽️ Gostos', campos:[{key:'alimentos_ama',label:'Ama'},{key:'alimentos_detesta',label:'Detesta'}] },
                    { titulo:'💫 Momentos', campos:[{key:'dia_mais_feliz',label:'Dia mais feliz'},{key:'dia_esquecer',label:'Dia que quer esquecer'}] },
                    { titulo:'🌈 Sonhos', campos:[{key:'faria_sem_dinheiro',label:'Se dinheiro não importasse'},{key:'sonho_compravel',label:'Sonho comprável'},{key:'sonho_nao_compravel',label:'Sonho não comprável'}] },
                    { titulo:'🔍 Autoconhecimento', campos:[{key:'pontos_melhorar',label:'Pontos a melhorar'},{key:'qualidades_outros',label:'Qualidades (outros)'},{key:'qualidades_proprias',label:'Qualidades próprias'},{key:'pessoas_admiradas',label:'Pessoas admiradas'}] },
                    { titulo:'🧠 Perfil Psicológico', campos:[{key:'temperamento_primario',label:'Temperamento primário'},{key:'temperamento_secundario',label:'Temperamento secundário'},{key:'linguagem_amor',label:'Linguagem do amor'},{key:'sinto_amado',label:'Me sinto amado(a) quando'},{key:'perfil_inteligencia',label:'Inteligência'},{key:'disc',label:'DISC'},{key:'talentos_clifton',label:'Talentos Clifton'}] },
                    { titulo:'💼 Profissional e Legado', campos:[{key:'momento_profissional',label:'Momento profissional'},{key:'como_ser_lembrado',label:'Como quer ser lembrado(a)'}] },
                  ]
                  return (
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      {SECOES_EXIB.map(sec => {
                        const temDados = sec.campos.some(c => mapeamento[c.key])
                        if (!temDados) return null
                        return (
                          <div key={sec.titulo} style={{ border:'1px solid #e8f0ec', borderRadius:14, overflow:'hidden' }}>
                            <div style={{ padding:'10px 14px', background:'#f8fdfb', borderBottom:'1px solid #e8f0ec' }}>
                              <p style={{ fontSize:12, fontWeight:700, color:'#0f6e56' }}>{sec.titulo}</p>
                            </div>
                            <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
                              {sec.campos.filter(c => mapeamento[c.key]).map(c => (
                                <div key={c.key}>
                                  <p style={{ fontSize:10, fontWeight:600, color:'#a0c8b8', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:3 }}>{c.label}</p>
                                  <p style={{ fontSize:13, color:'#374151', lineHeight:1.5 }}>{mapeamento[c.key]}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()
              )}
            </div>
          )}

          {/* ── ABAS PERSONALIZADAS ── */}
          {tab.startsWith('custom_') && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>{getLabel(tab)}</p>
                <button
                  onDoubleClick={e => startEdit(e, tab)}
                  onClick={e => startEdit(e, tab)}
                  style={{ fontSize:11, color:'#a0c8b8', background:'none', border:'1px solid #e8f0ec', borderRadius:6, padding:'3px 8px', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}
                >✏️ renomear</button>
              </div>
              <textarea
                value={customNotes[`${paciente.id}_${tab}`] || ''}
                onChange={e => saveCustomNote(`${paciente.id}_${tab}`, e.target.value)}
                placeholder="Anotações livres para esta aba..."
                style={{ width:'100%', minHeight:280, border:'1px solid #e8f0ec', borderRadius:12, padding:14, fontSize:14, resize:'vertical', fontFamily:'inherit', lineHeight:1.7, color:'#374151', outline:'none', background:'#fafdfb' }}
              />
              <p style={{ fontSize:10, color:'#c0d8d0' }}>Salvo automaticamente no dispositivo</p>
            </div>
          )}

        </div>
      </div>

      {editando && <ModalPaciente paciente={paciente} convenios={convenios} onSave={p=>{onEdit(p);setEditando(false)}} onClose={()=>setEditando(false)}/>}
      {(novoProntuario===true||(novoProntuario&&novoProntuario.id)) && (
        <ModalProntuario prontuario={novoProntuario!==true?novoProntuario:undefined} onSave={handleSaveProntuario} onClose={()=>{setNovoProntuario(false);setProntuarioSessao(null)}}/>
      )}
      {editAnamnese && <ModalAnamnese anamnese={anamnese} onSave={handleSaveAnamnese} onClose={()=>setEditAnamnese(false)}/>}
      {editMapeamento && <ModalMapeamento mapeamento={mapeamento} onSave={handleSaveMapeamento} onClose={()=>setEditMapeamento(false)}/>}
      {showTCLE    && <ModalTCLE    tcle={tcle}    paciente={paciente} onSave={handleSaveTCLE}   onClose={()=>setShowTCLE(false)}/>}
      {showEscalas && <ModalEscalas escalas={escalas}                  onSave={handleSaveEscala} onClose={()=>setShowEscalas(false)}/>}
      {showMetas   && <ModalMetas   metas={metasReg?.lista||[]}        onSave={handleSaveMetas}  onClose={()=>setShowMetas(false)}/>}
      {showAlta    && <ModalAlta    alta={alta} paciente={paciente} prontuarios={prontuarios} metas={metasReg?.lista||[]} onSave={handleSaveAlta} onClose={()=>setShowAlta(false)}/>}
    </div>
  )
}
