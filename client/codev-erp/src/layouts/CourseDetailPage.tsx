import { useState, useEffect } from "react";
import {AnimatePresence, motion } from "framer-motion";
import {Link, useParams} from "wouter";
import { Constants } from "../constants/constants.ts";
import type {Course, Lesson, UserHomeworkResponse} from "../constants/types.ts";
import {useAuth} from "../providers/AuthProvider.tsx";
import StudentSubmissionsList from "./StudentSubmissionList.tsx";

export default function CourseDetailPage() {
    const { id } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchCourse();
        fetchLessons();
    }, [id]);

    const fetchCourse = async () => {
        const response = await fetch(`${Constants.SERVER_URL}/courses/${id}`, {
            credentials: "include"
        });
        if (response.ok) {
            const data = await response.json();
            setCourse(data);
        }
    };

    const fetchLessons = async () => {
        const response = await fetch(`${Constants.SERVER_URL}/lessons/${id}`, {
            credentials: "include"
        });
        if (response.ok) {
            const data = await response.json();
            setLessons(data);
        }
    };


    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-200">
                <span className="text-green-500 font-bold text-xl">Loading...</span>
            </div>
        );
    }

    return (
        <div className="order-2 min-h-screen bg-gradient-to-b from-green-50 to-green-200 px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Шапка курса */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6 mb-6"
                >
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Превью курса */}
                        <img
                            src={`${Constants.SERVER_URL}/static/${course.previewImage}`}
                            alt={course.name}
                            className="w-full md:w-48 h-48 object-cover rounded-xl shadow"
                        />

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-green-700 mb-2">{course.name}</h1>
                            <p className="text-green-600 mb-4 whitespace-pre-line">{course.description}</p>

                            <div className="flex flex-wrap gap-4 text-sm items-center">
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                                    <img
                                        src={`${Constants.SERVER_URL}/static/${course.teacher.avatar}`}
                                        alt={`${course.teacher.firstName} ${course.teacher.lastName}`}
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span>
                                        Mentor: <Link to={`/profile/${course.teacher.id}`}>{course.teacher.firstName} {course.teacher.lastName}</Link></span>
                                </div>

                                {/* Количество уроков */}
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">Lessons: {lessons.length}</span>
                            </div>
                        </div>
                    </div>

                </motion.div>

                {currentUser?.role === "teacher" && (
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-green-700">Lessons</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAddLesson(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 shadow"
                        >
                            + Add Lesson
                        </motion.button>
                    </div>
                )}


                {/* Список уроков */}
                <div className="space-y-4">
                    {lessons.map((lesson, index) => (
                        <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            index={index}
                            onClick={() => setSelectedLesson(lesson)}
                        />
                    ))}
                    {lessons.length === 0 && (
                        <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                            No lessons yet.
                        </div>
                    )}
                </div>

                {/* Модальное окно добавления урока */}
                {showAddLesson && (
                    <AddLessonModal
                        courseId={Number(id)}
                        onClose={() => setShowAddLesson(false)}
                        onSuccess={() => {
                            fetchLessons();
                            setShowAddLesson(false);
                        }}
                    />
                )}

                {/* Модальное окно деталей урока */}
                {selectedLesson && (
                    <LessonDetailModal
                        lesson={selectedLesson}
                        onClose={() => setSelectedLesson(null)}
                        onUpdate={fetchLessons}
                    />
                )}
            </div>
        </div>
    );
}

