import { getQueryString } from '../../utils/getQueryString'
import { stringToDate } from '../../utils/stringToDate'
import { EnumLocale, InterfaceAllthingsRestClient } from '../types'
import { IFile } from './file'
import { LikeCollectionResult } from './like'
import { IUser } from './user'

// @TODO: get this from types file once it's merged
interface IGenericLink {
  readonly href: string
}

export interface ITranslationObject {
  readonly locale: EnumLocale
  readonly id: string
  readonly content: string
  readonly files: ReadonlyArray<IFile>
  readonly _embedded: {
    readonly files: ReadonlyArray<IFile>
  }
}

export interface IChannelPathLabel {
  readonly level: string
  readonly label: string
  readonly reach: number
  readonly id: string
}

export interface IBasicCommunityArticle {
  readonly id: string
  readonly category: string // @TODO
  readonly channels: ReadonlyArray<string>
  readonly unpublishedChannels: ReadonlyArray<string>
  readonly content: string
  readonly files: ReadonlyArray<IFile>
  readonly commentCount: number
  readonly published: boolean
  readonly sortHash: string
  readonly title: string
  readonly defaultLocale: EnumLocale
  readonly translations: ReadonlyArray<ITranslationObject>
  readonly isHtmlPost: boolean
  readonly disableSocialMedia: boolean
  readonly likeCount: number
  readonly _links: {
    readonly self: IGenericLink
    readonly comments: IGenericLink
    readonly likes: IGenericLink
  }
  readonly _embedded: {
    readonly likes: ReadonlyArray<any> // @TODO
    readonly user: IUser
    readonly files: ReadonlyArray<IFile>
  }
  readonly channelPathLabels: ReadonlyArray<IChannelPathLabel>
  readonly _meta: {
    readonly comments: {
      readonly unpublishedCount: number
      readonly publishedCount: number
    }
    readonly scheduled: boolean
    readonly hasPermission: boolean
    readonly reactions: number
    readonly reach: number
    readonly likedByUser: boolean
  }
}

export interface IPreprocessedCommunityArticle extends IBasicCommunityArticle {
  readonly createdAt: string
  readonly publishedFrom: string
  readonly publishedTo?: string
  readonly firstPublished: string
  readonly deletedAt: string | null
}

export interface ICommunityArticle extends IBasicCommunityArticle {
  readonly createdAt: Date
  readonly publishedFrom: Date
  readonly publishedTo: Date | null
  readonly firstPublished: Date
  readonly deletedAt: Date | null
}

export interface IBasicCommunityArticleCollection {
  readonly page: number
  readonly limit: number
  readonly pages: number
  readonly total: number
  readonly metaData: ReadonlyArray<string>
  readonly _links: {
    readonly self: IGenericLink
    readonly first: IGenericLink
    readonly last: IGenericLink
  }
}

export interface IPreprocessedCommunityArticleCollection
  extends IBasicCommunityArticleCollection {
  readonly _embedded: {
    readonly items: ReadonlyArray<IPreprocessedCommunityArticle>
  }
}

export interface ICommunityArticleCollection
  extends IBasicCommunityArticleCollection {
  readonly _embedded: {
    readonly items: ReadonlyArray<ICommunityArticle>
  }
}

export interface ICommunityArticleStats {
  readonly total: number
  readonly scheduled: number
  readonly createdByUser: number
  readonly _links: {
    readonly self: IGenericLink
  }
}

export type PartialCommunityArticle = Partial<IPreprocessedCommunityArticle>

export type CommunityArticleResult = Promise<ICommunityArticle>

export type CommunityArticleCollectionResult = Promise<
  ICommunityArticleCollection
>

export type CommunityArticleStatsResult = Promise<ICommunityArticleStats>

export function mapCommunityArticleDateFields({
  createdAt,
  publishedFrom,
  publishedTo,
  firstPublished,
  deletedAt,
  ...communityArticle
}: IPreprocessedCommunityArticle): ICommunityArticle {
  return {
    ...communityArticle,
    createdAt: stringToDate(createdAt),
    deletedAt: getDateOrNullField(deletedAt),
    firstPublished: stringToDate(firstPublished),
    publishedFrom: stringToDate(publishedFrom),
    publishedTo: getDateOrNullField(publishedTo),
  }
}

function mapCommunityArticleCollectionDateFields(
  communityArticleCollection: IPreprocessedCommunityArticleCollection,
): ICommunityArticleCollection {
  return {
    ...communityArticleCollection,
    _embedded: {
      items: communityArticleCollection._embedded.items.map(
        mapCommunityArticleDateFields,
      ),
    },
  }
}

// Returns a Date object if called with a string, null otherwise
export function getDateOrNullField(
  arg: string | null | undefined,
): Date | null {
  if (typeof arg === 'string') {
    return stringToDate(arg)
  }

  return null
}

/*
  Create a new community article
  https://api-doc.allthings.me/#/CommunityArticles/post_users__userID__community_articles
*/

