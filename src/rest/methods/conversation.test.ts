// tslint:disable:no-expression-statement

import { readFileSync } from 'fs'
import restClient from '..'

const client = restClient()

const CONVERSATION_ID = '5aa7cd7bd4959e004112e136'
const USER_ID = '5a9d5ce40ecb3300413971a7'

describe('conversationGetById()', () => {
  it('should be able to get a conversation by ID', async () => {
    const result = await client.conversationGetById(CONVERSATION_ID)

    expect(result.id).toEqual(CONVERSATION_ID)
  })
})

describe('conversationCreateMessage()', () => {
  it('should be able to add a message to a conversation', async () => {
    const content = 'some message'
    const result = await client.conversationCreateMessage(CONVERSATION_ID, {
      body: content,
      userId: USER_ID,
    })

    expect(result.content.content).toEqual(content)
    expect(result._embedded.createdBy.id).toEqual(USER_ID)
  })

  it('should be able to add a message to a conversation with attachments', async () => {
    const content = 'some message'
    const result = await client.conversationCreateMessage(CONVERSATION_ID, {
      attachments: [
        {
          content: readFileSync(__dirname + '/../../../test/fixtures/1x1.png'),
          filename: '2x2.png',
        },
      ],
      body: content,
      userId: USER_ID,
    })

    expect(result.content.description).toEqual(content)
    expect(result._embedded.createdBy.id).toEqual(USER_ID)

    if (result.content.files) {
      expect(result.content.files.length).toEqual(1)
    }
  })
})
