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
import Results from './Results';
import SignUp from './SignUp';
import AddProduct from './AddProduct';
import Login from './Login';
import CartResults from './CartResults';
import Starrate from './Starrate';
import Details from './Details';
import Cat from './Cat';
import Payment from './Payment';


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<><Offer /> <Navbar /> <Card /> <Carousal /> <Images /> <InfiniteCarousel /> <Footer /></>}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/signin' element={<SignUp />}/>
        <Route path='/add' element={<> <AddProduct /></>}/>
        <Route path="/search/:searchterm" element={<><Offer /> <Navbar /> <Results /></>} />
        <Route path="/showcart" element={<><Offer /> <Navbar /> <CartResults /></>} />
        <Route path='/rate-page/:product_Id' element={<><Starrate /></>} />
        <Route path='/details/:product_Id' element={<><Offer /> <Navbar /> <Details /></>}/>
        <Route path='/catagory/:cat' element={<><Offer /> <Navbar /> <Cat /></>} />
        <Route path='/payments/:product_Id' element={<><Offer /><Navbar /><Payment /></>}/>
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
