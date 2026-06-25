import React from "react";

const Hero = ()  => {
  return (
    <div className="bg-blue-400">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 pt-44 ps-32 rounded-lg">
            <h1 className="text-5xl text-white font-bold mb-10">Track Every Job. Land More Interviews.</h1>
            <h3 className="text-2xl mb-2">Paste any job ad and let AI instantly extract the key details. Organize applications, track progress, and prepare for interviews from one simple dashboard.</h3>
            

            <button className="bg-black mt-10 mb-10 rounded shadow h-12 px-6 outline-none text-white hover:bg-white hover:text-primary cursor-pointer text-base transition-bg hover:border hover:border-primary">
              Start Now
            </button>
          </div>

          <div>
            <img src="/images/jobseeker.png" alt="Fashion model" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;