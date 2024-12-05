import React from "react";
import { useParams } from "react-router-dom";
import DeleteModal from "../../../../../components/ui/DeleteModal/DeleteModal";
import { deleteSupplier } from "../../../../../apis/suppliers";
const DeleteSupplier = () => {
  const { id } = useParams();
  return (
    <div>
      <DeleteModal
        id={id}
        name={"المورد"}
        onDelete={deleteSupplier}
      />
    </div>
  );
};

export default DeleteSupplier;
