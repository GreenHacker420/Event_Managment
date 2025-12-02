import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { Sparkles, Calendar, Users, CheckSquare, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { authApi, usersApi } from "../../lib/api";

export const LoginSignupView = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { loginAsGuest, checkSession } = useAppStore();
    const [searchParams, setSearchParams] = useSearchParams();

    const [csrfToken, setCsrfToken] = useState("");

    useEffect(() => {
        // Check for auth errors in URL
        const error = searchParams.get('error');
        if (error) {
            if (error === 'OAuthAccountNotLinked') {
                toast.error("This email is already registered. Please sign in with your password.");
            } else if (error === 'signin' || error === 'auth') {
                toast.error("Authentication failed. Please try again.");
            } else {
                toast.error(`Authentication error: ${error}`);
            }
            // Clear the error from URL
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        authApi.getCsrfToken()
            .then(data => setCsrfToken(data.csrfToken))
            .catch(err => console.error("Failed to fetch CSRF token", err));
    }, []);

    const handleGoogleSignIn = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const baseUrl = apiUrl ? (apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`) : '/api';
        form.action = `${baseUrl}/auth/signin/google`;

        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfToken';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        const callbackInput = document.createElement('input');
        callbackInput.type = 'hidden';
        callbackInput.name = 'callbackUrl';
        callbackInput.value = window.location.origin;
        form.appendChild(callbackInput);

        document.body.appendChild(form);
        form.submit();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                // Login with credentials
                const data = await authApi.signInCredentials({
                    email,
                    password,
                    csrfToken,
                    callbackUrl: window.location.origin,
                    redirect: "false",
                });

                if (data.error) {
                    toast.error(data.error || "Invalid email or password");
                } else {
                    // Successful login - check session
                    await checkSession();
                    toast.success("Welcome back!");
                }
            } else {
                // Register new user
                const data = await usersApi.register({ name, email, password });

                if (data.id) {
                    toast.success("Account created! Please sign in.");
                    setIsLogin(true);
                    setPassword("");
                } else {
                    toast.error(data.error || "Registration failed");
                }
            }
        } catch (error: any) {
            console.error("Auth error:", error);
            // Axios error handling
            const errorMessage = error.response?.data?.error || error.message || "Something went wrong";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const floatingIcons = [
        { Icon: Calendar, color: "bg-[#ffcc00]", delay: 0, x: "10%", y: "20%" },
        { Icon: Users, color: "bg-[#ff4d4d]", delay: 0.2, x: "85%", y: "15%" },
        { Icon: CheckSquare, color: "bg-[#4dffb8]", delay: 0.4, x: "15%", y: "75%" },
        { Icon: Sparkles, color: "bg-[#4d94ff]", delay: 0.6, x: "80%", y: "70%" },
    ];

    return (
        <div className="relative flex min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] overflow-hidden">
            {floatingIcons.map(({ Icon, color, delay, x, y }, i) => (
                <motion.div
                    key={i}
                    className={`absolute ${color} w-16 h-16 rounded-2xl border-2 border-[var(--color-ink)] flex items-center justify-center shadow-[4px_4px_0px_var(--color-ink)]`}
                    style={{ left: x, top: y }}
                    initial={{ opacity: 0, scale: 0, rotate: -20 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                        y: [0, -10, 0],
                    }}
                    transition={{
                        delay,
                        duration: 0.6,
                        y: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: delay + 0.6 }
                    }}
                >
                    <Icon size={28} className="text-[var(--color-ink)]" />
                </motion.div>
            ))}

            <div className="hidden lg:flex flex-1 items-center justify-center p-12">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="max-w-lg"
                >
                    <h1 className="font-serif text-7xl font-bold leading-tight mb-6">
                        Plan Events<br />
                        <span className="text-[var(--color-accent)]">Like Magic</span>
                    </h1>
                    <p className="font-hand text-2xl text-[var(--color-ink)]/60 mb-8">
                        Organize, collaborate, and create unforgettable moments with your team.
                    </p>
                    <div className="flex gap-4">
                        {["Weddings", "Corporate", "Birthdays", "Festivals"].map((tag, i) => (
                            <motion.span
                                key={tag}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="px-4 py-2 bg-white border-2 border-[var(--color-ink)] rounded-full font-hand text-sm shadow-[2px_2px_0px_var(--color-ink)]"
                            >
                                {tag}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="font-serif text-4xl font-bold mb-2">
                            Plan Events <span className="text-[var(--color-accent)]">Like Magic</span>
                        </h1>
                    </div>

                    <div className="relative">
                        <div className="absolute -top-4 -left-4 w-full h-full bg-[var(--color-accent)] rounded-3xl border-2 border-[var(--color-ink)]" />

                        <div className="relative bg-white border-2 border-[var(--color-ink)] p-8 rounded-3xl shadow-[8px_8px_0px_var(--color-ink)]">
                            <div className="flex gap-2 mb-8">
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`flex-1 py-3 font-serif font-bold text-lg rounded-xl transition-all ${isLogin
                                        ? "bg-[var(--color-ink)] text-white"
                                        : "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5"
                                        }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`flex-1 py-3 font-serif font-bold text-lg rounded-xl transition-all ${!isLogin
                                        ? "bg-[var(--color-ink)] text-white"
                                        : "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ink)]/5"
                                        }`}
                                >
                                    Sign Up
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.form
                                    key={isLogin ? "login" : "signup"}
                                    initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="block font-hand text-sm text-[var(--color-ink)]/60 mb-2">Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-ink)]/20 rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--color-ink)] transition-colors font-serif text-lg"
                                                placeholder="Your name"
                                            />
                                        </motion.div>
                                    )}

                                    <div>
                                        <label className="block font-hand text-sm text-[var(--color-ink)]/60 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-ink)]/20 rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--color-ink)] transition-colors font-serif text-lg"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-hand text-sm text-[var(--color-ink)]/60 mb-2">Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-ink)]/20 rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--color-ink)] transition-colors font-serif text-lg"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>

                                    {isLogin && (
                                        <div className="text-right">
                                            <button type="button" className="font-hand text-sm text-[var(--color-ink)]/60 hover:text-[var(--color-accent)] transition-colors">
                                                Forgot password?
                                            </button>
                                        </div>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[var(--color-ink)] text-white font-serif font-bold py-4 text-lg rounded-xl flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <>
                                                {isLogin ? "Sign In" : "Create Account"}
                                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </motion.button>
                                </motion.form>
                            </AnimatePresence>

                            <div className="mt-8 pt-6 border-t-2 border-dashed border-[var(--color-ink)]/20">
                                <p className="text-center font-hand text-sm text-[var(--color-ink)]/50 mb-4">Or continue with</p>
                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    className="w-full py-3 border-2 border-[var(--color-ink)]/20 rounded-xl font-serif hover:border-[var(--color-ink)] hover:shadow-[2px_2px_0px_var(--color-ink)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => loginAsGuest('Guest')}
                                    className="w-full mt-3 py-3 text-[var(--color-ink)]/60 font-hand hover:text-[var(--color-ink)] transition-colors"
                                >
                                    Continue as Guest →
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
