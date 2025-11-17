import { useState } from "react";
import type { JSX } from "react";
import { motion } from "framer-motion";
import type {LoginUser} from "../constants/types.ts";
import {loginRequest} from "../net/HttpRequests.ts";
import {useLocation} from "wouter";

const roles: { label: string; value: "teacher" | "student" | "admin" | "lead" | "sales"; icon: JSX.Element }[] = [
    {
        label: "Teacher",
        value: "teacher",
        icon: (
            // Teacher: книгу/доску
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="14" rx="2" strokeWidth="2" />
                <path d="M7 8h10M7 12h4" strokeWidth="2" />
            </svg>
        )
    },

    {
        label: "Student",
        value: "student",
        icon: (
            // Student: шапка выпускника
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6l-9 4.5 9 4.5 9-4.5-9-4.5z" strokeWidth="2" />
                <path d="M12 15v5" strokeWidth="2" />
                <path d="M7 12.5v2.5c0 2 2.686 3.5 5 3.5s5-1.5 5-3.5v-2.5" strokeWidth="2" />
            </svg>
        )
    },

    {
        label: "Admin",
        value: "admin",
        icon: (
            // Admin: иконка щита с галочкой — символ безопасности и управления
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M12 2l7 4v6c0 5-5 8-7 8s-7-3-7-8V6l7-4z" />
                <path strokeWidth="2" d="M9 12l2 2 4-4" />
            </svg>
        )
    },

    {
        label: "Lead",
        value: "lead",
        icon: (
            // Lead: иконка звезды — символ лидерства и достижения
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
            </svg>
        )
    },

    {
        label: "Sales",
        value: "sales",
        icon: (
            // Sales: значок графика роста/денежная монета
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="10" width="4" height="8" strokeWidth="2" />
                <rect x="9" y="6" width="4" height="12" strokeWidth="2" />
                <rect x="15" y="2" width="4" height="16" strokeWidth="2" />
                <path d="M3 18h18" strokeWidth="2" />
            </svg>
        )
    }
];

export default function LoginPage() {
    const [user, setUser] = useState<LoginUser>({
        role: "student",
        email: "",
        password: "",
        remember: false
    });

    const [_, navigate] = useLocation();


    const sendLoginRequest = async (e: any) => {

        e.preventDefault();
        console.log("Login request sent");

        if (!!user.email && !!user.password) {

            console.log("Login request sent with role:", user.role, "email:",
                user.email, "password:", user.password);


            const data = await loginRequest(user);

            // @ts-ignore
            if (data["success"]){
                navigate("/dashboard");
            }else{
                alert(data.error)
            }


        } else {
            alert("Missing required fields");
        }



    }

    // @ts-ignore
    return (
        <div className="order-2 min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-100 to-green-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md p-8 rounded-xl shadow-md bg-white"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mb-6"
                >
                    <div className="mb-3 flex justify-center font-medium text-green-700">I am</div>
                    <div className="grid grid-cols-3 gap-4 text-center ">
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
