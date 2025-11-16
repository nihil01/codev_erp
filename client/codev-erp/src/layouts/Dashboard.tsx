import { motion } from "framer-motion";
import {Link} from "wouter";
import {useAuth} from "../providers/AuthProvider.tsx";
import {useEffect, useState} from "react";
import type {Course} from "../constants/types.ts";
import {getCourses} from "../net/HttpRequests.ts";
import {Constants} from "../constants/constants.ts";

export default function Dashboard() {
    const { currentUser } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {

        getCourses().then(res => {

            if (res){
                setCourses(res);
                console.log(res);
            }

        })


    },[])

    return (
        <>
            <div className="order-2 min-h-screen bg-gradient-to-b from-green-50 to-green-200 px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                        }}
                    >
                        <h2 className="text-2xl mt-5 font-semibold text-green-700 mb-6">My Courses</h2>
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {courses.length > 0 ? courses.map(course => (
                                <motion.div
                                    whileHover={{ scale: 1.04, boxShadow: "0 6px 28px -5px rgba(34,197,94,0.2)" }}
                                    key={course.id}
                                    className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition cursor-pointer flex flex-col"
                                >
                                    <img
                                        src={Constants.SERVER_URL + "/static/" + course.previewImage}
                                        alt={course.name}
                                        className="w-full h-40 object-cover rounded-xl mb-3"
                                    />
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-xl text-green-700">{course.name}</h3>
                                        <span className="text-green-400 font-bold italic">{course.duration} months</span>
                                    </div>
                                    {currentUser?.role === "student" && <p className={"text-grey-600"}>Mentor:
                                        {course.teacher ? course.teacher.firstName + " " + course.teacher.lastName : "NOT_ASSIGNED"}</p>}
                                    <p className="text-green-600 text-sm mb-2 line-clamp-5">{course.description}</p>
                                    <Link
                                        to={`/courses/${course.id}`}
                                        className="mt-2 px-4 py-2 rounded bg-green-500 text-white font-semibold hover:bg-green-600 transition"
                                    >
                                        View course
                                    </Link>
                                </motion.div>
                            )): <p className="text-green-600 text-center text-4xl">No courses available</p>}
                        </div>
                    </motion.div>
                </div>
            </div>
        </>

    );
}
