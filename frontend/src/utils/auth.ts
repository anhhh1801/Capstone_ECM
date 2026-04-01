export type StoredRole = string | { name?: string } | null | undefined;

export type StoredUser = {
    id?: number;
    firstName?: string;
    role?: StoredRole;
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