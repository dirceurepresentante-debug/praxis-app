import { createContext, useContext, useState, useEffect } from 'react'
import { demoData, DEMO_MODE } from '../lib/demo'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

const EMPTY_DATA = {
  profissionais: [], convenios: [], tipos_atendimento: [], pacientes: [],
  agendamentos: [], prontuarios: [], pre_cadastros: [], tcles: [],
  escalas: [], metas: [], altas: [], lista_espera: [], mapeamentos: [],
  despesas: [], anamneses: []
}

// Tabelas que exigem profissional_id no insert
const PROF_TABLES = ['pacientes','agendamentos','convenios','tipos_atendimento',
  'lista_espera','despesas','pre_cadastros']

export function AppProvider({ children }) {
  const [user, setUser] = useState(DEMO_MODE ? { nome: 'Demo', email: 'demo@praxis.app', role: 'admin' } : null)
  const [profissional, setProfissional] = useState(DEMO_MODE ? demoData.profissionais[0] : null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [needsPayment, setNeedsPayment] = useState(false)
  const [data, setData] = useState(DEMO_MODE ? demoData : EMPTY_DATA)
  const [loading, setLoading] = useState(!DEMO_MODE)

  useEffect(() => {
    if (DEMO_MODE || !supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) handleSession(session)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) handleSession(session)
      else { setUser(null); setProfissional(null); setNeedsPayment(false); setData(EMPTY_DATA); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSession = async (session) => {
    setLoading(true)
    const { data: prof } = await supabase
      .from('profissionais').select('*').eq('user_id', session.user.id).maybeSingle()

    setUser({ nome: prof?.nome || session.user.email, email: session.user.email, role: 'admin' })

    if (prof) {
      setProfissional(prof)
      setNeedsOnboarding(false)
      const bloqueado = prof.status === 'pendente' || prof.status === 'inadimplente' || prof.status === 'cancelado'
      setNeedsPayment(bloqueado)
      if (!bloqueado) await fetchAll()
      else setLoading(false)
    } else {
      setNeedsOnboarding(true)
      setLoading(false)
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const tables = ['profissionais','convenios','tipos_atendimento','pacientes','agendamentos',
        'prontuarios','pre_cadastros','tcles','escalas','metas','altas','lista_espera',
        'mapeamentos','despesas','anamneses']
      const results = await Promise.all(tables.map(t => supabase.from(t).select('*')))
      const newData = {}
      tables.forEach((t, i) => { newData[t] = results[i].data || [] })
      setData(newData)
    } finally {
      setLoading(false)
    }
  }

  const completeOnboarding = async (formData) => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const id = crypto.randomUUID()
    const { data: prof, error } = await supabase.from('profissionais')
      .insert({ id, user_id: authUser.id, ...formData }).select().single()
    if (error) throw error
    setProfissional(prof)
    setUser(prev => ({ ...prev, nome: prof.nome }))
    setNeedsOnboarding(false)
    // Seed convenios e tipos padrão
    const profId = prof.id
    await supabase.from('convenios').insert([
      { id: crypto.randomUUID(), nome: 'Particular', profissional_id: profId, ativo: true },
    ])
    await supabase.from('tipos_atendimento').insert([
      { id: crypto.randomUUID(), nome: 'Consulta Inicial', cor: '#3a9175', profissional_id: profId, ativo: true },
      { id: crypto.randomUUID(), nome: 'Sessão', cor: '#5dae92', profissional_id: profId, ativo: true },
      { id: crypto.randomUUID(), nome: 'Retorno', cor: '#8ecbb3', profissional_id: profId, ativo: true },
    ])
    await fetchAll()
  }

  const iniciarCheckout = async () => {
    if (DEMO_MODE || !supabase) return null
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const prof = profissional || (await supabase.from('profissionais').select('*').eq('user_id', authUser.id).maybeSingle()).data
    const { data, error } = await supabase.functions.invoke('criar-assinatura', {
      body: { profissional_id: prof.id, nome: prof.nome, email: authUser.email }
    })
    if (error) throw error
    return data?.checkout_url || null
  }

  const login = async (email, senha) => {
    if (DEMO_MODE) {
      if (email && senha) { setUser({ nome: 'Demo', email, role: 'admin' }); return true }
      return false
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    return !error
  }

  const logout = async () => {
    if (!DEMO_MODE && supabase) await supabase.auth.signOut()
    setUser(null); setProfissional(null)
  }

  const addItem = (entity, item) => {
    const id = typeof crypto !== 'undefined' ? crypto.randomUUID() : Date.now().toString()
    const newItem = { id, ...item }
    if (!DEMO_MODE && profissional && PROF_TABLES.includes(entity) && !newItem.profissional_id) {
      newItem.profissional_id = profissional.id
    }
    setData(prev => ({ ...prev, [entity]: [...(prev[entity] || []), newItem] }))
    if (!DEMO_MODE && supabase) {
      supabase.from(entity).insert(newItem).then(({ error }) => {
        if (error) console.error(`[supabase] insert ${entity}:`, error.message)
      })
    }
    return newItem
  }

  const editItem = (entity, id, changes) => {
    setData(prev => ({
      ...prev,
      [entity]: (prev[entity] || []).map(i => i.id === id ? { ...i, ...changes } : i)
    }))
    if (!DEMO_MODE && supabase) {
      supabase.from(entity).update(changes).eq('id', id).then(({ error }) => {
        if (error) console.error(`[supabase] update ${entity}:`, error.message)
      })
    }
  }

  const removeItem = (entity, id) => {
    setData(prev => ({ ...prev, [entity]: (prev[entity] || []).filter(i => i.id !== id) }))
    if (!DEMO_MODE && supabase) {
      supabase.from(entity).delete().eq('id', id).then(({ error }) => {
        if (error) console.error(`[supabase] delete ${entity}:`, error.message)
      })
    }
  }

  const pendentesCount = (data.pre_cadastros || []).filter(p => p.status === 'pendente').length

  return (
    <AppContext.Provider value={{
      user, profissional, needsOnboarding, needsPayment, completeOnboarding, iniciarCheckout,
      login, logout, data, addItem, editItem, removeItem,
      loading, DEMO_MODE, pendentesCount
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
