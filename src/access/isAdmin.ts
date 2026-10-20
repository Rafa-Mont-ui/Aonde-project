import type { Access } from "payload"

/** Only CMS editors (the `admins` auth collection) — never public app users. */
export const isAdmin: Access = ({ req }) => req.user?.collection === "admins"
