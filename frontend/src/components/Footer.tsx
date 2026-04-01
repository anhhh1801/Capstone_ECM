export default function Footer() {
    return (
        <footer className="bg-[var(--color-main)] text-[var(--color-soft-white)]">
            <div className="shell-frame mb-4 py-4">
                <p className="font-bold">Contact Us: </p>
                <p>tung.le.cit20@eiu.edu.vn</p>
                <p>anh.doviet.cit21@eiu.edu.vn</p>
            </div>
            <div className="bg-[var(--color-soft-white)] mx-auto text-right text-sm text-[var(--color-text)] py-2">
                <div className="shell-frame">
                    © {new Date().getFullYear()} EIU Capstone Project.
                </div>
            </div>
        </footer>
    );
}