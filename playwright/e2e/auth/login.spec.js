import { test, expect } from '@playwright/test'
import { loginService } from '../../support/services/login'

test.describe('POST /auth/login', () => {

    let login
    
    test.beforeEach(({ request }) => {
        login = loginService(request)
    })

    test('deve fazer login com sucesso', async ({ request }) => {
        const user = {
            name: "Gabo Hubs",
            email: "gabohubs@gmail.com",
            password: "123456"
        }

        const response = await login.auth(user)

        expect(response.status()).toBe(200)

        const responseBody = await response.json()

        // expect(responseBody).toHaveProperty('token')
    })

        
})