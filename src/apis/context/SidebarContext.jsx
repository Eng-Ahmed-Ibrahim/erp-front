import { createContext, useState } from "react";
import { PropTypes } from "prop-types";

export const SidebarContext = createContext({});

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [wrapperMargin, setWrapperMargin] = useState("mr-260"); // Initialize wrapperMargin state


  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };


  const toggleWrapperMargin = () => {
    // Toggle wrapperMargin based on its current value
    setWrapperMargin((prevMargin) =>
      prevMargin === "mr-260" ? "mr-145" : "mr-260"
    );
  };

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen,
        openSidebar,
        closeSidebar,
        wrapperMargin,
        toggleWrapperMargin, // Add toggleWrapperMargin to context value
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

SidebarProvider.propTypes = {
  children: PropTypes.node,
};
