import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { EventEmitter } from 'events'
import { z } from 'zod'
import { comparePassword, hashPassword, signToken } from './auth.js'
import { getClient, query } from './db.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 4000)

const events = new EventEmitter()

app.use(cors())
app.use(express.json())

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

const broadcast = (type, payload) => {
  events.emit('message', { type, payload, timestamp: Date.now() })
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const onMessage = (message) => {
    res.write(`event: ${message.type}\n`)
    res.write(`data: ${JSON.stringify(message)}\n\n`)
  }

  events.on('message', onMessage)

  req.on('close', () => {
    events.off('message', onMessage)
  })
})

app.post(
  '/auth/register',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    })

    const { name, email, password } = schema.parse(req.body)
    const passwordHash = await hashPassword(password)

    const result = await query(
      'insert into users (name, email, password_hash) values ($1, $2, $3) returning id, name, email',
      [name, email.toLowerCase(), passwordHash],
    )

    const user = result.rows[0]
    const token = signToken(user)
    res.status(201).json({ user, token })
  }),
)

app.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    })

    const { email, password } = schema.parse(req.body)
    const result = await query('select * from users where email = $1', [
      email.toLowerCase(),
    ])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const match = await comparePassword(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = signToken(user)
    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    })
  }),
)

app.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const result = await query('select id, name from categories order by name')
    res.json(result.rows)
  }),
)

app.post(
  '/categories',
  asyncHandler(async (req, res) => {
    const schema = z.object({ name: z.string().min(2) })
    const { name } = schema.parse(req.body)
    const result = await query(
      'insert into categories (name) values ($1) on conflict (name) do update set name = excluded.name returning id, name',
      [name.trim().toLowerCase()],
    )
    res.status(201).json(result.rows[0])
  }),
)

app.put(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const schema = z.object({ name: z.string().min(2) })
    const { name } = schema.parse(req.body)
    const result = await query(
      'update categories set name = $1 where id = $2 returning id, name',
      [name.trim().toLowerCase(), Number(req.params.id)],
    )
    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Category not found' })
    }
    res.json(result.rows[0])
  }),
)

app.delete(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    await query('delete from categories where id = $1', [Number(req.params.id)])
    res.status(204).end()
  }),
)

app.get(
  '/products',
  asyncHandler(async (req, res) => {
    const { search, category, sort = 'price-asc', limit = '100', offset = '0' } =
      req.query

    const filters = []
    const values = []
    let index = 1

    if (search) {
      filters.push(`p.title ilike $${index} or p.description ilike $${index}`)
      values.push(`%${search}%`)
      index += 1
    }

    if (category) {
      filters.push(`c.name = $${index}`)
      values.push(String(category))
      index += 1
    }

    const whereClause = filters.length ? `where ${filters.join(' and ')}` : ''

    const sortMap = {
      'price-asc': 'p.price asc',
      'price-desc': 'p.price desc',
      'rating-desc': 'p.rating desc',
      'name-asc': 'p.title asc',
    }

    const orderBy = sortMap[sort] || sortMap['price-asc']

    const totalResult = await query(
      `select count(*)::int as total from products p left join categories c on c.id = p.category_id ${whereClause}`,
      values,
    )

    const result = await query(
      `select p.id, p.title, p.description, p.price::float, p.rating::float, p.stock, p.thumbnail, p.images, c.name as category
       from products p
       left join categories c on c.id = p.category_id
       ${whereClause}
       order by ${orderBy}
       limit ${Number(limit)} offset ${Number(offset)}`,
      values,
    )

    res.json({
      products: result.rows,
      total: totalResult.rows[0]?.total ?? 0,
      skip: Number(offset),
      limit: Number(limit),
    })
  }),
)

app.get(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const result = await query(
      `select p.id, p.title, p.description, p.price::float, p.rating::float, p.stock, p.thumbnail, p.images, c.name as category
       from products p
       left join categories c on c.id = p.category_id
       where p.id = $1`,
      [Number(req.params.id)],
    )

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json(result.rows[0])
  }),
)

