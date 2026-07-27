import React from "react";
import Image from "next/image";

const Hero = () => {
  return (
    <div className="bg-blue-400">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="p-6 pt-16 md:pt-44 md:ps-32">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Track Every Job. Land More Interviews.
            </h1>

            <h3 className="text-lg md:text-2xl mb-6">
              Paste any job ad and let AI instantly extract the key details.
              Organize applications, track progress, and prepare for interviews
              from one simple dashboard.
            </h3>

            <button className="bg-black mt-8 rounded shadow h-12 px-6 text-white hover:bg-white hover:text-primary hover:border hover:border-primary transition">
              Start Now
            </button>
          </div>

          <div className="flex justify-center p-6">
            <Image
              src="/images/jobseeker.png"
              alt="Job seeker"
              width={600}
              height={600}
              className="w-full max-w-md h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;