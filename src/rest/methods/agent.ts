import { EnumLocale, IAllthingsRestClient } from '../types'
import {
  EnumUserPermissionObjectType,
  EnumUserPermissionRole,
  EnumUserType,
  IUserPermission,
  PartialUser,
  UserResult,
} from './user'

export type AgentPermissionsResult = Promise<ReadonlyArray<IUserPermission>>

/*
  Create new agent
*/

export type MethodAgentCreate = (
  appId: string,
  propertyManagerId: string,
  username: string,
  data: PartialUser & {
    readonly email: string
    readonly locale: EnumLocale
  },
  sendInvitation?: boolean,
  externalAgentCompany?: string,
) => UserResult

export async function agentCreate(
  client: IAllthingsRestClient,
  appId: string,
  propertyManagerId: string,
  username: string,
  data: PartialUser & {
    readonly email: string
    readonly locale: EnumLocale
  },
  sendInvitation?: boolean,
  externalAgentCompany?: string,
): UserResult {
  const user = await client.userCreate(appId, username, {
    ...data,
    type: EnumUserType.customer,
  })
  const manager = await client.post(
    `/v1/property-managers/${propertyManagerId}/users`,
    {
      userID: user.id,
      ...(externalAgentCompany && { externalAgentCompany }),
    },
  )

  // trigger sending of invitation emails to agents, then return data
  return (
    !(
      (typeof sendInvitation !== 'undefined' ? sendInvitation : true) &&
      (await client.post(`/v1/users/${user.id}/invitations`))
    ) && {
      ...user,
      ...manager,
    }
  )
}

/*
  Create agent permissions.
  This is a convenience wrapper around createUserPermission.
*/
/**
 * Returns a datastore-specific object of redis clients.
 */
export type MethodAgentCreatePermissions = (
  agentId: string,
  objectId: string,
  objectType: EnumUserPermissionObjectType,
  permissions: ReadonlyArray<EnumUserPermissionRole>,
  startDate?: Date,
  endDate?: Date,
) => Promise<boolean>

/**
 * Returns a datastore-specific object of redis clients.
 */
export async function agentCreatePermissions(
  client: IAllthingsRestClient,
  agentId: string,
  objectId: string,
  objectType: EnumUserPermissionObjectType,
  permissions: ReadonlyArray<EnumUserPermissionRole>,
  startDate?: Date,
  endDate?: Date,
): Promise<boolean> {
  return client.userCreatePermissionBatch(agentId, {
    endDate,
    objectId,
    objectType,
    restrictions: [],
    roles: permissions,
    startDate,
  })
}
