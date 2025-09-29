let inputCount = 5;
const main = document.getElementsByTagName("main")[0];
const inputsDiv = document.getElementById("inputs");
const outputsDiv = document.getElementById("outputs");
const mathDiv = document.getElementById("softmax-equation");

// const outputRectFullWidth = 200;

let rowSelected = false;
let selectedRowIndex = -1;

let inputArr = Array.from({ length: inputCount }, () => 0);

const resultArr = Array.from({ length: inputCount }, () => ({}));
const resultObj = {
  resultArr: resultArr,
  sum: 0,
};

document.addEventListener("DOMContentLoaded", e => {
  renderMain();
});

const renderMain = () => {
  console.log(`At start of renderMain(), inputArr: ${inputArr}`);
  main.innerHTML = ""; // clear <main> 

  if (inputCount === 0) {
    main.innerHTML = "<span class='the-void'>the void stares back.</span>";
    renderSoftmaxEquationOriginal();
    setTimeout(() => {
      document.getElementsByClassName("the-void")[0].classList.add("stares-back");
    }, 3000);
  }

  for (let i = 0; i < inputCount; i++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    const inputId = `input${i+1}`;
    const inputValueId = `inputValue${i+1}`;
    const outputId = `output${i+1}`;
    const outputPercentId = `outputPercent${i+1}`;
    
    rowDiv.insertAdjacentHTML("beforeend", `
    <div class="input-container">
      <i>x<sub>${i+1}</sub> </i>
      <input type="number" class="num-input" id="${inputId}" name="${inputId}"
              min="-50" max="50" value="${inputArr[i]}" step="1">
      <div class="spinner">
        <button onclick="decrement(this)">&minus;</button>
        <button onclick="increment(this)">&plus;</button>
        
        <!--
        <button onclick="this.parentElement.previousElementSibling.stepUp()">&and;</button>
        <button onclick="this.parentElement.previousElementSibling.stepDown()">&or;</button>
        -->
      </div>
    </div>
    `);

    rowDiv.insertAdjacentHTML("beforeend", `
    <div class="output-container">
      <div class="percentage" id="${outputPercentId}"></div>
      <div class="output-full-rect" >
        <div class="output" id="${outputId}"></div>
      </div>
      <button class="remove-input-btn" onclick="removeInputRow(${i})">
        &times;
      </button>
    </div>
    `);

    rowDiv.insertAdjacentHTML("beforeend", `
      
      `);

    main.appendChild(rowDiv);

    const inputElem = document.getElementById(inputId);
    // const inputValueElem = document.getElementById(inputValueId);
    
    inputElem.addEventListener("input", e => {
      console.log(`${inputId} changed: ${e.target.value}`);
      // inputValueElem.innerHTML = e.target.value;
      inputArr[i] = e.target.value;
      runSoftmax();
    });

  } 

  for (let i=0; i<main.children.length; i++) {
    const row = main.children[i];
    row.addEventListener("click", e => {
      rowSelected = true;

      if (selectedRowIndex != -1) {
        const prevSelected = main.children[selectedRowIndex];
        prevSelected.classList.remove("selected");
      }

      selectedRowIndex = i;

      const newSelected = e.currentTarget;
      newSelected.classList.add("selected"); // e.currentTarget is the elem that this event listener was attached to. e.target is the element that triggered the event, i.e. could be a child of e.currentTarget

      renderSoftmaxEquationWithValues(i);
    });

    row.addEventListener("mouseover", e => {
      const hovered = e.currentTarget;
      renderSoftmaxEquationWithValues(i);
    });

    row.addEventListener("mouseout", e => {
      // const selected = e.currentTarget;
      if (rowSelected) {
        const i = selectedRowIndex;
        renderSoftmaxEquationWithValues(i);
      } else {
        renderSoftmaxEquationOriginal();

      }
    });
  }

  runSoftmax();
}

document.body.addEventListener("click", e => {
  if (e.target.closest(".row") === null) {
    const prevSelected = main.children[selectedRowIndex];
    prevSelected.classList.remove("selected");
    renderSoftmaxEquationOriginal();
  }
});

document.getElementById("add-input-btn").addEventListener("click", onClickAddInputButton);

const renderSoftmaxEquationOriginal = () => {
  mathDiv.innerHTML = `\$\$\\text{softmax}(\\mathbf{x})_i = \\frac{e^{x_i}}{\\sum_{j=1}^K e^{x_j}}\$\$`;
  renderMathInElement(document.body);
}

const renderSoftmaxEquationWithValues = (index) => {
  mathDiv.innerHTML = `
    \$\$\\text{softmax}(\\mathbf{X})_${index+1} = \\frac{${formatNum(resultObj.resultArr[index].eToPowOfX)}}{${formatNum(resultObj.sum)}} = ${formatNum(resultObj.resultArr[index].softmaxed)}\$\$
  `;
  renderMathInElement(document.body);
}

// Limit 4 decimal places, and don't show trailing 0s after decimal point.
const formatNum = (num) => {
  return parseFloat(num.toFixed(4));
}

const runSoftmax = () => {
  inputArr = getInputArray();
  console.log(`Got inputArr from getInputArray(): ${inputArr}`);
  const outputArr = calcSoftmaxOutputs(inputArr);
  displayOutputs(outputArr);
}

// returns an Array of numbers
const getInputArray = () => {
  let inputArr = [];
  for (let i = 0; i < inputCount; i++) {
    const inputElem = document.getElementById(`input${i+1}`);
    inputArr.push(parseInt(inputElem.value));
  }
  return inputArr;
}

// return an Array of outputs (probabilities)
// n = e^n / sum for each n in arr
const calcSoftmaxOutputs = (inputArr) => {
  let arr = structuredClone(inputArr);
  // create array of x number of objects
  
  arr.forEach((n, i, arr) => {
    resultArr[i].eToPowOfX = arr[i] = Math.pow(Math.E, n); 
    
  });
  console.log(arr);
  const sum = arr.reduce((acc, curr) => acc + curr, 0);
  resultObj.sum = sum;
  console.log(sum);
  arr.forEach((n, i, arr) => {
    resultArr[i].softmaxed = arr[i] = n / sum; 
  });
  console.log(arr);
  return arr;
};

const displayOutputs = (outputArr) => {

  outputArr.forEach((output, i, arr) => {
    console.log(`output${i+1}: ${output}`);
    
    const outputRectFullWidth = document.getElementsByClassName("output-full-rect")[0].offsetWidth;
    console.log(outputRectFullWidth);
    document.getElementById(`output${i+1}`).style.transform = `scaleX(${output})`;
    document.getElementById(`outputPercent${i+1}`).innerHTML = `${(100 * output).toFixed(2)}%`;
  });
}

function onClickAddInputButton(e) {
  inputCount++;
  inputArr.push(0);
  resultArr.push({});
  renderMain();
}

function removeInputRow(index) {
  if (index === selectedRowIndex) {
    selectedRowIndex = -1;
  }
  inputCount--;
  inputArr.splice(index, 1);
  resultArr.splice(index, 1); 
  renderMain();
}

function decrement(el) {
  console.log(el);
  el.parentElement.previousElementSibling.stepDown();
  runSoftmax();
}

function increment(el) {
  el.parentElement.previousElementSibling.stepUp();
  runSoftmax();
}

