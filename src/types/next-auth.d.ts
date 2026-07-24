import "next-auth";


declare module "next-auth" {
  interface User {
    _id?: string;
    isEmailVerified?: boolean;
    name?: string;
    email?: string;
    username?: string;

  }
  interface Session {
    user: {
      _id?: string;
      isEmailVerified?: boolean;
      name?: string;
      email?: string;
        username?: string;
    } & DefaultSession["user"];
  }
}