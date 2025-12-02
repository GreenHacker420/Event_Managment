import { createAuthClient } from "better-auth/react";

// Better Auth client - baseURL should be the server URL (not including /api/auth)
// The client automatically appends the basePath
export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    fetchOptions: {
        credentials: "include",
    },
});

export const {
    signIn,
    signOut,
    signUp,
    useSession,
} = authClient;