// --- КАРТОЧКА УРОКА ---
function LessonCard({ lesson, index, onClick }: { lesson: Lesson; index: number; onClick: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(34,197,94,0.15)" }}
            onClick={onClick}
            className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer"
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-700 mb-2">{lesson.name}</h3>
                    <p className="text-green-600 text-sm mb-3 line-clamp-2">{lesson.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {lesson.tasks && lesson.tasks.length > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                📎 {lesson.tasks.length} files
                            </span>
                        )}
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            📝 Added at: {new Date(lesson.startDate).toDateString()}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// --- МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ УРОКА ---
function AddLessonModal({ courseId, onClose, onSuccess }: {
    courseId: number;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async () => {

        const response = await fetch(`${Constants.SERVER_URL}/lessons`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                name: title,
                description: description,
                courseId: courseId,
            })
        });

        if (response.ok) {
            onSuccess();
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-green-700">Create New Lesson</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl">
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-green-700 font-semibold mb-2">Lesson Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Enter lesson title"
                            className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                    </div>

                    <div>
                        <label className="block text-green-700 font-semibold mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What was covered in this lesson?"
                            rows={4}
                            className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
                        >
                            Create Lesson
                        </motion.button>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}


function LessonDetailModal({ lesson, onClose, onUpdate }: {
    lesson: Lesson;
    onClose: () => void;
    onUpdate: () => void;
}) {
    const [activeTab, setActiveTab] = useState<"sendTasks" | "viewGrades" | "show" | "rate" | "screenrecord" | "add">("show");
    const [homeworkFiles, setHomeworkFiles] = useState<File[]>([]);
    const [classworkFiles, setClassworkFiles] = useState<File[]>([]);
    const [userHwFiles, setUserHwFiles] = useState<File[]>([]);

    const [recording, setRecording] = useState<boolean>(false);
    const [homeworkFileNames, setHomeworkFileNames] = useState<string[]>([]);
    const [classworkFileNames, setClassworkFileNames] = useState<string[]>([]);
    // @ts-ignore
    const [userHw, setUserHw] = useState<UserHomeworkResponse>(null);

    const { currentUser } = useAuth();


    useEffect(() => {

        fetch(`${Constants.SERVER_URL}/lesson_tasks/${lesson.id}`, {
            method: "GET",
            credentials: "include",
        })
            .then(response => response.json())
            .then(data => {
                console.log("Arrived data")
                console.log(data)
                if (data) {
                    setHomeworkFileNames(data["homework"]);
                    setClassworkFileNames(data["classwork"]);
                }
        })}, [])


    useEffect(() => {

        fetch(`${Constants.SERVER_URL}/lesson_tasks/get_grades?lessonId=${lesson.id}&userId=${currentUser?.id}`, {
            method: "GET",
            credentials: "include",
        })
            .then(response => response.json())
            .then(data => {
                console.log("Arrived personal user's data")
                console.log(data)
                if (data) {
                    setUserHw(data);
                }
            })}, [])

    const handleHomeworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setHomeworkFiles(Array.from(e.target.files));
        }
    };

    const handleClassworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setClassworkFiles(Array.from(e.target.files));
        }
    };

    const handleUserHwFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setUserHwFiles(Array.from(e.target.files));
        }
    };

    const uploadTasks = async () => {
        const formData = new FormData();
        formData.append("lessonId", String(lesson.id));

        homeworkFiles.forEach((file) => {
            formData.append("homework_files", file);
        });

        classworkFiles.forEach((file) => {
            formData.append("classwork_files", file);
        });

        const result = await fetch(`${Constants.SERVER_URL}/lesson_tasks`, {
            method: "POST",
            credentials: "include",
            body: formData
        });

        const data = await result.json();

        if (data["success"]) {
            alert("Tasks uploaded successfully!");
            setHomeworkFiles([]);
            setClassworkFiles([]);
            onUpdate();
        } else {
            alert("Failed to upload tasks. Please try again.");
        }
    };

    const uploadHomework = async () => {
        const formData = new FormData();
        formData.append("lessonId", String(lesson.id));
        formData.append("userId", String(currentUser?.id));

        userHwFiles.forEach((file) => {
            formData.append("homework_files", file);
        });


        const result = await fetch(`${Constants.SERVER_URL}/lesson_tasks/homework`, {
            method: "POST",
            credentials: "include",
            body: formData
        });

        const data = await result.json();

        if (data["success"]) {
            alert(data["success"]);
            setHomeworkFiles([]);
            setClassworkFiles([]);
            onUpdate();

        } else {
            alert(data["error"]);

        }
    };

    const proceedScreenRecord = async (recording: boolean) => {
        try {
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            const mediaRecorder = new MediaRecorder(mediaStream);
            let recordedChunks: Blob[] = [];

            mediaRecorder.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            })

            mediaRecorder.addEventListener('stop', () => {
                saveFile(recordedChunks);
                setRecording(false);
            })

            mediaRecorder.addEventListener('error', (event) => {
                console.error('MediaRecorder error:', event);
                saveFile(recordedChunks);
                setRecording(false);
            })


            if (recording) {
                mediaRecorder.start();
            }else{
                mediaRecorder.stop();
            }


        } catch (err) {
            alert("Error: " + err);
            setRecording(false);
        }


        async function saveFile(recordedChunks: Blob[]){

            const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(recordedBlob);
            console.log(videoUrl)
            const anchorElement = document.createElement('a');
            anchorElement.href = videoUrl;
            anchorElement.download = `screenrecord_${new Date().toDateString()
                .toLowerCase().replace(" ", "_")}.mp4`;

            anchorElement.style.display = 'none'; // Hide the anchor element
            document.body.appendChild(anchorElement); // Add to DOM temporarily
            anchorElement.click(); // Programmatically click to trigger download

            anchorElement.remove();
            URL.revokeObjectURL(videoUrl);

            const formData = new FormData();
            formData.append("lessonId", String(lesson.id));
            formData.append("screenrecord", recordedBlob);
            formData.append("screenrecord_name", `screenrecord_${new Date().toDateString()
                .toLowerCase().replace(" ", "_")}.webm`)

            const data = await fetch(`${Constants.SERVER_URL}/lesson_tasks/screenrecord`, {
                method: "POST",
                credentials: "include",
                body: formData
            })

            const data2 = await data.json();
            console.log(data2)

            if (data2["success"]) {
                alert("Screen Recording saved successfully!");

            } else {
                alert("Failed to save Screen Recording. Please try again.");

            }



        }

    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-green-700">{lesson.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl">
                        ×
                    </button>
                </div>




                {/* Табы */}
                <div className="flex gap-2 mb-6 border-b border-green-200">
                    {
                        currentUser?.role === "teacher" && (

                            <button
                                onClick={() => setActiveTab("add")}
                                className={`pb-3 px-4 font-semibold transition ${
                                    activeTab === "add"
                                        ? "text-green-700 border-b-2 border-green-500"
                                        : "text-gray-500 hover:text-green-600"
                                }`}
                            >
                                Add Files
                            </button>

                    )}

                    <button
                        onClick={() => setActiveTab("show")}
                        className={`pb-3 px-4 font-semibold transition ${
                            activeTab === "show"
                                ? "text-green-700 border-b-2 border-green-500"
                                : "text-gray-500 hover:text-green-600"
                        }`}
                    >
                        Show Files
                    </button>

                    {
                        currentUser?.role === "teacher" && (

                            <button
                                onClick={() => setActiveTab("rate")}
                                className={`pb-3 px-4 font-semibold transition ${
                                    activeTab === "rate"
                                        ? "text-green-700 border-b-2 border-green-500"
                                        : "text-gray-500 hover:text-green-600"
                                }`}
                            >
                                Rate Students
                            </button>

                        )
                    }


                    {
                        currentUser?.role === "teacher" && (

                            <button
                                onClick={() => setActiveTab("screenrecord")}
                                className={`pb-3 px-4 font-semibold transition ${
                                    activeTab === "screenrecord"
                                        ? "text-green-700 border-b-2 border-green-500"
                                        : "text-gray-500 hover:text-green-600"
                                }`}
                            >
                                Record Screen
                            </button>

                        )
                    }


                    {
                        currentUser?.role === "student" && (

                            <button
                                onClick={() => setActiveTab("sendTasks")}
                                className={`pb-3 px-4 font-semibold transition ${
                                    activeTab === "screenrecord"
                                        ? "text-green-700 border-b-2 border-green-500"
                                        : "text-gray-500 hover:text-green-600"
                                }`}
                            >
                               Send Homework
                            </button>

                        )
                    }


                    {
                        currentUser?.role === "student" && (

                            <button
                                onClick={() => setActiveTab("viewGrades")}
                                className={`pb-3 px-4 font-semibold transition ${
                                    activeTab === "screenrecord"
                                        ? "text-green-700 border-b-2 border-green-500"
                                        : "text-gray-500 hover:text-green-600"
                                }`}
                            >
                                View Grades
                            </button>

                        )
                    }



                </div>

                {/* Контент табов */}
                <AnimatePresence mode="wait">
                    {/* TAB 1: Add Files */}
                    {activeTab === "add" && (
                        <motion.div
                            key="add"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {/* Homework Files */}
                            <div>
                                <label className="block text-green-700 font-semibold mb-2">📝 Homework Files</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleHomeworkChange}
                                    className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                                />
                                {homeworkFiles.length > 0 && (
                                    <div className="mt-2 text-sm text-green-600">
                                        {homeworkFiles.length} homework file(s) selected
                                    </div>
                                )}
                            </div>

                            {/* Classwork Files */}
                            <div>
                                <label className="block text-green-700 font-semibold mb-2">✏️ Classwork Files</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleClassworkChange}
                                    className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                                />
                                {classworkFiles.length > 0 && (
                                    <div className="mt-2 text-sm text-green-600">
                                        {classworkFiles.length} classwork file(s) selected
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={uploadTasks}
                                    className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
                                >
                                    Upload Tasks
                                </motion.button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 2: Show Files */}
                    {activeTab === "show" && (
                        <motion.div
                            key="show"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="mb-6">
                                <div className="space-y-2">
                                    {homeworkFileNames && homeworkFileNames.length ||
                                    classworkFileNames && classworkFileNames.length ? (
                                        <>
                                            <h3 className="font-bold text-green-700 mb-3">📝 Homework Files</h3>
                                            {homeworkFileNames && homeworkFileNames.map(file => (
                                                <div key={file} className="bg-blue-50 p-3 rounded flex justify-between">
                                                    <span className="text-blue-700">📘 Homework: {file}</span>
                                                    <a href={`${Constants.SERVER_URL}/lesson_tasks/download/${file}`}>Download</a>
                                                </div>
                                            ))}

                                            <h3 className="font-bold text-green-700 mb-3">📝 Classwork Files</h3>
                                            {classworkFileNames && classworkFileNames.map(file => (
                                                <div key={file} className="bg-yellow-50 p-3 rounded flex justify-between">
                                                    <span className="text-yellow-700">🏫 Classwork: {file}</span>
                                                    <a href={`${Constants.SERVER_URL}/lesson_tasks/download/${file}`}>Download</a>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <p>No tasks</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 3: Rate Students */}
                    {activeTab === "rate" && (
                        <motion.div
                            key="rate"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <h3 className="font-bold text-green-700 mb-4">Student Submissions</h3>
                            <StudentSubmissionsList lessonId={lesson.id} />
                        </motion.div>
                    )}



                    {
                        activeTab === "screenrecord" && (
                            <>
                                <h3 className={"pb-4"}>Once saved, screen record uploads to server</h3>
                                <motion.button
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 shadow"
                                    onClick={() => {
                                        const newValue = !recording;
                                        setRecording(newValue);
                                        proceedScreenRecord(newValue);
                                    }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    {!recording ? "Start" : "Stop"}
                                </motion.button>
                            </>

                        )
                    }

                    {/* Classwork Files */}

                    {
                        activeTab === "sendTasks" && (
                            <>
                                <motion.div
                                    key="sendTasks"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <label className="block text-green-700 font-semibold mb-2">✏️ Send homework for examination</label>
                                    <motion.p
                                        transition={{ duration: 1 }}
                                        initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: 20 }}>

                                        ⚠️ Teacher will examine your homework, send it once you are confident about results !

                                    </motion.p>
                                    <br/>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleUserHwFilesChange}
                                        className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                                    />

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={uploadHomework}
                                        className="flex-1 py-3 mt-2 p-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
                                    >
                                        Upload Homework
                                    </motion.button>
                                </motion.div>
                            </>
                        )
                    }


                    {
                        activeTab === "viewGrades" && (
                            <motion.div
                                key="viewGrades"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-4"
                            >
                                <h3 className="font-bold text-green-700 text-xl mb-4">Your Grade {userHw.points}</h3>

                                {userHw.checked ? (
                                    <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                                        {/* Оценка */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-green-800 font-semibold text-lg">Points:</span>
                                            <span className="text-3xl font-bold text-green-600">{userHw.points}/10</span>
                                        </div>

                                        {/* Визуальная шкала */}
                                        <div className="mb-6">
                                            <div className="w-full bg-green-200 rounded-full h-3">
                                                <div
                                                    className="bg-green-500 h-3 rounded-full transition-all"
                                                    style={{ width: `${(userHw.points / 10) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Комментарий учителя */}
                                        <div>
                                            <h4 className="font-semibold text-green-700 mb-2">Teacher's Comment:</h4>
                                            <div className="bg-white p-4 rounded-lg border border-green-200">
                                                <p className="text-green-800 whitespace-pre-line">
                                                    {userHw.comment || "No comment provided"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 text-center">
                                        <div className="text-yellow-600 text-6xl mb-3">⏳</div>
                                        <h4 className="font-semibold text-yellow-700 text-lg mb-2">Awaiting Review</h4>
                                        <p className="text-yellow-600">
                                            Your homework has been submitted and is waiting to be checked by the teacher.
                                        </p>
                                        <p className="text-sm text-yellow-500 mt-3">
                                            Submitted on: {new Date(userHw.startDate).toLocaleDateString()} at {new Date(userHw.startDate).toLocaleTimeString()}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )
                    }

                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
