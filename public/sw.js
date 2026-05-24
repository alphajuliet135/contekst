self.addEventListener('install', () => {
  // Hold in waiting — don't skip waiting until user taps Refresh
})

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
