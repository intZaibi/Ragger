import test from "node:test";
import assert from "node:assert/strict";
import { ownsCollection, validateName, makeCollectionName, notebookName, VECTOR_SIZE } from "../src/lib/notebooks.mjs";
import { isPublicIPv4, fetchPublicPage } from "../src/lib/public-page.mjs";

test("collection ownership uses the full user ID and an unambiguous separator", () => {
  assert.equal(ownsCollection("user_123456a", "user_123456a--notes-12345678"), true);
  assert.equal(ownsCollection("user_123456b", "user_123456a--notes-12345678"), false);
  assert.equal(ownsCollection("user_123", "user_123456a--notes-12345678"), false);
  assert.equal(ownsCollection("", "--notes"), false);
  assert.equal(ownsCollection("user_123", "user_123--"), false);
  assert.equal(ownsCollection("user_123", null), false);
  assert.equal(ownsCollection("user_123", "user_123-notes"), false);
});

test("notebook names validate, normalize, and preserve a unique suffix", () => {
  assert.equal(validateName("  Reading notes  "), "Reading notes");
  for (const invalid of ["", " ", "a".repeat(81), null, 123]) assert.throws(() => validateName(invalid));
  const first = makeCollectionName("user_abc", "Café & Notes", "1234abcd");
  assert.equal(first, "user_abc--cafe-notes-1234abcd");
  assert.equal(notebookName(first, "user_abc"), "cafe notes");
  assert.notEqual(first, makeCollectionName("user_abc", "Café & Notes", "abcd1234"));
  assert.equal(makeCollectionName("user_abc", "کتاب", "1234abcd"), "user_abc--notebook-1234abcd");
  assert.equal(VECTOR_SIZE, 3072);
});

test("URL ingestion rejects internal, loopback, link-local and reserved networks", () => {
  for (const address of ["127.0.0.1","10.20.30.40","172.16.0.1","192.168.1.1","169.254.169.254","0.0.0.0","100.64.0.1","198.18.0.1","224.0.0.1","255.255.255.255","::1","::ffff:127.0.0.1","not-an-ip"]) assert.equal(isPublicIPv4(address), false, address);
  assert.equal(isPublicIPv4("8.8.8.8"), true);
  assert.equal(isPublicIPv4("1.1.1.1"), true);
});

test("URL ingestion rejects unsafe protocols, credentials, ports and private addresses before fetching", async () => {
  for (const url of ["file:///etc/passwd","http://example.com","https://user:pass@example.com","https://example.com:8443","https://127.0.0.1","https://2130706433","https://0x7f000001"]) await assert.rejects(fetchPublicPage(url), undefined, url);
});
