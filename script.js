const myAlgoConnect = new MyAlgoConnect();

const algodClient = new algosdk.Algodv2("",'https://node.testnet.algoexplorerapi.io', '');

var deployParams = {from:'',
                   suggestedParams:{},
                   onComplete:0,
                   approvalProgram:null,
                   clearProgram:null,
                   numLocalInts:5,
                   numLocalByteSlices:5,
                   numGlobalInts:5,
                   numGlobalByteSlices:5}

//compiles from TEAL to Uint8Array machine code
async function compile(){
  let error = [];
  deployParams.approvalProgram=await tealcompile(editor.getValue());
  deployParams.clearProgram=await tealcompile('#pragma version 4\nint 1');

  if(deployParams.approvalProgram['code']){
    error += (deployParams.approvalProgram.message+'\n');
  }
  if(deployParams.clearProgram['code']){
    error += deployParams.clearProgram.message;
  }
  
  if(error.length===0){
    document.getElementById('langNav').style.display='block';
    document.getElementById('deployButton').style.display='block';
    document.getElementById('compileButton').style.display='none';
  }
}

//deploy contract
async function deploy(){
  await connect();

  try {
    let txn = algosdk.makeApplicationCreateTxnFromObject(deployParams);
    
    const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    const response = await algodClient.sendRawTransaction(signedTxn.blob).do();
  
    alert('Deploy successful\ntxId: '+response.txId);
  } catch(err) {alert(err)}
}

//connect wallet
async function connect(){
  try {
    const accounts = await myAlgoConnect.connect();
    deployParams.from = accounts[0].address;
    deployParams.suggestedParams = await algodClient.getTransactionParams().do();
  } catch(err) {alert(err)}
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
  } catch {
    alert('Invalid program');
  }
  return compiled;
}

//initialize code editor
let divElement = document.getElementById("container");
let height = document.defaultView.getComputedStyle(divElement).height;
      
var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
  lineNumbers: true,
  height: 200
});
editor.setSize(null,(parseInt(height)-40)+"px");
editor.setValue('//example program\n#pragma version 4\nint 1');
editor.on("change", function() {
  document.getElementById('langNav').style.display='none';
  document.getElementById('deployButton').style.display='none';
  document.getElementById('compileButton').style.display='block';
});

document.getElementById ("compileButton").addEventListener ("click", compile);
document.getElementById ("deployButton").addEventListener ("click", deploy);