// The "owner" is the single Super Admin account with truly unrestricted
// access. Every other Super Admin account is a restricted tier that cannot
// touch financial settings, offering records, or admin management, and only
// gets a read-only Sunday School overview instead of full Sunday School
// management. See middleware/ownerOnly.js and middleware/auth.js's
// authorizeOwnerOr() for where this is enforced.
//
// Overridable via OWNER_EMAIL in .env so this isn't hardcoded per-deployment.
export const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'hamilton@ncc.org').toLowerCase();

export const isOwner = (admin) => !!admin?.email && admin.email.toLowerCase() === OWNER_EMAIL;
