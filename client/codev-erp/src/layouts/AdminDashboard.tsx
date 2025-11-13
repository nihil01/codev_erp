import {useState, useEffect} from "react";
import { motion } from "framer-motion";
import type {Course, UserResponse} from "../constants/types.ts";
import { Constants } from "../constants/constants.ts";
import {Link} from "wouter";
import {logout} from "../net/HttpRequests.ts";

type Tab = "courses" | "users" | "staff";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("courses");
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [staff, setStaff] = useState<UserResponse[]>([]);
    const [open, setOpen] = useState(false);

    // Загрузка данных при смене табов
    useEffect(() => {
        if (activeTab === "courses") {
            fetchCourses();
            fetchStaff();
            fetchUsers();

        } else if (activeTab === "users") {
            fetchUsers();
        } else if (activeTab === "staff") {
            fetchStaff();
        }
    }, [activeTab]);

    const fetchCourses = async () => {
        const response = await fetch(`${Constants.SERVER_URL}/courses`, {credentials: "include"});
        if (response.ok) {
            const data = await response.json();
            setCourses(data);
        }
    };

    const fetchUsers = async () => {
        const response = await fetch(`${Constants.SERVER_URL}/get_users?students=true`,
            {credentials: "include"});

        if (response.ok) {
            const data = await response.json();
            setUsers(data);
        }
    };

    const fetchStaff = async () => {
        const response = await fetch(`${Constants.SERVER_URL}/get_users?students=false`,
            {credentials: "include"});

        if (response.ok) {
            const data = await response.json();
            setStaff(data);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-200 px-4 py-8">

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

                {open && (
                    <div className="absolute right-0 mt-2 w-36 rounded-xl shadow-lg bg-white border z-40">
                        <Link
                            to="/profile"
                            className="block px-4 py-2 text-green-900 hover:bg-green-100 rounded-t-xl transition"
                            onClick={() => setOpen(false)}
                        >
                            Profile
                        </Link>
                        <button
                            className="block w-full px-4 py-2 text-red-500 hover:bg-green-100 rounded-b-xl transition"
                            onClick={() => { logout(); setOpen(false); }}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </motion.div>

            <div className="max-w-7xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-green-700 mb-8"
                >
                    Admin Dashboard
                </motion.h1>

                {/* Табы */}
                <div className="flex gap-4 mb-8 flex-wrap">
                    {(["courses", "users", "staff"] as Tab[]).map(tab => (
                        <motion.button
                            key={tab}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-lg font-semibold transition shadow ${
                                activeTab === tab
                                    ? "bg-green-500 text-white"
                                    : "bg-white text-green-700 hover:bg-green-100"
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </motion.button>
                    ))}
                </div>

                {/* Контент табов */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === "courses" && <CoursesTab users={users} staff={staff} courses={courses} setCourses={setCourses} />}
                    {activeTab === "users" && <UsersTab users={users} setUsers={setUsers} />}
                    {activeTab === "staff" && <StaffTab staff={staff} setStaff={setStaff}/>}
                </motion.div>
            </div>
        </div>
    );
}

// --- COURSES TAB ---
function CoursesTab({ courses, setCourses, staff, users }: { courses: Course[]; setCourses: (c: Course[]) => void,
    staff: UserResponse[], users: UserResponse[] }) {

    const [showForm, setShowForm] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showParticipants, setShowParticipants] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(1);
    const [previewImage, setPreviewImage] = useState<File | null>(null);
    const [teacher, setTeacher] = useState(0);

    useEffect(() => {
        if (staff && staff.length > 0) {
            setTeacher(staff[0].id);
        }
    }, [staff]);

    const handleAddCourse = async () => {
        const formData = new FormData();

        formData.append("name", name);
        formData.append("description", description);
        formData.append("duration", String(duration));
        formData.append("teacher_id", String(teacher));

        if (previewImage) {
            formData.append("preview_image", previewImage);
        }

        const response = await fetch(`${Constants.SERVER_URL}/courses`, {
            method: "POST",
            credentials: "include",
            body: formData
        });

        if (response.ok) {
            const newCourse = await response.json();
            setCourses([...courses, newCourse]);
            setShowForm(false);
            setName("");
            setDescription("");
            setDuration(1);
            setPreviewImage(null);
            setTeacher(staff[0]?.id || 0);

            location.reload();
        }
    };

    const handleDeleteCourse = async (id: number) => {
        const response = await fetch(`${Constants.SERVER_URL}/courses/${id}`,
            { method: "DELETE", credentials: "include" });
        if (response.ok) {
            setCourses(courses.filter(c => c.id !== id));
        }
    };

    const handleViewParticipants = (course: Course) => {
        setSelectedCourse(course);
        setShowParticipants(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-green-700">Courses</h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 shadow"
                >
                    {showForm ? "Cancel" : "Add Course"}
                </motion.button>
            </div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow mb-6"
                >
                    <h3 className="font-bold text-green-700 mb-4">New Course</h3>
                    <input
                        placeholder="Name"
                        className="w-full px-3 py-2 border rounded mb-3"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <textarea
                        placeholder="Description"
                        className="w-full px-3 py-2 border rounded mb-3"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Duration (in months)"
                        className="w-full px-3 py-2 border rounded mb-3"
                        value={duration}
                        onChange={e => setDuration(parseInt(e.target.value))}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full px-3 py-2 border rounded mb-3"
                        onChange={e => setPreviewImage(e.target.files?.[0] || null)}
                    />

                    <label htmlFor={"teacherSelect"} className="block text-green-700 mb-2">Teacher:</label>

                    <select
                        id={"teacherSelect"}
                        value={teacher}
                        onChange={e => setTeacher(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded mb-3"
                    >
                        {
                            staff && staff.map(member => (
                                <option key={member.id} value={member.id}>
                                    {member.firstName} {member.lastName}
                                </option>
                            ))
                        }
                    </select>

                    <button
                        onClick={handleAddCourse}
                        className="w-full py-2 bg-green-500 mt-2 text-white rounded-lg font-semibold hover:bg-green-600"
                    >
                        Create Course
                    </button>
                </motion.div>
            )}

            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-green-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold">Name</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold">Teacher</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold">Duration</th>
                        <th className="px-4 py-3 text-center text-green-700 font-semibold">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {courses ? courses.map(course => (
                        <tr key={course.id} className="border-b hover:bg-green-50 transition">
                            <td className="px-4 py-3 cursor-pointer hover:text-green-600"
                                onClick={() => handleViewParticipants(course)}>
                                {course.name}
                            </td>
                            <td className="px-4 py-3 text-left">{course.teacher.firstName + " " + course.teacher.lastName}</td>
                            <td className="px-4 py-3 text-left">{course.duration} months</td>
                            <td className="px-4 py-3 text-center">
                                <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    )) : <tr><td colSpan={4} className="px-4 py-3 text-center text-green-700">No courses found</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Модальное окно участников */}
            {showParticipants && selectedCourse && (
                <CourseParticipantsModal
                    users={users}
                    course={selectedCourse}
                    onClose={() => {
                        setShowParticipants(false);
                        setSelectedCourse(null);
                    }}
                />
            )}
        </div>
    );
}

// --- МОДАЛЬНОЕ ОКНО УЧАСТНИКОВ КУРСА ---
function CourseParticipantsModal({ course, onClose, users }: { course: Course;
    users: UserResponse[]; onClose: () => void }) {

    interface CourseParticipant extends UserResponse{

        paid: boolean;
        start_date: string;
        end_date: string;

    }

    const [participants, setParticipants] = useState<CourseParticipant[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<number>(0);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        fetchParticipants();
    }, []);


    useEffect(() => {
        if (!users || users.length === 0 || !participants) return;

        // Находим первого студента, которого НЕТ в списке участников
        const availableStudent = users.find(
            (user) => !participants.some((p) => p.id === user.id)
        );

        if (availableStudent) {
            setSelectedStudent(availableStudent.id);
        } else {
            setSelectedStudent(0); // если все уже участвуют
        }
    }, [users, participants]);


    const fetchParticipants = async () => {
        const response = await fetch(`${Constants.SERVER_URL}/courses/${course.id}/participants`, {
            credentials: "include"
        });
        if (response.ok) {
            const data = await response.json();
            setParticipants(data);
        }
    };

    const handleAddParticipant = async () => {
        const response = await fetch(`${Constants.SERVER_URL}/courses/${course.id}/participants`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
                {
                    student_id: selectedStudent,
                    course_duration: course.duration
                }
            )
        });
        if (response.ok) {
            fetchParticipants();
            setShowAddForm(false);
        }
    };

    const handleRemoveParticipant = async (studentId: number) => {
        const response = await fetch(`${Constants.SERVER_URL}/courses/${course.id}/participants/${studentId}`, {
            method: "DELETE",
            credentials: "include"
        });
        if (response.ok) {
            setParticipants(participants.filter(p => p.id !== studentId));
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-green-700">
                        Participants: {course.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-green-700">Students ({participants ? participants.length : 0})</h3>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 shadow text-sm"
                        >
                            {showAddForm ? "Cancel" : "Add Student"}
                        </motion.button>
                    </div>

                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-green-50 p-4 rounded-lg mb-4"
                        >
                            <label className="block text-green-700 mb-2 font-semibold">Select Student:</label>
                            <select
                                value={selectedStudent}
                                onChange={e => {
                                    setSelectedStudent(Number(e.target.value))
                                    console.log("aelected value: ", e.target.value, "")
                                }}
                                className="w-full px-3 py-2 border rounded mb-3"
                            >
                                <option value="0" disabled>
                                    -- Select a student --
                                </option>

                                {users.map(student => (
                                    <option key={student.id} value={student.id}>
                                        {student.firstName} {student.lastName} ({student.email})
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddParticipant}
                                className="w-full py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
                            >
                                Add to Course
                            </button>
                        </motion.div>
                    )}

                    <div className="space-y-2">
                        {participants && participants.length > 0 ? participants.map(participant => (
                            <div
                                key={participant.id}
                                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition"
                            >
                                <div>
                                    <p className="font-semibold text-green-800">
                                        {participant.firstName} {participant.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600">{participant.email}</p>



                                    <p className={"text-sm text-gray-500"}>Enrolled: {new Date(participant.start_date).toDateString()}</p>
                                    <p className={"text-sm text-gray-500"}>Course ends: {new Date(participant.end_date).toDateString()}</p>

                                </div>

                                {
                                    participant.paid ? <p className="text-sm text-green-600">PAID</p> :
                                        <p className="text-sm text-red-600">UNPAID</p>
                                }

                                <button
                                    onClick={() => handleRemoveParticipant(participant.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-4">No participants yet</p>
                        )}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                >
                    Close
                </button>
            </motion.div>
        </motion.div>
    );
}


// --- USERS TAB ---
function UsersTab({ users, setUsers }: { users: UserResponse[]; setUsers: (u: UserResponse[]) => void }) {
    const [showForm, setShowForm] = useState(false);
    const [dropdown, setDropdown] = useState<number>(0);
    const [changesDetected, setChangesDetected] = useState(false);
    const [detectChanges, setDetectChanges] = useState<{
        user_id: number,
        course_id: number,
        paid: boolean,
    }[]>([]);

    const [userCourses, setUserCourses] = useState<{
        userID: number,
        courseList: {
            paid: boolean,
            paid_date: string | null,
            Course: Course
        }[]
    }[]>([]);

    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        role: "student"
    });

    const setChange = (userId: number, courseId: number, paid: boolean) => {
        const exists = detectChanges.findIndex(item => item.user_id === userId && item.course_id === courseId);
        if (exists !== -1) {
            detectChanges[exists] = {user_id: userId, course_id: courseId, paid: paid};

        }else{
            setDetectChanges(prev => [...prev, {user_id: userId,
                course_id: courseId, paid: paid}]);
            setChangesDetected(true);

        }

    }

    const sendChanges = async () => {
        const response = await fetch(`${Constants.SERVER_URL}/courses/update_user_payments`, {
            credentials: "include",
            method: "PUT",
            body: JSON.stringify(detectChanges)
        })

        console.log(response.ok)
    }

    const handleRegister = async () => {
        const response = await fetch(`${Constants.SERVER_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            const newUser = await response.json();
            setUsers([...users, newUser]);
            setShowForm(false);
            setFormData({ email: "", firstName: "", lastName: "", password: "", role: "student" });
        }
    };

    const handleDeleteUser = async (id: number) => {
        const confirmed = confirm("Are you sure you want to delete this user?");
        if (!confirmed) return;

        const response = await fetch(`${Constants.SERVER_URL}/users/${id}`,
            { method: "DELETE", credentials: "include"});
        if (response.ok) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const normalizeDate = (dateString: string): string => {

        const formattedDate = new Date(dateString).toLocaleDateString();

        if (formattedDate.includes("1970")) {
            return "N/A";
        }

        return formattedDate;
    }

    async function handleDropdownChange(user: number) {

        if (user && dropdown !== user) {
            setDropdown(user);
        }

        if (userCourses.some(uc => uc.userID === user)) {
            console.log("already obtained courses for this user");
            return;
        }

        const response = await fetch(`${Constants.SERVER_URL}/courses/student_courses/${user}`,
            { method: "GET", credentials: "include"});

        const data = await response.json();
        console.log("data: ", data);

        if (response.ok) {
            setUserCourses((uc) => {
                const exists = uc.findIndex(item => item.userID === data.user_id);
                if (exists !== -1) {
                    const updated = [...uc];
                    updated[exists] = { userID: data.user_id, courseList: data.courses };
                    return updated;
                }
                return [...uc, { userID: data.user_id, courseList: data.courses }];
            });
        }

    }

    return (
        <div>
            <h2 className="text-2xl font-semibold text-green-700">Users</h2>

            <div className="flex gap-5 items-center justify-end mb-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 shadow"
                >
                    {showForm ? "Cancel" : "Add User"}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    disabled={!changesDetected}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendChanges()}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 shadow"
                >
                    Save changes
                </motion.button>
            </div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow mb-6"
                >
                    <h3 className="font-bold text-green-700 mb-4">New User</h3>
                    <input
                        placeholder="Email"
                        className="w-full px-3 py-2 border rounded mb-3"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        placeholder="First Name"
                        className="w-full px-3 py-2 border rounded mb-3"
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    />
                    <input
                        placeholder="Last Name"
                        className="w-full px-3 py-2 border rounded mb-3"
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-3 py-2 border rounded mb-3"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                    <select
                        className="w-full px-3 py-2 border rounded mb-4"
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                    </select>
                    <button
                        onClick={handleRegister}
                        className="w-full py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
                    >
                        Register User
                    </button>
                </motion.div>
            )}


            <div className="overflow-x-auto">
                <table className="bg-white rounded-xl shadow min-w-[900px] m-auto">
                    <thead className="bg-green-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-green-700 font-semibold"></th>
                            <th className="px-4 py-3 text-left text-green-700 font-semibold">Name</th>
                            <th className="px-4 py-3 text-left text-green-700 font-semibold">Email</th>
                            <th className="px-4 py-3 text-left text-green-700 font-semibold">Role</th>
                            <th className="px-4 py-3 text-left text-green-700 font-semibold">Last Login</th>
                            <th className="px-4 py-3 text-center text-green-700 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {users
                        ? users.flatMap(user => [
                            (
                                <tr key={user.id} className="border-b hover:bg-green-50 transition">
                                    <td onClick={() => {
                                        handleDropdownChange(user.id).then();

                                    }} className="px-4 py-3 text-left cursor-pointer">&#11015;</td>
                                    <td className="px-4 py-3 text-left">{user.firstName} {user.lastName}</td>
                                    <td className="px-4 py-3 text-left">{user.email}</td>
                                    <td className="px-4 py-3 text-left">{user.role}</td>
                                    <td className="px-4 py-3 text-left">{normalizeDate(user.lastLogin)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ),
                            dropdown === user.id && (
                                <tr key={`dropdown-${user.id}`} className="bg-gray-50">
                                    <td colSpan={6} className="px-4 py-3">
                                        <div className="p-3 border rounded shadow">
                                            {!(userCourses && userCourses.find(uc => uc.userID === user.id)?.courseList?.length) ? (
                                                <p>Student hasn't subscribed on any course yet.</p>
                                            ) : (
                                                // @ts-ignore
                                                userCourses.find(uc => uc && (uc.userID === user.id))
                                                    .courseList.map(course => (
                                                    <div>
                                                        <div className={"flex justify-between items-center mb-4"}>
                                                            <label htmlFor={course.Course.id.toString()} className="block mb-2">
                                                                {course.Course.name}
                                                            </label>


                                                            {!course.paid && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => alert("*SENT REMINDER TO STUDENT (EMAIL OR WhatsApp)*")}
                                                                    className={`cursor-pointer px-6 py-3 rounded-lg font-semibold transition shadow "bg-white text-green-700 hover:bg-green-100"`}
                                                                >
                                                                    Remind about payment
                                                                </motion.button>
                                                            )}


                                                            <select id={course.Course.id.toString()} onChange={() =>
                                                                setChange(user.id, course.Course.id, !course.paid)
                                                            }>
                                                                <option value={course.paid ? "Paid" : "Unpaid"}>
                                                                    {course.paid ? "PAID" : "UNPAID"}
                                                                </option>
                                                                <option value={course.paid ? "Unpaid" : "Paid"}>
                                                                    {course.paid ? "UNPAID" : "PAID"}
                                                                </option>
                                                            </select>
                                                        </div>
                                                    </div>


                                                ))
                                            )}
                                        </div>
                                    </td>
                                </tr>

                            )
                        ])
                        : (
                            <tr>
                                <td colSpan={6} className="px-4 py-3 text-center text-green-700">
                                    No users found
                                </td>
                            </tr>
                        )
                    }
                    </tbody>
                </table>
            </div>

        </div>
    );
}

// --- STAFF TAB ---
function StaffTab({ staff, setStaff }: { staff: UserResponse[], setStaff: (u: UserResponse[]) => void }) {


    const handleDeleteUser = async (id: number) => {
        const response = await fetch(`${Constants.SERVER_URL}/users/${id}`,
            { method: "DELETE", credentials: "include"});
        if (response.ok) {
            setStaff(staff.filter(u => u.id !== id));
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-green-700 mb-6">Staff Members</h2>
            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-green-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-left">Name</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-left">Email</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-center"></th>
                    </tr>
                    </thead>
                    <tbody>
                    { staff? staff.map(member => (
                        <tr key={member.id} className="border-b hover:bg-green-50 transition">
                            <td className="px-4 py-3 text-left">{member.firstName} {member.lastName}</td>
                            <td className="px-4 py-3 text-left">{member.email}</td>

                            <td className="px-4 py-3 text-center">
                                <button
                                    onClick={() => handleDeleteUser(member.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                    Delete
                                </button>
                            </td>

                        </tr>
                    )) : <tr><td colSpan={2} className="px-4 py-3 text-center text-green-700">No staff members found</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
