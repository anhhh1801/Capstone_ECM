export type CourseStatus = "UPCOMING" | "IN_PROGRESS" | "ENDED";

export const getCourseStatusLabel = (status?: string) => {
    switch (status) {
        case "UPCOMING":
            return "Upcoming";
        case "IN_PROGRESS":
            return "In Process";
        case "ENDED":
            return "Ended";
        default:
            return status || "Unknown";
    }
};

export const getCourseStatusClasses = (status?: string) => {
    switch (status) {
        case "UPCOMING":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "IN_PROGRESS":
            return "bg-green-50 text-green-700 border-green-200";
        case "ENDED":
            return "bg-gray-100 text-gray-600 border-gray-200";
        default:
            return "bg-slate-100 text-slate-600 border-slate-200";
    }
};

export const isCourseOngoing = (status?: string) => status !== "ENDED";

export const isCourseInProgress = (status?: string) => status === "IN_PROGRESS";

export const isCourseEnded = (status?: string) => status === "ENDED";