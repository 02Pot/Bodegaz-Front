import HomeLayout from "@/layouts/HomeLayout";
import { authQueryOptions } from "@/lib/provider";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query(authQueryOptions);
    if (!user) {
      throw redirect({ to: "/login" });
    }
  },
    component: () => (
    <HomeLayout>
      <Outlet />
    </HomeLayout>
  ),
});