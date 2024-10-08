import logo from './logo.svg';
import './App.css';
import Navbar from './Navbar';
import Carousal from './Carousal';
import Card from './Card';
import Offer from './Offer';
import Images from './Images';
import InfiniteCarousel from './InfiniteCarousel';
import Footer from './Footer';
import Ps from './Ps'
import Psi from './Psi'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import offer from './Offer';
import Add from './Add';


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<><Offer /> <Navbar /> <Card /> <Carousal /> <Images /> <InfiniteCarousel /> <Footer /></>}/>
        <Route path='/login' element={<Psi />}/>
        <Route path='/signin' element={<Ps />}/>
        <Route path='/add' element={<Add />}/>
      </Routes>
    </Router>

       {/* <Offer />
    <Navbar />
    <Card />
    <Carousal />
   <Images /> 
 <InfiniteCarousel /> 

 <Footer /> */}
    
    </>
  );
}

export default App;
