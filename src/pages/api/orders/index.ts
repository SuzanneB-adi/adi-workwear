import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req:any, res:any){
  const { filter } = req.query
  if (filter === 'requested'){
    const orders = await prisma.order.findMany({
      where: { status: { in: ['pending_md','pending_team','requires_approval','hv_declined'] } },
      include: { createdBy: true, company: true },
      orderBy: { createdAt: 'desc' }
    })
    const mapped = orders.map(o=>({ id: o.id, orderNumber: o.orderNumber, requester: o.createdBy?.name, company: o.company?.name, requiredByDate: o.requiredByDate, invoicedValue: o.invoicedValue, status: o.status }))
    return res.json(mapped)
  }
  if (filter === 'placed'){
    const orders = await prisma.order.findMany({ where: { status: { in: ['approved','placed','completed'] } }, include: { createdBy: true }, orderBy: { placedAt: 'desc' } })
    const mapped = orders.map(o=>({ id: o.id, orderNumber: o.orderNumber, placedOrderRef: o.placedOrderRef, requester: o.createdBy?.name, placedAt: o.placedAt, invoicedValue: o.invoicedValue }))
    return res.json(mapped)
  }
  return res.status(400).json({ error: 'missing or invalid filter' })
}
