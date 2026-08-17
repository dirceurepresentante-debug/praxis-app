import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react'

const SECOES = [
  {
    id: 'apresentacao', titulo: '🌟 Apresentação',
    campos: [
      { key:'apresentacao', label:'Se apresente para mim', placeholder:'Eu sou a ........, tenho ..... anos, sou mãe, esposa, ...', tipo:'textarea' },
      { key:'cor_favorita', label:'Cor favorita e por quê?', tipo:'textarea' },
      { key:'musica_favorita', label:'Música favorita e por quê?', tipo:'textarea' },
      { key:'frase_vida', label:'Uma frase que você leva para a vida', tipo:'textarea' },
    ]
  },
  {
    id: 'familia', titulo: '👨‍👩‍👧 Família',
    campos: [
      { key:'nome_pai', label:'Nome do pai e uma palavra que o define', tipo:'text' },
      { key:'nome_mae', label:'Nome da mãe e uma palavra que a define', tipo:'text' },
    ]
  },
  {
    id: 'infancia', titulo: '🧒 Infância e Memórias',
    campos: [
      { key:'melhor_amigo_infancia', label:'Melhor amigo na infância — fale sobre ele/ela', tipo:'textarea' },
      { key:'sonho_infancia', label:'O que você sonhava em ser quando era criança?', tipo:'textarea' },
      { key:'algo_para_gritar', label:'Algo que você queria gritar para o mundo ouvir mas nunca teve coragem', tipo:'textarea' },
    ]
  },
  {
    id: 'gostos', titulo: '🍽️ Gostos e Preferências',
    campos: [
      { key:'alimentos_ama', label:'3 alimentos que você mais AMA', tipo:'textarea' },
      { key:'alimentos_detesta', label:'3 alimentos que você DETESTA', tipo:'textarea' },
    ]
  },
  {
    id: 'momentos', titulo: '💫 Momentos Marcantes',
    campos: [
      { key:'dia_mais_feliz', label:'O dia mais FELIZ da minha vida foi', tipo:'textarea' },
      { key:'dia_esquecer', label:'Um dia que eu gostaria de esquecer', tipo:'textarea' },
    ]
  },
  {
    id: 'sonhos', titulo: '🌈 Sonhos e Valores',
    campos: [
      { key:'faria_sem_dinheiro', label:'O que você faria para o resto da vida se dinheiro não fosse importante', placeholder:'não importa que pareça bobo, fútil ou sem sentido, escreva', tipo:'textarea' },
      { key:'sonho_compravel', label:'Um sonho comprável', tipo:'textarea' },
      { key:'sonho_nao_compravel', label:'Um sonho não comprável', tipo:'textarea' },
    ]
  },
  {
    id: 'autoconhecimento', titulo: '🔍 Autoconhecimento',
    campos: [
      { key:'pontos_melhorar', label:'3 coisas que preciso melhorar', tipo:'textarea' },
      { key:'qualidades_outros', label:'3 qualidades que os outros dizem que possuo', tipo:'textarea' },
      { key:'qualidades_proprias', label:'3 qualidades que eu vejo em mim', tipo:'textarea' },
      { key:'pessoas_admiradas', label:'3 pessoas que você admira e por quê', placeholder:'Ex: Maria pela organização e habilidade', tipo:'textarea' },
    ]
  },
  {
    id: 'testes', titulo: '🧠 Perfil Psicológico',
    campos: [
      {
        key:'temperamento_primario', label:'Temperamento Primário', tipo:'radio',
        opcoes: ['MELANCÓLICO — Reações Lentas e Impressões Duradouras','COLÉRICO — Reações Rápidas e Impressões Duradouras','SANGUÍNEO — Reações Rápidas e Impressões Superficiais','FLEUMÁTICO — Reações Lentas e Impressões Superficiais']
      },
      {
        key:'temperamento_secundario', label:'Temperamento Secundário', tipo:'radio',
        opcoes: ['MELANCÓLICO','COLÉRICO','SANGUÍNEO','FLEUMÁTICO']
      },
      { key:'linguagem_amor', label:'Linguagem de Amor (resultado do teste)', tipo:'text', placeholder:'Ex: Palavras de afirmação' },
      { key:'sinto_amado', label:'Me sinto amado(a) quando', tipo:'textarea' },
      { key:'perfil_inteligencia', label:'Perfil de Inteligência (2 primeiras)', tipo:'text', placeholder:'Ex: Linguística, Interpessoal' },
      {
        key:'disc', label:'Perfil DISC', tipo:'radio',
        opcoes: ['DOMINANTE','INFLUENTE','ESTÁVEL','CONFORME']
      },
      { key:'talentos_clifton', label:'Talentos inatos — Don Clifton (se tiver)', tipo:'textarea', placeholder:'Cole os talentos do teste StrengthsFinder' },
    ]
  },
  {
    id: 'profissional', titulo: '💼 Profissional e Legado',
    campos: [
      { key:'momento_profissional', label:'Descreva seu momento profissional atual com o máximo de detalhes', tipo:'textarea' },
      { key:'como_ser_lembrado', label:'Como desejo ser lembrado(a) quando não estiver mais aqui', tipo:'textarea' },
    ]
  },
]

