import Link from "next/link";
import BannerSlider from "@/components/BannerSlide";
import FeatureCard from "@/components/FeatureCard";
import cardImg from "@/imgs/home/card-1.jpg";

export default function Home() {
  return (
    <div>
      <div className="container mx-auto flex flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:py-12">
        <div className="flex w-full flex-col justify-center text-center lg:w-2/5 lg:text-left">
          <div>
            <h1 className="text-lg font-semibold sm:text-xl">
              EASILY MANAGE YOUR OWN TUTOR CENTER WITH
            </h1>
            <h1 className="header-1 mb-4 color-[var(--color-main)]">
              EXTRA CENTER MANAGER
            </h1>
          </div>
          <p className="text-base text-left sm:text-lg lg:text-justify">
            Try a new way to manage your own tutor center with all your needs in one
            place. Track students, teachers, schedules and finances in one simple
            dashboard.
          </p>

          <div className="mt-6 flex justify-center lg:justify-start">
            <Link
              href="/register"
              className="self-start main-btn font-bold"
            >
              I'm ready to get started
            </Link>
          </div>
        </div>

        <div className="h-64 w-full overflow-hidden rounded-lg shadow-lg sm:h-80 md:h-96 lg:w-3/5">
          <BannerSlider />
        </div>
      </div>
      <div className="mx-auto bg-[var(--color-main)] py-12 text-center">
        <h2 className="header-2 text-[var(--color-soft-white)] mb-8">
          Our Main Features
        </h2>
        <div className="container mx-auto grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8 px-4 sm:px-6">
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
      <div className="container mx-auto px-4 py-12 text-center sm:px-6" >
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