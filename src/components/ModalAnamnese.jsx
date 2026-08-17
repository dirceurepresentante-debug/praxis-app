import { useState } from 'react'
import { X } from 'lucide-react'
import { format } from 'date-fns'

export default function ModalAnamnese({ anamnese, onSave, onClose }) {
  const [form, setForm] = useState({
    data: anamnese?.data || format(new Date(), 'yyyy-MM-dd'),
    queixa_principal: anamnese?.queixa_principal || '',
    historico: anamnese?.historico || '',
    medicamentos: anamnese?.medicamentos || '',
    alergias: anamnese?.alergias || '',
    historico_familiar: anamnese?.historico_familiar || '',
    objetivos: anamnese?.objetivos || '',
    observacoes: anamnese?.observacoes || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const campos = [
    { key: 'queixa_principal', label: 'Queixa Principal *', placeholder: 'Por que procurou terapia?', rows: 3 },
    { key: 'historico', label: 'Histórico de Saúde Mental', placeholder: 'Tratamentos anteriores, diagnósticos, internações...', rows: 3 },
    { key: 'medicamentos', label: 'Medicamentos em uso', placeholder: 'Medicamentos, dosagens...', rows: 2 },
    { key: 'alergias', label: 'Alergias', placeholder: 'Alergias conhecidas...', rows: 1 },
    { key: 'historico_familiar', label: 'Histórico Familiar', placeholder: 'Histórico de saúde mental na família...', rows: 2 },
    { key: 'objetivos', label: 'Objetivos da Terapia', placeholder: 'O que espera alcançar com o tratamento?', rows: 3 },
    { key: 'observacoes', label: 'Observações adicionais', placeholder: 'Outras informações relevantes...', rows: 2 },
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-900">Ficha de Anamnese</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Data da anamnese</label>
            <input type="date" value={form.data} onChange={e => set('data', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
          </div>
          {campos.map(({ key, label, placeholder, rows }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
              <textarea value={form[key]} onChange={e => set(key, e.target.value)} rows={rows} placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={() => onSave(anamnese ? { ...anamnese, ...form } : form)}
            className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors">
            Salvar Anamnese
          </button>
        </div>
      </div>
    </div>
  )
}
