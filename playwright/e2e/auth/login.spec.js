import { test, expect } from '@playwright/test'
import { authService } from '../../support/services/auth'

test.describe('POST /auth/login', () => {

    let auth

    test.beforeEach(({ request }) => {
        auth = authService(request)
    })

    test('deve fazer login com sucesso', async ({ request }) => {
        const user = {
            name: "Gabo Hubs",
            email: "gabohubs@gmail.com",
            password: "123456"
        }

        const response = await auth.login(user)

        expect(response.status()).toBe(200)

        const responseBody = await response.json()

        // expect(responseBody).toHaveProperty('token')
    })


})