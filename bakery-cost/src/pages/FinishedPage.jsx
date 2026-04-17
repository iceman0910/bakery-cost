// src/pages/FinishedPage.jsx
import React, { useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { calcFinishedCost, grossMargin, suggestedPrice } from '../lib/calc'
import { SearchBar, EmptyState, LoadingSpinner, Tag, ConfirmDelete } from '../components/UI'

const emptyForm = { name: '', salePrice: '', quantity: '1', targetMargin: '60' }

export default function FinishedPage() {
  const { data: rawList } = useCollection('rawIngredients')
  const { data: prepList } = useCollection('prepItems')
  const { data: finList, loading, add, update, remove } = useCollection('finishedProducts')

  const [form, setForm] = useState(emptyForm)
  const [ingredients, setIngredients] = useState([])
  const [rawSel, setRawSel] = useState('')
  const [rawAmt, setRawAmt] = useState('')
  const [prepSel, setPrepSel] = useState('')
  const [prepAmt, setPrepAmt] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = '請輸入成品名稱'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const addRawIng = () => {
    if (!rawSel || !rawAmt || Number(rawAmt) <= 0) return
    if (ingredients.find(i => i.type === 'raw' && i.refId === rawSel)) return
    const raw = rawList.find(r => r.id === rawSel)
    setIngredients(prev => [...prev, { type: 'raw', refId: rawSel, name: raw?.name, amount: Number(rawAmt) }])
    setRawAmt('')
  }

  const addPrepIng = () => {
    if (!prepSel || !prepAmt || Number(prepAmt) <= 0) return
    if (ingredients.find(i => i.type === 'prep' && i.refId === prepSel)) return
    const prep = prepList.find(p => p.id === prepSel)
    setIngredients(prev => [...prev, { type: 'prep', refId: prepSel, name: prep?.name, amount: Number(prepAmt) }])
    setPrepAmt('')
  }

  const removeIng = (idx) => setIngredients(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      salePrice: Number(form.salePrice) || 0,
      quantity: Number(form.quantity) || 1,
      targetMargin: Number(form.targetMargin) || 60,
      ingredients
    }
    if (editing) {
      await update(editing, payload)
      setEditing(null)
    } else {
      await add(payload)
    }
    setForm(emptyForm)
    setIngredients([])
    setErrors({})
    setSaving(false)
  }

  const startEdit = (fin) => {
    setEditing(fin.id)
    setForm({
      name: fin.name,
      salePrice: String(fin.salePrice || ''),
      quantity: String(fin.quantity || 1),
      targetMargin: String(fin.targetMargin || 60)
    })
    setIngredients(fin.ingredients || [])
  }

  const cancelEdit = () => { setEditing(null); setForm(emptyForm); setIngredients([]); setErrors({}) }

  const filtered = finList.filter(f => f.name?.includes(search))

  const previewCost = calcFinishedCost({ ingredients }, rawList, prepList) * (Number(form.quantity) || 1)
  const previewMargin = form.salePrice ? grossMargin(Number(form.salePrice), previewCost) : null
  const previewSuggested = suggestedPrice(previewCost, Number(form.targetMargin) || 60)

  return (
    <div className="page">
      <div className="page-header">
        <h2>成品成本</h2>
        <p className="page-desc">組合原料與備料，計算成品成本與毛利率</p>
      </div>

      <div className="form-card">
        <div className="form-title">{editing ? '✏️ 編輯成品' : '＋ 新增成品'}</div>
        <div className="form-grid finished-info-grid">
          <div className={`field ${errors.name ? 'has-error' : ''}`}>
            <label>成品名稱</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例：鮮奶吐司" />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>
          <div className="field">
            <label>預計售價 (NT$)</label>
            <input type="number" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} placeholder="120" min="0" />
          </div>
          <div className="field">
            <label>製作數量</label>
            <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="1" min="1" />
          </div>
          <div className="field">
            <label>目標毛利率 (%)</label>
            <input type="number" value={form.targetMargin} onChange={e => setForm(f => ({ ...f, targetMargin: e.target.value }))} placeholder="60" min="0" max="100" />
          </div>
        </div>

        <div className="ing-section-grid">
          <div>
            <div className="form-section-title">加入原料</div>
            <div className="ing-add-row">
              <select value={rawSel} onChange={e => setRawSel(e.target.value)}>
                <option value="">選擇原料</option>
                {rawList.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <input type="number" value={rawAmt} onChange={e => setRawAmt(e.target.value)} placeholder="用量(g / 個)" min="0" />
              <button className="btn-secondary" onClick={addRawIng}>加入</button>
            </div>
          </div>
          <div>
            <div className="form-section-title">加入備料</div>
            <div className="ing-add-row">
              <select value={prepSel} onChange={e => setPrepSel(e.target.value)}>
                <option value="">選擇備料</option>
                {prepList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" value={prepAmt} onChange={e => setPrepAmt(e.target.value)} placeholder="用量(g)" min="0" />
              <button className="btn-secondary" onClick={addPrepIng}>加入</button>
            </div>
          </div>
        </div>

        {ingredients.length > 0 && (
          <div className="tags-row">
            {ingredients.map((ing, i) => (
              <Tag
                key={i}
                label={`${ing.type === 'prep' ? '[備料] ' : ''}${ing.name} ${ing.amount}g`}
                onRemove={() => removeIng(i)}
              />
            ))}
          </div>
        )}

        {/* 即時成本預覽 */}
        {ingredients.length > 0 && (
          <div className="cost-preview-row">
            <div className="cost-preview-item">
              <span>食材成本</span>
              <strong>NT$ {previewCost.toFixed(1)}</strong>
            </div>
            {previewMargin !== null && (
              <div className={`cost-preview-item ${previewMargin >= Number(form.targetMargin) ? 'preview-good' : 'preview-bad'}`}>
                <span>毛利率</span>
                <strong>{previewMargin.toFixed(1)}%</strong>
              </div>
            )}
            {previewSuggested !== null && (
              <div className="cost-preview-item">
                <span>建議售價</span>
                <strong>NT$ {previewSuggested.toFixed(0)}</strong>
              </div>
            )}
          </div>
        )}

        <div className="form-footer">
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? '儲存中...' : editing ? '儲存' : '新增'}
          </button>
          {editing && <button className="btn-cancel" onClick={cancelEdit}>取消</button>}
        </div>
      </div>

      <div className="list-header">
        <SearchBar value={search} onChange={setSearch} placeholder="搜尋成品名稱..." />
        <span className="count">{filtered.length} 筆</span>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState text={search ? '找不到符合的成品' : '尚無成品，請新增'} /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>成品名稱</th>
                <th>成分</th>
                <th>食材成本</th>
                <th>售價</th>
                <th>實際毛利率</th>
                <th>建議售價</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(fin => {
                const cost = calcFinishedCost(fin, rawList, prepList) * (fin.quantity || 1)
                const margin = grossMargin(fin.salePrice, cost)
                const suggested = suggestedPrice(cost, fin.targetMargin || 60)
                const isGood = margin !== null && margin >= (fin.targetMargin || 60)
                return (
                  <tr key={fin.id}>
                    <td className="td-name">{fin.name}</td>
                    <td className="td-ings">
                      {fin.ingredients?.map((ing, i) => (
                        <span key={i} className={`ing-chip ${ing.type === 'prep' ? 'ing-chip-prep' : ''}`}>
                          {ing.name} {ing.amount}g
                        </span>
                      ))}
                    </td>
                    <td className="td-cost">NT$ {cost.toFixed(1)}</td>
                    <td>{fin.salePrice ? `NT$ ${fin.salePrice}` : '—'}</td>
                    <td>
                      {margin !== null
                        ? <span className={isGood ? 'margin-good' : 'margin-bad'}>{margin.toFixed(1)}%</span>
                        : '—'}
                    </td>
                    <td className="td-cost">{suggested ? `NT$ ${suggested.toFixed(0)}` : '—'}</td>
                    <td className="td-actions">
                      <button className="btn-icon" onClick={() => startEdit(fin)} title="編輯">✎</button>
                      <button className="btn-icon btn-del" onClick={() => setConfirmDel(fin)} title="刪除">⌫</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmDel && (
        <ConfirmDelete
          name={confirmDel.name}
          onConfirm={async () => { await remove(confirmDel.id); setConfirmDel(null) }}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}
