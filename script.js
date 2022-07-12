import TxnVerifer from './txnVerify.mjs';
const verifier = new TxnVerifer();

var deployParams = {from:'',
                   suggestedParams:{},
                   onComplete:0,
                   approvalProgram:null,
                   clearProgram:null,
                   numLocalInts:5,
                   numLocalByteSlices:5,
                   numGlobalInts:5,
                   numGlobalByteSlices:5}

var language = 'dewdrops';

//compiles from TEAL to Uint8Array machine code
async function compile(){
  let error = [];
  deployParams.approvalProgram=await tealcompile(editor.getValue());
  deployParams.clearProgram=await tealcompile('#pragma version 4\nint 1');

  if(deployParams.approvalProgram.hasOwnProperty('message')){
    error += (deployParams.approvalProgram.message+'\n');
  }
  if(deployParams.clearProgram.hasOwnProperty('message')){
    error += deployParams.clearProgram.message;
  }
  
  if(error.length!==0){
    alert(error)
  } else {
    console.log('compiled');
  }
}

//deploy contract
async function deploy(){
  try {
    let algodClientParams = await window.algorand.getAlgodv2Client();
    let algodClient = new algosdk.Algodv2(algodClientParams);
    deployParams.from = await window.ethereum.request({
            method: 'wallet_invokeSnap',
            params:['npm:algorand',{
                method: 'getAddress'
            }]
    });
    deployParams.suggestedParams = await algodClient.getTransactionParams().do();
    let txn = algosdk.makeApplicationCreateTxnFromObject(deployParams);
    console.log(verifier.verifyTxn(txn));
    const signedTxn = await window.algorand.EZsign(txn);
    console.log('signed\n\n\n\n\n');
    //const response = await window.algorand.postTxns(signedTxn);
    //console.log('posted\n\n\n\n\n');
  
    alert('Deploy successful\ntxId: '+response.txId);
  } catch(err) {alert(err)}
}

//connect wallet
async function connect(){
  try {
    window.snapalgo = new SnapAlgo.Wallet();
    await window.algorand.enable();
    document.getElementById('connectButton').style.display='none';
    document.getElementById('deployButton').style.display='block';
  } catch(err) {
    alert(err.message);
  }
}

//compile from TEAL to Uint8Array machine code
async function tealcompile(data){
  let compiled;
  try{
    let url = 'https://tealcompBackend.deatheye.repl.co/compile-teal';
    
    const res = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'x-api-key':'CkCQ04Vtng4VB8xMxa0mr8qxA179pJwW6For09eb'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({inputcode:data}) // body data type must match "Content-Type" header
    });
    compiled = await res.json();
    
    let output = []
    for(let i = 0; i<Object.keys(compiled.result).length; i++){
      output.push(compiled.result[i]);
    }
    
    compiled = Uint8Array.from(output);
  } catch {}
  return compiled;
}

function changePage(evt) {
  document.getElementById("pageTitle").innerHTML = evt.currentTarget.myParam[0];
  document.getElementById('filesPage').style.display='none';
  document.getElementById('compilePage').style.display='none';
  document.getElementById('deployPage').style.display='none';
  document.getElementById(evt.currentTarget.myParam[1]).style.display='flex';
}

function changeLanguage(evt) {
  document.getElementById("dewdropsButton").style.filter = 'brightness(65%)';
  document.getElementById("tealButton").style.filter = 'brightness(65%)';
  document.getElementById(evt.currentTarget.myParam[0]+"Button").style.filter = 'none';
  language = evt.currentTarget.myParam[0];
  console.log('language changed to '+language);
}

//initialize code editor
let divElement = document.getElementById("container");
let height = document.defaultView.getComputedStyle(divElement).height;
      
var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  lineNumbers: true,
  height: 200
});
editor.setSize(null,(parseInt(height))+"px");
editor.setValue('//example program\n#pragma version 4\nint 1');
editor.on("change", function() {
  document.getElementById('langNav').style.display='none';
  document.getElementById('deployButton').style.display='none';
});

//page change
document.getElementById("compilePageButton").addEventListener("click", changePage);
document.getElementById("compilePageButton").myParam=['Compiler', 'compilePage'];
document.getElementById("deployPageButton").addEventListener("click", changePage);
document.getElementById("deployPageButton").myParam=['Deployer', 'deployPage'];
document.getElementById("filesPageButton").addEventListener("click", changePage);
document.getElementById("filesPageButton").myParam=['File Explorer', 'filesPage'];

//sidebar action buttons
document.getElementById("compileButton").addEventListener("click", compile);
document.getElementById("connectButton").addEventListener("click", connect);
document.getElementById("deployButton").addEventListener("click", deploy);

//language buttons
document.getElementById("dewdropsButton").addEventListener("click", changeLanguage);
document.getElementById("dewdropsButton").myParam=['dewdrops'];
document.getElementById("tealButton").addEventListener("click", changeLanguage);
document.getElementById("tealButton").myParam=['teal'];
document.getElementById("tealButton").style.filter = 'brightness(65%)';