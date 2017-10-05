var ethUtil = require('ethereumjs-util')
var sigUtil = require('eth-sig-util')
var Eth = require('ethjs')
window.Eth = Eth

var fs = require('fs')
var terms = fs.readFileSync(__dirname + '/terms.txt').toString()

ethSignButton.addEventListener('click', function(event) {
  event.preventDefault()
  var msg = '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0'
  var from = web3.eth.accounts[0]
  web3.eth.sign(from, msg, function (err, result) {
    if (err) return console.error(err)
    console.log('SIGNED:' + result)
  })
})

personalSignButton.addEventListener('click', function(event) {
  event.preventDefault()
  var text = terms
  var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))
  // var msg = '0x1' // hexEncode(text)
  console.log(msg)
  var from = web3.eth.accounts[0]

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
    console.dir({ msgParams })
    const recovered = sigUtil.recoverPersonalSignature(msgParams)
    console.dir({ recovered })

    if (recovered === from ) {
      console.log('SigUtil Successfully verified signer as ' + from)
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


personalRecoverTest.addEventListener('click', function(event) {
  event.preventDefault()
  var text = 'hello!'
  var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))
  // var msg = '0x1' // hexEncode(text)
  console.log(msg)
  var from = web3.eth.accounts[0]

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


      if (recovered === from ) {
        console.log('Successfully ecRecovered signer as ' + from)
      } else {
        console.log('Failed to verify signer when comparing ' + result + ' to ' + from)
      }

    })
  })

})

ethjsPersonalSignButton.addEventListener('click', function(event) {
  event.preventDefault()
  var text = terms
  var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))
  var from = web3.eth.accounts[0]

   console.log('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [from, msg]
  var method = 'personal_sign'


  // Now with Eth.js
  var eth = new Eth(web3.currentProvider)

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


signTypedDataButton.addEventListener('click', function(event) {
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

