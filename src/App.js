import logo from './logo.svg';
import WelcomeScreen from './WelcomeScreen';
import CalendarScreen from './CalendarScreen';
import React from 'react';
import './App.css';
import {processTaskBank} from "./AIJudge";

processTaskBank();
function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
      <div className="App">
          {isLoggedIn ? (<CalendarScreen />) : (<WelcomeScreen onLogin={() => setIsLoggedIn(true)}/>)}
      </div>
  );
}

export default App;
