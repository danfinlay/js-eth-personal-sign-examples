var ethUtil = require('ethereumjs-util')
var sigUtil = require('eth-sig-util')
var Eth = require('ethjs')
window.Eth = Eth

var fs = require('fs')
var terms = fs.readFileSync(__dirname + '/terms.txt').toString()


signTypedDataButton.addEventListener('click', function(event) {
  event.preventDefault()

  //const msgParams = [
    //{
      //type: 'string',
      //name: 'Message',
      //value: 'Hi, Alice!'
    //},
    //{
      //type: 'uint32',
      //name: 'A number',
      //value: '1337'
    //}
  //]
  const msgParams = [
    {
      type: 'string',
      name: 'address',
      value: '0xecf8f87f810ecf450940c9f60066b4a7a501d6a7'
    },
    {
      type: 'uint64',
      name: 'amount',
      value: '98794853168978'
    },
    {
      type: 'bool',
      name: 'sampleBoolean',
      value: true,
    },
    {
      type: 'uint64',
      name: 'aNumber',
      value: '22200'
    },
    {
      type: 'uint64',
      name: 'anotherUint',
      value: '1539325823'
    },
  ]

  var from = web3.eth.accounts[0]

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

    const recovered = sigUtil.recoverTypedSignature({ data: msgParams, sig: result.result })

    if (recovered === from ) {
      alert('Successfully ecRecovered signer as ' + from)
    } else {
      alert('Failed to verify signer when comparing ' + result + ' to ' + from)
    }

  })
})
