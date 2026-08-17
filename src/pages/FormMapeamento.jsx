import { useState, useEffect } from 'react'
import { Check, ChevronDown, ChevronUp, Heart, ArrowRight, ArrowLeft } from 'lucide-react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const DEMO_MODE = !SUPABASE_URL

const SECOES = [
  {
    id: 'identificacao', titulo: '👋 Identificação', subtitulo: 'Informações básicas',
    campos: [
      { key:'nome', label:'Nome completo', tipo:'text', obrigatorio:true },
      { key:'email', label:'E-mail', tipo:'email', obrigatorio:true },
      { key:'idade', label:'Idade', tipo:'text' },
      { key:'peso_altura', label:'Peso e altura', tipo:'text', placeholder:'Ex: 65kg / 1,68m' },
    ]
  },
  {
    id: 'apresentacao', titulo: '🌟 Apresentação', subtitulo: 'Quem é você?',
    campos: [
      { key:'apresentacao', label:'Se apresente para mim', placeholder:'Eu sou a ........, tenho ..... anos, sou mãe, esposa, ...', tipo:'textarea' },
      { key:'cor_favorita', label:'Cor favorita e por quê?', tipo:'textarea' },
      { key:'musica_favorita', label:'Música favorita e por quê?', tipo:'textarea' },
      { key:'frase_vida', label:'Uma frase que você leva para a vida', tipo:'textarea' },
    ]
  },
  {
    id: 'familia', titulo: '👨‍👩‍👧 Família', subtitulo: 'Vínculos e histórico',
    campos: [
      {
        key:'estado_civil', label:'Estado Civil', tipo:'radio',
        opcoes: ['Casado(a)','Solteiro(a)','Divorciado(a)','Outro']
      },
      { key:'conjuge', label:'Nome do esposo(a) e uma palavra que o define', tipo:'text' },
      { key:'filhos_desc', label:'Filhos — nome e idade', tipo:'textarea' },
      { key:'nome_pai', label:'Nome do pai e uma palavra que o define', tipo:'text' },
      { key:'nome_mae', label:'Nome da mãe e uma palavra que a define', tipo:'text' },
    ]
  },
  {
    id: 'infancia', titulo: '🧒 Infância', subtitulo: 'Memórias e sonhos',
    campos: [
      { key:'melhor_amigo_infancia', label:'Melhor amigo na infância — fale sobre ele/ela', tipo:'textarea' },
      { key:'sonho_infancia', label:'O que você sonhava em ser quando era criança?', tipo:'textarea' },
      { key:'algo_para_gritar', label:'Algo que você queria gritar para o mundo ouvir, mas nunca teve coragem', tipo:'textarea' },
    ]
  },
  {
    id: 'gostos', titulo: '🍽️ Gostos', subtitulo: 'Preferências do dia a dia',
    campos: [
      { key:'alimentos_ama', label:'3 alimentos que você mais AMA', tipo:'textarea' },
      { key:'alimentos_detesta', label:'3 alimentos que você DETESTA', tipo:'textarea' },
    ]
  },
  {
    id: 'momentos', titulo: '💫 Momentos Marcantes', subtitulo: 'Experiências que moldaram você',
    campos: [
      { key:'dia_mais_feliz', label:'O dia mais FELIZ da minha vida foi', tipo:'textarea' },
      { key:'dia_esquecer', label:'Um dia que eu gostaria de esquecer', tipo:'textarea' },
    ]
  },
  {
    id: 'sonhos', titulo: '🌈 Sonhos e Valores', subtitulo: 'O que move você',
    campos: [
      { key:'faria_sem_dinheiro', label:'O que você faria para o resto da vida se dinheiro não fosse importante', placeholder:'Não importa que pareça bobo, fútil ou sem sentido — escreva.', tipo:'textarea' },
      { key:'sonho_compravel', label:'Um sonho comprável', tipo:'textarea' },
      { key:'sonho_nao_compravel', label:'Um sonho não comprável', tipo:'textarea' },
    ]
  },
  {
    id: 'autoconhecimento', titulo: '🔍 Autoconhecimento', subtitulo: 'Como você se vê e como os outros te veem',
    campos: [
      { key:'pontos_melhorar', label:'3 coisas que preciso melhorar', tipo:'textarea' },
      { key:'qualidades_outros', label:'3 qualidades que os outros dizem que possuo', tipo:'textarea' },
      { key:'qualidades_proprias', label:'3 qualidades que eu vejo em mim', tipo:'textarea' },
      { key:'pessoas_admiradas', label:'3 pessoas que você admira e por quê', placeholder:'Ex: Maria pela organização e habilidade', tipo:'textarea' },
    ]
  },
  {
    id: 'testes', titulo: '🧠 Perfil Psicológico', subtitulo: 'Resultados dos testes indicados',
    intro: 'Realize os testes nos links abaixo e insira os resultados aqui.',
    links: [
      { label:'Teste de Temperamento', url:'https://www.refletirpararefletir.com.br/testes/qual-o-seu-temperamento' },
      { label:'Linguagem do Amor', url:'https://iaperforma.com.br/linguagem_do_amor/#resultado' },
      { label:'Tipo de Inteligência', url:'https://www.refletirpararefletir.com.br/testes/descubra-o-seu-tipo-de-inteligencia' },
      { label:'Perfil DISC', url:'https://www.mrcoach.com.br/teste-perfil-comportamental-disc.php' },
    ],
    campos: [
      {
        key:'temperamento_primario', label:'Meu temperamento PRIMÁRIO é', tipo:'radio',
        opcoes: ['MELANCÓLICO — Reações Lentas e Impressões Duradouras','COLÉRICO — Reações Rápidas e Impressões Duradouras','SANGUÍNEO — Reações Rápidas e Impressões Superficiais','FLEUMÁTICO — Reações Lentas e Impressões Superficiais']
      },
      {
        key:'temperamento_secundario', label:'Meu temperamento SECUNDÁRIO é', tipo:'radio',
        opcoes: ['MELANCÓLICO','COLÉRICO','SANGUÍNEO','FLEUMÁTICO']
      },
      { key:'sinto_amado', label:'Me sinto amado(a) quando', tipo:'textarea' },
      { key:'linguagem_amor', label:'Minha linguagem de amor é', tipo:'text', placeholder:'Ex: Palavras de afirmação' },
      { key:'perfil_inteligencia', label:'Meu perfil de inteligência (2 primeiras)', tipo:'text', placeholder:'Ex: Linguística, Interpessoal' },
      {
        key:'disc', label:'Meu perfil DISC é', tipo:'radio',
        opcoes: ['DOMINANTE','INFLUENTE','ESTÁVEL','CONFORME']
      },
      { key:'talentos_clifton', label:'Meus talentos inatos — Don Clifton (se tiver)', tipo:'textarea', placeholder:'Cole os resultados do StrengthsFinder aqui' },
    ]
  },
  {
    id: 'profissional', titulo: '💼 Profissional e Legado', subtitulo: 'Onde você está e para onde vai',
    campos: [
      { key:'momento_profissional', label:'Descreva seu momento profissional atual com o máximo de detalhes', tipo:'textarea' },
      { key:'como_ser_lembrado', label:'Como desejo ser lembrado(a) quando não estiver mais aqui', tipo:'textarea' },
    ]
  },
]

