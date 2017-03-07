var sigUtil = require('eth-sig-util')

function hexEncode(text){
  var hex, i

  var result = ''
  for (i = 0; i < text.length; i++) {
    hex = text.charCodeAt(i).toString(16)
    result += ('000'+hex).slice(-4)
  }
  return '0x' + result
}

ethSignButton.addEventListener('click', function(event) {
  event.preventDefault()
  var msg = '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0'
  var from = web3.eth.accounts[0]
  web3.eth.sign(from, msg, function (err, result) {
    if (err) return console.error(err)
    alert('SIGNED:' + result)
  })
})

personalSignButton.addEventListener('click', function(event) {
  event.preventDefault()
  var text = 'hello!'
  var buff = new Buffer(text, 'utf8')
  var msg = hexEncode(text)
  // var msg = '0x1' // hexEncode(text)
  console.log(msg)
  var from = web3.eth.accounts[0]

  /*  web3.personal.sign not yet implemented!!!
   *  We're going to have to assemble the tx manually!
   *  This is what it would probably look like, though:
    web3.personal.sign(from, msg, function (err, result) {
      if (err) return console.error(err)
      alert('PERSONAL SIGNED:' + result)
    })
  */

   console.log('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [from, msg]
  var method = 'personal_sign'

  web3.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return console.error(err)
    if (result.error) return console.error(result.error)
    alert('PERSONAL SIGNED:' + JSON.stringify(result.result))

    console.log('recovering...')
    const msgParams = { data: msg }
    msgParams.sig = result.result
    console.dir({ msgParams })
    const recovered = sigUtil.recoverPersonalSignature(msgParams)
    console.dir({ recovered })

    if (recovered === from ) {
      alert('SigUtil Successfully verified signer as ' + from)
    } else {
      console.dir(recovered)
      alert('SigUtil Failed to verify signer when comparing ' + recovered.result + ' to ' + from)
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
        alert('Successfully verified signer as ' + from)
      } else {
        alert('Failed to verify signer when comparing ' + result.result + ' to ' + from)
      }

    })
    */
  })

})

