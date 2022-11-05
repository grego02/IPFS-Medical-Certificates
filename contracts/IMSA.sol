// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "hardhat/console.sol";


contract IMSA {

    address company;
    uint256 public count;
    
mapping (uint256 => string) public userFiles;
mapping (address=>uint) membership; 

    modifier onlyCompany{
     require(msg.sender==company);
     _;
}

    modifier onlyDoctor{
     require(membership[msg.sender]==1);
    _;
   }


constructor () public payable {
 company=msg.sender;
 membership[msg.sender]=1; // automatically registered
}

function register (address doctor) public payable onlyCompany{
    membership[doctor]=1;
}


function unregister (address doctor) public payable onlyCompany{
    membership[doctor]=0;
}


function setFile(string memory file) external onlyDoctor {
        userFiles[count] = file;
        count = count+1;
    }

    function getFile(uint256 id) public view returns(string memory) {

        return userFiles[id];
}     

function getID() public view returns (uint256) {
        return count;
    }

 function getRole(address user) public view returns (string memory) {
     if (user == company){
        return '0';}
     else if(membership[user]==1){
        return '1';}
     else{
        return '2';}   
    }

}