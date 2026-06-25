// "use client";

// import { useState } from "react";
// import { HiMenuAlt3 } from "react-icons/hi";
// import { MdClose } from "react-icons/md";
// import {  FaUser, FaHeart } from "react-icons/fa";
// import Link from "next/link";
// // import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";




// export default function Header(): JSX.Element {
//     const [dropdown, setDropdown] = useState<boolean>(false);
  

//   return (
//     <nav className="w-full h-24 flex flex-col justify-center items-center sticky top-0 z-50 bg-white shadow-md">
//       <div className="container mx-auto lg:px-3 w-full">
//         <div className="lg:w-full w-11/12 mx-auto h-full flex justify-between items-center">
//           <div className="flex items-center">
//             <span className="text-4xl font-bold text-primary">Job</span>
//             <span className="text-4xl font-bold"> Snap</span>
//           </div>

//           <ul className="flex items-center xl:gap-12 gap-x-4 max-lg:hidden">
//             <li>
//               <Link href="/" className="leading-normal text-cyan-950 text-lg hover:text-black">
//                 Home
//               </Link>
//             </li>
//             <li>
//               <Link href="#" className="leading-normal text-cyan-950 text-lg hover:text-black">
//                 Gallery
//               </Link>
//             </li>
//             <li>
//               <Link href="#" className="leading-normal text-cyan-950 text-lg hover:text-black">
//                 Category
//               </Link>
//             </li>
//             <li>
//               <Link href="#" className="leading-normal text-cyan-950 text-lg hover:text-black">
//                 Products
//               </Link>
//             </li>
//           </ul>

//           <div className="flex gap-4 items-center max-lg:hidden">
//             <div className="relative">
              
//             </div>

//             <Link href="/login" className="text-2xl text-cyan-950 hover:text-black cursor-pointer">
//               <FaUser />
//             </Link>

//             <Link href="/wishlist" className="text-2xl text-cyan-950 hover:text-black cursor-pointer">
//               <FaHeart />
//             </Link>
//           </div>

//           <div className="flex lg:hidden">
//             {dropdown ? (
//               <MdClose
//                 onClick={showDropdown}
//                 className="text-[22px] cursor-pointer text-black"
//               />
//             ) : (
//               <HiMenuAlt3
//                 onClick={showDropdown}
//                 className="text-[22px] cursor-pointer text-black"
//               />
//             )}
//           </div>
//         </div>

//         {dropdown && (
//           <div className="lg:hidden w-full fixed top-24 bg-primary transition-all z-40">
//             <div className="w-full flex flex-col gap-4">
//               <ul className="flex flex-col w-full">
//                 <li>
//                   <Link href="/" className="px-6 h-10 flex items-center text-white font-bold text-lg hover:text-primary border-b border-[#ffffff1a]">
//                     Home
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/ticket" className="px-6 h-10 flex items-center text-white font-bold text-lg hover:text-primary border-b border-[#ffffff1a]">
//                     Ticket
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/explore" className="px-6 h-10 flex items-center text-white font-bold text-lg hover:text-primary border-b border-[#ffffff1a]">
//                     Explore
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/activity" className="px-6 h-10 flex items-center text-white font-bold text-lg hover:text-primary border-b border-[#ffffff1a]">
//                     Activity
//                   </Link>
//                 </li>
//               </ul>

//               <div className="flex flex-col gap-2 px-6 py-4">
//                 <Link
//                   href="/login"
//                   className="px-4 py-2 bg-transparent border border-white text-white rounded text-center hover:bg-white hover:text-primary transition"
//                 >
//                   Login
//                 </Link>

//                 <Link
//                   href="/signup"
//                   className="px-4 py-2 bg-indigo-700 text-white rounded text-center hover:bg-indigo-800 transition"
//                 >
//                   Sign Up
//                 </Link>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

      
//     </nav>
//   );
// }

"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto h-20  flex items-center justify-between">
        <Link href="/" className="text-4xl font-bold">
          JobSnap
        </Link>

        <nav className="flex gap-6 font-semibold">
          <Link href="/dashboard" className="hover:text-blue-600">
            Dashboard
          </Link>

          <Link href="/jobs" className="hover:text-blue-600">
            Jobs
          </Link>

          <Link href="/kanban" className="hover:text-blue-600">
            Kanban
          </Link>

          <Link href="/add-job" className="hover:text-blue-600">
            Add Job
          </Link>

          <Link href="/resume" className="hover:text-blue-600">
            resume
          </Link>
        </nav>
      </div>
    </header>
  );
}