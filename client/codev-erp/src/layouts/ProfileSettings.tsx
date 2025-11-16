import {useEffect, useRef, useState} from "react";
import { motion } from "framer-motion";
import { useParams } from "wouter";
import { useAuth } from "../providers/AuthProvider.tsx";
import type { UserResponse } from "../constants/types.ts";
import {getUserProfile, uploadAvatar} from "../net/HttpRequests.ts";
import {Constants} from "../constants/constants.ts";

// Модальное окно для смены пароля
function PasswordChangeModal({ onSubmit, onClose }: {
    onSubmit: (oldPass: string, newPass: string) => void;
    onClose: () => void;
}) {
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center min-h-screen"
        >
            <div className="bg-white rounded-xl p-7 max-w-xs w-full h-fit">
                <h3 className="font-bold text-lg text-green-700 mb-4">Change Password</h3>
                <input
                    type="password"
                    className="w-full px-3 py-2 rounded border mb-3"
                    placeholder="Old Password"
                    value={oldPass}
                    onChange={e => setOldPass(e.target.value)}
                />
                <input
                    type="password"
                    className="w-full px-3 py-2 rounded border mb-5"
                    placeholder="New Password"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                />
                <button
                    className="w-full py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 mb-2"
                    onClick={() => onSubmit(oldPass, newPass)}
                >
                    Save
                </button>
                <button
                    className="w-full py-2 text-green-900 rounded bg-green-100 hover:bg-green-200"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </motion.div>
    );
}

export default function ProfileView() {
    const [showPassModal, setShowPassModal] = useState(false);
    const { currentUser, isLoggedIn } = useAuth();
    const [profile, setProfile] = useState<UserResponse | null>(null);
    const [ownProfile, setOwnProfile] = useState(true);
    const [email, setEmail] = useState("");
    const profileID = useParams()["id"];
    const fileInputRef = useRef<HTMLInputElement>(null);
    const STATIC_BASE_URL = Constants.SERVER_URL + "/static/";

    // Определение режима просмотра профиля
    useEffect(() => {
        // Если нет profileID — это свой профиль
        if (!profileID || !isLoggedIn || profileID === String(currentUser?.id)) {
            setProfile(currentUser);
            setOwnProfile(true);
        } else {
            getUserProfile(parseInt(profileID)).then(res => {
                if (res) {
                    setProfile(res);
                    setOwnProfile(false);
                }
            });
        }
    }, [profileID, currentUser, isLoggedIn]);

    useEffect(() => {
        console.log("Profile data")
        console.log(profile)
        if (profile) {
            setEmail(profile.email ?? "");
        }
    }, [profile]);

    const handleAvatarChange = () => {
        if (ownProfile) {
            document.getElementById("avatar")?.click();
        }
    };


    const handlePassChange = async (oldPass: string, newPass: string) => {
        // Тут можно реализовать логику обновления пароля через API

        setShowPassModal(false);

        const res = await fetch(`${Constants.SERVER_URL}/change_password`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                old_password: oldPass,
                new_password: newPass,
            }),
        })

        if (res.ok) {

            const data = await res.json();

            if (data["success"]){
                alert("Password changed successfully");
            }

        }
    };

    if (!profile) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <span className="text-green-500 font-bold text-xl">Loading...</span>
            </div>
        );
    }

    return (
        <div className="order-2 min-h-screen bg-gradient-to-b from-green-50 to-green-200 flex items-center justify-center px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-7 mt-10"
            >
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <input
                            id={"avatar"} ref={fileInputRef}
                            name={"avatar"} type={"file"}
                            accept={"image/*"} style={{ display: "none" }}
                            onChange={uploadAvatar}
                        />
                        <img
                            src={
                                profile.avatar
                                    ? STATIC_BASE_URL + profile.avatar
                                    : STATIC_BASE_URL + "default-avatar.png"
                            }
                            alt="avatar"
                            className="w-32 h-32 rounded-full object-cover mb-3 border-4 border-green-200"
                        />

                        {ownProfile && (
                            <button
                                className="absolute bottom-2 right-2 p-2 rounded-full bg-green-500 text-white font-bold hover:bg-green-600 transition shadow"
                                onClick={handleAvatarChange}
                            >
                                Change
                            </button>
                        )}
                    </div>
                    <h2 className="font-bold text-2xl text-green-700 mb-2">{profile.firstName + " " + profile.lastName}</h2>
                    <p className="text-sm text-green-400 mb-4">Last login: {new Date(profile.lastLogin).toLocaleDateString()
                        + " " + new Date(profile.lastLogin).toLocaleTimeString()}</p>
                </div>
                <div className="mt-4">
                    <label className="block text-green-900 font-semibold mb-1">Email:</label>
                    <input
                        type="email"
                        value={email}
                        disabled={true}
                        onChange={e => setEmail(e.target.value)}
                        className={`w-full px-3 py-2 border rounded mb-4 ${!ownProfile ? "bg-gray-100 text-gray-400" : ""}`}
                    />
                </div>
                {/* В режиме своего профиля доступна смена пароля */}
                {ownProfile && (
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        className="w-full py-2 mt-2 mb-4 bg-green-500 text-white font-semibold rounded hover:bg-green-600 shadow"
                        onClick={() => setShowPassModal(true)}
                    >
                        Change password
                    </motion.button>
                )}
                {showPassModal && (
                    <PasswordChangeModal
                        onSubmit={handlePassChange}
                        onClose={() => setShowPassModal(false)}
                    />
                )}
            </motion.div>
        </div>

    );
}
