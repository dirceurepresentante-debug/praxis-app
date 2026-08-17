import { useState } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'

export default function ModalProntuario({ prontuario, onSave, onClose }) {
  const [form, setForm] = useState({
    data: prontuario?.data || format(new Date(), 'yyyy-MM-dd'),
    humor: prontuario?.humor || 3,
    anotacoes: prontuario?.anotacoes || '',
    plano: prontuario?.plano || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const humorLabels = ['', 'Muito mal', 'Mal', 'Regular', 'Bem', 'Muito bem']

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Anotação de Sessão</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Data da sessão</label>
              <input type="date" value={form.data} onChange={e => set('data', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Humor do paciente — <span className="text-brand-600">{humorLabels[form.humor]}</span>
              </label>
              <div className="flex items-center gap-2 pt-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => set('humor', n)}
                    className={`w-8 h-8 rounded-full text-xs font-semibold border-2 transition-all ${form.humor === n ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-200 text-gray-400 hover:border-brand-300'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Anotações da sessão *</label>
            <textarea value={form.anotacoes} onChange={e => set('anotacoes', e.target.value)} rows={5}
              placeholder="Relato do paciente, temas abordados, observações clínicas..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Plano / próxima sessão</label>
            <textarea value={form.plano} onChange={e => set('plano', e.target.value)} rows={2}
              placeholder="O que trabalhar na próxima sessão, tarefas para o paciente..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={() => onSave(prontuario ? { ...prontuario, ...form } : form)}
            className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors">
            Salvar Anotação
          </button>
        </div>
      </div>
    </div>
  )
}
