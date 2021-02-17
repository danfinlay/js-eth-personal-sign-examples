const detectEthereumProvider = require('@metamask/detect-provider');
const ethUtil = require('ethereumjs-util')
const sigUtil = require('eth-sig-util')
const Eth = require('ethjs')
window.Eth = Eth
// console.log('new V2')
// const fs = require('fs')
require('@metamask/legacy-web3');
// const terms = fs.readFileSync(__dirname + '/terms.txt').toString('utf-8')
const terms = 'test test test'

const { web3 } = window;


connectButton.addEventListener('click', function () {
  connect()
})

function connect () {
  if (typeof ethereum !== 'undefined') {
    ethereum.request({ method: 'eth_requestAccounts' }).catch(console.error)
  }
}

async function getAccounts () {
  return ethereum.request({ method: 'eth_requestAccounts' });
}


ethSignButton.addEventListener('click', async function (event) {
  // if (!from) return connect()
  // const ethResult = await ethereum.request({
  //   method: 'eth_sign',
  //   params: [from, msgHash]
  // })
  // console.log('ethResult', ethResult);
  try {
    event.preventDefault()
    const accounts = await getAccounts();
    const from = accounts[0]
    const msgHash = ethUtil.keccak256('An amazing message, for use with MetaMask!')
    const ethResult = await ethereum.request({
      method: 'eth_sign',
      params: [from, msgHash],
    })
    console.log('ethResult', ethResult)
  } catch (err) {
    console.error(err)
  }


  // web3.eth.sign(from, msgHash, function (err, result) {
  //   if (err) return console.error(err)
  //   console.log('SIGNED:' + result)
  // })
})

personalSignButton.addEventListener('click', async function (event) {
  event.preventDefault()
  const accounts = await getAccounts();
  var text = terms
  var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))
  // var msg = '0x1' // hexEncode(text)
  console.log(msg)
  var from = accounts[0]
  if (!from) return connect()


  console.log('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [msg, from]
  var method = 'personal_sign'

  web3.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return console.error(err)
    if (result.error) return console.error(result.error)
    console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))

    console.log('recovering...')
    const msgParams = { data: msg }
    msgParams.sig = result.result
    console.dir({ msgParams })
    const recovered = sigUtil.recoverPersonalSignature(msgParams)
    console.dir({ recovered })

    if (recovered === from) {
      console.log('SigUtil Successfully verified signer as ' + from)
      window.alert('SigUtil Successfully verified signer as ' + from)
    } else {
      console.dir(recovered)
      console.log('SigUtil Failed to verify signer when comparing ' + recovered.result + ' to ' + from)
      console.log('Failed, comparing %s to %s', recovered, from)
    }


    /*
    method = 'personal_ecRecover'
    var params = [msg, result.result]
    web3.currentProvider.sendAsync({
      method,
      params,
      from,
    }, function (err, recovered) {
      console.dir({ err, recovered })
      if (err) return console.error(err)
      if (result.error) return console.error(result.error)

      if (result.result === from ) {
        console.log('Successfully verified signer as ' + from)
      } else {
        console.log('Failed to verify signer when comparing ' + result.result + ' to ' + from)
      }

    })
    */
  })

})


personalRecoverTest.addEventListener('click', function (event) {
  event.preventDefault()
  var text = 'hello!'
  var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))
  // var msg = '0x1' // hexEncode(text)
  console.log(msg)
  var from = web3.eth.accounts[0]
  if (!from) return connect()

  /*  web3.personal.sign not yet implemented!!!
   *  We're going to have to assemble the tx manually!
   *  This is what it would probably look like, though:
    web3.personal.sign(msg, from) function (err, result) {
      if (err) return console.error(err)
      console.log('PERSONAL SIGNED:' + result)
    })
  */

  console.log('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [msg, from]
  var method = 'personal_sign'

  web3.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return console.error(err)
    if (result.error) return console.error(result.error)
    console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))

    console.log('recovering...')
    const msgParams = { data: msg }
    msgParams.sig = result.result

    method = 'personal_ecRecover'
    var params = [msg, result.result]
    web3.currentProvider.sendAsync({
      method,
      params,
      from,
    }, function (err, result) {
      var recovered = result.result
      console.log('ec recover called back:')
      console.dir({ err, recovered })
      if (err) return console.error(err)
      if (result.error) return console.error(result.error)


      if (recovered === from) {
        console.log('Successfully ecRecovered signer as ' + from)
      } else {
        console.log('Failed to verify signer when comparing ' + result + ' to ' + from)
      }

    })
  })
})

ethjsPersonalSignButton.addEventListener('click', async function (event) {
  event.preventDefault()
  var text = terms
  var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))
  var from = web3.eth.accounts[0]
  if (!from) return connect()

  console.log('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [from, msg]

  // Now with Eth.js
  const provider = await detectEthereumProvider();
  var eth = new Eth(provider)

  eth.personal_sign(msg, from)
    .then((signed) => {
      console.log('Signed!  Result is: ', signed)
      console.log('Recovering...')

      return eth.personal_ecRecover(msg, signed)
    })
    .then((recovered) => {

      if (recovered === from) {
        console.log('Ethjs recovered the message signer!')
      } else {
        console.log('Ethjs failed to recover the message signer!')
        console.dir({ recovered })
      }
    })
})


