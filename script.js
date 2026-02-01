// Definitions

let tokens = [];
let lastAnswer = "#000000";
let justSolved = false;

// Constants

const hexInput = document.getElementById ("hexInput");
const preview = document.getElementById ("colorPreview");
const rgbInput = document.getElementById ("rgbInput");
const hslInput = document.getElementById ("hslInput");
const cmykInput = document.getElementById ("cmykInput");

const mix1 = document.getElementById ("mix1");
const mix2 = document.getElementById ("mix2");
const blendMode = document.getElementById ("blendMode");
const mixBtn = document.getElementById ("mixBtn");
const mixResult = document.getElementById ("mixResult");

const contrast1 = document.getElementById ("contrast1");
const contrast2 = document.getElementById ("contrast2");
const contrastResult = document.getElementById ("contrastResult");

const generatePalette = document.getElementById ("generatePalette");
const paletteContainer = document.getElementById ("palette");

// Functions

function render () {
    const box = document.getElementById ("exprBox");
    if (!box) return;
    box.innerHTML = "";

    tokens.forEach ( t=> {
        if (t.type == "color") {
            const sw = document.createElement ("div");
            sw.className = "swatch";
            sw.style.background = t.value;
            box.appendChild (sw);
        } else {
            const sp = document.createElement ("span");
            sp.className = "token";
            sp.textContent = t.value;
            box.appendChild (sp);
        }
    });
}

function addToken (val) {
    if (justSolved) {
        tokens = [{
            type: "color",
            value: lastAnswer
        }];

        justSolved = false;
    }

    tokens.push({
        type: "op",
        value: val
    });

    render ();
}

function addColor () {
    if (justSolved) {
        tokens = [{
            type: "color",
            value: lastAnswer
        }];

        justSolved = false;
    }

    let c = prompt ("Enter Color Hex (#RRGGBB): ");

    if (/^#([0-9A-F]{6})$/i.test(c)) {
        tokens.push ({
            type: "color",
            value: c
        });

        render ();
    }
}

function clearAll () {
    tokens = [];
    render ();
}

function hexToRgb (hex) {
    let bigint = parseInt (hex.slice (1), 16);
    return [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        bigint & 255
    ];
}

function rgbToHex (r, g, b) {
    return "#" + [r, g, b].map (x => {
        x = Math.max (0, Math.min (255, Math.round (x)));
        return x.toString (16).padStart (2, "0");
    }).join ("");
}

function calculate () {
    try {
        let rE = "", gE = "", bE = "";
        tokens.forEach ( t=> {
            if (t.type === "color"){
                let [r,g,b] = hexToRgb (t.value);
                rE += r;
                gE += g;
                bE += b;
            } else if (t.value === "^2") {
                rE += "**2";
                gE += "**2";
                bE += "**2";
            } else if (t.value === "^3") {
                rE += "**3";
                gE += "**3";
                bE += "**3";
            } else {
                rE += t.value;
                gE += t.value;
                bE += t.value;
            }
        });

        let r = eval (rE), g = eval (gE), b = eval (bE);
        let ans = rgbToHex(r,g,b);

        const resCol = document.getElementById("resultColor");
        if (resCol) resCol.style.background = ans;
        lastAnswer = ans;
        justSolved = true;
    } catch {
        alert ("Invalid Expression")
    }
}

function blend (a,b,mode) {
    if (mode === "multiply") return a*b/255;
    if (mode === "screen") return 255-(255-a)*(255-b)/255;
    if (mode === "overlay") return a<128?2*a*b/255:255-2*(255-a)*(255-b)/255;

    return (a+b)/2;
}

function luminance (r,g,b) {
    let a = [r,g,b].map ( v => {
        v/=255;
        return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
    });

    return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];
}

function saveHistory (hex) {
    let history = JSON.parse (localStorage.getItem ("colors")||"[]");

    if (!history.includes (hex)) {
        history.unshift (hex);
        history = history.slice (0, 12);
        localStorage.setItem("colors", JSON.stringify (history));
        renderHistory();
    }
}

function renderHistory () {
    let history = JSON.parse (localStorage.getItem ("colors")||"[]");
    let container = document.getElementById ("history");

    if (!container) return;

    container.innerHTML = "";

    history.forEach (c => {
        let d = document.createElement("div");
        d.style.background = c;
        container.appendChild (d);
    });
}

// Render History:

renderHistory();

// Misc

hexInput?.addEventListener ("input", () => {
    let hex = hexInput.value;

    if (/^#([0-9A-F]{6})$/i.test(hex)) {
        let [r,g,b] = hexToRgb (hex);
        if (preview) preview.style.background = hex;
        if (rgbInput) rgbInput.value = `rgb(${r}, ${g}, ${b})`;
    }
});

if (mixBtn) {
    mixBtn.onclick = () => {
        let c1 = hexToRgb (mix1.value), c2 = hexToRgb (mix2.value);
        let mode = blendMode.value;
        let result = rgbToHex (
            blend (c1 [0], c2 [0], mode),
            blend (c1 [1], c2 [1], mode),
            blend (c1 [2], c2 [2], mode)
        );

        mixResult.style.background = result;
    }
}

contrast1.oninput = contrast2.oninput = () => {
    let c1 = hexToRgb (contrast1.value);
    let c2 = hexToRgb (contrast2.value);

    let L1 = luminance (...c1) + 0.05;
    let L2 = luminance (...c2) + 0.05;

    contrastResult.textContent = `Contrast Ratio: ${ratio}`;
};