const INPUT = { width:'100%', border:'1.5px solid rgba(255,255,255,.25)', borderRadius:12, padding:'11px 14px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit', resize:'vertical', lineHeight:1.6, background:'rgba(255,255,255,.1)', color:'#fff', transition:'border .2s' }

export default function FormMapeamento() {
  const [etapa, setEtapa] = useState(0)
  const [form, setForm] = useState({})
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [pacienteId, setPacienteId] = useState(null)
  const [nomePaciente, setNomePaciente] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pid = params.get('pid')
    if (pid) setPacienteId(pid)
  }, [])

  const sec = SECOES[etapa]
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const total = SECOES.length
  const pct = Math.round(((etapa) / total) * 100)

  const proximaEtapa = () => { if (etapa < SECOES.length - 1) setEtapa(e => e+1); else enviar() }
  const etapaAnterior = () => setEtapa(e => e-1)

  const preenchidaEtapa = () => sec.campos.filter(c => form[c.key]).length

  const enviar = async () => {
    setEnviando(true)
    const payload = { ...form, status: pacienteId ? 'vinculado' : 'pendente' }
    if (pacienteId) payload.paciente_id = pacienteId
    if (!DEMO_MODE) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/mapeamentos`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
          body: JSON.stringify(payload)
        })
      } catch {}
    } else {
      await new Promise(r => setTimeout(r, 900))
    }
    setEnviando(false)
    setEnviado(true)
  }

  if (enviado) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0f2a1e 0%,#1b4d3a 50%,#0f1a14 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ textAlign:'center', color:'#fff', maxWidth:400 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(58,145,117,.3)', border:'3px solid #3a9175', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
          <Check size={36} color="#5dae92"/>
        </div>
        <h1 style={{ fontSize:24, fontWeight:800, marginBottom:12 }}>Mapeamento enviado!</h1>
        <p style={{ fontSize:15, color:'rgba(255,255,255,.7)', lineHeight:1.7, marginBottom:8 }}>
          Obrigado por compartilhar tanto de você.<br/>
          Suas respostas chegaram com segurança.
        </p>
        <p style={{ fontSize:13, color:'rgba(255,255,255,.4)', marginTop:20 }}>
          Praxis — Gestão Clínica
        </p>
        {DEMO_MODE && <p style={{ fontSize:10, color:'rgba(255,255,255,.25)', marginTop:12 }}>Modo demonstração — dados não salvos</p>}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0f2a1e 0%,#1b4d3a 50%,#0f1a14 100%)' }}>

      {/* Header fixo */}
      <div style={{ position:'sticky', top:0, zIndex:10, background:'rgba(15,26,20,.9)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,.07)', padding:'12px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, maxWidth:560, margin:'0 auto' }}>
          <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,#3a9175,#1b3d33)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Heart size={13} color="#fff"/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.6)' }}>Etapa {etapa+1} de {total}</span>
              <span style={{ fontSize:11, color:'#5dae92' }}>{pct}%</span>
            </div>
            <div style={{ background:'rgba(255,255,255,.1)', borderRadius:99, height:4 }}>
              <div style={{ height:'100%', borderRadius:99, width:`${pct}%`, background:'linear-gradient(90deg,#3a9175,#5dae92)', transition:'width .4s' }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth:560, margin:'0 auto', padding:'32px 20px 120px' }}>

        {/* Intro — só na etapa 0 */}
        {etapa === 0 && (
          <div style={{ marginBottom:32, textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:18, background:'rgba(58,145,117,.2)', border:'1px solid rgba(58,145,117,.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Heart size={24} color="#5dae92"/>
            </div>
            <h1 style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:10 }}>Mapeamento Pessoal</h1>
            <p style={{ fontSize:14, color:'rgba(255,255,255,.65)', lineHeight:1.7 }}>
              Essa é uma das ferramentas da Neuropsicoterapia que proporciona um autoconhecimento incrível — seu "manual de instruções". Com o Mapeamento você saberá exatamente como você funciona, suas ações e reações.
            </p>
            <p style={{ fontSize:13, color:'rgba(255,255,255,.45)', marginTop:12 }}>Se prepare para se conhecer de verdade! 🌱</p>
            {pacienteId && (
              <div style={{ marginTop:16, padding:'10px 16px', borderRadius:12, background:'rgba(58,145,117,.15)', border:'1px solid rgba(58,145,117,.3)' }}>
                <p style={{ fontSize:12, color:'#5dae92' }}>✓ Suas respostas serão enviadas diretamente para sua terapeuta.</p>
              </div>
            )}
          </div>
        )}

        {/* Seção atual */}
        <div style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, padding:'22px 20px', marginBottom:20 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:4 }}>{sec.titulo}</h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginBottom: sec.intro?12:20 }}>{sec.subtitulo}</p>

          {sec.intro && (
            <p style={{ fontSize:13, color:'rgba(255,255,255,.6)', marginBottom:16, lineHeight:1.6 }}>{sec.intro}</p>
          )}

          {sec.links && (
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
              {sec.links.map(l => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" style={{
                  display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12,
                  background:'rgba(58,145,117,.15)', border:'1px solid rgba(58,145,117,.3)',
                  color:'#5dae92', textDecoration:'none', fontSize:13, fontWeight:500
                }}>
                  <ArrowRight size={13}/>
                  {l.label}
                </a>
              ))}
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {sec.campos.map(campo => (
              <div key={campo.key}>
                <label style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.75)', display:'block', marginBottom:7 }}>
                  {campo.label}
                  {campo.obrigatorio && <span style={{ color:'#f87171', marginLeft:3 }}>*</span>}
                </label>
                {campo.tipo === 'textarea' && (
                  <textarea rows={3} placeholder={campo.placeholder||'Escreva aqui...'} value={form[campo.key]||''} onChange={e=>set(campo.key,e.target.value)} style={INPUT}
                    onFocus={e=>e.target.style.borderColor='rgba(93,174,146,.7)'}
                    onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.25)'}/>
                )}
                {(campo.tipo==='text'||campo.tipo==='email') && (
                  <input type={campo.tipo} placeholder={campo.placeholder||'Sua resposta...'} value={form[campo.key]||''} onChange={e=>set(campo.key,e.target.value)} style={{...INPUT, resize:undefined}}
                    onFocus={e=>e.target.style.borderColor='rgba(93,174,146,.7)'}
                    onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.25)'}/>
                )}
                {campo.tipo === 'radio' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {campo.opcoes.map(op => {
                      const val = op.split('—')[0].trim()
                      const ativo = form[campo.key] === val
                      return (
                        <button key={op} onClick={()=>set(campo.key,val)} style={{
                          display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:12,
                          border:`1.5px solid ${ativo?'#3a9175':'rgba(255,255,255,.15)'}`,
                          background: ativo?'rgba(58,145,117,.2)':'rgba(255,255,255,.05)',
                          textAlign:'left', cursor:'pointer', transition:'all .15s'
                        }}>
                          <div style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${ativo?'#5dae92':'rgba(255,255,255,.3)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:ativo?'#3a9175':'transparent' }}>
                            {ativo && <Check size={10} color="#fff"/>}
                          </div>
                          <span style={{ fontSize:13, color:ativo?'#b8e8d8':'rgba(255,255,255,.7)', fontWeight:ativo?600:400 }}>{op}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {preenchidaEtapa() > 0 && (
            <p style={{ fontSize:11, color:'rgba(93,174,146,.7)', marginTop:14, textAlign:'right' }}>
              ✓ {preenchidaEtapa()} de {sec.campos.length} respondidas
            </p>
          )}
        </div>
      </div>

      {/* Botões fixos no rodapé */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(15,26,20,.95)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,255,255,.07)', padding:'14px 20px' }}>
        <div style={{ display:'flex', gap:10, maxWidth:560, margin:'0 auto' }}>
          {etapa > 0 && (
            <button onClick={etapaAnterior} style={{ flex:'0 0 auto', padding:'13px 18px', borderRadius:14, border:'1.5px solid rgba(255,255,255,.15)', background:'transparent', color:'rgba(255,255,255,.7)', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <ArrowLeft size={14}/> Voltar
            </button>
          )}
          <button onClick={proximaEtapa} disabled={enviando} style={{ flex:1, padding:'14px', borderRadius:14, border:'none', background: enviando?'#3a9175':'linear-gradient(135deg,#3a9175,#1b5c42)', color:'#fff', fontSize:14, fontWeight:700, cursor: enviando?'wait':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {enviando ? 'Enviando...' : etapa < SECOES.length-1 ? <><span>Próximo</span><ArrowRight size={15}/></> : <><Check size={15}/><span>Enviar Mapeamento</span></>}
          </button>
        </div>
      </div>
    </div>
  )
}
