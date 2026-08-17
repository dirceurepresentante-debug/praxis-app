import { useState, useMemo } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, getMonth, getYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign, AlertCircle, Plus, X, Check } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const CATEGORIAS_DESP = ['Aluguel de sala','Supervisão clínica','Cursos e capacitação','Contador','Material de escritório','Plano de saúde','Marketing','Software e assinaturas','Outros']

const cur = (v) => `R$ ${Number(v||0).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })}`

export default function Financeiro() {
  const { data, addItem, editItem } = useApp()
  const hoje = new Date()
  const [anoSel, setAnoSel] = useState(getYear(hoje))
  const [mesSel, setMesSel] = useState(null) // null = visão ano; 0..11 = mês específico
  const [showDespModal, setShowDespModal] = useState(false)
  const [editDesp, setEditDesp] = useState(null)
  const [formDesp, setFormDesp] = useState({ descricao:'', valor:'', data: format(hoje,'yyyy-MM-dd'), categoria:'Aluguel de sala' })
  const [filtroStatus, setFiltroStatus] = useState('todos') // todos | pago | aberto

  const agendamentos = data.agendamentos || []
  const despesas = (data.despesas || []).filter(d => getYear(parseISO(d.data)) === anoSel)
  const convenios = data.convenios || []
  const pacientes = data.pacientes || []

  // ─── Dados anuais por mês ───
  const dadosAnuais = useMemo(() => MESES.map((nome, idx) => {
    const ags = agendamentos.filter(a => {
      try { const d = parseISO(a.data); return getMonth(d) === idx && getYear(d) === anoSel } catch { return false }
    })
    const recebido  = ags.filter(a => a.pago).reduce((s,a) => s+(a.valor||0), 0)
    const aReceber  = ags.filter(a => !a.pago && a.status !== 'cancelado' && a.valor > 0).reduce((s,a) => s+(a.valor||0), 0)
    const desp      = despesas.filter(d => getMonth(parseISO(d.data)) === idx).reduce((s,d) => s+(d.valor||0), 0)
    return { nome, mes: idx, recebido, aReceber, despesas: desp, resultado: recebido - desp }
  }), [agendamentos, despesas, anoSel])

  // ─── KPIs anuais ───
  const totalRecebidoAno  = dadosAnuais.reduce((s,m) => s+m.recebido, 0)
  const totalAReceberAno  = dadosAnuais.reduce((s,m) => s+m.aReceber, 0)
  const totalDespesasAno  = dadosAnuais.reduce((s,m) => s+m.despesas, 0)
  const resultadoAno      = totalRecebidoAno - totalDespesasAno

  // ─── Mês selecionado ───
  const mesDados = mesSel !== null ? dadosAnuais[mesSel] : null
  const agsMes = mesSel !== null ? agendamentos.filter(a => {
    try { const d = parseISO(a.data); return getMonth(d) === mesSel && getYear(d) === anoSel } catch { return false }
  }) : []
  const despMes = mesSel !== null ? despesas.filter(d => getMonth(parseISO(d.data)) === mesSel) : []

  const pagsFiltrados = agsMes.filter(a => a.valor > 0 && (
    filtroStatus === 'todos' ? true :
    filtroStatus === 'pago' ? a.pago :
    !a.pago && a.status !== 'cancelado'
  )).sort((a,b) => b.data.localeCompare(a.data))

  // ─── Modal despesa ───
  const openNovaDesp = () => { setFormDesp({ descricao:'', valor:'', data: format(hoje,'yyyy-MM-dd'), categoria: mesSel !== null ? `${anoSel}-${String(mesSel+1).padStart(2,'0')}-01` : format(hoje,'yyyy-MM-dd'), }); setEditDesp(null); setShowDespModal(true) }
  const openEditDesp = (d) => { setFormDesp({ descricao:d.descricao, valor:String(d.valor), data:d.data, categoria:d.categoria }); setEditDesp(d); setShowDespModal(true) }
  const salvarDesp = () => {
    const payload = { ...formDesp, valor: parseFloat(formDesp.valor)||0 }
    if (editDesp) editItem('despesas', editDesp.id, payload)
    else addItem('despesas', payload)
    setShowDespModal(false)
  }
  const preencherDataMes = () => {
    if (mesSel !== null) setFormDesp(f => ({ ...f, data: `${anoSel}-${String(mesSel+1).padStart(2,'0')}-15` }))
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background:'#0f1a14', border:'1px solid #1d2e22', borderRadius:10, padding:'10px 14px', fontSize:11 }}>
        <p style={{ color:'#7aaa95', fontWeight:700, marginBottom:6 }}>{label}</p>
        {payload.map(p => <p key={p.name} style={{ color:p.fill||p.color, marginBottom:2 }}>{p.name}: {cur(p.value)}</p>)}
      </div>
    )
  }

  return (
    <div style={{ padding:'20px 16px', maxWidth:760, margin:'0 auto' }}>

      {/* Título + nav ano */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:17, fontWeight:700, color:'#0f1a14' }}>Financeiro</h1>
          <p style={{ fontSize:12, color:'#6b9e8a', marginTop:3 }}>Receitas, despesas e resultado</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={() => { setAnoSel(y=>y-1); setMesSel(null) }} style={{ background:'#f0f5f2', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#3a9175' }}><ChevronLeft size={14}/></button>
          <span style={{ fontSize:15, fontWeight:700, color:'#0f1a14', minWidth:46, textAlign:'center' }}>{anoSel}</span>
          <button onClick={() => { setAnoSel(y=>y+1); setMesSel(null) }} style={{ background:'#f0f5f2', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#3a9175' }}><ChevronRight size={14}/></button>
        </div>
      </div>

      {/* KPIs anuais */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }} className="sm:grid-cols-4">
        {[
          { label:'Recebido no ano',   value: cur(totalRecebidoAno),  color:'#0f6e56', bg:'#e1f5ee', icon: <TrendingUp size={14}/> },
          { label:'A receber',         value: cur(totalAReceberAno),  color:'#854f0b', bg:'#faeeda', icon: <AlertCircle size={14}/> },
          { label:'Despesas no ano',   value: cur(totalDespesasAno),  color:'#a32d2d', bg:'#fef2f2', icon: <TrendingDown size={14}/> },
          { label:'Resultado',         value: cur(resultadoAno),      color: resultadoAno>=0?'#0f6e56':'#a32d2d', bg: resultadoAno>=0?'#e1f5ee':'#fef2f2', icon: <DollarSign size={14}/> },
        ].map(k => (
          <div key={k.label} style={{ background:k.bg, borderRadius:14, padding:'14px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, color:k.color }}>{k.icon}<span style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>{k.label}</span></div>
            <p style={{ fontSize:17, fontWeight:700, color:k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Gráfico anual */}
      <div style={{ background:'#fff', border:'1px solid #e8f0ec', borderRadius:16, padding:'18px 16px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>Visão do ano — {anoSel}</p>
          {mesSel !== null && <button onClick={() => setMesSel(null)} style={{ fontSize:11, color:'#3a9175', background:'#e1f5ee', border:'none', borderRadius:8, padding:'4px 10px', cursor:'pointer' }}>← Voltar ao ano</button>}
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dadosAnuais} barGap={2} onClick={e => e?.activePayload && setMesSel(e.activePayload[0]?.payload?.mes)}>
            <XAxis dataKey="nome" tick={{ fontSize:10, fill:'#6b9e8a' }} axisLine={false} tickLine={false}/>
            <YAxis hide />
            <Tooltip content={<CustomTooltip/>}/>
            <Legend wrapperStyle={{ fontSize:10, color:'#6b9e8a', paddingTop:8 }}/>
            <Bar dataKey="recebido" name="Recebido" radius={[4,4,0,0]}>
              {dadosAnuais.map((m,i) => <Cell key={i} fill={mesSel===m.mes?'#0f6e56':'#3a9175'}/>)}
            </Bar>
            <Bar dataKey="despesas" name="Despesas" radius={[4,4,0,0]}>
              {dadosAnuais.map((m,i) => <Cell key={i} fill={mesSel===m.mes?'#a32d2d':'#f87171'}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{ fontSize:10, color:'#a0c8b8', textAlign:'center', marginTop:4 }}>Clique em um mês para ver o detalhe</p>
      </div>

      {/* Detalhe do mês OU tabela resumo */}
      {mesSel === null ? (
        /* Tabela resumo anual */
        <div style={{ background:'#fff', border:'1px solid #e8f0ec', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid #f0f5f2', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>Resumo por mês</p>
            <button onClick={openNovaDesp} style={{ display:'flex', alignItems:'center', gap:6, background:'#3a9175', color:'#fff', border:'none', borderRadius:8, padding:'7px 12px', fontSize:11, fontWeight:600, cursor:'pointer' }}><Plus size={12}/> Despesa</button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr style={{ background:'#f8fdfb' }}>
                  {['Mês','Recebido','A receber','Despesas','Resultado'].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign: h==='Mês'?'left':'right', fontSize:10, fontWeight:700, color:'#6b9e8a', textTransform:'uppercase', letterSpacing:'.05em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dadosAnuais.map((m,i) => (
                  <tr key={i} onClick={() => setMesSel(i)} style={{ borderTop:'1px solid #f0f5f2', cursor:'pointer', transition:'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#f8fdfb'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'11px 14px', fontWeight:600, color:'#0f1a14' }}>{m.nome}</td>
                    <td style={{ padding:'11px 14px', textAlign:'right', color:'#0f6e56', fontWeight:600 }}>{m.recebido>0?cur(m.recebido):'-'}</td>
                    <td style={{ padding:'11px 14px', textAlign:'right', color: m.aReceber>0?'#854f0b':'#c0d8ce' }}>{m.aReceber>0?cur(m.aReceber):'-'}</td>
                    <td style={{ padding:'11px 14px', textAlign:'right', color: m.despesas>0?'#a32d2d':'#c0d8ce' }}>{m.despesas>0?cur(m.despesas):'-'}</td>
                    <td style={{ padding:'11px 14px', textAlign:'right', fontWeight:700, color: m.resultado>=0?'#0f6e56':'#a32d2d' }}>
                      {(m.recebido>0||m.despesas>0)?cur(m.resultado):'-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop:'2px solid #e8f0ec', background:'#f0f9f4' }}>
                  <td style={{ padding:'12px 14px', fontWeight:700, fontSize:11, color:'#0f6e56', textTransform:'uppercase', letterSpacing:'.04em' }}>Total</td>
                  <td style={{ padding:'12px 14px', textAlign:'right', fontWeight:700, color:'#0f6e56' }}>{cur(totalRecebidoAno)}</td>
                  <td style={{ padding:'12px 14px', textAlign:'right', fontWeight:700, color: totalAReceberAno>0?'#854f0b':'#c0d8ce' }}>{cur(totalAReceberAno)}</td>
                  <td style={{ padding:'12px 14px', textAlign:'right', fontWeight:700, color:'#a32d2d' }}>{cur(totalDespesasAno)}</td>
                  <td style={{ padding:'12px 14px', textAlign:'right', fontWeight:800, fontSize:14, color: resultadoAno>=0?'#0f6e56':'#a32d2d' }}>{cur(resultadoAno)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* Detalhe do mês selecionado */
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Header do mês */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#0f1a14' }}>{MESES[mesSel]} / {anoSel}</h2>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => setMesSel(m => m===0?0:m-1)} style={{ background:'#f0f5f2', border:'none', borderRadius:8, width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#3a9175' }}><ChevronLeft size={13}/></button>
              <button onClick={() => setMesSel(m => m===11?11:m+1)} style={{ background:'#f0f5f2', border:'none', borderRadius:8, width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#3a9175' }}><ChevronRight size={13}/></button>
            </div>
          </div>

          {/* KPIs do mês */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8 }}>
            {[
              { label:'Recebido',  value: cur(mesDados.recebido),  color:'#0f6e56', bg:'#e1f5ee' },
              { label:'A receber', value: cur(mesDados.aReceber),  color:'#854f0b', bg:'#faeeda' },
              { label:'Despesas',  value: cur(mesDados.despesas),  color:'#a32d2d', bg:'#fef2f2' },
              { label:'Resultado', value: cur(mesDados.resultado), color: mesDados.resultado>=0?'#0f6e56':'#a32d2d', bg: mesDados.resultado>=0?'#e1f5ee':'#fef2f2' },
            ].map(k => (
              <div key={k.label} style={{ background:k.bg, borderRadius:12, padding:'10px 12px', textAlign:'center' }}>
                <p style={{ fontSize:14, fontWeight:700, color:k.color }}>{k.value}</p>
                <p style={{ fontSize:9, color:k.color, opacity:.75, marginTop:3, fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>{k.label}</p>
              </div>
            ))}
          </div>

          {/* Receitas do mês */}
          <div style={{ background:'#fff', border:'1px solid #e8f0ec', borderRadius:14 }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #f0f5f2', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>Receitas — {agsMes.filter(a=>a.valor>0).length} sessões</p>
              <div style={{ display:'flex', gap:4 }}>
                {['todos','pago','aberto'].map(f => (
                  <button key={f} onClick={() => setFiltroStatus(f)} style={{ fontSize:10, fontWeight:600, padding:'3px 10px', borderRadius:20, border:'none', cursor:'pointer', textTransform:'capitalize', background: filtroStatus===f?'#3a9175':'#f0f5f2', color: filtroStatus===f?'#fff':'#6b9e8a' }}>
                    {f==='todos'?'Todos':f==='pago'?'Pagos':'Em aberto'}
                  </button>
                ))}
              </div>
            </div>
            {pagsFiltrados.length === 0 ? (
              <p style={{ padding:'20px', textAlign:'center', fontSize:12, color:'#a0c8b8' }}>Nenhum registro neste mês.</p>
            ) : (
              <div>
                {pagsFiltrados.map(ag => {
                  const pac = pacientes.find(p => p.id === ag.paciente_id)
                  const tipo = (data.tipos_atendimento||[]).find(t => t.id === ag.tipo_id)
                  return (
                    <div key={ag.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderTop:'1px solid #f8faf8' }}>
                      <div style={{ width:3, height:32, borderRadius:2, background: tipo?.cor||'#3a9175', flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>{pac?.nome || '—'}</p>
                        <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>{ag.data} às {ag.hora} · {tipo?.nome}</p>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ fontSize:14, fontWeight:700, color: ag.pago?'#0f6e56':'#0f1a14' }}>{cur(ag.valor)}</p>
                        <span style={{ fontSize:9, fontWeight:700, padding:'1px 7px', borderRadius:20, background: ag.pago?'#e1f5ee':'#faeeda', color: ag.pago?'#0f6e56':'#854f0b' }}>
                          {ag.pago?'PAGO':'ABERTO'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Despesas do mês */}
          <div style={{ background:'#fff', border:'1px solid #fce8e8', borderRadius:14 }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #fce8e8', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>Despesas — {despMes.length} lançamento{despMes.length!==1?'s':''}</p>
              <button onClick={() => { preencherDataMes(); setFormDesp(f => ({ ...f, data:`${anoSel}-${String(mesSel+1).padStart(2,'0')}-01` })); setEditDesp(null); setShowDespModal(true) }} style={{ display:'flex', alignItems:'center', gap:5, background:'#fef2f2', color:'#a32d2d', border:'1px solid #fcd4d4', borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                <Plus size={11}/> Adicionar
              </button>
            </div>
            {despMes.length === 0 ? (
              <p style={{ padding:'20px', textAlign:'center', fontSize:12, color:'#c0c8c4' }}>Nenhuma despesa lançada.</p>
            ) : (
              despMes.sort((a,b) => b.data.localeCompare(a.data)).map(d => (
                <div key={d.id} onClick={() => openEditDesp(d)} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderTop:'1px solid #fdf5f5', cursor:'pointer' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#fdf5f5'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>{d.descricao}</p>
                    <p style={{ fontSize:11, color:'#c08080', marginTop:2 }}>{d.data} · {d.categoria}</p>
                  </div>
                  <p style={{ fontSize:14, fontWeight:700, color:'#a32d2d', flexShrink:0 }}>{cur(d.valor)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal nova/editar despesa */}
      {showDespModal && (
        <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.4)', backdropFilter:'blur(4px)' }} onClick={() => setShowDespModal(false)}/>
          <div style={{ position:'relative', background:'#fff', borderRadius:18, width:'100%', maxWidth:400, padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:'#0f1a14' }}>{editDesp?'Editar despesa':'Nova despesa'}</h3>
              <button onClick={() => setShowDespModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}><X size={16}/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:5 }}>Descrição</label>
                <input value={formDesp.descricao} onChange={e=>setFormDesp(f=>({...f,descricao:e.target.value}))} placeholder="Ex: Aluguel sala outubro" style={{ width:'100%', border:'1px solid #d1f0e4', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:5 }}>Valor (R$)</label>
                  <input type="number" step="0.01" min="0" value={formDesp.valor} onChange={e=>setFormDesp(f=>({...f,valor:e.target.value}))} placeholder="0,00" style={{ width:'100%', border:'1px solid #d1f0e4', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}/>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:5 }}>Data</label>
                  <input type="date" value={formDesp.data} onChange={e=>setFormDesp(f=>({...f,data:e.target.value}))} style={{ width:'100%', border:'1px solid #d1f0e4', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:5 }}>Categoria</label>
                <select value={formDesp.categoria} onChange={e=>setFormDesp(f=>({...f,categoria:e.target.value}))} style={{ width:'100%', border:'1px solid #d1f0e4', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', background:'#fff', boxSizing:'border-box' }}>
                  {CATEGORIAS_DESP.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={salvarDesp} style={{ background:'linear-gradient(135deg,#3a9175,#1b5c42)', color:'#fff', border:'none', borderRadius:12, padding:'12px', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:4 }}>
                <Check size={14}/> {editDesp?'Salvar alterações':'Lançar despesa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
