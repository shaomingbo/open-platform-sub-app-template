// Umi mock — dev-time API stubs.
//
// Umi enables mocks by default; no .umirc.ts entry needed. Format:
//   'METHOD /path': body | (req, res) => res.json(body)
//
// Replace `/api/health` with your sub-app's actual mock endpoints as you
// add business pages.

export default {
  'GET /api/health': { status: 'ok' },
};
