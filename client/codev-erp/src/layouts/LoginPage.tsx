import { useState } from "react";
import type { JSX } from "react";
import { motion } from "framer-motion";
import type {LoginUser} from "../constants/types.ts";
import {loginRequest} from "../net/HttpRequests.ts";

const roles: { label: string; value: "staff" | "student" | "admin"; icon: JSX.Element }[] = [
    {
        label: "Staff",
        value: "staff",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" strokeWidth="2" />
                <path d="M4 20c0-4 16-4 16 0" strokeWidth="2" />
            </svg>
        )
    },
    {
        label: "Student",
        value: "student",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6l-8 4 8 4 8-4-8-4z" strokeWidth="2" />
                <path d="M6 10v4c0 2 2.686 4 6 4s6-2 6-4v-4" strokeWidth="2" />
            </svg>
        )
    },
    {
        label: "Admin",
        value: "admin",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" strokeWidth="2" />
                <path d="M4 20c0-4 16-4 16 0" strokeWidth="2" />
            </svg>
        )
    }
];

export default function LoginPage() {
    const [user, setUser] = useState<LoginUser>({
        role: "staff",
        email: "",
        password: "",
        remember: false
    });


    const sendLoginRequest = async (e: any) => {

        e.preventDefault();
        console.log("Login request sent");

        if (!!user.email && !!user.password) {

            console.log("Login request sent with role:", user.role, "email:",
                user.email, "password:", user.password);


            const data = await loginRequest(user);

            // @ts-ignore
            if (data["success"]){
                location.reload();
            }


        } else {
            alert("Missing required fields");
        }



    }

    // @ts-ignore
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-100 to-green-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md p-8 rounded-xl shadow-md bg-white"
            >
                <div className="flex flex-col items-center mb-8">
                    <img src="http://localhost:8080/static/codev_logo.png" alt="Logo" className="w-auto h-16 mb-4" />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mb-6"
                >
                    <div className="mb-3 flex justify-center font-medium text-green-700">I am</div>
                    <div className="flex justify-center space-x-6">
                        {roles.map((r) => (
                            <motion.button
                                key={r.value}
                                type="button"
                                onClick={() =>

                                    setUser((u) => ({ ...u, role: r.value }))
                                }
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.97 }}
                                className={`flex flex-col items-center px-4 py-2 border rounded-full transition ${
                                    user.role === r.value
                                        ? "bg-green-400 text-white border-green-500"
                                        : "bg-transparent text-green-800 border-green-300 hover:border-green-400"
                                }`}
                            >
                                {r.icon}
                                <span className="mt-1 font-semibold">{r.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
                <form className="space-y-5" onSubmit={sendLoginRequest}>
                    <input
                        type="text"
                        placeholder="Email"
                        className="w-full py-3 px-4 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                        value={user.email}
                        onChange={(e) => setUser(u => ({ ...u, email: e.target.value }))}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full py-3 px-4 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                        value={user.password}
                        onChange={(e) => setUser(u => ({ ...u, password: e.target.value }))}
                    />
                    <motion.button
                        type="submit"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-green-400 hover:bg-green-500 text-white py-3 rounded-lg font-semibold transition"
                    >
                        Log in
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
