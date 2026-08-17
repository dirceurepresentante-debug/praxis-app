import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isWithinInterval, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'

const COLORS = ['#3a9175', '#5dae92', '#8ecbb3', '#245d4c', '#1b3d33']

export default function Relatorios() {
  const { data } = useApp()
  const [mes, setMes] = useState(new Date())

  const inicio = startOfMonth(mes)
  const fim = endOfMonth(mes)

  const agendamentos = (data.agendamentos || []).filter(a => {
    try { return isWithinInterval(parseISO(a.data), { start: inicio, end: fim }) } catch { return false }
  })

  const pacientes = data.pacientes || []
  const convenios = data.convenios || []
  const tipos = data.tipos_atendimento || []

  // Métricas
  const totalSessoes = agendamentos.filter(a => a.status === 'realizado').length
  const totalFaltas = agendamentos.filter(a => a.status === 'faltou').length
  const totalCancelados = agendamentos.filter(a => a.status === 'cancelado').length
  const recebido = agendamentos.filter(a => a.pago).reduce((s, a) => s + (a.valor || 0), 0)
  const aReceber = agendamentos.filter(a => !a.pago && a.status !== 'cancelado').reduce((s, a) => s + (a.valor || 0), 0)
  const totalPrevisto = recebido + aReceber
  const taxaPresenca = agendamentos.length > 0 ? Math.round((totalSessoes / agendamentos.length) * 100) : 0

  // Por convênio
  const porConvenio = convenios.map(c => {
    const count = agendamentos.filter(a => {
      const pac = pacientes.find(p => p.id === a.paciente_id)
      return pac?.convenio_id === c.id && a.status === 'realizado'
    }).length
    return { nome: c.nome, sessoes: count }
  }).filter(c => c.sessoes > 0)

  // Por tipo
  const porTipo = tipos.map(t => {
    const count = agendamentos.filter(a => a.tipo_id === t.id && a.status === 'realizado').length
    return { nome: t.nome, sessoes: count, cor: t.cor }
  }).filter(t => t.sessoes > 0)

  // Receita por dia
  const diasMes = eachDayOfInterval({ start: inicio, end: fim })
  const receitaDia = diasMes.slice(0, 20).map(d => {
    const str = format(d, 'yyyy-MM-dd')
    const valor = agendamentos.filter(a => a.data === str && a.pago).reduce((s, a) => s + (a.valor || 0), 0)
    return { dia: format(d, 'dd'), valor }
  })

  // Pacientes com mais faltas
  const faltasPorPaciente = pacientes.map(p => ({
    nome: p.nome?.split(' ')[0],
    faltas: agendamentos.filter(a => a.paciente_id === p.id && a.status === 'faltou').length
  })).filter(p => p.faltas > 0).sort((a, b) => b.faltas - a.faltas).slice(0, 5)

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Relatórios</h1>
          <p className="text-sm text-gray-500 mt-0.5 capitalize">
            {format(mes, 'MMMM \'de\' yyyy', { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMes(subMonths(mes, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={16} /></button>
          <button onClick={() => setMes(new Date())} className="px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg">Hoje</button>
          <button onClick={() => setMes(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Sessões realizadas', value: totalSessoes, icon: Calendar, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Receita recebida', value: `R$ ${recebido.toFixed(0)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'A receber', value: `R$ ${aReceber.toFixed(0)}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Taxa de presença', value: `${taxaPresenca}%`, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Gráfico receita por dia */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Receita por dia</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={receitaDia} barSize={12}>
              <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => [`R$ ${v}`, 'Receita']} />
              <Bar dataKey="valor" fill="#3a9175" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Por convênio */}
        {porConvenio.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Sessões por convênio</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={porConvenio} dataKey="sessoes" nameKey="nome" cx="50%" cy="50%" outerRadius={60} label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {porConvenio.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Status summary */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Resumo do mês</h3>
          <div className="space-y-3">
            {[
              { label: 'Realizadas', value: totalSessoes, color: 'bg-green-500' },
              { label: 'Faltas', value: totalFaltas, color: 'bg-red-400' },
              { label: 'Canceladas', value: totalCancelados, color: 'bg-gray-300' },
              { label: 'Total agendado', value: agendamentos.length, color: 'bg-brand-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                <p className="flex-1 text-sm text-gray-600">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex justify-between">
              <p className="text-sm text-gray-500">Previsão total</p>
              <p className="text-sm font-bold text-gray-900">R$ {totalPrevisto.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Faltas por paciente */}
      {faltasPorPaciente.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">⚠️ Pacientes com mais faltas no mês</h3>
          <div className="space-y-2">
            {faltasPorPaciente.map(p => (
              <div key={p.nome} className="flex items-center gap-3">
                <p className="flex-1 text-sm text-gray-700">{p.nome}</p>
                <div className="flex gap-1">
                  {Array(p.faltas).fill(0).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-red-400" />
                  ))}
                </div>
                <p className="text-sm font-medium text-red-500 w-8 text-right">{p.faltas}x</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {agendamentos.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum agendamento neste período.</p>
        </div>
      )}
    </div>
  )
}
