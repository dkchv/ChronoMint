pragma solidity ^0.4.4;

contract Managed {
  uint public percentageRequired;
  uint public numAuthorizedKeys;
  mapping(string => mapping(address => uint)) lastVoteBySender;
  event VoteReceived(string issue, uint value, uint voteCount);
  mapping(address => mapping(string=> mapping(uint => PendingValue))) internal pendingsettings;
  mapping(address => bool) public authorizedKeys;

  struct PendingValue {
        address val;
        mapping(address => bool) voters;
        uint voteCount;
    }

  function Managed() {
    address owner  = msg.sender;
    authorizedKeys[owner] = true;
    numAuthorizedKeys++;
    percentageRequired = 50;
  }

  modifier onlyAuthorized() {
      if (isAuthorized(msg.sender)) {
          _;
      }
  }

  modifier byVote(address subject, string name, uint currentValue, uint newValue, bool oneValuePerName) {
    if (currentValue != newValue) { // Make sure that the key being submitted isn't already the value in the contract.
      uint lastVal = lastVoteBySender[name][msg.sender];

      if (!pendingsettings[subject][name][newValue].voters[msg.sender]){
        if (pendingsettings[subject][name][lastVal].voters[msg.sender] && oneValuePerName)

        {

          if (pendingsettings[subject][name][lastVal].voters[msg.sender] && oneValuePerName)
          {
            pendingsettings[subject][name][lastVal].voters[msg.sender] = false;
            pendingsettings[subject][name][lastVal].voteCount--;
          }
          pendingsettings[subject][name][newValue].voters[msg.sender] = true; // add this voter to the list of voters for this pending key
          pendingsettings[subject][name][newValue].voteCount++; // increment vote count
      }
      lastVoteBySender[name][msg.sender] = newValue;

      uint percentage_consensus = (pendingsettings[subject][name][newValue].voteCount*100)/numAuthorizedKeys; // percentage of votes for this key

      if (percentage_consensus >= percentageRequired){ // isse has met conditions
        _;
        pendingsettings[subject][name][newValue].voteCount = 0; // reset vote count
      }
      VoteReceived(name, newValue, percentageRequired);
    }
  }

  function isAuthorized(address key) returns(bool) {
      if (authorizedKeys[key]){
        return true;
      }
      else
        return false;
  }

  function addKey(address key) onlyAuthorized() byVote(address(this), 'ADMIN', 0x0, uint(key), false) {
    if (!authorizedKeys[key]) { // Make sure that the key being submitted isn't already CBE.
      authorizedKeys[key] = true;
      numAuthorizedKeys++;
    }
  }

  function revokeKey(address key) onlyAuthorized() byVote(address(this), 'REVOKE', 0x0, uint(key), false) {
    if (authorizedKeys[key]) { // Make sure that the key being submitted isn't already CBE.
      authorizedKeys[key] = false;
      numAuthorizedKeys--;
    }
  }


  function forwardCall(address _to, uint _value, bytes _data) onlyAuthorized() returns(bool) {
      if (!_to.call.value(_value)(_data)) {
          throw;
      }
      return true;
  }
}
