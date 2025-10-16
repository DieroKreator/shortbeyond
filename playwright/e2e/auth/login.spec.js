import { test, expect } from '@playwright/test'
import { authService } from '../../support/services/auth'

import { getUser } from '../../support/factories/user'

test.describe('POST /auth/login', () => {

    let auth

    test.beforeEach(({ request }) => {
        auth = authService(request)
    })

    test('deve fazer login com sucesso', async ({ request }) => {
        const user = getUser()

        const respCreate = await auth.createUser(user)
        expect(respCreate.status()).toBe(201)

        const response = await auth.login(user)
        expect(response.status()).toBe(200)

        const responseBody = await response.json()

        expect(responseBody).toHaveProperty('message', 'Login realizado com sucesso')
        expect(responseBody.data).toHaveProperty('token')
        expect(responseBody.data.user).toHaveProperty('id')
        expect(responseBody.data.user).toHaveProperty('name', user.name)
        expect(responseBody.data.user).toHaveProperty('email', user.email)
        expect(responseBody.data.user).not.toHaveProperty('password')
    })

    test('não deve logar com senha incorreta', async ({ request }) => {
        const user = getUser()

        const respCreate = await auth.createUser(user)
        expect(respCreate.status()).toBe(201)

        const response = await auth.login({ ...user, password: 'jahsgdhj' })
        expect(response.status()).toBe(401)

        const responseBody = await response.json()

        expect(responseBody).toHaveProperty('message', 'Credenciais inválidas')
    })

    test('não deve logar com email que não foi cadastrado', async ({ request }) => {
        const user = {
            email: 'fergurn@gmail.com',
            password: 'pwd123'
        }

        const response = await auth.login(user)
        expect(response.status()).toBe(401)

        const responseBody = await response.json()

        expect(responseBody).toHaveProperty('message', 'Credenciais inválidas')
    })

    test('não deve logar quando o email não é informado', async ({ request }) => {
        const user = {
            password: 'pwd123'
        }

        const response = await auth.login(user)
        expect(response.status()).toBe(400)

        const responseBody = await response.json()

        expect(responseBody).toHaveProperty('message', 'O campo \'Email\' é obrigatório')
    })

    test('não deve logar quando a senha não é informada', async ({ request }) => {
        const user = {
            email: 'fergurn@gmail.com'
        }

        const response = await auth.login(user)
        expect(response.status()).toBe(400)

        const responseBody = await response.json()

        expect(responseBody).toHaveProperty('message', 'O campo \'Password\' é obrigatório')
    })

})