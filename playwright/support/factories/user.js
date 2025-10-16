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

export const getUserWithLink = () => {

    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
        // name: firstName + ' ' + lastName,
        name: `${firstName} ${lastName}`, // interpolation
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: "123456",
        link: {
            original_url: faker.internet.url(),
            title: faker.music.songName()
        }
    }
}