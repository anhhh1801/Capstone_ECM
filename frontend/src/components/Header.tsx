import Link from "next/link";
import Logo from "./Logo";

export default function Header() {
    return (

        <header className="text-white shadow-md">
            <div className="flex justify-between items-center container mx-auto bg-[var(--color-soft-white)] text-[var(--color-text)] font-bold p-2">
                <Link href="/" className="text-3xl">
                    Extra Center Manager
                </Link>

                <p className="text-sm font-normal opacity-70">
                    A project by EIU Students
                </p>
            </div>
            <div className="bg-[var(--color-main)]">
                <div className="container mx-auto flex justify-between items-center py-2">
                    <Link href="/" className="flex items-center">
                        <Logo className="text-white" />
                    </Link>
                    <nav className="space-x-6">

                        <Link href="/login" className="loginBtn">
                            Login
                        </Link>
                        <Link href="/register" className="regBtn">
                            Get Started
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}