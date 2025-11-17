import type {Course, LoginUser, UserResponse} from "../constants/types.ts";
import {Constants} from "../constants/constants.ts";
import React from "react";

async function loginRequest(user: LoginUser) {

    const response: Response = await fetch(`${Constants.SERVER_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    })

    const data = await response.json();
    console.log(data);
    return data;
}


async function checkAuthRequest(): Promise<UserResponse | null> {

    const response: Response = await fetch(`${Constants.SERVER_URL}/check_auth`, {
        credentials: "include"
    })

    const data = await response.json();


    if (data.message){
        return data.user;
    } else {
        return null;
    }

}

async function getCourses(): Promise<Course[] | null>{

    const response: Response = await fetch(`${Constants.SERVER_URL}/courses`, {
        credentials: "include"
    })

    const data = await response.json();

    if (response.ok){
        return data;
    }

    return null;

}

async function getUserProfile(id: number): Promise<UserResponse | null>{

    const response: Response = await fetch(`${Constants.SERVER_URL}/profile/${id}`, {
        credentials: "include"
    })

    const data = await response.json();

    if (response.ok){
        return data;
    }

    return null;

}

const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
        const response = await fetch(`${Constants.SERVER_URL}` + "/avatar_update", {
            method: "PUT",
            credentials: "include",
            body: formData
        });

        if (response.ok) {
            // Получить новый url аватара (например, как строку)
            let data = await response.json();
            console.log(data)

        } else {
            alert("Ошибка загрузки аватара");
        }
    } catch (e) {
        alert("Ошибка соединения");
    }
};

const logout = async () => {
    await fetch(`${Constants.SERVER_URL}/logout`, {
        method: "GET",
        credentials: "include"
    })
}


export {loginRequest, checkAuthRequest, getCourses, getUserProfile, uploadAvatar, logout};