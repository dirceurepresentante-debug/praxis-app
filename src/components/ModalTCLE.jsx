import { useState, useRef } from 'react'
import { X, Check, FileText, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TEXTO_TCLE = `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO

Eu, paciente identificado(a) abaixo, declaro que fui devidamente informado(a) sobre o serviço de atendimento clínico que será realizado pelo(a) profissional responsável.

1. SOBRE O SERVIÇO
O atendimento psicoterápico é um processo de autoconhecimento e tratamento de saúde mental que envolve conversas, técnicas terapêuticas e acompanhamento regular. Não há garantias de resultado, pois cada pessoa responde de forma única ao processo.

2. SIGILO E CONFIDENCIALIDADE
As informações compartilhadas nas sessões são protegidas pelo sigilo profissional, conforme o Código de Ética do CFP (Conselho Federal de Psicologia). O sigilo poderá ser quebrado apenas nos casos previstos em lei: risco iminente à vida do paciente ou de terceiros, ou determinação judicial.

3. REGISTROS
A terapeuta poderá realizar registros escritos (prontuário) para acompanhamento do processo. Esses registros são confidenciais e ficam sob guarda da profissional.

4. FREQUÊNCIA E CANCELAMENTOS
As sessões são realizadas conforme combinado entre as partes. Cancelamentos devem ser comunicados com no mínimo 24 horas de antecedência. Faltas sem aviso prévio poderão ser cobradas.

5. RESCISÃO
O paciente tem o direito de encerrar o processo terapêutico a qualquer momento, sendo recomendável comunicar à terapeuta para que seja feito um encerramento adequado.

6. CONSENTIMENTO
Ao assinar este termo, declaro que li e compreendi as informações acima e concordo livremente em participar do processo terapêutico nas condições descritas.`

export default function ModalTCLE({ tcle, paciente, onSave, onClose }) {
  const [assinatura, setAssinatura] = useState(tcle?.assinatura || '')
  const [lido, setLido] = useState(false)
  const hoje = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const valido = assinatura.trim().length >= 3 && lido

  const handleSave = () => {
    if (!valido) return
    onSave({
      assinatura: assinatura.trim(),
      data_assinatura: format(new Date(), 'yyyy-MM-dd'),
      assinado: true,
    })
  }

  const jaAssinado = tcle?.assinado

  return (
    <div style={{ position:'fixed', inset:0, zIndex:70, display:'flex', alignItems:'flex-end', justifyContent:'center' }} className="md:items-center md:p-4">
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)' }} onClick={onClose}/>
      <div style={{ position:'relative', background:'#fff', width:'100%', maxWidth:600, borderRadius:'20px 20px 0 0', maxHeight:'92vh', display:'flex', flexDirection:'column' }} className="md:rounded-2xl">

        <div style={{ padding:'18px 22px', borderBottom:'1px solid #f0f5f2', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#0f1a14' }}>Termo de Consentimento</h2>
            <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>TCLE — Resolução CFP 010/2000</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {jaAssinado && <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:20, background:'#e1f5ee', color:'#0f6e56' }}>✓ ASSINADO</span>}
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}><X size={16}/></button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px 22px' }}>
          {/* Texto do TCLE */}
          <div style={{ background:'#f8fdfb', border:'1px solid #d1f0e4', borderRadius:14, padding:'18px 20px', marginBottom:18 }}>
            <pre style={{ fontSize:11.5, color:'#374151', lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'inherit', margin:0 }}>{TEXTO_TCLE}</pre>
            <div style={{ marginTop:16, padding:'12px 14px', background:'#e1f5ee', borderRadius:10 }}>
              <p style={{ fontSize:11.5, color:'#0f6e56', fontWeight:500 }}>Paciente: <strong>{paciente?.nome}</strong></p>
              <p style={{ fontSize:11.5, color:'#0f6e56', marginTop:3 }}>Data: {jaAssinado ? tcle.data_assinatura : hoje}</p>
              {jaAssinado && <p style={{ fontSize:11.5, color:'#0f6e56', marginTop:3 }}>Assinatura (nome): <strong>{tcle.assinatura}</strong></p>}
            </div>
          </div>

          {!jaAssinado ? (
            <>
              {/* Checkbox leu */}
              <button onClick={() => setLido(l => !l)} style={{ display:'flex', alignItems:'flex-start', gap:10, width:'100%', background:'none', border:'none', cursor:'pointer', textAlign:'left', marginBottom:16, padding:0 }}>
                <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${lido?'#3a9175':'#c0d8ce'}`, background:lido?'#3a9175':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, transition:'all .15s' }}>
                  {lido && <Check size={11} color="#fff"/>}
                </div>
                <span style={{ fontSize:12, color:'#374151', lineHeight:1.5 }}>Li e compreendi todas as informações acima e concordo livremente com os termos descritos.</span>
              </button>

              {/* Campo assinatura */}
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:'#6b9e8a', display:'block', marginBottom:6 }}>Assinatura digital — Digite seu nome completo</label>
                <input value={assinatura} onChange={e=>setAssinatura(e.target.value)} placeholder={paciente?.nome || 'Nome completo...'} style={{ width:'100%', border:'1px solid #d1f0e4', borderRadius:12, padding:'11px 14px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'Georgia, serif', color:'#0f1a14', fontStyle:'italic' }}/>
                {assinatura && assinatura.trim().length < 3 && <p style={{ fontSize:10, color:'#f87171', marginTop:4 }}>Digite pelo menos 3 caracteres.</p>}
              </div>

              {!lido && <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:12, padding:'8px 12px', background:'#fef9ec', borderRadius:10, border:'1px solid #faeeda' }}>
                <AlertCircle size={12} color="#854f0b"/><p style={{ fontSize:11, color:'#854f0b' }}>Marque que leu o termo antes de assinar.</p>
              </div>}
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'20px 0', color:'#3a9175' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'#e1f5ee', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                <Check size={22} color="#3a9175"/>
              </div>
              <p style={{ fontSize:13, fontWeight:600 }}>Termo assinado em {tcle.data_assinatura}</p>
              <p style={{ fontSize:11, color:'#6b9e8a', marginTop:4 }}>Assinatura: <em>{tcle.assinatura}</em></p>
            </div>
          )}
        </div>

        {!jaAssinado && (
          <div style={{ padding:'14px 22px', borderTop:'1px solid #f0f5f2', flexShrink:0 }}>
            <button onClick={handleSave} disabled={!valido} style={{ width:'100%', padding:'13px', borderRadius:14, border:'none', background: valido?'linear-gradient(135deg,#3a9175,#1b5c42)':'#e5e7eb', color: valido?'#fff':'#9ca3af', fontSize:13, fontWeight:700, cursor: valido?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s' }}>
              <FileText size={14}/> Assinar e registrar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
