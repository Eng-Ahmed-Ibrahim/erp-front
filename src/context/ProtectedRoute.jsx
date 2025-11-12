import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      const permissions = Array.isArray(user?.permissions)
        ? user.permissions
        : [];

      const hasPermission =
        !requiredPermission ||
        permissions.some(
          (permission) => permission?.name === requiredPermission.name
        );

      if (!hasPermission) {
        navigate("/warehouse/unauthorized");
      }
    }
  }, [user, isLoading, navigate, requiredPermission]);

  if (isLoading) {
    return (
      <Spin indicator={<LoadingOutlined style={{ fontSize: 56 }} spin />} />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
