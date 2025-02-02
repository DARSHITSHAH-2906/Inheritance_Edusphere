import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { contractAbi, contractAddress } from "../utils/constants";
import { useWriteContract, useAccount } from 'wagmi'

export const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { writeContract, writeContractAsync } = useWriteContract()
  const { address } = useAccount()

  useEffect(() => {
    const initializeContract = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        setContract(contractInstance);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    };
    initializeContract();
  }, []);

  const addCourse = async (courseFee) => {
    if (!contract) return;
    setIsLoading(true);
    try {
      await writeContractAsync({
        abi: contractAbi,
        address: contractAddress,
        functionName: 'addCourse',
      });
      toast.success("Course added successfully!");
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add course.");
    }
    setIsLoading(false);
  };

  const buyCourse = async (priceInWei, addr) => {
    if (!contract) return;
    setIsLoading(true);
    try {
      await writeContractAsync({
        abi: contractAbi,
        address: contractAddress,
        functionName: 'buyCourse',
        args: [priceInWei, addr],
      })
      toast.success("Course purchased successfully!");
    } catch (error) {
      console.error("Error purchasing course:", error);
      toast.error("Failed to purchase course.");
    }
    setIsLoading(false);
  };

  const viewAllCourses = async () => {
    if (!contract) return;
    try {
      const courses = await contract.viewAllCourses();
      return courses;
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const redeemCoins = async (coins) => {
    // console.log("Done Redeeming");

    if (!contract) return;
    setIsLoading(true);
    try {
      console.log("Calling contract.redeem with coins:", coins, "and account:", account);

      // const transaction = await contract.methods.redeem(coins, account).call();

      // console.log("Transaction sent:", transaction);

      // console.log("Waiting for transaction confirmation...");
      // await transaction.wait();

      // const txObject = {
      //   from: account,
      //   to: contractAddress,
      //   data: contract.methods.redeem(coins, account).encodeABI(),        
      //   gas: 2000000, // Specify your desired gas limit
      // };
      // const txHash = await web3.eth.sendTransaction(txObject);
      // console.log(txHash);

      // console.log("Transaction confirmed!");
      await writeContractAsync({
        abi: contractAbi,
        address: contractAddress,
        functionName: 'redeem',
        args: [coins, address],
      });
      toast.success("Redemption successful!");
  } catch (error) {
      console.error("Error redeeming coins:", error);
      toast.error("Failed to redeem coins.");
  }

  setIsLoading(false);
};

  return (
    <CourseContext.Provider
      value={{ account, addCourse, buyCourse, viewAllCourses, redeemCoins, isLoading }}
    >
      {children}
    </CourseContext.Provider>
  );
};