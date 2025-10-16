import { test, expect } from '@playwright/test'
import { getUser } from '../../support/factories/user'
import { authService } from '../../support/services/auth'

test.describe('POST /auth/resgister', () => {

  let auth

  test.beforeEach(({ request }) => {
    auth = authService(request)
  })

  test('deve cadastrar um novo usuário', async ({ request }) => {

    // Arrange
    const user = getUser()

    // Act
    const response = await auth.createUser(user)

    // Assert
    expect(response.status()).toBe(201)

    const responseBody = await response.json()

    // expect(responseBody.message).toBe('Usuário cadastrado com sucesso!')
    expect(responseBody).toHaveProperty('message', 'Usuário cadastrado com sucesso!')
    expect(responseBody.user).toHaveProperty('id')
    expect(responseBody.user).toHaveProperty('name', user.name)
    expect(responseBody.user).toHaveProperty('email', user.email)
    expect(responseBody.user).not.toHaveProperty('password')
  })

  test('não deve cadastrar quando o email já estiver em uso', async ({ request }) => {

    // Arrange
    const user = getUser()
    const preCondition = await auth.createUser(user)
    expect(preCondition.status()).toBe(201)

    // Act
    const response = await auth.createUser(user)

    // Assert
    expect(response.status()).toBe(400)

    const responseBody = await response.json()
    let expectedMessage = 'Este e-mail já está em uso. Por favor, tente outro.'
    expect(responseBody).toHaveProperty('message', expectedMessage)
  })

  test('não deve cadastrar quando o email é incorreto', async ({ request }) => {

    const user = {
      name: "Gabo Hubs",
      email: "gabohubs$gmail.com",
      password: "123456"
    }

    const response = await auth.createUser(user)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()
    let expectedMessage = 'O campo \'Email\' deve ser um email válido'
    expect(responseBody).toHaveProperty('message', expectedMessage)
  })

  test('não deve cadastrar quando o nome não é informado', async ({ request }) => {

    const user = {
      email: "gabohubs@gmail.com",
      password: "123456"
    }

    const response = await auth.createUser(user)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()
    let expectedMessage = 'O campo \'Name\' é obrigatório'
    expect(responseBody).toHaveProperty('message', expectedMessage)
  })

  test('não deve cadastrar quando o email não é informado', async ({ request }) => {

    const user = {
      name: "Gabo Hubs",
      password: "123456"
    }

    const response = await auth.createUser(user)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()
    let expectedMessage = 'O campo \'Email\' é obrigatório'
    expect(responseBody).toHaveProperty('message', expectedMessage)
  })

  test('não deve cadastrar quando a senha não é informada', async ({ request }) => {

    const user = {
      name: "Gabo Hubs",
      email: "gabohubs@gmail.com"
    }

    const response = await auth.createUser(user)

    expect(response.status()).toBe(400)

    const responseBody = await response.json()
    let expectedMessage = 'O campo \'Password\' é obrigatório'
    expect(responseBody).toHaveProperty('message', expectedMessage)
  })
})