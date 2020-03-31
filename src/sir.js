function SIR(s, i, r) {
    let ds = -rt*s*i;
    let di = rt*s*i - rr*i;
    let dr = rr*i;

    return {
        s: s+ds,
        i: i+di,
        r: r+dr
    }
}

let n = 1;
let iStart = .01;
let sStart = 0.99;
let rStart = 0;

let maxT = 20;

let dt = 0.01;
let rt = 3.2*dt;
let rr = 0.23*dt;
let s = sStart;
let i = iStart;
let r = rStart;

for (let t = 0; t<= maxT; t+=dt) {
    let sir = SIR(s,i,r);
    s = sir.s;
    i = sir.i;
    r = sir.r;
    console.log(`s: ${s}, i: ${i}, r: ${r}`);
}




