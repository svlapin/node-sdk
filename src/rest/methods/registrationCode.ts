import { InterfaceAllthingsRestClient } from '../types'

export interface IRegistrationCodeOptions {
  readonly expiresAt?: string | null
  readonly externalId?: string
  readonly permanent?: boolean
}

export interface IRegistrationCode extends Required<IRegistrationCodeOptions> {
  readonly code: string
  readonly createdAt: string
  readonly email: string
  readonly id: string
  readonly invitationSent: boolean
  readonly utilisationPeriods: ReadonlyArray<string>
}

export type PartialRegistrationCode = Partial<IRegistrationCode>

export type RegistrationCodeResult = Promise<IRegistrationCode>

/*
  Create new registration code
  https://api-doc.allthings.me/#!/Registration32Code/post_registration_codes
*/

export type MethodRegistrationCodeCreate = (
  code: string,
  utilisationPeriods: string | ReadonlyArray<string>,
  options?: IRegistrationCodeOptions,
) => RegistrationCodeResult

export async function registrationCodeCreate(
  client: InterfaceAllthingsRestClient,
  code: string,
  utilisationPeriods: string | ReadonlyArray<string>,
  options: IRegistrationCodeOptions = { permanent: false },
): RegistrationCodeResult {
  const { externalId, ...moreOptions } = options

  const { tenantID: resultExternalId, ...result } = await client.post(
    '/v1/registration-codes',
    {
      code,
      utilisationPeriods:
        typeof utilisationPeriods === 'string'
          ? [utilisationPeriods]
          : utilisationPeriods,
      ...(externalId && { tenantID: externalId }),
      ...moreOptions,
    },
  )

  return {
    ...result,
    externalId: resultExternalId,
  }
}