app.post(
  '/products',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      title: z.string().min(2),
      description: z.string().optional().default(''),
      price: z.number().min(0),
      rating: z.number().min(0).max(5).optional().default(0),
      stock: z.number().min(0).optional().default(0),
      category: z.string().min(2),
      thumbnail: z.string().optional().default(''),
      images: z.array(z.string()).optional().default([]),
    })

    const payload = schema.parse(req.body)

    const client = await getClient()
    try {
      await client.query('begin')
      const categoryResult = await client.query(
        'insert into categories (name) values ($1) on conflict (name) do update set name = excluded.name returning id',
        [payload.category.trim().toLowerCase()],
      )

      const categoryId = categoryResult.rows[0].id

      const result = await client.query(
        `insert into products (title, description, price, rating, stock, thumbnail, images, category_id)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         returning id, title, description, price::float, rating::float, stock, thumbnail, images, $9::text as category`,
        [
          payload.title,
          payload.description,
          payload.price,
          payload.rating,
          payload.stock,
          payload.thumbnail,
          payload.images,
          categoryId,
          payload.category.trim().toLowerCase(),
        ],
      )

      await client.query('commit')

      const created = result.rows[0]
      broadcast('products.created', created)
      res.status(201).json(created)
    } catch (error) {
      await client.query('rollback')
      throw error
    } finally {
      client.release()
    }
  }),
)

app.put(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      title: z.string().min(2),
      description: z.string().optional().default(''),
      price: z.number().min(0),
      rating: z.number().min(0).max(5).optional().default(0),
      stock: z.number().min(0).optional().default(0),
      category: z.string().min(2),
      thumbnail: z.string().optional().default(''),
      images: z.array(z.string()).optional().default([]),
    })

    const payload = schema.parse(req.body)

    const client = await getClient()
    try {
      await client.query('begin')
      const categoryResult = await client.query(
        'insert into categories (name) values ($1) on conflict (name) do update set name = excluded.name returning id',
        [payload.category.trim().toLowerCase()],
      )

      const categoryId = categoryResult.rows[0].id

      const result = await client.query(
        `update products
         set title = $1, description = $2, price = $3, rating = $4, stock = $5, thumbnail = $6, images = $7, category_id = $8, updated_at = now()
         where id = $9
         returning id, title, description, price::float, rating::float, stock, thumbnail, images, $10::text as category`,
        [
          payload.title,
          payload.description,
          payload.price,
          payload.rating,
          payload.stock,
          payload.thumbnail,
          payload.images,
          categoryId,
          Number(req.params.id),
          payload.category.trim().toLowerCase(),
        ],
      )

      await client.query('commit')

      if (!result.rows[0]) {
        return res.status(404).json({ message: 'Product not found' })
      }

      const updated = result.rows[0]
      broadcast('products.updated', updated)
      res.json(updated)
    } catch (error) {
      await client.query('rollback')
      throw error
    } finally {
      client.release()
    }
  }),
)

app.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    await query('delete from products where id = $1', [Number(req.params.id)])
    broadcast('products.deleted', { id: Number(req.params.id) })
    res.status(204).end()
  }),
)

app.get(
  '/stock-orders',
  asyncHandler(async (req, res) => {
    const result = await query(
      'select id, order_code, vendor, eta, items, total::float, status from stock_orders order by id desc',
    )
    res.json(result.rows)
  }),
)

app.post(
  '/stock-orders',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      orderCode: z.string().min(2),
      vendor: z.string().min(2),
      eta: z.string().optional().default(''),
      items: z.number().min(0).optional().default(0),
      total: z.number().min(0).optional().default(0),
      status: z.string().optional().default('pending'),
    })

    const payload = schema.parse(req.body)
    const result = await query(
      `insert into stock_orders (order_code, vendor, eta, items, total, status)
       values ($1, $2, $3, $4, $5, $6)
       returning id, order_code, vendor, eta, items, total::float, status`,
      [
        payload.orderCode,
        payload.vendor,
        payload.eta,
        payload.items,
        payload.total,
        payload.status,
      ],
    )

    res.status(201).json(result.rows[0])
  }),
)

