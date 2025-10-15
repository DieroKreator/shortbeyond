// @ts-check
import { test, expect } from '@playwright/test'

test('deve verificar se a api está online', async ({ request }) => {

  const reponse = await request.get('http://localhost:3333/health')

  expect(reponse.status()).toBe(200)

  const body = await reponse.json()
  expect(body.service).toBe('shortbeyond-api')
  expect(body.status).toBe('healthy')
  
})