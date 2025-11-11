
import request from 'supertest'
import app from '../src/index'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../src/index', async () => {
  const actual = await vi.importActual<any>('../src/index')

  const prismaMock = {
    user: {
      update: vi.fn().mockImplementation(({ where: { id }, data }: any) => {
        if (id !== 'u1') {
          const err: any = new Error('Record not found')
          err.code = 'P2025'
          throw err
        }
        return Promise.resolve({ id, ...data })
      }),
      delete: vi.fn().mockImplementation(({ where: { id } }: any) => {
        if (id !== 'u1') {
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

describe('Users API - update & delete', () => {
  it('PUT /api/users/:id -> atualiza usuário (200)', async () => {
    const res = await request(app).put('/api/users/u1').send({ name: 'Alice Atualizada' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({ id: 'u1', name: 'Alice Atualizada' })
  })

  it('PUT /api/users/:id -> 404 ao atualizar inexistente', async () => {
    const res = await request(app).put('/api/users/naoexiste').send({ name: 'X' })
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('DELETE /api/users/:id -> exclui usuário (204)', async () => {
    const res = await request(app).delete('/api/users/u1')
    expect(res.status).toBe(204)
  })

  it('DELETE /api/users/:id -> 404 ao excluir inexistente', async () => {
    const res = await request(app).delete('/api/users/naoexiste')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})
