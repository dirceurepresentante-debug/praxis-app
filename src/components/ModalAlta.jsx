import { useState } from 'react'
import { X, Check, Printer, Award } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useApp } from '../contexts/AppContext'

export default function ModalAlta({ alta, paciente, prontuarios, metas, onSave, onClose }) {
  const { profissional } = useApp()
  const totalSessoes = prontuarios?.length || 0
  const metasAlcancadas = (metas || []).filter(m => m.status === 'alcancada')

  const [form, setForm] = useState({
    data_inicio: alta?.data_inicio || '',
    data_alta: alta?.data_alta || format(new Date(), 'yyyy-MM-dd'),
    total_sessoes: alta?.total_sessoes || totalSessoes,
    motivo_alta: alta?.motivo_alta || 'objetivos_alcancados',
    objetivos_alcancados: alta?.objetivos_alcancados || metasAlcancadas.map(m=>m.titulo).join('\n'),
    evolucao_clinica: alta?.evolucao_clinica || '',
    recomendacoes: alta?.recomendacoes || '',
    retorno_previsto: alta?.retorno_previsto || '',
    observacoes: alta?.observacoes || '',
  })

  const set = (k,v) => setForm(f => ({ ...f, [k]: v }))

  const MOTIVOS = {
    objetivos_alcancados: 'Objetivos terapêuticos alcançados',
    alta_voluntaria: 'Alta a pedido do paciente',
    encaminhamento: 'Encaminhamento para outro profissional',
    remissao_sintomas: 'Remissão dos sintomas',
    outro: 'Outro motivo',
  }

  const imprimir = () => {
    const w = window.open('', '_blank')
    const hoje = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    w.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>Relatório de Alta — ${paciente?.nome}</title>
      <style>
        body { font-family: Georgia, serif; max-width: 680px; margin: 40px auto; color: #1a1a1a; line-height: 1.7; }
        h1 { font-size: 20px; color: #0f6e56; border-bottom: 2px solid #3a9175; padding-bottom: 10px; }
        h2 { font-size: 14px; color: #3a9175; margin-top: 24px; text-transform: uppercase; letter-spacing: .05em; }
        p, li { font-size: 13px; margin: 4px 0; }
        .header { text-align: center; margin-bottom: 30px; }
        .header small { color: #6b9e8a; font-size: 12px; }
        .section { margin-bottom: 18px; }
        .label { font-weight: bold; }
        .assinatura { margin-top: 60px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 12px; color: #666; }
        @media print { body { margin: 20px; } }
      </style>
      </head><body>
      <div class="header">
        <h1>Relatório de Alta Terapêutica</h1>
        <small>${profissional?.nome || 'Profissional'} — ${profissional?.especialidade || ''}</small>
      </div>
      <div class="section">
        <h2>Dados do Paciente</h2>
        <p><span class="label">Nome:</span> ${paciente?.nome}</p>
        <p><span class="label">Período:</span> ${form.data_inicio || '—'} a ${form.data_alta}</p>
        <p><span class="label">Total de sessões:</span> ${form.total_sessoes}</p>
        <p><span class="label">Motivo da alta:</span> ${MOTIVOS[form.motivo_alta]}</p>
      </div>
      ${form.objetivos_alcancados ? `<div class="section"><h2>Objetivos Alcançados</h2><p style="white-space:pre-wrap">${form.objetivos_alcancados}</p></div>` : ''}
      ${form.evolucao_clinica ? `<div class="section"><h2>Evolução Clínica</h2><p style="white-space:pre-wrap">${form.evolucao_clinica}</p></div>` : ''}
      ${form.recomendacoes ? `<div class="section"><h2>Recomendações</h2><p style="white-space:pre-wrap">${form.recomendacoes}</p></div>` : ''}
      ${form.retorno_previsto ? `<div class="section"><h2>Retorno / Acompanhamento</h2><p>${form.retorno_previsto}</p></div>` : ''}
      ${form.observacoes ? `<div class="section"><h2>Observações</h2><p style="white-space:pre-wrap">${form.observacoes}</p></div>` : ''}
      <div class="assinatura">
        <p>Emitido em ${hoje}</p>
        <p>${profissional?.nome || 'Profissional'} — ${profissional?.especialidade || ''}</p>
        <p>CRP _______________</p>
      </div>
      </body></html>
    `)
    w.document.close()
    w.print()
  }

  const IN = { border:'1px solid #d1f0e4', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box', width:'100%', fontFamily:'inherit' }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:70, display:'flex', alignItems:'flex-end', justifyContent:'center' }} className="md:items-center md:p-4">
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)' }} onClick={onClose}/>
      <div style={{ position:'relative', background:'#fff', width:'100%', maxWidth:580, borderRadius:'20px 20px 0 0', maxHeight:'92vh', display:'flex', flexDirection:'column' }} className="md:rounded-2xl">

        <div style={{ padding:'16px 22px', borderBottom:'1px solid #f0f5f2', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#0f1a14' }}>Relatório de Alta</h2>
            <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>{paciente?.nome}</p>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {alta && <button onClick={imprimir} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:8, border:'1px solid #d1f0e4', background:'#f8fdfb', color:'#3a9175', fontSize:11, fontWeight:600, cursor:'pointer' }}><Printer size={12}/>Imprimir</button>}
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}><X size={16}/></button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            <div><label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:4 }}>Início do processo</label>
              <input type="date" value={form.data_inicio} onChange={e=>set('data_inicio',e.target.value)} style={IN}/></div>
            <div><label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:4 }}>Data da alta</label>
              <input type="date" value={form.data_alta} onChange={e=>set('data_alta',e.target.value)} style={IN}/></div>
            <div><label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:4 }}>Total de sessões</label>
              <input type="number" value={form.total_sessoes} onChange={e=>set('total_sessoes',e.target.value)} style={IN}/></div>
          </div>

          <div><label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:6 }}>Motivo da alta</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {Object.entries(MOTIVOS).map(([k,v]) => (
                <button key={k} onClick={()=>set('motivo_alta',k)} style={{ padding:'6px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:11, fontWeight:500, background: form.motivo_alta===k?'#3a9175':'#f0f5f2', color: form.motivo_alta===k?'#fff':'#6b9e8a', transition:'all .15s' }}>{v}</button>
              ))}
            </div>
          </div>

          {[
            { key:'objetivos_alcancados', label:'Objetivos alcançados', rows:3 },
            { key:'evolucao_clinica', label:'Evolução clínica (resumo do processo)', rows:4 },
            { key:'recomendacoes', label:'Recomendações e orientações de alta', rows:3 },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:4 }}>{f.label}</label>
              <textarea rows={f.rows} value={form[f.key]} onChange={e=>set(f.key,e.target.value)} style={{ ...IN, resize:'vertical' }}/>
            </div>
          ))}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div><label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:4 }}>Retorno previsto / acompanhamento</label>
              <input value={form.retorno_previsto} onChange={e=>set('retorno_previsto',e.target.value)} placeholder="Ex: Retorno em 6 meses se necessário" style={IN}/></div>
            <div><label style={{ fontSize:10, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:4 }}>Observações finais</label>
              <input value={form.observacoes} onChange={e=>set('observacoes',e.target.value)} style={IN}/></div>
          </div>
        </div>

        <div style={{ padding:'14px 22px', borderTop:'1px solid #f0f5f2', flexShrink:0, display:'flex', gap:10 }}>
          <button onClick={imprimir} style={{ display:'flex', alignItems:'center', gap:6, padding:'12px 18px', borderRadius:14, border:'1px solid #d1f0e4', background:'#f8fdfb', color:'#3a9175', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            <Printer size={13}/>Imprimir PDF
          </button>
          <button onClick={() => onSave(form)} style={{ flex:1, padding:'13px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#3a9175,#1b5c42)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <Award size={14}/>Registrar alta
          </button>
        </div>
      </div>
    </div>
  )
}
