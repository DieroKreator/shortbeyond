import { faker } from '@faker-js/faker'

export const getUser = () => {

    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
        // name: firstName + ' ' + lastName,
        name: `${firstName} ${lastName}`, // interpolation
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: "123456"
    }
}