app.put(
  '/stock-orders/:id',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      orderCode: z.string().min(2),
      vendor: z.string().min(2),
      eta: z.string().optional().default(''),
      items: z.number().min(0).optional().default(0),
      total: z.number().min(0).optional().default(0),
      status: z.string().optional().default('pending'),
    })

    const payload = schema.parse(req.body)
    const result = await query(
      `update stock_orders
       set order_code = $1, vendor = $2, eta = $3, items = $4, total = $5, status = $6, updated_at = now()
       where id = $7
       returning id, order_code, vendor, eta, items, total::float, status`,
      [
        payload.orderCode,
        payload.vendor,
        payload.eta,
        payload.items,
        payload.total,
        payload.status,
        Number(req.params.id),
      ],
    )

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Stock order not found' })
    }

    res.json(result.rows[0])
  }),
)

app.delete(
  '/stock-orders/:id',
  asyncHandler(async (req, res) => {
    await query('delete from stock_orders where id = $1', [Number(req.params.id)])
    res.status(204).end()
  }),
)

app.get(
  '/warehouse/docks',
  asyncHandler(async (req, res) => {
    const result = await query(
      'select id, dock_name, status, carrier, eta from warehouse_docks order by id',
    )
    res.json(result.rows)
  }),
)

app.post(
  '/warehouse/docks',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      dockName: z.string().min(2),
      status: z.string().optional().default('idle'),
      carrier: z.string().optional().default(''),
      eta: z.string().optional().default(''),
    })

    const payload = schema.parse(req.body)
    const result = await query(
      `insert into warehouse_docks (dock_name, status, carrier, eta)
       values ($1, $2, $3, $4)
       returning id, dock_name, status, carrier, eta`,
      [payload.dockName, payload.status, payload.carrier, payload.eta],
    )

    res.status(201).json(result.rows[0])
  }),
)

app.put(
  '/warehouse/docks/:id',
  asyncHandler(async (req, res) => {
    const schema = z.object({
      dockName: z.string().min(2),
      status: z.string().optional().default('idle'),
      carrier: z.string().optional().default(''),
      eta: z.string().optional().default(''),
    })

    const payload = schema.parse(req.body)
    const result = await query(
      `update warehouse_docks
       set dock_name = $1, status = $2, carrier = $3, eta = $4, updated_at = now()
       where id = $5
       returning id, dock_name, status, carrier, eta`,
      [payload.dockName, payload.status, payload.carrier, payload.eta, Number(req.params.id)],
    )

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Dock not found' })
    }

    res.json(result.rows[0])
  }),
)

app.delete(
  '/warehouse/docks/:id',
  asyncHandler(async (req, res) => {
    await query('delete from warehouse_docks where id = $1', [Number(req.params.id)])
    res.status(204).end()
  }),
)

app.get(
  '/analytics/overview',
  asyncHandler(async (req, res) => {
    const result = await query(
      `select
        count(*)::int as total_products,
        avg(p.rating)::float as average_rating,
        sum(p.price * p.stock)::float as inventory_value,
        count(*) filter (where p.stock > 0 and p.stock < 10)::int as low_stock
       from products p`,
    )

    res.json(result.rows[0])
  }),
)

app.get(
  '/analytics/category-distribution',
  asyncHandler(async (req, res) => {
    const result = await query(
      `select c.name as category, count(*)::int as count
       from products p
       left join categories c on c.id = p.category_id
       group by c.name
       order by count desc`,
    )

    res.json(result.rows)
  }),
)

app.use((error, req, res, next) => {
  console.error(error)
  if (error instanceof z.ZodError) {
    return res.status(400).json({ message: 'Invalid request', issues: error.issues })
  }
  res.status(500).json({ message: 'Server error' })
})

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})
