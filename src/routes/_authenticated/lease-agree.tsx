import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/lease-agree')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/lease-agree"!</div>
}
