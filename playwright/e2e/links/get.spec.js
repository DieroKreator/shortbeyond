import {test, expect} from '../../support/fixtures'

import {getUserWithLinks} from '../../support/factories/user'

test('dev retornar uma lista de links pre-encurtados', async ({auth, links}) => {
    const user = getUserWithLinks()

    await auth.createUser(user)
    const token = await auth.getToken(user)

    for (const link of user.links) {
        await links.createLink(link,token)
    }
})