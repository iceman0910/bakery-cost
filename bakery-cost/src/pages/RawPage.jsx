// src/pages/RawPage.jsx
import React, { useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { unitCostPerG } from '../lib/calc'
import { SearchBar, UnitBadge, EmptyState, LoadingSpinner, ConfirmDelete } from '../components/UI'

const UNITS = ['kg', 'g', 'cc', '個']

const emptyForm = { name: '', qty: '', unit: 'kg', price: '' }

export default function RawPage() {
  const { data: rawList, loading, add, update, remove } = useCollection('rawIngredients')
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = '請輸入品名'
    if (!form.qty || isNaN(form.qty) || Number(form.qty) <= 0) e.qty = '請輸入有效數量'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = '請輸入有效價格'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    const payload = { name: form.name.trim(), qty: Number(form.qty), unit: form.unit, price: Number(form.price) }
    if (editing) {
      await update(editing, payload)
      setEditing(null)
    } else {
      await add(payload)
    }
    setForm(emptyForm)
    setErrors({})
    setSaving(false)
  }

  const startEdit = (raw) => {
    setEditing(raw.id)
    setForm({ name: raw.name, qty: String(raw.qty), unit: raw.unit, price: String(raw.price) })
  }

  const cancelEdit = () => { setEditing(null); setForm(emptyForm); setErrors({}) }

  const filtered = rawList.filter(r => r.name?.includes(search))

  const fmtCost = (raw) => {
    const cpg = unitCostPerG(raw)
    if (raw.unit === '個') return `NT$ ${cpg.toFixed(2)} / 個`
    return `NT$ ${(cpg * 1000).toFixed(2)} / kg`
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>原料食材</h2>
        <p className="page-desc">記錄每種原料的進貨量與價格，系統自動計算單位成本</p>
      </div>

      <div className="form-card">
        <div className="form-title">{editing ? '✏️ 編輯原料' : '＋ 新增原料'}</div>
        <div className="form-grid raw-grid">
          <div className={`field ${errors.name ? 'has-error' : ''}`}>
            <label>原料品名</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例：高筋麵粉" />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>
          <div className={`field ${errors.qty ? 'has-error' : ''}`}>
            <label>進貨量</label>
            <input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} placeholder="25" min="0" />
            {errors.qty && <span className="error-msg">{errors.qty}</span>}
          </div>
          <div className="field">
            <label>單位</label>
            <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className={`field ${errors.price ? 'has-error' : ''}`}>
            <label>進貨價格 (NT$)</label>
            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="450" min="0" />
            {errors.price && <span className="error-msg">{errors.price}</span>}
          </div>
          <div className="field form-actions">
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? '儲存中...' : editing ? '儲存' : '新增'}
            </button>
            {editing && <button className="btn-cancel" onClick={cancelEdit}>取消</button>}
          </div>
        </div>
      </div>

      <div className="list-header">
        <SearchBar value={search} onChange={setSearch} placeholder="搜尋原料品名..." />
        <span className="count">{filtered.length} 筆</span>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? <EmptyState text={search ? '找不到符合的原料' : '尚無原料，請新增'} /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>品名</th>
                <th>進貨量</th>
                <th>進貨價格</th>
                <th>單位成本</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(raw => (
                <tr key={raw.id}>
                  <td className="td-name">{raw.name}</td>
                  <td>{raw.qty} <UnitBadge unit={raw.unit} /></td>
                  <td>NT$ {raw.price?.toLocaleString()}</td>
                  <td className="td-cost">{fmtCost(raw)}</td>
                  <td className="td-actions">
                    <button className="btn-icon" onClick={() => startEdit(raw)} title="編輯">✎</button>
                    <button className="btn-icon btn-del" onClick={() => setConfirmDel(raw)} title="刪除">⌫</button>
                  </td>
                </tr>
              ))}
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
