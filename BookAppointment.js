import React from "react";
import { useLocation } from "react-router-dom";

const BookAppointment = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const disease = queryParams.get("disease");

  return (
    <div className="appointment-page">
      <h2>Book an Appointment</h2>
      <p>Based on your skin disease prediction, you may need to see a specialist.</p>

      <form>
        <label>
          Predicted Disease:
          <input type="text" value={disease || ""} readOnly />
        </label>

        <label>
          Select Doctor:
          <select>
            <option>Select a doctor...</option>
            {disease === "Acne" && <option>Dr. Sharma (Dermatologist)</option>}
            {disease === "Eczema" && <option>Dr. Ahuja (Allergy Specialist)</option>}
            {disease === "Psoriasis" && <option>Dr. Kapoor (Skin Specialist)</option>}
            {disease === "Melanoma" && <option>Dr. Rao (Oncologist)</option>}
          </select>
        </label>

        <label>
          Select Date:
          <input type="date" />
        </label>

        <button type="submit">Confirm Appointment</button>
      </form>
    </div>
  );
};

export default BookAppointment;
