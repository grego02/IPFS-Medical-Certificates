import './App.css';
import { useEffect,useState } from 'react';
import { ethers } from 'ethers'
import IMSA from './artifacts/contracts/IMSA.sol/IMSA.json'
import { create as ipfsHttpClient } from "ipfs-http-client";

// Update with the contract address obtained when the smart contract was deployed 
const imsaAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

// insert your infura project crediental you can find 
// easily these your infura account in API key management section
const projectId = "2DxpAMDUxnEwmX2dp5U3YrLjlRZ"
const projectSecretKey = "2a7dbfdfb1d708794a3b7a1c4bac0e4e"
const authorization = "Basic " + btoa(projectId + ":" + projectSecretKey);
var connected_user;

function App() {

  const [role, setRole] = useState();
  const [Provider, setProvider] = useState();
  const [countid, setCountid] = useState([])
  const [filecid, setFilecid] = useState([])
  const [countdown, setCountdown] = useState([])
  const [images, setImages] = useState([])
  const [userAddress, setUserAddress] = useState("");
  const [regok, setregOk] = useState("");
  

   useEffect(() => {
    async function fetchData() {
  
      try {
      
        if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");
  
        await window.ethereum.send("eth_requestAccounts");
  

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner(); // user
        const addr = await signer.getAddress();
        setUserAddress(addr.toString());
        console.log('addr',addr)
        const contract = new ethers.Contract(imsaAddress, IMSA.abi, provider)
        const contractRole = await contract.getRole(addr);
        console.log('contractrole',contractRole)
        
        if(contractRole==='0'){
          setRole("Authority");
        } else if (contractRole === '1') {
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
 
  useEffect(() => {
    console.log('role',role)
  }, [role])


  async function fetchID() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      //console.log({ provider })
      const contract = new ethers.Contract(imsaAddress, IMSA.abi, provider)
      try {
        const data = await contract.getID()
        //setFilecid(data)
        let countid = data.toNumber()
        countid -= 1
        setCountid(countid)
        console.log(countid)
        //console.log('filecid: ', filecid)
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  async function getFileid() {
    console.log('countid',countid)
    console.log('filecid',filecid)
    if (!countid) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      //const signer = provider.getSigner()
      const contract = new ethers.Contract(imsaAddress, IMSA.abi, provider)
      try {
        const data = await contract.getFile(countdown)
        //const fileid = data.toNumber()
        //setCountid(countid)
        console.log(data)
        console.log('data: ', data)
        setFilecid(data)
        console.log('filecid',filecid)
        //console.log('FILEID',fileid)
      } catch (err) {
        console.log("Error: ", err)
      }
    }
  }


  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

 
  //Register Doctor
  async function registerProvider() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(imsaAddress, IMSA.abi, signer)
      
      try {
        const transaction = await contract.register(Provider)
        await transaction.wait()
        console.log('Registration OK')
        setregOk('OK')
      } catch (err) {
        console.log("Error: ", err)
        setregOk('NK')
      }
    }    
  }



   // IPFS
  const ipfs = ipfsHttpClient({
    url: "https://ipfs.infura.io:5001/api/v0",
    headers: {
      authorization
    }
  })
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const form = event.target;
    const files = (form[0]).files;

    if (!files || files.length === 0) {
      return alert("No files selected");
    }

    const file = files[0];
    // upload files
    const result =  await ipfs.add(file);
    

    setImages([
      //...images,
      {
        cid: result.cid,
        path: result.path,
      },
    ]);
    form.reset();
    //console.log ('cid',result.path)
    if (!result.path) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(imsaAddress, IMSA.abi, signer)
      const transaction = await contract.setFile(result.path)
      await transaction.wait()
      fetchID()
  };

}
    

  return (
    <div className="App">
    <header className="App-header">Medical certificates</header>
      

{ipfs && role === "Authority" && (
        <>
        <h3 className="hashing-form-heading">Register Doctors</h3>
        <br></br>
        <input onChange={e => setProvider(e.target.value)} placeholder="Add Doctor" />
        <button type="submit" onClick={registerProvider}>Doctor Registration</button>
        <br></br>
        { regok=== 'OK'&& (
         <h4>Registration OK</h4>
        )}

       { regok=== 'NK'&& (
         <h4>Registration failure</h4>
        )}
        
        </>
        
      )}

{ipfs && role === "Doctor" &&<div>
<h3>Upload certificate to ipfs</h3>
<br></br>
          <form onSubmit={onSubmitHandler}>
            <input type="file" name="file" />
            <button type="submit">Upload file</button>
          </form>
        {images.map((image, index) => (

          <img
            alt={`Uploaded #${index + 1}`}
            src={"https://skywalker.infura-ipfs.io/ipfs/" + image.path}
            style={{ maxWidth: "400px", margin: "15px" }}
            key={image.cid.toString() + index}
          />
        ))}

        
{images.map((image, index) => (

<h3>Document ID:{countid}</h3>

))}

      </div>

}
      
            <br></br>
                <h3 className="hashing-form-heading">Download certificate </h3>
                <br></br>  
                <div className="main">
                <input onChange={e => setCountdown(e.target.value)} placeholder="Document ID" />
                <button type="submit" onClick={getFileid }>Get certificate</button>
                
                </div>
                <br></br>
                {filecid.length!==0 && <div className="main">
                <img

 alt= "Bidding document"
 src={"https://skywalker.infura-ipfs.io/ipfs/" + filecid}
 
 //key={image.cid.toString() + index}
 onError={(e) => {
  e.target.src = "https://skywalker.infura-ipfs.io/ipfs/QmPGAcqWQ1wuHsSczpgHpC1UquEix8mU6FH4dc7wuur8vN" //replacement image imported above
  e.target.style = 'padding: 8px; margin: 8px' // inline styles in html format
}}
/>    
      </div>}    
      <h3> </h3>
    </div>

  );
}

export default App;