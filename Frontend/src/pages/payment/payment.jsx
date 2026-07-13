import React from "react";
import { createClient } from "@supabase/supabase-js";
import emmyImage from "../../assets/emmy.png";
import "../../App.css";
const Payment = () => {
  return (
    <div className="payment-page-container">
            <form className="payment-form">
                <img id="emmy" src={emmyImage} alt="Emmy" />
                <h7>Enter your payment </h7>
            <div className="payment-form-group">
            <label   htmlFor="cardName" >Name</label>
                <input type="text" id="username"  placeholder="username" required /><br />
            <br />
               <label htmlFor="PhoneNumber">phone Number</label>
                <input type="text" id="phoneNumber" placeholder="Phone Number" required /><br />
                <br />
                <label htmlFor="Amount">Amount</label>
                <input type="number" id="amount" placeholder="amount" required /><br />
                <button type="submit" className="payment-submit-btn">Pay Now</button>
            </div>
        </form>
</div>
  );
}
export default Payment;