export type MethodCommunityArticleCreate = (
  userId: string,
  data: PartialCommunityArticle & {
    readonly category: string
    readonly channels: ReadonlyArray<string>
    readonly content: string
    readonly title: string
  },
) => CommunityArticleResult

export async function communityArticleCreate(
  client: InterfaceAllthingsRestClient,
  userId: string,
  data: PartialCommunityArticle,
): CommunityArticleResult {
  return mapCommunityArticleDateFields(
    await client.post(`/v1/users/${userId}/community-articles`, data),
  )
}

/*
  Get a community article by ID
  https://api-doc.allthings.me/#/CommunityArticles/get_community_articles__communityArticleID
*/

export type MethodCommunityArticleGetById = (
  communityArticleId: string,
) => CommunityArticleResult

export async function communityArticleGetById(
  client: InterfaceAllthingsRestClient,
  communityArticleId: string,
): CommunityArticleResult {
  return mapCommunityArticleDateFields(
    await client.get(`/v1/community-articles/${communityArticleId}`),
  )
}

/*
  Delete a community article by ID
  https://api-doc.allthings.me/#/CommunityArticles/delete_community_articles__communityArticleID_
*/

export type MethodCommunityArticleDelete = (
  communityArticleId: string,
  type?: undefined | 'softDelete',
) => Promise<boolean>

export async function communityArticleDelete(
  client: InterfaceAllthingsRestClient,
  communityArticleId: string,
  type?: undefined | 'softDelete',
): Promise<boolean> {
  const query = getQueryString({ type })

  return (
    (await client.delete(
      `/v1/community-articles/${communityArticleId}${query}`,
    )) === ''
  )
}

/*
  Update a community article by ID
  https://api-doc.allthings.me/#/CommunityArticles/patch_community_articles__communityArticleID
*/

export type MethodCommunityArticleUpdate = (
  communityArticleId: string,
  data: PartialCommunityArticle,
) => CommunityArticleResult

export async function communityArticleUpdate(
  client: InterfaceAllthingsRestClient,
  communityArticleId: string,
  data: PartialCommunityArticle,
): CommunityArticleResult {
  return mapCommunityArticleDateFields(
    await client.patch(`/v1/community-articles/${communityArticleId}`, data),
  )
}

/*
  List all community articles for a user based on their utilisation periods
  https://api-doc.allthings.me/#/CommunityArticles/get_community_articles
*/

export type MethodCommunityArticlesGet = (
  filter?: string,
) => CommunityArticleCollectionResult

export async function communityArticlesGet(
  client: InterfaceAllthingsRestClient,
  filter?: string,
): CommunityArticleCollectionResult {
  const query = getQueryString({ filter })

  return mapCommunityArticleCollectionDateFields(
    await client.get(`/v2/community-articles${query}`),
  )
}

/*
  Get community article stats by user ID
  https://api-doc.allthings.me/#/CommunityArticles/Stats/get_users__userId__community_article_stats
*/

export type MethodCommunityArticleStatsGetByUser = (
  userId: string,
  appFilter?: string,
) => CommunityArticleStatsResult

export async function communityArticleStatsGetByUser(
  client: InterfaceAllthingsRestClient,
  userId: string,
  filter?: string,
): CommunityArticleStatsResult {
  const query = getQueryString({ filter })

  return client.get(`/v1/users/${userId}/community-article-stats${query}`)
}

/*
  Create a like for a community article by community article ID
  https://api-doc.allthings.me/#/CommunityArticles/Likes/post_community_articles__communityArticleID__likes
*/

export type MethodCommunityArticleCreateLike = (
  communityArticleId: string,
) => Promise<boolean>

export async function communityArticleCreateLike(
  client: InterfaceAllthingsRestClient,
  communityArticleId: string,
): Promise<boolean> {
  return (
    (await client.post(
      `/v1/community-articles/${communityArticleId}/likes`,
    )) === ''
  )
}

/*
  Delete a like for a community article by community article ID
  https://api-doc.allthings.me/#/CommunityArticles/Likes/delete_community_articles__communityArticleID__likes
*/

export type MethodCommunityArticleDeleteLike = (
  communityArticleId: string,
) => Promise<boolean>

export async function communityArticleDeleteLike(
  client: InterfaceAllthingsRestClient,
  communityArticleId: string,
): Promise<boolean> {
  return (
    (await client.delete(
      `/v1/community-articles/${communityArticleId}/likes`,
    )) === ''
  )
}

/*
  Get all likes for a community article by community article ID
  https://api-doc.allthings.me/#/CommunityArticles/Likes/get_community_articles__communityArticleID__likes
*/

export type MethodCommunityArticleGetLikes = (
  communityArticleId: string,
  filter?: string,
) => LikeCollectionResult // @TODO

export async function communityArticleGetLikes(
  client: InterfaceAllthingsRestClient,
  communityArticleId: string,
  filter?: string,
): LikeCollectionResult {
  const query = getQueryString({ filter })

  return client.get(
    `/v1/community-articles/${communityArticleId}/likes${query}`,
  )
}
