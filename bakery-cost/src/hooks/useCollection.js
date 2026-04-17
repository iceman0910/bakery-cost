// src/hooks/useCollection.js
import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useCollection(collectionName) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [collectionName])

  const add = async (item) => {
    await addDoc(collection(db, collectionName), { ...item, createdAt: serverTimestamp() })
  }

  const update = async (id, item) => {
    await updateDoc(doc(db, collectionName, id), item)
  }

  const remove = async (id) => {
    await deleteDoc(doc(db, collectionName, id))
  }

  return { data, loading, add, update, remove }
}
