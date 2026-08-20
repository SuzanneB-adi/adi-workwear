import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>adi Workwear</h1>
      <ul>
        <li><Link href="/orders-requested">Orders Requested</Link></li>
        <li><Link href="/orders-placed">Orders Placed</Link></li>
      </ul>
    </main>
  )
}
