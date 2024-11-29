import React, { useState } from "react";
import VideoSearchComponent from "./VideoSearchComponent";
import SecondStepToVideoSearch from "./SecondStepToVideoSearch";

const ProsessStep = () => {
  const [activeStep, setActiveStep] = useState(1);

  const handleStepClick = (step) => {
    setActiveStep(step);
  };

  return (
    <div>
 
      <div className="stepper-container flex items-center p-7 justify-center gap-2">
       <ul className="flex items-center">

  <li
    onClick={() => handleStepClick(1)}
    className={`${
      activeStep === 1 ? "bg-green-500 text-white" : "bg-white text-black shadow-lg"
    } flex items-center justify-center rounded-full w-10 h-10 cursor-pointer transition`}
  >
    1
   
  </li>
 


  <div
    className={`w-20 h-1 mx-2 border-t-2 border-dashed transition-colors ${
      activeStep >= 2 ? "border-green-500" : "border-gray-400"
    }`}
  ></div>


  <li
    onClick={() => handleStepClick(2)}
    className={`${
      activeStep === 2 ? "bg-green-500 text-white" : "bg-white text-black shadow-lg"
    } flex items-center justify-center rounded-full w-10 h-10 cursor-pointer transition`}
  >
    2
  </li>



</ul>

      </div>
      <div className="text-center -mt-6">
  <span className="mx-14 text-gray-700">Step</span>
  <span className="mx-14 text-gray-700">Step</span>
</div>

      <div className="step-content mt-6">
        {activeStep === 1 && <VideoSearchComponent />} 
        {activeStep === 2 && <SecondStepToVideoSearch />} 
      </div>
    </div>
  );
};

export default ProsessStep;
