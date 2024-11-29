import ProsessStep from './components/ProsessStep';

import './App.css'


import logo from './logo.jpg';
import VideoTimeline from './components/VideoTimeline';



function App() {
  return (
    <div className="App">
   
       <div className='flex justify-center pt-6'>
       <img src={logo} className="App-logo w-21 h-20 " alt="logo" />
       
       </div>
       <h1 className='flex justify-center pt-6 text-2xl font-semibold'>Tool to Search within Video in 2 simple steps:</h1>
     
     <ProsessStep />

 

 
    
    </div>
  );
}

export default App;
