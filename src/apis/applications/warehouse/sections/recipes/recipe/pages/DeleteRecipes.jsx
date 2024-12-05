import React from "react";
import { useParams } from "react-router-dom";
import DeleteModal from "../../../../../../components/ui/DeleteModal/DeleteModal";
import { deleteRecipe } from "../../../../../../apis/recipes/recipe";
const DeleteRecipes = () => {
  const { id } = useParams();
  return (
    <div>
      <DeleteModal
        id={id}
        name={"التصنيف الفرعى"}
        onDelete={deleteRecipe}
      />
    </div>
  );
};

export default DeleteRecipes;
