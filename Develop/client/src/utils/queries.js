import { gql } from '@apollo/client'

export const QUERY_ME = gql`
    {
        me {
            username
            savedBooks {
                books {
                bookId
                authors
                title
                description
                image
                link
                }
            }
        }
    }
`