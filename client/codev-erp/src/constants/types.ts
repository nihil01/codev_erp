export type LoginUser = {
    role: "staff" | "student" | "admin";
    email: string;
    password: string;
    remember: boolean;
};

export type UserResponse = {
    id: number;
    role: "staff" | "student" | "admin";
    email: string;
    firstName: string;
    lastName: string;
    registered: string;
    lastLogin: string;
    avatarUrl: string;
    avatar: string;
};

export type Course = {
    id: number;
    name: string;
    previewImage: string;
    teacher: UserResponse;
    description: string;
    duration: number;
    lessons?: Lesson[]; // добавлено (опционально)
};


export type Lesson = {
    id: number;
    courseID: number;
    name: string;
    description: string;
    startDate: string;       // ISO string
    tasks: LessonTasks[];    // список заданий
};

export type LessonTasks = {
    id: number;
    lessonID: number;
    homework: string[];      // JSON массив
    classwork: string[];     // JSON массив
};

export type UserHomeworkResponse = {
    id: number;
    userID: number;
    lessonID: number;
    homework: string[];      // ответы студента
    startDate: string;
    user?: UserResponse;
    lesson?: Lesson;
    points: number;
    checked: boolean;
    comment: string;
};
