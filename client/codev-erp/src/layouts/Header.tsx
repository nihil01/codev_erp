import {Constants} from "../constants/constants.ts";
import {useAuth} from "../providers/AuthProvider.tsx";
import {motion} from "framer-motion";
import {Link, useLocation} from "wouter";
import {useState} from "react";
import {logout} from "../net/HttpRequests.ts";

export const Header = () => {

    const { currentUser, isLoggedIn } = useAuth();
    const [open, setOpen] = useState(false);
    const [location, navigate] = useLocation();

    return (

        <div className="max-w-6xl mx-auto flex gap-6 md:flex-row md:justify-between md:items-center mb-8 order-1">

            <Link to={"/"}>

                <img
                    alt={"Logo"}
                    className={"w-auto h-16"}
                    src={`${Constants.SERVER_URL}/static/codev_logo.png`}

                />

            </Link>

            {
                location !== "/login" && (
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold text-green-700 mb-4 md:mb-0 text-center md:text-left"
                    >
                        {currentUser?.firstName && `Welcome, ${currentUser?.firstName}`}


                    </motion.h1>
                )
            }


            {isLoggedIn && location !== "/login" && (

                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="absolute right-5 mt-2 w-20 rounded-xl shadow-lg bg-white border border-green-100 z-50"
                >
                    <button
                        onClick={() => setOpen(o => !o)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow"
                    >
                        Menu
                    </button>
                </motion.div>
            )}


            {open && (
                <div className="absolute right-30 mt-2 w-36 rounded-xl shadow-lg bg-white border z-40">
                    <Link
                        to="/profile"
                        className="block px-4 py-2 text-green-900 hover:bg-green-100 rounded-t-xl transition"
                        onClick={() => setOpen(false)}
                    >
                        Profile
                    </Link>
                    <button
                        className="block w-full px-4 py-2 text-red-500 hover:bg-green-100 rounded-b-xl transition"
                        onClick={() => {
                            logout().then();
                            setOpen(false);
                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>
                </div>
            )}

        </div>


    )


}