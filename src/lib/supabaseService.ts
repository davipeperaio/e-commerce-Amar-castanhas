import { supabase, isSupabaseEnabled } from './supabase'
import { Product, Expense, Customer, Sale, RetailMargin, WholesaleMargins as WholesaleMarginsType } from './types'

const ensure = () => {
  if (!isSupabaseEnabled || !supabase) throw new Error('Supabase not configured')
}

export const productsService = {
  async list(): Promise<Product[]> {
    ensure()
    const { data, error } = await supabase!.from('products').select('*')
    if (error) throw error
    return data as Product[]
  },
  async upsert(items: Product[]) {
    ensure()
    await supabase!.from('products').upsert(items as any, { onConflict: 'id' })
  },
  async delete(id: string) {
    ensure()
    await supabase!.from('products').delete().eq('id', id)
  },
}

export const expensesService = {
  async list(): Promise<Expense[]> {
    ensure()
    const { data, error } = await supabase!.from('expenses').select('*')
    if (error) throw error
    return (data as any[]).map(e => ({ ...e, data: new Date(e.data) })) as Expense[]
  },
  async upsert(items: Expense[]) {
    ensure()
    const rows = items.map(i => ({ ...i, data: (i.data as any)?.toISOString?.() ?? i.data }))
    await supabase!.from('expenses').upsert(rows as any, { onConflict: 'id' })
  },
  async delete(id: string) {
    ensure()
    await supabase!.from('expenses').delete().eq('id', id)
  },
}

export const customersService = {
  async list(): Promise<Customer[]> {
    ensure()
    const { data, error } = await supabase!.from('customers').select('*')
    if (error) throw error
    return (data as any[]).map(c => ({ ...c, createdAt: new Date(c.created_at) })) as Customer[]
  },
  async upsert(items: Customer[]) {
    ensure()
    const rows = items.map(i => ({ ...i, created_at: (i.createdAt as any)?.toISOString?.() ?? i.createdAt }))
    await supabase!.from('customers').upsert(rows as any, { onConflict: 'id' })
  },
  async delete(id: string) {
    ensure()
    await supabase!.from('customers').delete().eq('id', id)
  },
}

export const salesService = {
  async list(): Promise<Sale[]> {
    ensure()
    const { data, error } = await supabase!.from('sales').select('*')
    if (error) throw error
    return (data as any[]).map(s => ({ ...s, date: new Date(s.date), customerId: s.customer_id })) as Sale[]
  },
  async upsert(items: Sale[]) {
    ensure()
    const rows = items.map(i => ({ ...i, date: (i.date as any)?.toISOString?.() ?? i.date, customer_id: i.customerId ?? null }))
    await supabase!.from('sales').upsert(rows as any, { onConflict: 'id' })
  },
  async delete(id: string) {
    ensure()
    await supabase!.from('sales').delete().eq('id', id)
  },
}

