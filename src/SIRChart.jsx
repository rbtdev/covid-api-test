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

function SIRChart() {

    // Set up state variables
    let [data, setData] = useState([]);
    let [RT, setRT] = useState(3.2);
    let [RR, setRR] = useState(0.23);
    let [I0, setI0] = useState(50);

    //
    // Get new data from api
    //
    const getData = async () => {

        function SIR(s, i, r) {
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

        let iStart = I0/100;
        let sStart = 1 - iStart;
        let rStart = 0;

        let maxT = 20;

        let dt = 0.1;
        let rt = RT * dt;
        let rr = RR * dt;
        let s = sStart;
        let i = iStart;
        let r = rStart;

        for (let t = 0; t <= maxT; t += dt) {
            let sir = SIR(s, i, r);
            s = sir.s;
            i = sir.i;
            r = sir.r;
            console.log(`s: ${s}, i: ${i}, r: ${r}`);
            susceptableSeries.dataPoints.unshift({
                x: t,
                y: s
            });
            infectedSeries.dataPoints.unshift({
                x: t,
                y: i
            });
            recoveredSeries.dataPoints.unshift({
                x: t,
                y: r
            });
        }
        let data = [susceptableSeries, infectedSeries, recoveredSeries]

        // Set state
        setData(data);
    }

    //
    // On monunt, start data updates and countdown
    //
    useEffect(() => {
        getData();
    }, [RT, RR, I0]);


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
            horizontalAlign: "left", // "center" , "right"
            verticalAlign: "center",  // "top" , "bottom"
            fontSize: 20
        },
        data // Use latest data from api
    };

    return (
            <div>
                <SplineChart options={options} />
                <input type = 'range' min = '.01' max = '5' step = '.01' value={`${RT}`} onChange = {(e) => {
                    setRT(e.target.value)
                }} style = {{width: 300}}/>
                <div>Rate of Transmission = {RT}</div>

                <input type = 'range' min = '.01' max = '5' step = '.01' value={`${RR}`} onChange = {(e) => {
                    setRR(e.target.value)
                }} style = {{width: 300}}/>
                <div>Rate of Recovery = {RR}</div>

                <input type = 'range' min = '0' max = '100' step = '.001' value={`${I0}`} onChange = {(e) => {
                    setI0(parseFloat(e.target.value));
                }} style = {{width: 300}}/>
                <div>Initial Infected % = {I0}</div>
            </div>
    );
}

export default SIRChart;
