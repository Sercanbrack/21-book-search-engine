const { AuthenticationError } = require('apollo-server-express')
const { User, Book } = require('../models')
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const user = await User.findbyId(context.user._id)

                return user
            }
        }
    },

    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email })

            if(!user) {
                throw new AuthenticationError('Invalid credentials, please try again.')
            }

            const correctPassword = await user.isCorrectPassword(password)

            if (!correctPassword) {
                throw new AuthenticationError('Invalid credentials, please try again.')
            }

            const token = signToken(user)

            return { token, user }
        },

        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)

            return { token, user }
        },

        saveBook: async (parent, {input}, context) => {
            if (context.user) {
                const book = Book.findOne({input})
                const user = await User.findById(context.user._id, { $push: {savedBooks: book}})

                return user
            }

            throw new AuthenticationError('Not logged in')
        },

        removeBook: async (parent, {bookId}, context) => {
            const user = await User.findByIdAndUpdate(context.user._id, bookId, { new: true })

            return user
        }
    }
}

module.exports = resolvers