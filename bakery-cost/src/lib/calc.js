// src/lib/calc.js

// 換算每g（或每個）的單價
export function unitCostPerG(raw) {
  const { qty, unit, price } = raw
  if (!qty || !price) return 0
  if (unit === 'kg') return price / (qty * 1000)
  if (unit === 'g')  return price / qty
  if (unit === 'cc') return price / qty
  if (unit === '個') return price / qty
  return 0
}

export function unitLabel(unit) {
  return unit === '個' ? '個' : 'g'
}

// 備料的總食材成本
export function calcPrepCost(prep, rawList) {
  if (!prep?.ingredients?.length) return 0
  return prep.ingredients.reduce((sum, ing) => {
    const raw = rawList.find(r => r.id === ing.rawId)
    if (!raw) return sum
    return sum + unitCostPerG(raw) * ing.amount
  }, 0)
}

// 備料每g成本
export function calcPrepCostPerG(prep, rawList) {
  const total = prep.totalWeight || 1
  return calcPrepCost(prep, rawList) / total
}

// 成品食材總成本（含原料 + 備料）
export function calcFinishedCost(product, rawList, prepList) {
  if (!product?.ingredients?.length) return 0
  return product.ingredients.reduce((sum, ing) => {
    if (ing.type === 'raw') {
      const raw = rawList.find(r => r.id === ing.refId)
      if (!raw) return sum
      return sum + unitCostPerG(raw) * ing.amount
    }
    if (ing.type === 'prep') {
      const prep = prepList.find(p => p.id === ing.refId)
      if (!prep) return sum
      return sum + calcPrepCostPerG(prep, rawList) * ing.amount
    }
    return sum
  }, 0)
}

// 毛利率
export function grossMargin(salePrice, cost) {
  if (!salePrice || salePrice <= 0) return null
  return ((salePrice - cost) / salePrice) * 100
}

// 建議售價（依目標毛利率反推）
export function suggestedPrice(cost, targetMarginPct) {
  if (!cost || targetMarginPct >= 100) return null
  return cost / (1 - targetMarginPct / 100)
}
