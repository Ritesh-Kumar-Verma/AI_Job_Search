import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navigation() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState("Job  Feed");

  return (
    <nav
      className="bg-white  shadow h-1/10"
      style={{
        background: `linear-gradient(135deg, #0a192f, #020c1b, #1c1f2f) `,
      }}
    >
      <div className="flex justify-between items-center lg:p-4 lg:flex-row flex-col bg-[rgb(255,255,255,0.05)]  shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-lg border-b border-[rgb(100,255,218)]">
        <Link
          to="/"
          className="flex-1 text-[#00bfff] font-bold lg:text-3xl text-2xl lg:flex-1 "
          onClick={()=>setActive("JobTracker")}
        >
          JobTracker
        </Link>
        <div className=" flex-4 lg:flex-row px-2 ">
          <div className="flex items-center md:justify-around justify-between gap-4  ">
            <Link
              to="/jobs"
              className={`  hover:text-[rgb(100,255,218)] lg:hover:scale-140 ${active == "Job Feed" ? "border-t rounded-t-md lg:scale-140 text-[rgb(100,255,218)]" : "text-[#e2e8f0]"}`}
              onClick={() => setActive("Job Feed")}
            >
              Job Feed
            </Link>
            <Link
              to="/applications"
              className={`  hover:text-[rgb(100,255,218)] lg:hover:scale-140 ${active == "Applications" ? "border-t rounded-t-md lg:scale-140 text-[rgb(100,255,218)]" : "text-[#e2e8f0]"}`}
              onClick={() => setActive("Applications")}
            >
              Applications
            </Link>
            <Link
              to="/resume"
              className={`  hover:text-[rgb(100,255,218)] lg:hover:scale-140 ${active == "Resume" ? "border-t rounded-t-md lg:scale-140 text-[rgb(100,255,218)]" : "text-[#e2e8f0]"}`}
              onClick={() => setActive("Resume")}
            >
              Resume
            </Link>

            <span className=" text-[#e2e8f0] hidden lg:block">{user?.email}</span>
            {/* <div className="flex items-center  border-2 border-white "> */}
              <button
                onClick={logout}
                className="opacity-40 border-2 border-white  bg-blue-100 hover:bg-red-400 text-gray-800 px-2 py-1 rounded text-sm mb-2"
              >
                Logout
              </button>
            {/* </div> */}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
