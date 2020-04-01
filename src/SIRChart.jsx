import React, { useEffect, useState } from 'react';
import SplineChart from './spline-chart';
import './App.css';

const S_TEMPLATE = {
    type: "spline",
    showInLegend: true,
    legendText: "Susceptable",
};

const I_TEMPLATE = {
    type: "spline",
    showInLegend: true,
    legendText: "Infected",
};

const R_TEMPLATE = {
    type: "spline",
    showInLegend: true,
    legendText: "Recovered",
};

const T_TEMPLATE = {
    type: "spline",
    showInLegend: true,
    legendText: "Total Affected",
};

const TR_TEMPLATE = {
    type: "spline",
    showInLegend: true,
    legendText: "Total Affected Rate",
};

function SIRChart() {

    // Set up state variables
    let [data, setData] = useState([]);
    let [RT, setRT] = useState(1.3);
    let [RR, setRR] = useState(0.23);
    let [I0, setI0] = useState(0.01);
    let [MAX_T, setMAX_T] = useState(20);

    //
    // Get new data from api
    //
    const getData = async () => {

        function SIR(s, i, r, rt, rr) {
            let ds = -rt * s * i;
            let di = rt * s * i - rr * i;
            let dr = rr * i;

            return {
                s: s + ds,
                i: i + di,
                r: r + dr
            }
        }

        let susceptableSeries = {
            ...S_TEMPLATE,
            dataPoints: []
        }

        let infectedSeries = {
            ...I_TEMPLATE,
            dataPoints: []
        }

        let recoveredSeries = {
            ...R_TEMPLATE,
            dataPoints: []
        }

        let totalSeries = {
            ...T_TEMPLATE,
            dataPoints: []
        }

        let totalRateSeries = {
            ...TR_TEMPLATE,
            dataPoints: []
        }

        let iStart = I0 / 100;
        let sStart = 1 - iStart;
        let rStart = 0;

        let dt = .1;
        let rt = RT*dt;
        let rr = RR*dt;
        let s = sStart;
        let i = iStart;
        let r = rStart;
        let ta = iStart;

        for (let t = 0; t <= MAX_T; t += dt) {
            let sir = SIR(s, i, r, rt, rr);
            s = sir.s;
            i = sir.i;
            r = sir.r;
            let taPrev = ta;
            ta = r + i;
            let taRate = ta - taPrev;
            susceptableSeries.dataPoints.unshift({ x: t, y: s });
            infectedSeries.dataPoints.unshift({ x: t, y: i });
            recoveredSeries.dataPoints.unshift({ x: t, y: r });
            totalSeries.dataPoints.unshift({ x: t, y: ta });
            totalRateSeries.dataPoints.unshift({ x: t, y: taRate })
        }

        let data = [susceptableSeries, infectedSeries, recoveredSeries, totalSeries, totalRateSeries]

        // Set state
        setData(data);
    }

    //
    // On monunt, start data updates and countdown
    //
    useEffect(() => {
        getData();
    }, [RT, RR, I0, MAX_T]);


    // Chart options
    const options = {
        zoomEnabled: true,
        zoomType: 'xy',
        //animationEnabled: true,
        title: {
            text: `SIR Model`
        },
        axisX: {
            //valueFormatString: "MM/DD/YY",
            interval: 1,
            title: 'Time'
        },
        axisY: {
            title: "% of Population",
            includeZero: false,
        },
        legend: {
            horizontalAlign: "center", // "center" , "right"
            verticalAlign: "top",  // "top" , "bottom"
            fontSize: 20
        },
        data // Use latest data from api
    };

    return (
        <div>
            <SplineChart options={options} />

            <div className='control'>
                <div className='label'>Rate of Transmission</div>
                <input type='range' min='.01' max='5' step='.01' value={`${RT}`} onChange={(e) => {
                    setRT(e.target.value)
                }} style={{ width: 300 }} />
                <div className='value'>{RT}</div>

            </div>

            <div className='control'>
                <div className='label'>Rate of Recovery</div>
                <input type='range' min='.01' max='5' step='.01' value={`${RR}`} onChange={(e) => {
                    setRR(e.target.value)
                }} style={{ width: 300 }} />
                <div className='value'>{RR}</div>
            </div>

            <div className='control'>
                <div className='label'>Initial Infected</div>
                <input type='range' min='.001' max='100' step='.001' value={`${I0}`} onChange={(e) => {
                    setI0(parseFloat(e.target.value));
                }} style={{ width: 300 }} />
                <div className='value'>{I0}</div>

            </div>

            <div className='control'>
                <div className='label'>Time Period</div>
                <input type='range' min='1' max='50' step='1' value={`${MAX_T}`} onChange={(e) => {
                    setMAX_T(parseFloat(e.target.value));
                }} style={{ width: 300 }} />
                <div className='value'>{MAX_T}</div>

            </div>

        </div>
    );
}

export default SIRChart;
