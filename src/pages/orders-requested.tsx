import React from 'react'

export default function OrdersRequested() {
  const [orders, setOrders] = React.useState<any[]>([])
  React.useEffect(()=>{
    fetch('/api/orders?filter=requested').then(r=>r.json()).then(setOrders)
  },[])
  return (
    <main style={{ padding: 20 }}>
      <h2>Orders Requested</h2>
      <table border={1} cellPadding={6}>
        <thead>
          <tr><th>Order</th><th>Requester</th><th>Company</th><th>Required By</th><th>Value</th><th>Status</th></tr>
        </thead>
        <tbody>
          {orders.map(o=> (
            <tr key={o.id}><td>{o.orderNumber || o.id}</td><td>{o.requester}</td><td>{o.company}</td><td>{o.requiredByDate}</td><td>{o.invoicedValue}</td><td>{o.status}</td></tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
