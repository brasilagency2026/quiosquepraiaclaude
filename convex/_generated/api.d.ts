/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as cardapio from "../cardapio.js";
import type * as crons from "../crons.js";
import type * as encryption from "../encryption.js";
import type * as http from "../http.js";
import type * as kiosques from "../kiosques.js";
import type * as notifications from "../notifications.js";
import type * as pagamentos from "../pagamentos.js";
import type * as pedidos from "../pedidos.js";
import type * as pinAuth from "../pinAuth.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  cardapio: typeof cardapio;
  crons: typeof crons;
  encryption: typeof encryption;
  http: typeof http;
  kiosques: typeof kiosques;
  notifications: typeof notifications;
  pagamentos: typeof pagamentos;
  pedidos: typeof pedidos;
  pinAuth: typeof pinAuth;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
