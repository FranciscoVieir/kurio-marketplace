export async function enableMocking() {
  const { worker } = await import(
    './browser'
  )

  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}