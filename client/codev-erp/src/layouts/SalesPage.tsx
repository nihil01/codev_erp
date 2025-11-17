import { useEffect, useState } from "react";
import { Constants } from "../constants/constants";
import type {Course, Lead} from "../constants/types.ts";

export const SalesPage = () => {
    type SalesRow = {
        id: number,
        lastCall: string,
        result: string,
        paid: string,
        group: string,
        note: string
        course: Course
        lead: Lead
    };

    const [sales, setSales] = useState<SalesRow[]>([]);

    useEffect(() => {
        getSalesRows().then();
    }, []);

    const getSalesRows = async () => {
        const response = await fetch(`${Constants.SERVER_URL}/sales`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });

        if (response.ok) {
            const data = await response.json();
            setSales(data);

            setSales(data.map((row: { note: any; }) => ({
                ...row,
                note: row.note ?? ""
            })));
        }
    };

    const updateSalesRow = async (rowId: number, field: string, value: string) => {
        const updatedList = sales.map(row =>
            row.id === rowId ? { ...row, [field]: value } : row
        );
        setSales(updatedList);

        await fetch(`${Constants.SERVER_URL}/sales/${rowId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                id: rowId,
                [field]: value
            })
        });
    };

    return (
        <div className="order-2">

            <div className="overflow-x-auto">
                <table className="w-full bg-white border border-green-200 rounded-lg shadow-md">
                    <thead className="bg-green-100">
                        <tr className="text-left text-green-700 font-semibold">
                            <th className="px-4 py-3">Lead ID</th>
                            <th className="px-4 py-3">Name/Surname</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Course</th>
                            <th className="px-4 py-3">Lead Colleague</th>

                            <th className="px-4 py-3">Last call</th>
                            <th className="px-4 py-3">Result</th>
                            <th className="px-4 py-3">Payed?</th>
                            <th className="px-4 py-3">Assigned group</th>
                            <th className="px-4 py-3">Note</th>
                        </tr>
                    </thead>

                    <tbody>
                    {sales.map((row, index) => (
                        <tr key={index} className="border-t">
                            <td className="px-4 py-3 text-left">{row.lead.id}</td>
                            <td className="px-4 py-3 text-left">{row.lead.name}</td>
                            <td className="px-4 py-3 text-left">{row.lead.phone}</td>
                            <td className="px-4 py-3 text-left">{row.course.name}</td>
                            <td className="px-4 py-3 font-semibold text-left">{row.lead.author}</td>

                            <td className="px-4 py-3 text-left">
                                <input type="date"
                                       className="border border-blue-400 rounded px-2 py-1"
                                       value={row.lastCall || ""}
                                       onChange={(e) =>
                                           updateSalesRow(row.id, "lastCall", e.target.value)
                                       }/>
                            </td>

                            <td className="px-4 py-3">
                                <select
                                    className="border border-blue-400 rounded px-2 py-1"
                                    value={row.result}
                                    onChange={(e) =>
                                        updateSalesRow(row.id, "result", e.target.value)
                                    }>
                                    <option value="">-- choose --</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="declined">Not accepted</option>
                                </select>
                            </td>

                            <td className="px-4 py-3">
                                <select
                                    className="border border-blue-400 rounded px-2 py-1"
                                    value={row.paid}
                                    onChange={(e) =>
                                        updateSalesRow(row.id, "paid", e.target.value)
                                    }>
                                    <option value="">-- choose --</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </td>

                            <td className="px-4 py-3 text-left">
                                {row.group}
                            </td>

                            <td className="px-4 py-3">
                                <textarea
                                    className="border border-blue-400 rounded px-2 py-1 w-full"
                                    value={row.note ?? ""}
                                    onChange={(e) =>
                                        updateSalesRow(row.id, "note", e.target.value)
                                    }/>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
};
