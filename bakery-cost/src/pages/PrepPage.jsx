// src/pages/PrepPage.jsx
import React, { useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { calcPrepCost, calcPrepCostPerG, unitCostPerG } from '../lib/calc'
import { SearchBar, EmptyState, LoadingSpinner, Tag, ConfirmDelete } from '../components/UI'

const emptyForm = { name: '', totalWeight: '', servings: '1' }

export default function PrepPage() {
  const { data: rawList } = useCollection('rawIngredients')
  const { data: prepList, loading, add, update, remove } = useCollection('prepItems')

  const [form, setForm] = useState(emptyForm)
  const [ingredients, setIngredients] = useState([])
  const [selectedRaw, setSelectedRaw] = useState('')
  const [ingAmount, setIngAmount] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = '請輸入備料名稱'
    if (!form.totalWeight || Number(form.totalWeight) <= 0) e.totalWeight = '請輸入總重量'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const addIngredient = () => {
    if (!selectedRaw || !ingAmount || Number(ingAmount) <= 0) return
    if (ingredients.find(i => i.rawId === selectedRaw)) return
    const raw = rawList.find(r => r.id === selectedRaw)
    setIngredients(prev => [...prev, { rawId: selectedRaw, rawName: raw?.name, amount: Number(ingAmount) }])
    setIngAmount('')
  }

  const removeIngredient = (rawId) => {
    setIngredients(prev => prev.filter(i => i.rawId !== rawId))
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      totalWeight: Number(form.totalWeight),
      servings: Number(form.servings) || 1,
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

  const startEdit = (prep) => {
    setEditing(prep.id)
    setForm({ name: prep.name, totalWeight: String(prep.totalWeight), servings: String(prep.servings || 1) })
    setIngredients(prep.ingredients || [])
  }

  const cancelEdit = () => { setEditing(null); setForm(emptyForm); setIngredients([]); setErrors({}) }

  const filtered = prepList.filter(p => p.name?.includes(search))

  return (
    <div className="page">
      <div className="page-header">
        <h2>備料食材</h2>
        <p className="page-desc">記錄麵糰、餡料等備料的成分組成，計算每克成本</p>
      </div>

      <div className="form-card">
        <div className="form-title">{editing ? '✏️ 編輯備料' : '＋ 新增備料'}</div>
        <div className="form-grid prep-info-grid">
          <div className={`field ${errors.name ? 'has-error' : ''}`}>
            <label>備料名稱</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例：吐司麵糰" />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>
          <div className={`field ${errors.totalWeight ? 'has-error' : ''}`}>
            <label>做出總重量 (g)</label>
            <input type="number" value={form.totalWeight} onChange={e => setForm(f => ({ ...f, totalWeight: e.target.value }))} placeholder="1200" min="0" />
            {errors.totalWeight && <span className="error-msg">{errors.totalWeight}</span>}
          </div>
          <div className="field">
            <label>份數</label>
            <input type="number" value={form.servings} onChange={e => setForm(f => ({ ...f, servings: e.target.value }))} placeholder="1" min="1" />
          </div>
        </div>

        <div className="form-section-title">使用的原料</div>
        <div className="ing-add-row">
          <select value={selectedRaw} onChange={e => setSelectedRaw(e.target.value)}>
            <option value="">選擇原料</option>
            {rawList.map(r => <option key={r.id} value={r.id}>{r.name} ({r.unit})</option>)}
          </select>
          <input
            type="number"
            value={ingAmount}
            onChange={e => setIngAmount(e.target.value)}
            placeholder="用量(g / 個)"
            min="0"
          />
          <button className="btn-secondary" onClick={addIngredient}>加入</button>
        </div>
        {ingredients.length > 0 && (
          <div className="tags-row">
            {ingredients.map(ing => (
              <Tag
                key={ing.rawId}
                label={`${ing.rawName} ${ing.amount}g`}
                onRemove={() => removeIngredient(ing.rawId)}
              />
            ))}
          </div>
        )}

        {/* 即時成本預覽 */}
        {ingredients.length > 0 && form.totalWeight > 0 && (
          <div className="cost-preview">
            <span>預估食材成本：</span>
            <strong>NT$ {calcPrepCost({ ingredients }, rawList).toFixed(1)}</strong>
            <span className="cost-perunit">
              每g：NT$ {(calcPrepCost({ ingredients }, rawList) / Number(form.totalWeight)).toFixed(4)}
            </span>
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
        <SearchBar value={search} onChange={setSearch} placeholder="搜尋備料名稱..." />
        <span className="count">{filtered.length} 筆</span>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState text={search ? '找不到符合的備料' : '尚無備料，請新增'} /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>備料名稱</th>
                <th>成分</th>
                <th>總重</th>
                <th>份數</th>
                <th>食材成本</th>
                <th>每g成本</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(prep => {
                const cost = calcPrepCost(prep, rawList)
                const cpg = calcPrepCostPerG(prep, rawList)
                return (
                  <tr key={prep.id}>
                    <td className="td-name">{prep.name}</td>
                    <td className="td-ings">
                      {prep.ingredients?.map(i => (
                        <span key={i.rawId} className="ing-chip">{i.rawName} {i.amount}g</span>
                      ))}
                    </td>
                    <td>{prep.totalWeight}g × {prep.servings || 1}份</td>
                    <td>{prep.servings || 1}</td>
                    <td className="td-cost">NT$ {cost.toFixed(1)}</td>
                    <td className="td-cost">NT$ {cpg.toFixed(4)}</td>
                    <td className="td-actions">
                      <button className="btn-icon" onClick={() => startEdit(prep)} title="編輯">✎</button>
                      <button className="btn-icon btn-del" onClick={() => setConfirmDel(prep)} title="刪除">⌫</button>
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
