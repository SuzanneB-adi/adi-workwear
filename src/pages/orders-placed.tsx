import React from 'react'

export default function OrdersPlaced() {
  const [orders, setOrders] = React.useState<any[]>([])
  React.useEffect(()=>{
    fetch('/api/orders?filter=placed').then(r=>r.json()).then(setOrders)
  },[])
  return (
    <main style={{ padding: 20 }}>
      <h2>Orders Placed</h2>
      <table border={1} cellPadding={6}>
        <thead>
          <tr><th>Placed Order No</th><th>Supplier Ref</th><th>Requester</th><th>Placed At</th><th>Value</th></tr>
        </thead>
        <tbody>
          {orders.map(o=> (
            <tr key={o.id}><td>{o.orderNumber}</td><td>{o.placedOrderRef}</td><td>{o.requester}</td><td>{o.placedAt}</td><td>{o.invoicedValue}</td></tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
