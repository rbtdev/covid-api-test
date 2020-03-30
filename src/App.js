import React, { useEffect, useState } from 'react';
import SplineChart from './spline-chart';
import axios from 'axios';
import CountryCodes from './ISO3166-1.alpha2.json';
import './App.css';

const UPDATE_INTERVAL = 60 * 1000; // One minute update interval

const CONFIRMED_TOTAL_TEMPLATE = {
  name: 'Total Confirmed',
  yValueFormatString: "#,###",
  xValueFormatString: "MM/DD/YY",
  type: "line",
  showInLegend: true,
  legendText: "Total Confirmed",
};

const CONFIRMED_NEW_TEMPLATE = {
  name: 'New Confirmed',
  yValueFormatString: "#,###",
  xValueFormatString: "MM/DD/YY",
  type: "column",
  showInLegend: true,
  legendText: "New Confirmed",
};

const CONFIRMED_DEAD_TEMPLATE = {
  name: 'Confirmed Dead',
  yValueFormatString: "#,###",
  xValueFormatString: "MM/DD/YY",
  type: "column",
  showInLegend: true,
  legendText: "Confirmed Dead",
};

const INITIAL_DATA = [];
const CONFIRMED_TOTAL_INDEX = 0;
const CONFIRMED_NEW_INDEX = 1;
const CONFIRMED_DEAD_INDEX = 2;

INITIAL_DATA[CONFIRMED_TOTAL_INDEX] = {
  ...CONFIRMED_TOTAL_TEMPLATE,
  dataPoints: []
}

INITIAL_DATA[CONFIRMED_NEW_INDEX] = {
  ...CONFIRMED_NEW_TEMPLATE,
  dataPoints: []
};

INITIAL_DATA[CONFIRMED_DEAD_INDEX] = {
  ...CONFIRMED_DEAD_TEMPLATE,
  dataPoints: []
};


function App() {

  // Set up state variables
  const [nextUpdate, setNextUpdate] = useState(UPDATE_INTERVAL);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [data, setData] = useState(INITIAL_DATA);
  const [country, setCountry] = useState('US');

  let countdownTimer = null;
  let fetchTimer = null;

  //
  // Get new data from api
  //
  // Transform raw data to chart timeline
  //
  // Reset countdown
  //
  const getData = async () => {

    let response = await axios.get(`https://corona-api.com/countries/${country}`);
    let data = response.data.data.timeline.reduce((data, entry) => {
      data[CONFIRMED_TOTAL_INDEX].dataPoints.push({
        x: new Date(entry.date),
        y: entry.confirmed
      });
      data[CONFIRMED_NEW_INDEX].dataPoints.push({
        x: new Date(entry.date),
        y: entry.new_confirmed
      });
      data[CONFIRMED_DEAD_INDEX].dataPoints.push({
        x: new Date(entry.date),
        y: entry.deaths
      });

      return data;

    }, [{
      ...CONFIRMED_TOTAL_TEMPLATE,
      dataPoints: []
    }, {
      ...CONFIRMED_NEW_TEMPLATE,
      dataPoints: []
    }, {
      ...CONFIRMED_DEAD_TEMPLATE,
      dataPoints: []
    }]);

    // Set state
    setData(data);
    setLastUpdate(new Date(response.data.data.updated_at));
    setNextUpdate(UPDATE_INTERVAL);
  }

  //
  // On monunt, start data updates and countdown
  //
  useEffect(() => {
    getData();
    clearInterval(fetchTimer);
    clearInterval(countdownTimer);
    fetchTimer = setInterval(getData, UPDATE_INTERVAL);
    countdownTimer = setInterval(() => {
      setNextUpdate(nextUpdate => nextUpdate - 1000);
    }, 1000);
    return () => {
      clearInterval(fetchTimer);
      clearInterval(countdownTimer);
    }
  }, []);

  useEffect(() => {
    getData();
    debugger
    clearInterval(fetchTimer);
    clearInterval(countdownTimer);
    fetchTimer = setInterval(getData, UPDATE_INTERVAL);
    countdownTimer = setInterval(() => {
      setNextUpdate(nextUpdate => nextUpdate - 1000);
    }, 1000);
    return () => {
      clearInterval(fetchTimer);
      clearInterval(countdownTimer);
    }
  }, [country]);


  // Chart options
  const options = {
    zoomEnabled: true,
    zoomType: 'xy',
    animationEnabled: true,
    title: {
      text: `${CountryCodes[country]} Covid-19 Stats`
    },
    axisX: {
      valueFormatString: "MM/DD/YY",
      interval: 7,
      intervalType: "day"
    },
    axisY: {
      title: "People",
      includeZero: false
    },
    legend: {
      horizontalAlign: "left", // "center" , "right"
      verticalAlign: "center",  // "top" , "bottom"
      fontSize: 20
    },
    data // Use latest data from api
  };

  return (
    <div className="App">
      <div style={{ width: '75%' }}>
        <SplineChart options={options} />
        <h3>Last update {lastUpdate ? ((new Date() - lastUpdate)/(1000*60)).toFixed(0): ''} mins ago</h3>
        <h3>Checking for update in  {(nextUpdate/1000).toFixed(0)} seconds</h3>
        <p>
          This data is obtained from <a href = 'https://about-corona.net' target = '_blank'>about-corona.net</a>
        </p>
        <select value = {country} onChange = { (e) => {
          setCountry(e.target.value)}}>
          {Object.keys(CountryCodes).map((key) => (<option value = {key}>{CountryCodes[key]}</option>))}
        </select>
      </div>
    </div>
  );
}

export default App;
