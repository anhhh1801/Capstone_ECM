import Link from "next/link";
import BannerSlider from "@/components/BannerSlide";
import FeatureCard from "@/components/FeatureCard";
import cardImg from "@/imgs/home/card-1.jpg";

export default function Home() {
  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-center pt-12 pb-12 gap-12 container mx-auto">
        <div className="lg:w-2/5 flex flex-col justify-center items-left">
          <div>
            <h1 className="font-semibold text-xl ">
              EASILY MANAGE YOUR OWN TUTOR CENTER WITH
            </h1>
            <h1 className="header-1 color-[var(--color-main)] mb-4">
              EXTRA CENTER MANAGER
            </h1>
          </div>
          <p className="text-lg text-justify">
            Try a new way to manage your own tutor center with all your needs in one
            place. Track students, teachers, schedules and finances in one simple
            dashboard.
          </p>

          <div className="flex justify-center">
            <Link
              href="/register"
              className="self-start main-btn font-bold"
            >
              I'm ready to get started
            </Link>
          </div>
        </div>

        <div className="lg:w-3/5 h-64 md:h-96 overflow-hidden rounded-lg shadow-lg">
          <BannerSlider />
        </div>
      </div>
      <div className="mx-auto text-center bg-[var(--color-main)] py-12">
        <h2 className="header-2 text-[var(--color-soft-white)] mb-8">
          Our Main Features
        </h2>
        <div className="container grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8 mx-auto">
          <FeatureCard
            title="Student Management"
            image={cardImg}
            description={
              <ul className="list-disc pl-5 space-y-1">
                <li>Create and manage student profiles</li>
                <li>Track enrollment and classes</li>
                <li>Monitor academic progress</li>
                <li>Store student records securely</li>
              </ul>
            }
          />

          <FeatureCard
            title="Teacher Management"
            image={cardImg}
            description={
              <ul className="list-disc pl-5 space-y-1">
                <li>Add and manage teacher profiles</li>
                <li>Assign teachers to classes</li>
                <li>Manage teaching schedules</li>
                <li>Track workload and performance</li>
              </ul>
            }
          />

          <FeatureCard
            title="Class & Schedule Management"
            image={cardImg}
            description={
              <ul className="list-disc pl-5 space-y-1">
                <li>Create and organize classes</li>
                <li>Assign students and teachers</li>
                <li>Manage weekly schedules</li>
                <li>Avoid timetable conflicts</li>
              </ul>
            }
          />

          <FeatureCard
            title="Reports & Analytics"
            image={cardImg}
            description={
              <ul className="list-disc pl-5 space-y-1">
                <li>Generate performance reports</li>
                <li>Track attendance statistics</li>
                <li>Analyze center activities</li>
                <li>Support data-driven decisions</li>
              </ul>
            }
          />
        </div>
      </div>
      <div className="mx-auto text-center container py-12" >
        <h2 className="header-2 text-[var(--color-text)] text-center mb-8">How it works ?</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8 mx-auto">
          <FeatureCard
            title="Create an account and Log in to your dashboard"
            image={cardImg}
            description={
              <ul className="list-disc pl-5 space-y-1">
                <li>Register a new account in seconds</li>
                <li>Securely log in to your personal dashboard</li>
                <li>Access all management tools in one place</li>
                <li>Start setting up your tutoring center</li>
              </ul>
            }
          />

          <FeatureCard
            title="Set up your tutor center's profile and preferences"
            image={cardImg}
            description={
              <ul className="list-disc pl-5 space-y-1">
                <li>Add your tutoring center information</li>
                <li>Configure subjects and available courses</li>
                <li>Set operating hours and schedules</li>
                <li>Customize system preferences</li>
              </ul>
            }
          />

          <FeatureCard
            title="Start adding your students, teachers, schedules and finances"
            image={cardImg}
            description={
              <ul className="list-disc pl-5 space-y-1">
                <li>Add student and teacher profiles</li>
                <li>Create classes and assign schedules</li>
                <li>Track tuition fees and payments</li>
                <li>Monitor activities and performance</li>
              </ul>
            }
          />
        </div>
      </div>
    </div>
  );
}