signTypedDataButton.addEventListener('click', function (event) {
  event.preventDefault()

  const msgParams = [
    {
      type: 'string',
      name: 'Message',
      value: 'Hi, Alice!'
    },
    {
      type: 'uint32',
      name: 'A number',
      value: '1337'
    }
  ]

  var from = web3.eth.accounts[0]
  if (!from) return connect()

  /*  web3.eth.signTypedData not yet implemented!!!
   *  We're going to have to assemble the tx manually!
   *  This is what it would probably look like, though:
    web3.eth.signTypedData(msg, from) function (err, result) {
      if (err) return console.error(err)
      console.log('PERSONAL SIGNED:' + result)
    })
  */

  console.log('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [msgParams, from]
  console.dir(params)
  var method = 'eth_signTypedData'

  web3.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return console.dir(err)
    if (result.error) {
      alert(result.error.message)
    }
    if (result.error) return console.error(result)
    console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))

    const recovered = sigUtil.recoverTypedSignatureLegacy({ data: msgParams, sig: result.result })

    if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
      alert('Successfully ecRecovered signer as ' + from)
    } else {
      alert('Failed to verify signer when comparing ' + result + ' to ' + from)
    }

  })

})

signTypedDataV3Button.addEventListener('click', function (event) {
  event.preventDefault()

  web3.currentProvider.sendAsync({
    method: 'net_version',
    params: [],
    jsonrpc: "2.0"
  }, function (err, result) {
    const netId = result.result
    const msgParams = JSON.stringify({
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" }
        ],
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" }
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" }
        ]
      },
      primaryType: "Mail",
      domain: { name: "Ether Mail", version: "1", chainId: netId, verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC" },
      message: {
        from: { name: "Cow", wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826" },
        to: { name: "Bob", wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" },
        contents: "Hello, Bob!"
      }
    })



    var from = web3.eth.accounts[0]

    console.log('CLICKED, SENDING PERSONAL SIGN REQ', 'from', from, msgParams)
    var params = [from, msgParams]
    console.dir(params)
    var method = 'eth_signTypedData_v3'

    web3.currentProvider.sendAsync({
      method,
      params,
      from,
    }, function (err, result) {
      if (err) return console.dir(err)
      if (result.error) {
        alert(result.error.message)
      }
      if (result.error) return console.error('ERROR', result)
      console.log('TYPED SIGNED:' + JSON.stringify(result.result))

      const recovered = sigUtil.recoverTypedSignature({ data: JSON.parse(msgParams), sig: result.result })

      if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
        alert('Successfully ecRecovered signer as ' + from)
      } else {
        alert('Failed to verify signer when comparing ' + result + ' to ' + from)
      }

    })

  })

})

signTypedDataV4Button.addEventListener('click', function (event) {
  event.preventDefault()

  const msgParams = JSON.stringify({
    domain: {
      chainId: 1,
      name: 'Ether Mail',
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      version: '1'
    },
    message: {
      contents: 'Hello, Bob!',
      from: {
        name: 'Cow',
        wallets: [
          '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'
        ]
      },
      to: [
        {
          name: 'Bob',
          wallets: [
            '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
            '0xB0B0b0b0b0b0B000000000000000000000000000'
          ]
        }
      ]
    },
    primaryType: 'Mail',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Group: [{ name: 'name', type: 'string' }, { name: 'members', type: 'Person[]' }],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person[]' },
        { name: 'contents', type: 'string' }
      ],
      Person: [{ name: 'name', type: 'string' }, { name: 'wallets', type: 'address[]' }]
    }
  });

  var from = web3.eth.accounts[0]

  var params = [from, msgParams]
  var method = 'eth_signTypedData_v4'

  web3.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return console.dir(err)
    if (result.error) {
      alert(result.error.message)
    }
    if (result.error) return console.error('ERROR', result)
    console.log('TYPED SIGNED:' + JSON.stringify(result.result))

    const recovered = sigUtil.recoverTypedSignature_v4({ data: JSON.parse(msgParams), sig: result.result })

    if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
      alert('Successfully recovered signer as ' + from)
    } else {
      alert('Failed to verify signer when comparing ' + result + ' to ' + from)
    }
  })
})

ethjsSignTypedDataButton.addEventListener('click', async function (event) {
  event.preventDefault()

  const msgParams = [
    {
      type: 'string',
      name: 'Message',
      value: 'Hi, Alice!'
    },
    {
      type: 'uint32',
      name: 'A number',
      value: '1337'
    }
  ]

  var from = web3.eth.accounts[0]
  if (!from) return connect()

  console.log('CLICKED, SENDING PERSONAL SIGN REQ')

  const provider = await detectEthereumProvider();
  var eth = new Eth(provider)

  const signed = await eth.signTypedData(msgParams, from)
  console.log('Signed!  Result is: ', signed)
  console.log('Recovering...')

  const recovered = sigUtil.recoverTypedSignature({ data: msgParams, sig: signed })

  if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
    alert('Successfully ecRecovered signer as ' + from)
  } else {
    alert('Failed to verify signer when comparing ' + signed + ' to ' + from)
  }
})
