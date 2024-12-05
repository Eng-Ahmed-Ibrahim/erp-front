import React from "react";
import { useParams } from "react-router-dom";
import DeleteModal from "../../../../../../components/ui/DeleteModal/DeleteModal";
import { deleteRecipeSubCategory } from "../../../../../../apis/recipes/recipeSubCategory";
const DeleteRecipeSubCategory = () => {
  const { id } = useParams();
  return (
    <div>
      <DeleteModal
        id={id}
        name={"المورد"}
        onDelete={deleteRecipeSubCategory}
      />
    </div>
  );
};

export default DeleteRecipeSubCategory;
