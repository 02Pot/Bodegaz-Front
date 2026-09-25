import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/my-rental')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/my-rental"!</div>
}
