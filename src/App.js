import React, { useEffect, useState } from 'react';
import './App.css';
import Mapa from './Mapa.js';

function App(){
  return(
    <div className='App'>
      <header className='App-header'>
          <h1>Datos MUNICIPIOS</h1>
      </header>
      <main>
        <Mapa />
      </main>
    </div>
  );
}

export default App;