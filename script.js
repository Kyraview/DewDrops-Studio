const myAlgoConnect = new MyAlgoConnect();

const algodClient = new algosdk.Algodv2("",'https://node.testnet.algoexplorerapi.io', '');

var deployParams = {from:'',
                   suggestedParams:{},
                   onComplete:0,
                   approvalProgram:null,
                   clearProgram:null,
                   numLocalInts:10,
                   numLocalByteSlices:10,
                   numGlobalInts:10,
                   numGlobalByteSlices:10}

//compile first
async function compile(){
  deployParams.approvalProgram=await tealcompile('int 1');
  deployParams.clearProgram=await tealcompile('int 1');
  
  document.getElementById('langNav').style.display='block';
  document.getElementById('deployButton').style.display='block';
  document.getElementById('compileButton').style.display='none';
}

//deploy second
async function deploy(){
  await connect();
  
  let txn = algosdk.makeApplicationCreateTxnFromObject(deployParams);
  
  const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
}


//call third


async function connect(){
  try {
    const accounts = await myAlgoConnect.connect();
    deployParams.from = accounts[0].address;
    deployParams.suggestedParams = await algodClient.getTransactionParams().do();
  } catch {console.error('failed to connect wallet')}
}

//compile first
async function tealcompile(data){
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
    const compiled = await res.json();
    
    let output = []
    for(let i = 0; i<Object.keys(compiled.result).length; i++){
      output.push(compiled.result[i]);
    }
    
    compiled.result = Uint8Array.from(output);

    return compiled.result;
  } catch {
    alert('compile failed');
  }
}

//listener for editor text change
function editorChange(){
  document.getElementById('langNav').style.display='none';
  document.getElementById('deployButton').style.display='none';
  document.getElementById('compileButton').style.display='block';
}

document.getElementById ("compileButton").addEventListener ("click", compile);
document.getElementById ("deployButton").addEventListener ("click", deploy);
document.getElementById ("editor").style.height='600px';