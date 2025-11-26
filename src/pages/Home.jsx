import React, { useState } from "react";
//import GradeTimelineEditor from "../components/GradeTimelineEditor";
import TimelineEditor from "../components/GradeTimelineEditor";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white p-4 rounded-lg shadow-md mb-4">
        <h1 className="text-2xl font-bold text-center">
          Grade Transition Visualizer
        </h1>
      </header>
      <TimelineEditor  />
    </div>
  );
}
