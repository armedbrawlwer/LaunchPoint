import React from 'react';
import { useSelector } from 'react-redux';
import HomePage from '../components/HomePage';

function Home() {
  const { currentUser } = useSelector(state => state.user); // Adjusted the selector to match your state structure
  return (
    <>
      {currentUser ? <HomePage /> : <div>Welcome to the home page. Please sign in to continue.</div>}
    </>
  );
}

export default Home;
