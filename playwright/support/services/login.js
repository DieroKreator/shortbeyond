export const loginService = (request) => {

    const auth = async (user) => {
        return await request.post('http://localhost:3333/api/auth/login', {
            data: {
                email: user.email,
                password: user.password
            }
        })
    }

    return {
        auth
    }
}