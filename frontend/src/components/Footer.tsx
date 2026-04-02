export default function Footer() {
    return (
        <div className="bg-[var(--color-main)]">
            <footer className="container bg-[var(--color-main)] text-[var(--color-soft-white)] flex items-center justify-between px-6 py-2">
                <div>
                    <p className="font-bold">Contact Us:</p>
                    <p>tung.le.cit20@eiu.edu.vn</p>
                    <p>anh.doviet.cit21@eiu.edu.vn</p>
                </div>

                <div>
                    © {new Date().getFullYear()} EIU Capstone Project.
                </div>
            </footer>
        </div>
    );
}