// One place for the suggestion filename rule. The status lives in the name, so listing the
// open ones never has to open a file:
//
//   <stamp>-<slug>.md              open
//   <stamp>-<slug>.deferred.md     any other status
//
// The slug comes from `[^a-z0-9]+ -> -`, so it never holds a dot. That makes the suffix
// safe to match on.
export const STATUSES = ['open', 'applied', 'rejected', 'deferred', 'needs-info'];

const SUFFIX = new RegExp(`\\.(${STATUSES.filter(s => s !== 'open').join('|')})\\.md$`);

/** @param name {string} @returns {string} */
export function statusOf(name) {
  const m = name.match(SUFFIX);
  return m ? m[1] : 'open';
}

/** Strip the status back off, giving the name the suggestion was written under.
 * @param name {string} @returns {string} */
export function baseOf(name) {
  return name.replace(SUFFIX, '.md');
}

/** @param name {string} @param status {string} @returns {string} */
export function nameFor(name, status) {
  const base = baseOf(name);
  return status === 'open' ? base : base.replace(/\.md$/, `.${status}.md`);
}
