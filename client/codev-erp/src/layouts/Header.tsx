import {Constants} from "../constants/constants.ts";
import {useAuth} from "../providers/AuthProvider.tsx";
import {motion} from "framer-motion";
import {Link} from "wouter";

export const Header = () => {

    const { currentUser } = useAuth();

    return (

        <div>

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center mb-8">

                <Link to={"/"}>

                    <img
                        alt={"Logo"}
                        className={"w-auto h-16"}
                        src={`${Constants.SERVER_URL}/static/codev_logo.png`}

                    />

                </Link>

                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-green-700 mb-4 md:mb-0"
                >
                    {currentUser?.firstName && `Welcome, ${currentUser?.firstName}`}


                </motion.h1>

            </div>

        </div>



    )


}