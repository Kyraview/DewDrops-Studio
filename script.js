var deployParams = {from:'',
                   approvalProgram:Uint8Array,
                   clearProgram:Uint8Array,
                   numLocalInts:2,
                   numLocalByteSlices:0,
                   numGlobalInts:0,
                   numGlobalByteSlices:65}

//compile first
async function tealcompile(){
  let url = 'https://tealcompBackend.deatheye.repl.co/compile-teal';
  
  data = document.getElementById('editor').value;
  
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

  deployParams.from=compiled.hash;
  deployParams.approvalProgram=compiled.result;
  
  document.getElementById('hashBox').innerHTML=compiled.hash;
  document.getElementById('resultBox').innerHTML=compiled.result;
}

document.getElementById ("submitButton").addEventListener ("click", tealcompile);


//deploy second
async function deploy(){
  makeApplicationCreateTxn(from=deployParams.from,
                          suggestedParams={fee:1,firstRound:1},
                          onComplete=0,
                          approvalProgram=deployParams.approvalProgram,
                          clearProgram=deployParams.clearProgram,
                          numLocalInts=deployParams.numLocalInts,
                          numLocalByteSlices=deployParams.numLocalByteSlices,
                          numGlobalInts=deployParams.numGlobalInts,
                          numGlobalByteSlices=deployParams.numGlobalByteSlices);
}

//call third