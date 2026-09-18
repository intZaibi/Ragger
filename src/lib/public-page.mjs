import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { BlockList, isIP } from "node:net";
const blocked = new BlockList();
for (const [address, prefix] of [["0.0.0.0",8],["10.0.0.0",8],["100.64.0.0",10],["127.0.0.0",8],["169.254.0.0",16],["172.16.0.0",12],["192.168.0.0",16],["192.0.0.0",24],["192.0.2.0",24],["198.18.0.0",15],["198.51.100.0",24],["203.0.113.0",24],["224.0.0.0",4],["240.0.0.0",4]]) blocked.addSubnet(address, prefix, "ipv4");
export function isPublicIPv4(address) { return isIP(address) === 4 && !blocked.check(address, "ipv4"); }
export async function fetchPublicPage(value, redirects = 0) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) throw new Error("Use a public HTTPS web page.");
  const addresses = await lookup(url.hostname, { all: true, family: 4 });
  if (!addresses.length || addresses.some(({ address }) => !isPublicIPv4(address))) throw new Error("This web address is not supported.");
  // Pin the validated DNS answer for the connection, including every redirect.
  const pinned = addresses[0];
  const response = await new Promise((resolve, reject) => {
    const req = request(url, { agent: false, headers: { "User-Agent": "Marginalia/1.0", Accept: "text/html,text/plain" }, lookup: (_host, options, callback) => options.all ? callback(null, [pinned]) : callback(null, pinned.address, pinned.family) }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400) { res.resume(); resolve({ redirect: res.headers.location }); return; }
      if (res.statusCode !== 200) { res.resume(); reject(new Error("The web page could not be loaded.")); return; }
      if (!/text\/(html|plain)/i.test(res.headers["content-type"] || "")) { res.resume(); reject(new Error("This URL must point to a web page or plain text.")); return; }
      let size = 0;
      const chunks = [];
      res.on("data", chunk => { size += chunk.length; if (size > 2 * 1024 * 1024) req.destroy(new Error("Web page exceeds the 2 MB limit.")); else chunks.push(chunk); });
      res.on("end", () => resolve({ text: Buffer.concat(chunks).toString("utf8") }));
      res.on("error", reject);
    });
    req.setTimeout(15000, () => req.destroy(new Error("Web page timed out.")));
    req.on("error", reject);
    req.end();
  });
  if ("redirect" in response) {
    if (!response.redirect || redirects >= 3) throw new Error("Too many redirects.");
    return fetchPublicPage(new URL(response.redirect, url).href, redirects + 1);
  }
  return response.text;
}
