import { useState } from 'react'
import { X, Check, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

const PHQ9 = {
  nome: 'PHQ-9', titulo: 'Escala de Depressão', subtitulo: 'Patient Health Questionnaire',
  instrucao: 'Durante as últimas 2 semanas, com que frequência você foi incomodado(a) pelos problemas abaixo?',
  opcoes: ['Nenhuma vez (0)','Menos de 1 semana (1)','Mais da metade dos dias (2)','Quase todos os dias (3)'],
  perguntas: [
    'Pouco interesse ou prazer em fazer as coisas',
    'Se sentir "pra baixo", deprimido(a) ou sem perspectiva',
    'Dificuldade para adormecer ou permanecer dormindo, ou dormir mais do que de costume',
    'Se sentir cansado(a) ou com pouca energia',
    'Falta de apetite ou comer demais',
    'Se sentir mal consigo mesmo(a) — ou achar que é um fracasso ou que decepcionou sua família',
    'Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televisão',
    'Lentidão para se movimentar ou falar, a ponto das outras pessoas perceberem; ou o oposto — estar tão agitado(a) que você fica andando de um lado para o outro mais do que de costume',
    'Pensar em se machucar de alguma forma ou que seria melhor estar morto(a)',
  ],
  classificar: (score) => {
    if (score <= 4)  return { label:'Mínimo',  cor:'#16a34a', bg:'#f0fdf4' }
    if (score <= 9)  return { label:'Leve',     cor:'#65a30d', bg:'#f7fee7' }
    if (score <= 14) return { label:'Moderado', cor:'#d97706', bg:'#fffbeb' }
    if (score <= 19) return { label:'Grave',    cor:'#ea580c', bg:'#fff7ed' }
    return                  { label:'Muito grave', cor:'#dc2626', bg:'#fef2f2' }
  }
}

const GAD7 = {
  nome: 'GAD-7', titulo: 'Escala de Ansiedade', subtitulo: 'Generalized Anxiety Disorder',
  instrucao: 'Durante as últimas 2 semanas, com que frequência você foi incomodado(a) pelos seguintes problemas?',
  opcoes: ['Nenhuma vez (0)','Menos de 1 semana (1)','Mais da metade dos dias (2)','Quase todos os dias (3)'],
  perguntas: [
    'Sentir-se nervoso(a), ansioso(a) ou muito agitado(a)',
    'Não ser capaz de parar de se preocupar ou de controlar as preocupações',
    'Preocupar-se demasiadamente com diferentes coisas',
    'Dificuldade em relaxar',
    'Ficar tão agitado(a) que se torna difícil permanecer sentado(a)',
    'Tornar-se facilmente irritável ou irritado(a)',
    'Sentir medo como se algo horrível pudesse acontecer',
  ],
  classificar: (score) => {
    if (score <= 4)  return { label:'Mínimo',  cor:'#16a34a', bg:'#f0fdf4' }
    if (score <= 9)  return { label:'Leve',     cor:'#65a30d', bg:'#f7fee7' }
    if (score <= 14) return { label:'Moderado', cor:'#d97706', bg:'#fffbeb' }
    return                  { label:'Grave',    cor:'#dc2626', bg:'#fef2f2' }
  }
}

const ESCALA_VAZIA = (n) => Array(n).fill(null)

export default function ModalEscalas({ escalas, onSave, onClose }) {
  const [escala, setEscala] = useState('PHQ9')
  const [respostas, setRespostas] = useState(ESCALA_VAZIA(9))
  const cfg = escala === 'PHQ9' ? PHQ9 : GAD7

  const mudarEscala = (e) => { setEscala(e); setRespostas(ESCALA_VAZIA(e === 'PHQ9' ? 9 : 7)) }
  const setR = (i, v) => setRespostas(r => { const n=[...r]; n[i]=v; return n })

  const score = respostas.reduce((s, v) => s + (v ?? 0), 0)
  const respondidas = respostas.filter(v => v !== null).length
  const completo = respondidas === cfg.perguntas.length
  const resultado = completo ? cfg.classificar(score) : null

  const handleSave = () => {
    if (!completo) return
    onSave({
      tipo: escala,
      score,
      classificacao: resultado.label,
      respostas: [...respostas],
      data: format(new Date(), 'yyyy-MM-dd'),
    })
  }

  // Histórico da escala selecionada
  const historico = (escalas || []).filter(e => e.tipo === escala).sort((a,b) => b.data.localeCompare(a.data))

  return (
    <div style={{ position:'fixed', inset:0, zIndex:70, display:'flex', alignItems:'flex-end', justifyContent:'center' }} className="md:items-center md:p-4">
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)' }} onClick={onClose}/>
      <div style={{ position:'relative', background:'#fff', width:'100%', maxWidth:600, borderRadius:'20px 20px 0 0', maxHeight:'93vh', display:'flex', flexDirection:'column' }} className="md:rounded-2xl">

        <div style={{ padding:'16px 22px', borderBottom:'1px solid #f0f5f2', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#0f1a14' }}>Escalas Clínicas</h2>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}><X size={16}/></button>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {['PHQ9','GAD7'].map(e => (
              <button key={e} onClick={() => mudarEscala(e)} style={{ padding:'7px 16px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:600, fontSize:12, background: escala===e?'#3a9175':'#f0f5f2', color: escala===e?'#fff':'#6b9e8a', transition:'all .15s' }}>
                {e === 'PHQ9' ? 'PHQ-9 · Depressão' : 'GAD-7 · Ansiedade'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}>
          {/* Histórico */}
          {historico.length > 0 && (
            <div style={{ marginBottom:18 }}>
              <p style={{ fontSize:10, fontWeight:700, color:'#a0c8b8', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Histórico de aplicações</p>
              <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
                {historico.map((h,i) => {
                  const cls = cfg.classificar(h.score)
                  return (
                    <div key={i} style={{ flexShrink:0, background:cls.bg, border:`1px solid ${cls.cor}33`, borderRadius:12, padding:'10px 14px', minWidth:110, textAlign:'center' }}>
                      <p style={{ fontSize:18, fontWeight:800, color:cls.cor }}>{h.score}</p>
                      <p style={{ fontSize:10, fontWeight:700, color:cls.cor }}>{h.classificacao}</p>
                      <p style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>{h.data}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Nova aplicação */}
          <div>
            <div style={{ marginBottom:14 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#0f1a14' }}>{cfg.titulo} — {cfg.subtitulo}</p>
              <p style={{ fontSize:11, color:'#6b9e8a', marginTop:3 }}>{cfg.instrucao}</p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {cfg.perguntas.map((p, i) => (
                <div key={i} style={{ background:'#f8fdfb', borderRadius:12, padding:'12px 14px', border: respostas[i]!==null?'1px solid #c8e0d5':'1px solid #f0f5f2' }}>
                  <p style={{ fontSize:12, fontWeight:500, color:'#0f1a14', marginBottom:10 }}><span style={{ color:'#a0c8b8', marginRight:6, fontWeight:700 }}>{i+1}.</span>{p}</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5 }}>
                    {cfg.opcoes.map((op, val) => (
                      <button key={val} onClick={() => setR(i, val)} style={{ padding:'7px 8px', borderRadius:9, border:'none', cursor:'pointer', fontSize:11, textAlign:'left', transition:'all .12s', background: respostas[i]===val?'#3a9175':'#fff', color: respostas[i]===val?'#fff':'#6b7280', outline: respostas[i]===val?'none':'1px solid #e8f0ec', fontWeight: respostas[i]===val?600:400 }}>
                        {op}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Score em tempo real */}
            {respondidas > 0 && (
              <div style={{ marginTop:16, padding:'14px 18px', borderRadius:14, background: resultado?resultado.bg:'#f8fdfb', border:`1px solid ${resultado?resultado.cor+'33':'#e8f0ec'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontSize:11, color:'#6b9e8a', marginBottom:2 }}>Score atual</p>
                    <p style={{ fontSize:28, fontWeight:800, color: resultado?resultado.cor:'#0f1a14' }}>{score}</p>
                  </div>
                  {resultado && <div style={{ textAlign:'right' }}>
                    <p style={{ fontSize:16, fontWeight:700, color:resultado.cor }}>{resultado.label}</p>
                    <p style={{ fontSize:10, color:'#9ca3af', marginTop:2 }}>{respondidas}/{cfg.perguntas.length} respondidas</p>
                  </div>}
                </div>
                {escala === 'PHQ9' && respostas[8] > 0 && (
                  <div style={{ marginTop:10, padding:'8px 12px', background:'#fef2f2', borderRadius:8, border:'1px solid #fca5a5' }}>
                    <p style={{ fontSize:11, color:'#dc2626', fontWeight:600 }}>⚠️ Atenção: pergunta 9 indica pensamentos de automutilação. Avaliar risco imediatamente.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding:'14px 22px', borderTop:'1px solid #f0f5f2', flexShrink:0 }}>
          <button onClick={handleSave} disabled={!completo} style={{ width:'100%', padding:'13px', borderRadius:14, border:'none', background: completo?'linear-gradient(135deg,#3a9175,#1b5c42)':'#e5e7eb', color: completo?'#fff':'#9ca3af', fontSize:13, fontWeight:700, cursor: completo?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <TrendingUp size={14}/> {completo?'Registrar resultado':'Complete todas as perguntas'}
          </button>
        </div>
      </div>
    </div>
  )
}
