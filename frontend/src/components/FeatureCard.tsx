"use client";

import Image, { StaticImageData } from "next/image";

type FeatureCardProps = {
  title: string;
  image: StaticImageData | string;
  description: string;
};

export default function FeatureCard({
  title,
  image,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 flex flex-col group">
      
      {/* Title */}
      <div className="bg-[var(--color-secondary)] p-2 m-2">
        <h3 className="text-[var(--color-text)] font-bold text-lg text-center uppercase">
          {title}
        </h3>
      </div>

      {/* Image / Description Container */}
      <div className="relative aspect-[4/3]">
        
        {/* Image */}
        <div className="absolute inset-0 flex items-center justify-center bg-white transition-opacity duration-300 group-hover:opacity-0">
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain p-4"
          />
        </div>

        {/* Description (replace image on hover) */}
        <div className="
          absolute inset-0 
          bg-[var(--color-soft-white)] 
          text-[var(--color-text)]
          p-4
          opacity-0
          group-hover:opacity-100
          transition-opacity duration-300
          overflow-y-auto
          text-sm
        ">
          {description}
        </div>

      </div>
    </div>
  );
}