import {useEffect, useState} from "react";
import type {UserHomeworkResponse} from "../constants/types.ts";
import {AnimatePresence, motion} from "framer-motion";
import {Constants} from "../constants/constants.ts";

export default function StudentSubmissionsList({ lessonId }: { lessonId: number }) {
    const [submissions, setSubmissions] = useState<UserHomeworkResponse[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        fetchSubmissions();
    }, [lessonId]);

    const fetchSubmissions = async () => {
        const response = await fetch(`${Constants.SERVER_URL}/lesson_tasks/list_homeworks/${lessonId}`, {
            credentials: "include"
        });
        if (response.ok) {
            const data = await response.json();
            setSubmissions(data);
        }
    };

    if (submissions.length === 0) {
        return <p className="text-gray-500">No student submissions yet</p>;
    }

    return (
        <div className="space-y-3">
            {submissions.map((submission) => (
                <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    expanded={expandedId === submission.id}
                    onToggle={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                    onUpdate={fetchSubmissions}
                />
            ))}
        </div>
    );
}

// --- КАРТОЧКА РАБОТЫ СТУДЕНТА ---
function SubmissionCard({ submission, expanded, onToggle, onUpdate }: {
    submission: UserHomeworkResponse;
    expanded: boolean;
    onToggle: () => void;
    onUpdate: () => void;
}) {
    const [points, setPoints] = useState(submission.points);
    const [comment, setComment] = useState(submission.comment);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const response = await fetch(`${Constants.SERVER_URL}/lesson_tasks/submissions/${submission.id}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                points,
                comment,
                checked: true
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert(result["success"] || "Grade saved successfully");
            onUpdate();
        } else {
            alert(result["error"] || "Failed to save grade");
        }
        setSaving(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-green-200 rounded-xl overflow-hidden"
        >
            {/* Заголовок карточки */}
            <div
                className="p-4 cursor-pointer hover:bg-green-50 transition flex justify-between items-center"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3">
                    {submission.user?.avatar && (
                        <img
                            src={`${Constants.SERVER_URL}/static/${submission.user.avatar}`}
                            alt={submission.user.firstName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    )}
                    <div>
                        <p className="font-semibold text-green-800">
                            {submission.user?.firstName} {submission.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                            Submitted: {new Date(submission.startDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {submission.checked ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            ✓ Checked ({submission.points}/10)
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                            ⏳ Pending
                        </span>
                    )}
                    <motion.svg
                        animate={{ rotate: expanded ? 180 : 0 }}
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                </div>
            </div>

            {/* Развёрнутое содержимое */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-green-200"
                    >
                        <div className="p-4 space-y-4 bg-green-50">
                            {/* Файлы студента */}
                            <div>
                                <h4 className="font-semibold text-green-700 mb-2">Student Files:</h4>
                                <div className="space-y-2">
                                    {submission.homework && submission.homework.length > 0 ? (
                                        submission.homework.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between bg-white p-2 rounded"
                                            >
                                                <span className="text-green-700 text-sm">📎 {file}</span>
                                                <a
                                                    href={`${Constants.SERVER_URL}/static/${file}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                                >
                                                    View
                                                </a>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">No files submitted</p>
                                    )}
                                </div>
                            </div>

                            {/* Оценка */}
                            <div>
                                <label className="block font-semibold text-green-700 mb-2">
                                    Points: {points}/10
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={points}
                                    onChange={(e) => setPoints(Number(e.target.value))}
                                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0</span>
                                    <span>5</span>
                                    <span>10</span>
                                </div>
                            </div>

                            {/* Комментарий */}
                            <div>
                                <label className="block font-semibold text-green-700 mb-2">Comment:</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Leave a comment for the student..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                                />
                            </div>

                            {/* Кнопка сохранения */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? "Saving..." : "Save Grade"}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
