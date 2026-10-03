import HomeLayout from "@/layouts/HomeLayout";
import { authQueryOptions } from "@/lib/provider";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const currentUser = await context.queryClient.query(authQueryOptions);
    if (!currentUser) {
      throw redirect({ to: "/login" });
    }
  },
    component: () => (
    <HomeLayout>
      <Outlet />
    </HomeLayout>
  ),
});