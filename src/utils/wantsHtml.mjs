// Render server-side HTML only when the client explicitly requests it.
// Existing API clients (including the previous homework tests) keep JSON responses.
export function wantsHtml(req) {
  const accept = req.get('accept') || ''
  return accept.split(',').some((part) => part.trim().split(';')[0].toLowerCase() === 'text/html')
}
