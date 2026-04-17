// src/components/UI.jsx
import React from 'react'

export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-wrap">
      <span className="search-icon">⌕</span>
      <input
        className="search-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || '搜尋...'}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')}>×</button>
      )}
    </div>
  )
}

export function UnitBadge({ unit }) {
  const cls = { kg: 'badge-blue', g: 'badge-green', cc: 'badge-amber', 個: 'badge-pink' }
  return <span className={`badge ${cls[unit] || 'badge-gray'}`}>{unit}</span>
}

export function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🍞</div>
      <p>{text || '尚無資料，請新增'}</p>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="loading">
      <div className="spinner" />
      <span>載入中...</span>
    </div>
  )
}

export function Tag({ label, onRemove }) {
  return (
    <span className="tag">
      {label}
      {onRemove && <button className="tag-remove" onClick={onRemove}>×</button>}
    </span>
  )
}

export function ConfirmDelete({ onConfirm, onCancel, name }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <p>確定要刪除「<strong>{name}</strong>」嗎？</p>
        <div className="confirm-btns">
          <button className="btn-cancel" onClick={onCancel}>取消</button>
          <button className="btn-danger" onClick={onConfirm}>刪除</button>
        </div>
      </div>
    </div>
  )
}
