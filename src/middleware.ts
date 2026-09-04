import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/exams/:path*",
    "/topics/:path*",
    "/videos/:path*",
    "/settings/:path*",
    "/study/:path*",
    "/tercih/:path*",
    "/pomodoro/:path*",
  ],
};
