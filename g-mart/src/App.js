import logo from './logo.svg';
import './App.css';
import Navbar from './Navbar';
import Carousal from './Carousal';
import Card from './Card';
import Offer from './Offer';
import StaticImage from './StaticImage';
import InfiniteCarousel from './InfiniteCarousel';
import Ps from './Ps';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Psi from './Psi';

function App() {
  return (
    <>
    {/* <Offer />
    <Navbar />
    <Card />
    <Carousal />
    <StaticImage />
    <InfiniteCarousel /> */}
    <Router>
      <Routes>
      <Route path="/signup" element={<Ps />} />
      <Route path='/login' element={<Psi />} />
      </Routes>
    </Router>
    <Ps />
    </>
  );
}

export default App;
