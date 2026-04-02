export type StoredRole = string | { name?: string } | null | undefined;

export type StoredUser = {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    personalEmail?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    avatarImg?: string;
    role?: StoredRole;
};

type StoredLoginResponse = {
    token?: string;
    loginTime?: number;
    user?: StoredUser;
};

export const getRoleName = (role?: StoredRole) => {
    if (!role) {
        return "";
    }

    return typeof role === "string" ? role : role.name || "";
};

export const getStoredUser = (): StoredUser | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            return JSON.parse(storedUser) as StoredUser;
        } catch {
            localStorage.removeItem("user");
        }
    }

    const loginResponse = localStorage.getItem("loginResponse");
    if (loginResponse) {
        try {
            const parsed = JSON.parse(loginResponse) as { user?: StoredUser };
            return parsed.user || null;
        } catch {
            localStorage.removeItem("loginResponse");
        }
    }

    return null;
};

export const getStoredLoginResponse = (): StoredLoginResponse | null => {
    if (typeof window === "undefined") {
        return null;
    }

    const loginResponse = localStorage.getItem("loginResponse");
    if (!loginResponse) {
        return null;
    }

    try {
        return JSON.parse(loginResponse) as StoredLoginResponse;
    } catch {
        localStorage.removeItem("loginResponse");
        return null;
    }
};

export const persistStoredUser = (user: StoredUser) => {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem("user", JSON.stringify(user));

    const loginResponse = getStoredLoginResponse();
    if (!loginResponse) {
        return;
    }

    localStorage.setItem(
        "loginResponse",
        JSON.stringify({
            ...loginResponse,
            user: {
                ...loginResponse.user,
                ...user,
            },
        })
    );
};

export const clearStoredAuth = () => {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem("loginResponse");
    localStorage.removeItem("user");
};