const INPUT_STYLE = { width:'100%', border:'1px solid #d1f0e4', borderRadius:10, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit', resize:'vertical', lineHeight:1.5 }

export default function ModalMapeamento({ mapeamento, onSave, onClose }) {
  const inicial = mapeamento || {}
  const [form, setForm] = useState(inicial)
  const [abertas, setAbertas] = useState({ apresentacao:true })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const toggle = (id) => setAbertas(a => ({ ...a, [id]: !a[id] }))

  const preenchido = (secao) => secao.campos.some(c => form[c.key])
  const total = SECOES.reduce((s,sec) => s + sec.campos.length, 0)
  const respondidas = SECOES.reduce((s,sec) => s + sec.campos.filter(c => form[c.key]).length, 0)
  const pct = Math.round((respondidas / total) * 100)

  return (
    <div style={{ position:'fixed', inset:0, zIndex:70, display:'flex', alignItems:'flex-end', justifyContent:'center' }} className="md:items-center md:p-4">
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.5)', backdropFilter:'blur(4px)' }} onClick={onClose}/>
      <div style={{ position:'relative', background:'#fff', width:'100%', maxWidth:580, borderRadius:'20px 20px 0 0', maxHeight:'93vh', display:'flex', flexDirection:'column' }} className="md:rounded-2xl">

        {/* Header */}
        <div style={{ padding:'18px 22px', borderBottom:'1px solid #f0f5f2', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:'#0f1a14' }}>Mapeamento Pessoal</h2>
              <p style={{ fontSize:11, color:'#6b9e8a', marginTop:2 }}>Neuropsicoterapia · {respondidas}/{total} perguntas respondidas</p>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:4 }}><X size={16}/></button>
          </div>
          {/* Barra de progresso */}
          <div style={{ background:'#e8f0ec', borderRadius:99, height:5 }}>
            <div style={{ height:'100%', borderRadius:99, width:`${pct}%`, background:'linear-gradient(90deg,#3a9175,#5dae92)', transition:'width .3s' }}/>
          </div>
          <p style={{ fontSize:10, color:'#a0c8b8', marginTop:4 }}>{pct}% preenchido</p>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 0' }}>
          {SECOES.map(sec => (
            <div key={sec.id} style={{ borderBottom:'1px solid #f8fdfb' }}>
              <button onClick={() => toggle(sec.id)} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                width:'100%', padding:'12px 22px', background:'none', border:'none',
                cursor:'pointer', textAlign:'left'
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'#0f1a14' }}>{sec.titulo}</span>
                  {preenchido(sec) && <span style={{ width:8, height:8, borderRadius:'50%', background:'#3a9175', display:'block' }}/>}
                </div>
                {abertas[sec.id] ? <ChevronUp size={14} color="#a0c8b8"/> : <ChevronDown size={14} color="#a0c8b8"/>}
              </button>

              {abertas[sec.id] && (
                <div style={{ padding:'4px 22px 16px', display:'flex', flexDirection:'column', gap:14 }}>
                  {sec.campos.map(campo => (
                    <div key={campo.key}>
                      <label style={{ fontSize:11, fontWeight:600, color:'#3a9175', display:'block', marginBottom:5 }}>{campo.label}</label>
                      {campo.tipo === 'textarea' && (
                        <textarea rows={3} placeholder={campo.placeholder||'Sua resposta...'} value={form[campo.key]||''} onChange={e=>set(campo.key, e.target.value)} style={INPUT_STYLE}/>
                      )}
                      {campo.tipo === 'text' && (
                        <input placeholder={campo.placeholder||'Sua resposta...'} value={form[campo.key]||''} onChange={e=>set(campo.key, e.target.value)} style={{...INPUT_STYLE, resize:undefined}}/>
                      )}
                      {campo.tipo === 'radio' && (
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                          {campo.opcoes.map(op => {
                            const val = op.split('—')[0].split(' ')[0].trim()
                            const ativo = form[campo.key] === val
                            return (
                              <button key={op} onClick={() => set(campo.key, val)} style={{
                                display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, border:'none',
                                textAlign:'left', cursor:'pointer', transition:'all .15s',
                                background: ativo?'#e1f5ee':'#f8fdfb',
                                outline: ativo?'2px solid #3a9175':'2px solid transparent'
                              }}>
                                <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${ativo?'#3a9175':'#c0d8ce'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: ativo?'#3a9175':'transparent' }}>
                                  {ativo && <Check size={9} color="#fff"/>}
                                </div>
                                <span style={{ fontSize:12, color: ativo?'#0f6e56':'#374151', fontWeight: ativo?600:400 }}>{op}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding:'14px 22px', borderTop:'1px solid #f0f5f2', flexShrink:0 }}>
          <button onClick={() => onSave(form)} style={{ width:'100%', padding:'13px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#3a9175,#1b5c42)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <Check size={15}/> Salvar Mapeamento
          </button>
        </div>
      </div>
    </div>
  )
}
