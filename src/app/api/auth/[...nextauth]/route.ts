import { mergeAnonToUser } from "@/library/database/cart";
import { prisma } from "@/library/database/prisma";
import { env } from "@/library/env";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

export const authOpt: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {
        session({session, user}) {
            session.user.id = user.id
            return session;
        },
    },
    events: {
        async signIn({user}) {
            await mergeAnonToUser(user.id);
        }
    }
},
CredentialsProvider({
        	name: "Credentials",
        	credentials: {
            	email: { label: "email", type: "text", placeholder: "x@example.com" },
            	password: { label: "Password", type: "password" }
        	},
        	async authorize(credentials, req) {
            	if (!credentials || !credentials.email || !credentials.password) {
                	return null;
            	}

            	const user= await prisma.user.findUnique({
                	where: { email: credentials.email }
            	});
            	if (!user) {
                	//console.log("WORKS");
                	return null
            	}
              const passwordsMatch = await bcrypt.compare(credentials.password, user.hashedPassword);
              if(!passwordsMatch){
                return null;
              }
              else{
                return user;
              }

        	}
    	}),
	],
	session: {
    strategy: "jwt"
  },
secret: env.NEXTAUTH_SECRET
}


const handler = NextAuth(authOpt);
export { handler as GET, handler as POST }



