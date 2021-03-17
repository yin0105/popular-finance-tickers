var synth = window.speechSynthesis;

// var inputForm = document.querySelector('form');
// var inputTxt = document.querySelector('.txt');
// var voiceSelect = document.querySelector('select');

// var pitch = document.querySelector('#pitch');
// var pitchValue = document.querySelector('.pitch-value');
// var rate = document.querySelector('#rate');
// var rateValue = document.querySelector('.rate-value');
var pitch_val = 1;
var rate_val = 1;

var voices = [];

function populateVoiceList() {
    console.log("populate");
  voices = synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
  });
  console.log(voices);
//   var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
//   voiceSelect.innerHTML = '';
//   for(i = 0; i < voices.length ; i++) {
//     var option = document.createElement('option');
//     option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
    
//     if(voices[i].default) {
//       option.textContent += ' -- DEFAULT';
//     }

//     option.setAttribute('data-lang', voices[i].lang);
//     option.setAttribute('data-name', voices[i].name);
//     voiceSelect.appendChild(option);
//   }
//   voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak(text){
    console.log("speak");
    // if (synth.speaking) {
    //     console.error('speechSynthesis.speaking');
    //     return;
    // }
    // if (inputTxt.value !== '') {
    var utterThis = new SpeechSynthesisUtterance(text);
    utterThis.onend = function (event) {
        console.log('SpeechSynthesisUtterance.onend');
    }
    utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
    }
    // var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
    for(i = 0; i < voices.length ; i++) {
        console.log(voices[i].lang);
      if(voices[i].lang === "en-US") {
        utterThis.voice = voices[i];
        break;
      }
    }
    utterThis.pitch = pitch_val;
    utterThis.rate = rate_val;
    synth.speak(utterThis);
//   }
}



