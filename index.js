(function () {
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  // this is the same ABI JSON string generated by the `deploy.js` script
  var abi = '[{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"totalVotesFor","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"validCandidate","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"candidateList","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"candidate","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"candidateNames","type":"bytes32[]"}],"payable":false,"type":"constructor"}]';

  var VotingContract = web3.eth.contract(JSON.parse(abi));
  // use the address that was provided when creating the Voting contract on testrpc
  var contractInstance = VotingContract.at('0xca8bab43d250f9128178f5750972d9061b508c2e');
  var candidates = ['2B', '9S', 'A2'];

  // define totalVotesFor callback
  var createTotalVotesForCallback = function (candidate) {
    return function (err, numVotes) {
      if (err) {
        alert(err);
        return;
      }
      var n = candidates.indexOf(candidate) + 1;
      document.getElementById('candidate-' + n).innerHTML = numVotes.toString();
    };
  };

  // get all candidate votes function
  var updateVotes = function() {
    candidates.forEach(function(candidate) {
      contractInstance.totalVotesFor.call(candidate, createTotalVotesForCallback(candidate));
    });
  };

  var voteButton = document.getElementById('vote');
  var candidateInput = document.getElementById('candidate');
  voteButton.addEventListener('click', function (e) {
    e.preventDefault();
    var candidate = candidateInput.value;
    if (candidate === '' || candidates.indexOf(candidate) < 0) {
      alert('invalid candidate:', candidate)
      return
    }
    contractInstance.voteForCandidate(candidate, {from: web3.eth.accounts[0]}, function (err) {
      if (err) {
        alert(err);
        return;
      }
      contractInstance.totalVotesFor.call(candidate, createTotalVotesForCallback(candidate));
    });
  })

  // get initial value of votes
  updateVotes();
  // update votes every 30 seconds
  setInterval(updateVotes, 30000);
  })();
