import "./App.css";
import { useEffect, useState, createRef } from 'react';
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from "ipfs-http-client";
import Web3 from "web3";


// User who can registrate doctors
//ACCOUNT ADDRESS 0xc939d487b9F6778f45776248eFaa2f24b56e4e63
//PRIVATE KEY 885c94148a89d22dde289c29db44364a598bd647f07436714f3d1402b3296503

// Doctor account
//ACCOUNT ADDRESS
//0x4C7EA38fBA69F3C380F28cf70cf4C15F73726d23
//PRIVATE KEY
//e8f0fb12203440e277aaacf0448f70e9ad1815d2d8b47043a9ae3f83ed8d2374

// Patient account
//ACCOUNT ADDRESS
//0x6E8693762140f69Ae47bDA410232D3BdD0E9cF08
//PRIVATE KEY
//084723002bdab8837d0d8ec0d2c8417afe65196fa4730ce9930475c5eeab1541

// You have to add those three accounts to your metamask wallet

const provider = new ethers.providers.Web3Provider(window.ethereum);

var doctors = [];
var doc;
var connected_user;
// Who can register doctors
var authority;


doctors.push('0x4C7EA38fBA69F3C380F28cf70cf4C15F73726d23');
doctors.push('0x6E8693762140f69Ae47bDA410232D3BdD0E9cF08');

//console.log(doctors);

// Obtain connected account in varialble res
window.ethereum.request({method:'eth_requestAccounts'})
.then(res=>{
        // Return the address of the wallet
        console.log(res);      
})

//We fix the values of the different accounts (public keys), 
//in order to simplify the prototype. In the final version, 
//the authorizing medical entity will register to the doctors, 
//who will be allowed to upload medical certificates.

console.log('connected_user', connected_user)
if(connected_user==='0xc939d487b9F6778f45776248eFaa2f24b56e4e63'){
  authority = 1;

}


const web3 = new Web3(Web3.givenProvider);


const App = () => {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [doctor, setDoctor] = useState(0);
  const [cert, setCert] = useState(0);
  const [role, setRole] = useState();
  const [userAddress, setUserAddress] = useState("");

useEffect(() => {
  async function fetchData() {

    try {
     
      const signer = provider.getSigner(); // user
      const addr = await signer.getAddress();
      setUserAddress(addr.toString());

      console.log(addr)
      
      if(addr=='0xc939d487b9F6778f45776248eFaa2f24b56e4e63'){
        setRole("Authority");
      } else if (addr === '0x4C7EA38fBA69F3C380F28cf70cf4C15F73726d23') {
        setRole("Doctor");
      } else {
        setRole("Patient");
      }

      const contractUser = await signer.getAddress();
      const contractUserBalance = await provider.getBalance(contractUser);
    } catch (error) {
      console.log("error");
      console.error(error);
    } 
  }

  fetchData();

}, []);


  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

    const retrieveFile = (e) => {
    const data = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);

    reader.onloadend = () => {
      setFile(Buffer(reader.result));
    };

    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
// We use infura service upload recipes to IPFS
      const projectId = "2DxpAMDUxnEwmX2dp5U3YrLjlRZ"
      const projectSecretKey = "2a7dbfdfb1d708794a3b7a1c4bac0e4e"
      const authorization = "Basic " + btoa(projectId + ":" + projectSecretKey);
           
      const url = ipfsHttpClient({
        url: "https://ipfs.infura.io:5001/api/v0",
        headers: {
          authorization
        }
      })

      const result = await url.add(file);

      setImages([
        ...images,
        {
          cid: result.cid,
          path: result.path,
          
        },
      ]);
    } catch (error) {
      console.log(error.message);
    } 

    };

    
    async function registerUser() {
// Currently we don't use this     
// In the final version, we'll replace this code by a registration
// via smart contract
      if (!doctor) return
      if (typeof window.ethereum !== 'undefined') {
        await requestAccount()
        console.log('doctor:',doctor)
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        doctors.push(doctor);
        console.log(doctors);
      }        
    }

  
    async function UnregisterUser() {
      console.log('unregister user')
      if (!doctor) return
      if (typeof window.ethereum !== 'undefined') {
        await requestAccount()
        console.log('doctor:',doctor)
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const index = doctors.indexOf(doctor);
      if (index > -1) { // only splice array when item is found
         doctors.splice(index, 1); // 2nd parameter means remove one item only
}
        console.log(doctors)
    }
   
  }

  
  return (

    <div className="App">
      <header className="App-header">Medical certificates</header>

     {role === "Doctor" &&<div className="main">
     <form onSubmit={handleSubmit}>
          <input type="file" onChange={retrieveFile} />
          <button type="submit" className="button">Submit</button>
        </form>

        <div className="display">
        {images.length !== 0
          ? images.map((image) => <img src={"https://skywalker.infura-ipfs.io/ipfs/" + image.path} alt="Cert" />)
          : <h3></h3>}
      </div>

      <div className="App">

      {images.length !== 0
          ? images.map((image) =>  <h3>Path:</h3>)
          : <h3></h3>}

        {images.length !== 0
          ? images.map((image) =>  <h3>{image.path}</h3>)
          : <h3></h3>}
      </div>

      </div> }
      <br></br>
      
     {role === "Authority" && <h3>Registration page</h3> }
    
     {role === "Authority" &&<div className="main"> 
      <input onChange={e => setDoctor(e.target.value)} placeholder="Register Doctor" />
      <button onClick={registerUser}>Register Doctor</button>
      
      </div> }

      {role === "Authority" && <div className="main">
      <input onChange={e => setDoctor(e.target.value)} placeholder="Unregister Doctor" />
      <button onClick={UnregisterUser}>Unregister Doctor</button>
      </div> }

      <br></br>
      
      <h3>Download certificate</h3>
    
      <div className="main">
      <input onChange={e => setCert(e.target.value)} placeholder="Certificate ID" />
      

    <div className="display">
        
    {cert !== null ? <img src={"https://skywalker.infura-ipfs.io/ipfs/" + cert} 
      onError={event => {
        event.target.src = "https://skywalker.infura-ipfs.io/ipfs/QmPGAcqWQ1wuHsSczpgHpC1UquEix8mU6FH4dc7wuur8vN"
        event.onerror = null
      }}
  

     /> 
        : <h3></h3>}
      </div>      
      </div>
    </div>
    
  );
};

export default App;
