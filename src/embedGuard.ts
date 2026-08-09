// 直接アクセスは、正式な配布先である埋め込みページへ集約する。
export const HOST_PAGE_URL = 'https://vrceve.com/tools/thumbnail/'

const PRODUCTION_HOSTS = ['youtube-thumbnail-maker.cuckoo-mailbox000.workers.dev']

export function shouldRedirectToHostPage(hostname: string, isFramed: boolean): boolean {
  if (isFramed) {
    return false
  }
  return PRODUCTION_HOSTS.includes(hostname)
}

export function redirectToHostPageIfStandalone(): boolean {
  const isFramed = window.self !== window.top
  if (!shouldRedirectToHostPage(window.location.hostname, isFramed)) {
    return false
  }
  window.location.replace(HOST_PAGE_URL)
  return true
}
