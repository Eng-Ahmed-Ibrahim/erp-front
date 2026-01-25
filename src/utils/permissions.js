/**
 * Permission utility functions for checking user permissions
 */

/**
 * Check if user has a specific permission
 * @param {Object} user - User object from AuthContext
 * @param {string} permissionName - Name of the permission to check
 * @returns {boolean} - True if user has the permission
 */
export const hasPermission = (user, permissionName) => {
    if (!user?.permissions) return false;
    
    // Handle both array of objects and array of strings
    if (Array.isArray(user.permissions)) {
      return user.permissions.some(
        (permission) => 
          (typeof permission === 'string' && permission === permissionName) ||
          (typeof permission === 'object' && permission?.name === permissionName)
      );
    }
    
    return false;
  };
  
  /**
   * Check if user has any of the specified permissions
   * @param {Object} user - User object from AuthContext
   * @param {string[]} permissionNames - Array of permission names to check
   * @returns {boolean} - True if user has at least one of the permissions
   */
  export const hasAnyPermission = (user, permissionNames) => {
    if (!permissionNames || permissionNames.length === 0) return true;
    return permissionNames.some(name => hasPermission(user, name));
  };
  
  /**
   * Check if user has all of the specified permissions
   * @param {Object} user - User object from AuthContext
   * @param {string[]} permissionNames - Array of permission names to check
   * @returns {boolean} - True if user has all of the permissions
   */
  export const hasAllPermissions = (user, permissionNames) => {
    if (!permissionNames || permissionNames.length === 0) return true;
    return permissionNames.every(name => hasPermission(user, name));
  };
  