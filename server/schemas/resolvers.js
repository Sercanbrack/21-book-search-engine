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
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$addToSet: { savedBooks: input}},
                    { new: true}
                )

                return updatedUser
            }

            throw new AuthenticationError("It looks like you're not logged in...")
        },

        removeBook: async (parent, {bookId}, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    {$pull: { savedBooks: {bookId: bookId}}},
                    { new: true }
                )
                if (!updatedUser) {
                    throw new AuthenticationError("Unable to find a user with this id!")
                }

                return updatedUser
            }

            throw new AuthenticationError("It looks like you're not logged in...")
        }
    }
}

module.exports = resolvers