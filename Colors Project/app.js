const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustBtn = document.querySelectorAll('.adjust');
const lockBtn = document.querySelectorAll('.lock');
const SliderBox = document.querySelectorAll('.slider');
const closeAdjust = document.querySelectorAll('.close-adjustment');
let initialColors;

let savedPalletes = [];



generateBtn.addEventListener('click', randomColors);

lockBtn.forEach((locks, index) =>{
    locks.addEventListener('click', () => {
        colorDivs[index].classList.toggle('locked');
        if (colorDivs[index].classList.contains('locked')){
            locks.innerHTML = '<i class="fas fa-lock">'
        }
        else{
            locks.innerHTML = '<i class="fas fa-lock-open">'
        }

    })
})
sliders.forEach(slider => {
    slider.addEventListener('input', hslControls);
})

colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateTextUI(index);
    })
})

currentHexes.forEach(hex => {
    hex.addEventListener('click', ()=>{
        copyToClipBoard(hex);
    })
})

popup.addEventListener('transitionend', ()=> {
    const box = popup.children[0];
    popup.classList.remove('active');
    box.classList.remove('active');
})

adjustBtn.forEach((adjust, index) => {
    adjust.addEventListener('click', () => {
        SliderBox[index].classList.toggle('active');
    })
})

closeAdjust.forEach((clos, index) => {
    clos.addEventListener('click', () => {
        SliderBox[index].classList.remove('active');
    })
})






function generateHex(){
    return chroma.random();
}

function randomColors(){
    initialColors = [];
    colorDivs.forEach((div,index) => {
        const HexText = div.children[0];
        const randomColor = generateHex();

        if (div.classList.contains('locked')){
            initialColors.push(HexText.innerText);
            return;
        }
        else{
            initialColors.push(chroma(randomColor).hex());
        }
        //Add color to bg
        div.style.background = randomColor;
        HexText.innerText = randomColor;
        checkTextConstrast(randomColor, HexText);

        //Initial colorize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".slider input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);
    });
    resetInputs();

    adjustBtn.forEach((button, index) => {
        checkTextConstrast(initialColors[index], button);
        checkTextConstrast(initialColors[index], lockBtn[index]);
    })
}

function checkTextConstrast(color, text){
    if (chroma(color).luminance() > 0.5){
        text.style.color = "black";
    }
    else{
        text.style.color = "white";
    }
}

function colorizeSliders(color, hue, brightness, saturation){
    //Scale saturation
    const noSat = color.set('hsl.s', 0); //ye cheez us color ko desaturate krdegi to it's loweste
    const fullSat = color.set('hsl.s', 1); 
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    //Scale Brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBright, 'white'])

    //Ab us scale k peechhe ka update krna:
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)} ,${scaleBright(1)})`;
    hue.style.backgroundImage =  `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), 
                                    rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
}


function hslControls(e){
    const index = e.target.getAttribute('data-bright') || e.target.getAttribute('data-hue') ||  e.target.getAttribute('data-sat')
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];

    let color = chroma(bgColor).set('hsl.s', saturation.value).set('hsl.l', brightness.value).set('hsl.h', hue.value);

    colorDivs[index].style.background = color;

    //Colorizing Inputs:
    colorizeSliders(color, hue, brightness, saturation)

}

function updateTextUI(index){
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();
    checkTextConstrast(color, textHex);
    for (icon of icons){
        checkTextConstrast(color, icon);
    }
}

function resetInputs(){
    const sliders = document.querySelectorAll(".slider input");
    sliders.forEach(slider => {
        if (slider.name === 'hue'){
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if (slider.name === 'brightness'){
            const BrColor = initialColors[slider.getAttribute('data-bright')];
            const BrValue = chroma(BrColor).hsl()[2];
            slider.value = Math.floor(BrValue * 100)/100;
        }
        if (slider.name === 'saturation'){
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue* 100)/100;
        }
    })
}

function copyToClipBoard(hex){
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    //UI:
    const box = popup.children[0];
    popup.classList.add('active');
    box.classList.add('active');

}

const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

saveBtn.addEventListener('click', openPalett);
closeSave.addEventListener('click', closePalett);
submitSave.addEventListener('click', savePallet)
libraryBtn.addEventListener('click', openLib);
closeLibraryBtn.addEventListener('click', closeLib);


function openPalett(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');

}

function closePalett(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePallet(e){
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.add('active');
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    })

    let palettNbr = savedPalletes.length;
    const palettObject = {name: name, colors: colors, nbr: palettNbr};
    savedPalletes.push(palettObject);
    
    //Now save to local storage
    savetoLocal(palettObject);
    saveInput.value = '';

    //Generate the Palett for the lib
    const palett = document.createElement('div');
    palett.classList.add('custom-palett');
    const title = document.createElement('h4');
    title.innerText = palettObject.name;
    const preview  = document.createElement('div');
    preview.classList.add('small-preview');
    palettObject.colors.forEach(smallcol => {
        const smallDiv  = document.createElement('div');
        smallDiv.style.backgroundColor = smallcol;
        preview.appendChild(smallDiv);
    })
    const palettBtn  = document.createElement('button');
    palettBtn.classList.add('pick-palett-btn');
    palettBtn.classList.add(palettObject.nbr);
    palettBtn.innerText = 'Select';

    palettBtn.addEventListener('click', e => {
        closeLib();
        const index = e.target.classList[1];
        initialColors = [];
        savedPalletes[index].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextConstrast(color, text);
            updateTextUI(index);
        })
        resetInputs();

    })

    palett.appendChild(title);
    palett.appendChild(preview);
    palett.appendChild(palettBtn);
    libraryContainer.children[0].appendChild(palett);
} 

function savetoLocal(palettObject){
    let localPaletts;
    if (localStorage.getItem('palett')===null){
        localPaletts = [];
    }
    else{
        localPaletts = JSON.parse(localStorage.getItem('palett'));
        localPaletts.push(palettObject);
        localStorage.setItem('palett', JSON.stringify(localPaletts));
    }
}

function openLib(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closeLib(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}


function getLocal(){
    if (localStorage.getItem('palett')===null){
        localPaletts = [];
    }
    else{
        const palettObjects = JSON.parse(localStorage.getItem('palett'));
        palettObjects.forEach(palettObject => {
            const palett = document.createElement('div');
            palett.classList.add('custom-palett');
            const title = document.createElement('h4');
            title.innerText = palettObject.name;
            const preview  = document.createElement('div');
            preview.classList.add('small-preview');
            palettObject.colors.forEach(smallcol => {
                const smallDiv  = document.createElement('div');
                smallDiv.style.backgroundColor = smallcol;
                preview.appendChild(smallDiv);
            })
            const palettBtn  = document.createElement('button');
            palettBtn.classList.add('pick-palett-btn');
            palettBtn.classList.add(palettObject.nbr);
            palettBtn.innerText = 'Select';

            palettBtn.addEventListener('click', e => {
                closeLib();
                const index = e.target.classList[1];
                initialColors = [];
                palettObjects[index].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    checkTextConstrast(color, text);
                    updateTextUI(index);
                })
                resetInputs();

            })

            palett.appendChild(title);
            palett.appendChild(preview);
            palett.appendChild(palettBtn);
            libraryContainer.children[0].appendChild(palett);
            })
    }
}


getLocal();
randomColors();