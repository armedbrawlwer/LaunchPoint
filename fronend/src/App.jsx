import { useState } from 'react';
import './App.css';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import Signup from './pages/Signup';
import CreateProject from './pages/CreateProject';
import ViewProjects from './pages/ViewProjects';
import ViewDeployments from './pages/ViewDeployments';


function App() {

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/create-project' element={<CreateProject />} />
        <Route path='/view-all-projects' element={<ViewProjects />} />
        <Route path='/view-deployed-projects' element={<ViewDeployments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
