import React, { useEffect, useState } from 'react';
import SplineChart from './spline-chart';
import axios from 'axios';
import moment from 'moment';
import CountryCodes from './ISO3166-1.alpha2.json';
import './App.css';

const UPDATE_INTERVAL = 60 * 1000; // One minute update interval

const CONFIRMED_TOTAL_TEMPLATE = {
  type: "line",
  showInLegend: true,
  legendText: "Total Confirmed",
};

const CONFIRMED_NEW_TEMPLATE = {
  type: "column",
  showInLegend: true,
  legendText: "New Confirmed Cases",
};

const CONFIRMED_DEAD_TEMPLATE = {
  type: "line",
  showInLegend: true,
  legendText: "Confirmed Dead",
};

function App() {

  // Set up state variables
  const [nextUpdate, setNextUpdate] = useState(UPDATE_INTERVAL);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
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



    let response = await axios.get(`https://corona-api.com/countries/${country}`);
    let _data = response.data.data;
    let start = moment('March 2020', 'MMMM YYYY')
    _data.timeline.forEach(entry => {
      let date = moment(entry.date, "YYYY-MM-DD");
      if (!entry.is_in_progress && date.isAfter(start)) {

        confirmedNew.dataPoints.unshift({
          x: date.toDate(),
          y: entry.new_confirmed
        });
        // confirmedTotal.dataPoints.unshift({
        //   x: date.toDate(),
        //   y: entry.confirmed
        // });
        // confirmedDead.dataPoints.unshift({
        //   x: date.toDate(),
        //   y: 100000*entry.deaths
        // });
      }
    });

    let data = [confirmedTotal, confirmedNew, confirmedDead];
    let summary = {
      population: _data.population || 0,
      percentCases: _data.latest_data.confirmed / _data.population || 0,
      confirmed: _data.latest_data.confirmed || 0,
      today: _data.today,
      deaths: _data.latest_data.deaths | 0,
      recovered: _data.latest_data.recovered || 0,
      deathRate: _data.latest_data.calculated.death_rate || 0,
      recoveryRate: _data.latest_data.calculated.recovery_rate || 0
    }

    // Set state
    setData(data);
    setSummary(summary);
    setLastUpdate(new Date(response.data.data.updated_at));
    setNextUpdate(UPDATE_INTERVAL);
  }

  const startFeed = () => {
    stopFeed();
    getData();
    fetchTimer = setInterval(getData, UPDATE_INTERVAL);
    countdownTimer = setInterval(() => setNextUpdate(nextUpdate => nextUpdate - 1000), 1000);
  }

  const stopFeed = () => {
    clearInterval(fetchTimer);
    clearInterval(countdownTimer);
  }

  //
  // Switch feed if country changes
  // This will happen when the country is first set when the component initializes
  //
  useEffect(() => {
    startFeed();
    return stopFeed;
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
      valueFormatString: "MMM-DD-YYYY",
      interval: 2,
      intervalType: "week"
    },
    axisY: {
      title: "People",
      includeZero: false
    },
    legend: {
      horizontalAlign: "center", // "center" , "right"
      verticalAlign: "bottom",  // "top" , "bottom"
      fontSize: 20
    },
    data // Use latest data from api
  };

  const getSummary = () => {
    if (!summary) return null;
    let { today, population = 0, confirmed = 0, percentCases = 0, deathRate = 0 } = summary;
    return (
      <div style={{ margin: '30px', textAlign: 'left' }}>
        <div>Population: {population.toLocaleString()}</div>
        <div>Confirmed Cases: {confirmed.toLocaleString()}</div>
        <div>Case Percentage: {(percentCases * 100).toFixed(2)}% of total population</div>
        <div>Mortality Rate: {deathRate.toFixed(2)}%</div>
        <div>New Cases Today: {today.confirmed.toLocaleString()}</div>
        <div>Deaths Today: {today.deaths.toLocaleString()}</div>
      </div>
    )
  }
  return (
    <div className="App">
      <div style={{ padding: 20 }}>
        <div style={{ display: 'inline-block', padding: 20 }}>
          Select country:
        </div>
        <select value={country} onChange={(e) => {
          setCountry(e.target.value)
        }}>
          {Object.keys(CountryCodes).map((key) => (<option value={key}>{CountryCodes[key]}</option>))}
        </select>
      </div>
      <SplineChart options={options} />
      <div className='summary'>
        {getSummary()}
      </div>
      <h3>Last update {lastUpdate ? ((new Date() - lastUpdate) / (1000 * 60)).toFixed(0) : ''} mins ago</h3>
      <h3>Checking for update in  {(nextUpdate / 1000).toFixed(0)} seconds</h3>
      <p>
        This data is obtained from <a href='https://about-corona.net' target='_blank'>about-corona.net</a>
      </p>


    </div>
  );
}

export default App;
