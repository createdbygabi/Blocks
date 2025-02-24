export function getAuthCookiePrefix(host) {
  if (!host) return "sb-main";
  const subdomain = host.split(".")[0];
  return subdomain === "localhost" ? "sb-main" : `sb-${subdomain}`;
}
