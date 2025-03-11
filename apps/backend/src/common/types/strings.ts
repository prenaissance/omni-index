/**
 * Matches a string union to a pattern. Use `*` as the wildcard character.
 * 
 * @example
 * type Events = MatchesPattern<
    "entry.*",
    "entry.created" | "entry.deleted" | "comment.created"
  >; // "entry.created" | "entry.deleted"
 */
export type MatchesPattern<
  Pattern extends string,
  Union extends string,
> = Pattern extends `${infer Start}*`
  ? Union extends `${Start}${infer _Rest}`
    ? Union
    : never
  : never;
