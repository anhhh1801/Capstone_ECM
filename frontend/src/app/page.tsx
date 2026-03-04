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
            <h1 className="header-1">
              EASILY MANAGE YOUR OWN TUTOR CENTER WITH
            </h1>
            <h1 className="header-1">
              EXTRA CENTER MANAGER
            </h1>
          </div>
          <p className="text-lg text-justify">
            Try a new way to manage your own tutor center with all your needs in one
            place. Track students, teachers, schedules and finances in one simple
            dashboard.
          </p>

          <Link
            href="/register"
            className="self-start main-btn font-bold"
          >
            I'm ready to get started
          </Link>
        </div>

        <div className="lg:w-3/5 h-64 md:h-96 overflow-hidden rounded-lg shadow-lg">
          <BannerSlider />
        </div>
      </div>
      <div className="mx-auto text-center bg-[var(--color-main)] py-12">
        <h2 className="header-2 text-[var(--color-soft-white)] mb-8">
          Our Main Features
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8 max-w-7xl mx-auto px-6">
          <FeatureCard
            title="Manage your students and teachers stats"
            image={cardImg}
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <FeatureCard
            title="Manage your students and teachers stats"
            image={cardImg}
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <FeatureCard
            title="Manage your students and teachers stats"
            image={cardImg}
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <FeatureCard
            title="Manage your students and teachers stats"
            image={cardImg}
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
        </div>
      </div>
      <div className="mx-auto text-center container py-12" >
        <h2 className="header-2 text-[var(--color-text)] text-center mb-8">How it works ?</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8 max-w-7xl mx-auto px-6">
          <FeatureCard
            title="Create an account and Log in to your dashboard"
            image={cardImg}
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <FeatureCard
            title="Set up your tutor center's profile and preferences"
            image={cardImg}
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
          <FeatureCard
            title="Start adding your students, teachers, schedules and finances"
            image={cardImg}
            description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
          />
        </div>
      </div>
    </div>
  );
}