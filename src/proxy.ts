import { NextResponse, type NextRequest } from "next/server";
import {
  ACCOUNT_COOKIE,
  ACCOUNT_PATH,
  accountHome,
  can,
  decodeAccountSession,
  decodeSession,
  LOGIN_PATH,
  permissionForPath,
  REVIEW_PATH,
  RIDER_PATH,
  SESSION_COOKIE,
  SESSION_PATH,
} from "@/lib/portal-access";

/**
 * Optimistic access check for logistics sign-in areas (Next.js 16 proxy). It
 * reads the two session cookies and sends everyone to the right place before
 * any page renders:
 * - partner portal: approved company staff (portal cookie)
 * - review status page: pending company or individual accounts (account cookie)
 * - rider area: active company and individual riders (account cookie)
 * - signed in on the sign-in page → their own home
 * - signed out → sign in (portal pages come back to where they were going)
 * - a manager opening a super-admin screen → overview
 *
 * This is not the security boundary: the cookies are a front-end mock. The
 * data layer checks the session on every call, as the real API must.
 */
const under = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const staff = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  const account = decodeAccountSession(request.cookies.get(ACCOUNT_COOKIE)?.value);
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  const toLogin = (keepNext: boolean) => {
    const url = new URL(LOGIN_PATH, request.url);
    if (keepNext) url.searchParams.set("next", pathname + search);
    // Portal staff and riders see their own "signed out" note on the sign-in page
    if (request.cookies.has(SESSION_COOKIE)) url.searchParams.set("reason", "expired");
    else if (request.cookies.has(ACCOUNT_COOKIE)) url.searchParams.set("reason", "account_expired");
    const res = NextResponse.redirect(url);
    res.cookies.delete({ name: SESSION_COOKIE, path: SESSION_PATH });
    res.cookies.delete({ name: ACCOUNT_COOKIE, path: ACCOUNT_PATH });
    return res;
  };

  if (pathname === LOGIN_PATH) {
    if (staff) return to(SESSION_PATH);
    if (account) return to(accountHome(account));
    return NextResponse.next();
  }

  if (under(pathname, REVIEW_PATH)) {
    if (account?.status === "pending_review") return NextResponse.next();
    if (account) return to(accountHome(account));
    if (staff) return to(SESSION_PATH);
    return toLogin(false);
  }

  if (under(pathname, RIDER_PATH)) {
    if (account?.status === "active") return NextResponse.next();
    if (account) return to(accountHome(account));
    if (staff) return to(SESSION_PATH);
    return toLogin(false);
  }

  // Partner portal
  if (!staff) {
    if (account) return to(accountHome(account));
    return toLogin(true);
  }

  const permission = permissionForPath(pathname);
  if (permission && !can(staff.role, permission)) {
    const url = new URL(SESSION_PATH, request.url);
    url.searchParams.set("denied", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/logistics/portal", "/logistics/portal/:path*", "/logistics/rider", "/logistics/rider/:path*"],
};
