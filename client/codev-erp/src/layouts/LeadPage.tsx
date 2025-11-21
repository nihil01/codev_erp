import { motion } from "framer-motion";
import {useEffect, useState} from "react";
import {Constants} from "../constants/constants.ts";
import {useAuth} from "../providers/AuthProvider.tsx";

export const LeadPage = () => {

    type LeadRow = {id?:number, date: string, description: string, igNick: string,
        name: string, phone: string, source: string, status: string, author: string, course: string};


    const { currentUser } = useAuth();
    const [rowAdded, setRowAdded] = useState(false);
    const [leads, setLeads] = useState<LeadRow[]>( [])
    const [courses, setCourses] = useState<string[]>([])

    const [rowData, setRowData] = useState<LeadRow>({date: "", description: "", igNick: "",
        name: "", phone: "", source: "dm", status: "new", author: currentUser?.email ?? "", course: ""});


    useEffect(() => {
        getLeads().then();
        getAllCourses().then();
    }, []);

    const sendLeadRequest = async () => {

        let emptyValueFound: boolean = false;

        for (let val of Object.values(rowData)) {

            if (val === "") {
                emptyValueFound = true;
                break
            }

        }

        if (rowData.course === "NO COURSE" || rowData.course === "-- Select Course --"){
            alert("Select a valid course !");
            return
        }

        if (emptyValueFound) {
            alert("Please fill in all fields before sending the lead request.");
            return;
        }

        const response = await fetch(`${Constants.SERVER_URL}/leads`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(rowData),
        });

        if (response.ok) {
            alert("Lead request sent successfully!");
        } else {
            alert("Failed to send lead request. Please try again.");
        }

    }

    const getLeads = async () => {

        const response = await fetch(`${Constants.SERVER_URL}/leads`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });


        if (response.ok) {
            const data = await response.json();
            setLeads(data);
        }
    }

    const getAllCourses = async () => {

        const response = await fetch(`${Constants.SERVER_URL}/courses_all`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });


        if (response.ok) {
            const data = await response.json();
            console.log(data)
            setCourses(data);
        }

    }

    const deleteLead = async (id: number) => {

        const confirmDelete = confirm("Are you sure you want to delete this lead?");
        if (!confirmDelete) return;

        await fetch(`${Constants.SERVER_URL}/leads/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        })

        alert("Lead deleted successfully!");
    }

    return (
        <div className={"order-2"}>

            <div className={"flex justify-end mb-4 gap-5"}>

                <motion.button
                    onClick={() => setRowAdded(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={"cursor-pointer bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"}
                >
                    Add row
                </motion.button>

                <motion.button
                    onClick={() => sendLeadRequest()}
                    whileHover={{ scale: 1.05 }}
                    disabled={!rowAdded}
                    whileTap={{ scale: 0.95 }}
                    className={"cursor-pointer bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"}
                >
                    Save row
                </motion.button>

            </div>


            <div className={"overflow-x-auto"}>

                <table className="w-full  bg-white border border-green-200 rounded-lg shadow-md">
                    <thead className="bg-green-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-left">Description</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-left">Date</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-left">Name/Surname</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-left">Phone</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-left">IG Nick</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-left">Source</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-left">Course</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-left">Status</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-left">Author</th>
                        <th className="px-4 py-3 text-left text-green-700 font-semibold text-left"></th>
                    </tr>
                    </thead>

                    <tbody>

                    {
                        leads.map((row, index) => (
                            <tr key={index}>
                                <td className="px-4 py-3 text-left">{row.description}</td>
                                <td className={"px-4 py-3 text-left"}>{row.date.substring(
                                    0, row.date.indexOf("T"))}</td>
                                <td className={"px-4 py-3 text-left"}>{row.name}</td>
                                <td className={"px-4 py-3 text-left"}>{row.phone}</td>
                                <td className={"px-4 py-3 text-left"}>{row.igNick}</td>
                                <td className={"px-4 py-3 text-left"}>{row.source}</td>
                                <td className={"px-4 py-3 text-left"}>{row.course}</td>
                                <td className={"px-4 py-3 text-left"}>{row.status}</td>
                                <td className={"px-4 py-3 text-left"}>{row.author}</td>
                                <td className={"px-4 py-3 text-left"}>
                                    <button
                                        onClick={() => deleteLead(row.id || 0)}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    }

                    {rowAdded && (

                        <tr>

                            <td className="px-4 py-3 text-left">
                                <textarea className={"border border-green-500 rounded-md"}
                                          onChange={(e) =>
                                              setRowData(prev => ({...prev,
                                                  description: e.target.value}))}/>
                            </td>

                            <td className="px-4 py-3 text-left">
                                <input type={"date"} className={"border border-green-500 rounded-md"} onChange={(e) =>
                                    setRowData(prev => ({...prev, date: e.target.value}))}/>
                            </td>

                            <td className="px-4 py-3 text-left">
                                <input type={"text"} className={"border border-green-500 rounded-md"} onChange={(e) =>
                                    setRowData(prev => ({...prev, name: e.target.value}))}/>
                            </td>

                            <td className="px-4 py-3 text-left">
                                <input type={"text"} className={"border border-green-500 rounded-md"} onChange={(e) =>
                                    setRowData(prev => ({...prev, phone: e.target.value}))}/>
                            </td>

                            <td className="px-4 py-3 text-left">
                                <input type={"text"} className={"border border-green-500 rounded-md"} onChange={(e) =>
                                    setRowData(prev => ({...prev, igNick: e.target.value}))}/>
                            </td>

                            <td className="px-4 py-3 text-left">
                                <select className={"border border-green-500 rounded-md"} onChange={(e) =>
                                    setRowData(prev => ({...prev, source: e.target.value}))}>
                                    <option value={"dm"}>DM</option>
                                    <option value={"story"}>Story</option>
                                    <option value={"wp"}>WhatsApp</option>
                                    <option value={"ad"}>Advertisement</option>
                                </select>
                            </td>

                            <td className="px-4 py-3 text-left">
                                <select className={"border border-green-500 rounded-md"} onChange={(e)=>
                                    setRowData(prev => ({...prev, course: e.target.value}))}>
                                    <option>-- Select Course --</option>

                                    {
                                        courses && courses.length > 0 ? courses.map((course, index) => (

                                            <option value={course} key={index}>{course}</option>

                                        )) : <option>NO COURSES</option>
                                    }

                                </select>
                            </td>

                            <td className="px-4 py-3 text-left">
                                <select className={"border border-green-500 rounded-md"} onChange={(e) =>
                                    setRowData(prev => ({...prev, status: e.target.value}))}>
                                    <option value={"new"}>New</option>
                                    <option value={"answered"}>Answered</option>
                                    <option value={"awaiting"}>Awaiting</option>
                                    <option value={"demo"}>Demo</option>
                                </select>
                            </td>

                        </tr>

                    )}

                    </tbody>
                </table>

            </div>

        </div>
    )
}
