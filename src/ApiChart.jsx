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

const PREDICTED_GROWTH_TEMPLATE = {
  name: 'Predicted Growth',
  yValueFormatString: "#,###",
  xValueFormatString: "MM/DD/YY",
  type: "line",
  showInLegend: true,
  legendText: "Predicted Growth",
};

function App() {

  // Set up state variables
  const [showPredicted, setShowPredicted] = useState(false);
  const [nextUpdate, setNextUpdate] = useState(UPDATE_INTERVAL);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [data, setData] = useState([]);
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

    let confirmedTotal = {
      ...CONFIRMED_TOTAL_TEMPLATE,
      dataPoints: []
    }
    
    let confirmedNew = {
      ...CONFIRMED_NEW_TEMPLATE,
      dataPoints: []
    }
    
    let confirmedDead = {
      ...CONFIRMED_DEAD_TEMPLATE,
      dataPoints: []
    }
    
    let predictedTotal =  {
      ...PREDICTED_GROWTH_TEMPLATE,
      dataPoints: []
    }



    let response = await axios.get(`https://corona-api.com/countries/${country}`);
    response.data.data.timeline.forEach(entry => {
      let date = new Date(entry.date);
      confirmedTotal.dataPoints.unshift({
        x: date,
        y: entry.confirmed
      });
      confirmedNew.dataPoints.unshift({
        x: date,
        y: entry.new_confirmed
      });
      confirmedDead.dataPoints.unshift({
        x: date,
        y: entry.deaths
      });
    });
    let data = [confirmedTotal, confirmedNew, confirmedDead];

    if (showPredicted) {
      let end = new Date();
      let date = new Date(confirmedTotal.dataPoints[0].x);
      let value = 1;
      while (date < end) {
        let point = {
          x: new Date(date),
          y: value
        }
        predictedTotal.dataPoints.push(point)
        console.log(point)
        value *= 1.2;
        date = new Date(date.setDate(date.getDate() + 1));
      }
      data.push(predictedTotal);
    }

    // Set state
    console.log(JSON.stringify(data, null, 2));
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
  }, [country, showPredicted]);


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
        <h3>Last update {lastUpdate ? ((new Date() - lastUpdate) / (1000 * 60)).toFixed(0) : ''} mins ago</h3>
        <h3>Checking for update in  {(nextUpdate / 1000).toFixed(0)} seconds</h3>
        <p>
          This data is obtained from <a href='https://about-corona.net' target='_blank'>about-corona.net</a>
        </p>
        <select value={country} onChange={(e) => {
          setCountry(e.target.value)
        }}>
          {Object.keys(CountryCodes).map((key) => (<option value={key}>{CountryCodes[key]}</option>))}
        </select>
        <div>
          <input type = 'checkbox' onChange = {() => {
            setShowPredicted(showPredicted => !showPredicted)
        }}/>
          <span>Show Exponenrial Growth</span>
        </div>
      </div>
    </div>
  );
}

export default App;