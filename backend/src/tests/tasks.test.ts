
import request from 'supertest'
import app from '../src/index'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/index', async () => {
  const actual = await vi.importActual<any>('../src/index')

  const baseTask = {
    id: 't1',
    title: 'Fazer algo',
    description: 'desc',
    status: 'PENDING',
    priority: 'LOW',
    userId: 'u1',
    categoryId: 'c1',
  }

  const prismaMock = {
    task: {
      findMany: vi.fn().mockResolvedValue([baseTask]),
      findUnique: vi.fn().mockImplementation(({ where: { id } }: any) => {
        if (id === 't1') return Promise.resolve(baseTask)
        return Promise.resolve(null)
      }),
      create: vi.fn().mockImplementation(({ data }: any) => {
        return Promise.resolve({ id: 't2', ...data })
      }),
      update: vi.fn().mockImplementation(({ where: { id }, data }: any) => {
        if (id !== 't1') {
          const err: any = new Error('Record not found')
          err.code = 'P2025'
          throw err
        }
        return Promise.resolve({ id, ...data })
      }),
      delete: vi.fn().mockImplementation(({ where: { id } }: any) => {
        if (id !== 't1') {
          const err: any = new Error('Record not found')
          err.code = 'P2025'
          throw err
        }
        return Promise.resolve({ id })
      }),
    },
  }

  return { ...actual, prisma: prismaMock, default: actual.default }
})

describe('Tasks API - CRUD', () => {
  it('GET /api/tasks -> lista tarefas (200)', async () => {
    const res = await request(app).get('/api/tasks')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('GET /api/tasks/:id -> retorna tarefa (200)', async () => {
    const res = await request(app).get('/api/tasks/t1')
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('t1')
  })

  it('GET /api/tasks/:id -> 404 quando não existe', async () => {
    const res = await request(app).get('/api/tasks/nope')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('POST /api/tasks -> cria tarefa (201)', async () => {
    const payload = { title: 'Nova tarefa', userId: 'u1', categoryId: 'c1' }
    const res = await request(app).post('/api/tasks').send(payload)
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({ title: 'Nova tarefa', userId: 'u1', categoryId: 'c1' })
  })

  it('PUT /api/tasks/:id -> atualiza tarefa (200)', async () => {
    const res = await request(app).put('/api/tasks/t1').send({ status: 'IN_PROGRESS' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({ id: 't1', status: 'IN_PROGRESS' })
  })

  it('PUT /api/tasks/:id -> 404 quando não existe', async () => {
    const res = await request(app).put('/api/tasks/nope').send({ status: 'COMPLETED' })
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('DELETE /api/tasks/:id -> exclui tarefa (204)', async () => {
    const res = await request(app).delete('/api/tasks/t1')
    expect(res.status).toBe(204)
  })

  it('DELETE /api/tasks/:id -> 404 quando não existe', async () => {
    const res = await request(app).delete('/api/tasks/nope')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})
