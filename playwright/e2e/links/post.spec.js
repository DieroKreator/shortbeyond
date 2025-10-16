import { test, expect } from '@playwright/test'
import { authService } from '../../support/services/auth'
import { linkService } from '../../support/services/links'

test.describe('POST /api/links', () => {

    test('deve encurtar um novo link', async ({ request }) => {

        const auth = authService(request)
        const link = linkService(request)

        const user = {
            name: "Gabo Hubs",
            email: "gabohubs@gmail.com",
            password: "123456",
            link: {
                original_url: "https://www.instagram.com/dierokreator",
                title: "Meu IG"
            }
        }

        const token = await auth.getToken(user)

        const response = await link.createLink(user.link, token)

        expect(response.status()).toBe(201)

        const { data, message } = await response.json()

        expect(data).toHaveProperty('id')
        expect(data).toHaveProperty('original_url', user.link.original_url)
        expect(data).toHaveProperty('title', user.link.title)
        expect(data.short_code).toMatch(/^[a-zA-Z0-9]{5}$/) // estrategia de expressao regular para validar o short_code de 5 chars - REGEX
        expect(message).toBe('Link criado com sucesso')
    })

})