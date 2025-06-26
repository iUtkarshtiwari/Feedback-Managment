import React from "react";

const RequestCard = ({ request }) => {
  return (
    <div className="border rounded p-4 my-2 shadow-sm">
      <h3 className="font-bold">{request.title || "Feedback Request"}</h3>
      <p className="text-sm text-gray-600">{request.text}</p>
      <p className="mt-2">
        <span className="font-medium">Status:</span> {request.status}
      </p>
      <p>
        <span className="font-medium">Rating:</span> {request.rating ?? "Not rated"}
      </p>
    </div>
  );
};

export default RequestCard;
