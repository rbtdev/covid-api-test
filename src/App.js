import React, { useEffect, useState } from 'react';
import SIRChart from './SIRChart';
import ApiChart from './ApiChart'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './App.css';

function App() {

  return (
    <div className="App">
      <Tabs>
        <TabList>
          <Tab>Real Time COVID-19 Data</Tab>
          <Tab>Dynamic SIR Model</Tab>
        </TabList>
        <TabPanel>
          <ApiChart />
        </TabPanel>
        <TabPanel>
          <SIRChart />
        </TabPanel>
      </Tabs>

    </div>
  );
}

export default App;
