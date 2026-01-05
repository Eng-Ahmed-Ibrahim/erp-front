import { Routes, Route } from "react-router-dom";
import "./App.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import Warehouse from "./applications/warehouse/Warehouse";
import {
  ShowSuppliers,
  AddSupplier,
  ShowSupplierInvoices,
  EditSuppliers,
} from "./applications/warehouse/sections/suppliers/pages";
import Suppliers from "./applications/warehouse/sections/suppliers/Suppliers";
import {
  AddRecipes,
  DeleteRecipes,
  EditRecipes,
  ShowRecipe,
  ShowRecipeDetails,
} from "./applications/warehouse/sections/recipes/recipe/pages";

import Departments from "./applications/warehouse/sections/recipes/Departments/Departments";
import RecipesSubCategory from "./applications/warehouse/sections/recipes/recipeSubCategory/RecipeSubCategory";
import {
  AddRecipeSubCategory,
  DeleteRecipeSubCategory,
  EditRecipeSubCategory,
  ShowRecipesSubCategory,
} from "./applications/warehouse/sections/recipes/recipeSubCategory/pages";
import Recipe from "./applications/warehouse/sections/recipes/recipe/Recipe";
import RecipesCategoryParent from "./applications/warehouse/sections/recipes/recipeCategoryParent/RecipesCategoryParent";
import {
  AddRecipeCategoryParent,
  EditRecipeCategoryParent,
  ShowRecipesCategoryParent,
  RecipesReview,
} from "./applications/warehouse/sections/recipes/recipeCategoryParent/pages";
import Invoice from "./applications/warehouse/sections/invoices/Invoice";
import InvoiceCategories from "./applications/warehouse/sections/invoices/InvoiceCategory/InvoiceCategory";
import IncomingInvoice from "./applications/warehouse/sections/invoices/Incoming/IncomingInvoice";
import {
  AddInvoices,
  AddTaintedInvoices,
  PrintInvoice,
  ShowTaintedInvoices,
} from "./applications/warehouse/sections/invoices/Incoming/pages";
import Requests from "./applications/warehouse/sections/requests/Requests";
import {
  AddRequest,
  EditRequest,
  ShowRequests,
} from "./applications/warehouse/sections/requests/pages";
import {
  AddCashierOrder,
  OpenedTables,
  OrderDetails,
  CashierWarehouseRequests,
  CashierKitchenRequests,
  PrintOrder,
  SellsPoints,
} from "./applications/warehouse/sections/cashier/pages";
import UnderLimit from "./applications/warehouse/sections/underLimit/UnderLimit";
import {
  ShowExpireLimit,
  ShowUnderLimit,
} from "./applications/warehouse/sections/underLimit/pages";
import Resturants from "./applications/warehouse/sections/Kitchen/categories/Resturants/Returants";
import Category from "./applications/warehouse/sections/Kitchen/categories/Category/Category";
import Cashiers from "./applications/warehouse/sections/cashier/Cashiers";
import {
  AddSubCategory,
  EditSubCategory,
  ShowSubCategory,
} from "./applications/warehouse/sections/Kitchen/categories/subCategory/pages";
import Product from "./applications/warehouse/sections/Kitchen/categories/product/Product";
import {
  AddProduct,
  AddProductRecipe,
  AddProductToDepartment,
  AddProductToOrder,
  // EditProduct,
  ShowProduct,
} from "./applications/warehouse/sections/Kitchen/categories/product/pages";
import KitchenRequests from "./applications/warehouse/sections/cashier/pages/KitchenRequests/KitchenRequests";
import DeletedOrders from "./applications/warehouse/sections/cashier/pages/KitchenRequests/DeletedOrders";
import KitchenOrders from "./applications/warehouse/sections/cashier/pages/KitchenRequests/KitchenOrders";
import Department from "./applications/warehouse/sections/department/Deaprtment";
import ShowDepartment from "./applications/warehouse/sections/department/pages/ShowDepartments";
import {
  AddDepartments,
  EditDepartment,
  ShowDepartments,
  ShowProductDepartment,
} from "./applications/warehouse/sections/department/pages";
import Unit from "./applications/warehouse/sections/unit/Unit";
import {
  AddUnits,
  EditUnits,
  ShowUnits,
} from "./applications/warehouse/sections/unit/pages";
import Login from "./auth/Login";
import Users from "./applications/warehouse/sections/admin/Users/Users";
import {
  AddUser,
  EditUser,
  ShowUsers,
} from "./applications/warehouse/sections/admin/Users/pages";
import Roles from "./applications/warehouse/sections/admin/Roles/Roles";
import {
  ShowRoles,
  EditRole,
  AddRole,
} from "./applications/warehouse/sections/admin/Roles/pages";
import ProtectedRoute from "./context/ProtectedRoute";
import Unauthorized from "./auth/Unauthorized";
import Payables from "./applications/warehouse/sections/payble/Payables";
import {
  AddPayable,
  ShowPayables,
} from "./applications/warehouse/sections/payble/pages";
import Clients from "./applications/warehouse/sections/clients/Clients";
import {
  AddClientType,
  AddDiscountReason,
  AddPaymentMethod,
  Client,
  ClientType,
  DiscountReason,
  EditClient,
  EditDiscountReason,
  EditPaymentMethod,
  PaymentMethod,
} from "./applications/warehouse/sections/clients/pages";
import EditClientType from "./applications/warehouse/sections/clients/pages/EditClientType";
import AddClient from "./applications/warehouse/sections/clients/pages/AddClient";
import Reports from "./applications/warehouse/sections/reports/Reports";
import {
  OneRecipeReport,
  ShowAllDepartment,
  ShowAllSupplier,
  ShowOneRecipeReport,
  ShowRecipeReports,
  ShowRecipesForSupplier,
  ShowReports,
  ShowSupplierInvoicesReport,
  ShowTotalStores,
} from "./applications/warehouse/sections/reports/pages";
import CategoryInventoryReport from "./applications/warehouse/sections/reports/pages/CategoryInventoryReport";
import ShowDepartmentsForCategoryReport from "./applications/warehouse/sections/reports/pages/ShowDepartmentsForCategoryReport";
import ShowDepartmentsProducts from "./applications/warehouse/sections/reports/pages/ShowDepartmentsProducts";
import Home from "./applications/warehouse/sections/home/Home";
import MenuSellsPoints from "./pages/MenuSellsPoints";
import Shifts from "./pages/Shifts";
import Witer from "./pages/witer";
import UpdateWiter from "./pages/UpdateWiter";
import CreateNewWiter from "./pages/CreateNewWiter";
import ReviewProduct from "./pages/ReviewProduct";
import UpdateReviewProduct from "./pages/UpdateReviewProduct";
import ReviewProducts from "./pages/ReviewProducts";
import EditProduct from "./pages/EditProduct";
import InventoryShowSupplierInvoicesReport from "./pages/InventoryShowSupplierInvoicesReport";
import CashierShowSupplierInvoicesReport from "./pages/CashierShowSupplierInvoicesReport";
import ShowProduct2 from "./applications/warehouse/sections/Kitchen/categories/product/pages2/ShowProduct2";
import ShowSubCategory2 from "./applications/warehouse/sections/Kitchen/categories/product/pages2/ShowSubCategory2";
import AddNewProduct2 from "./applications/warehouse/sections/Kitchen/categories/product/pages2/AddNewProduct2";
import UpdateProduct2 from "./applications/warehouse/sections/Kitchen/categories/product/pages2/UpdateProduct2";
import DetailsProduct2 from "./applications/warehouse/sections/Kitchen/categories/product/pages2/DetailsProduct2";
import CreateNewProduct2 from "./applications/warehouse/sections/Kitchen/categories/product/pages2/CreateNewProduct2";
import UpdateSubProduct2 from "./applications/warehouse/sections/Kitchen/categories/product/pages2/UpdateSubProduct2";
import CustomPrice from "./applications/warehouse/sections/Kitchen/categories/product/pages2/CustomPrice";
import ShowAllTable from "./pages/ShowAllTable";
import DetailsOrder2 from "./pages/DetailsOrder2";
import ShowInventoryBalanceReport from "./pages/ShowInventoryBalanceReport";
import ShowProductDepartment2 from "./pages/ShowProductDepartment2";
import ShoowShifts from "./pages/ShoowShifts";
import ShowInventoryDepartmentOrdersReport from "./pages/ShowInventoryDepartmentOrdersReport";
import OrdersReports from "./applications/warehouse/sections/cashier/pages/KitchenRequests/OrdersReports";
import ShowCardTypeReport from "./pages/showCardType";
import { RelatedProducts } from "./applications/warehouse/sections/recipes/recipe/pages/RelatedProducts";
import ShowRecipesFromAllDepartments from "./pages/ShowRecipesFromAllDepartments";
import ShowAllOrdersReports from "./pages/showAllOrdersReports";
import ShowAllSalesDetails from "./pages/ShowAllSalesDetails";
import ShowDepartmentProductsReport from "./pages/ShowDepartmentProductsReport";
import ExternalOrdersReport from "./pages/ShowExternalOrdersReport";

import CashierPage from "./pages/reception/CashierPage";
import AccountingPage from "./pages/accounting/AccountingPage";
import ReceptionPage from "./pages/reception/ReceptionPage";
import AuditDashboard from "./pages/AuditDashboard";

import InventoryDiscrepancyReviews from "./pages/InventoryDiscrepancyReviews";
import InventoryBlindCount from "./pages/InventoryBlindCount";
import InventoryBlindCountReports from "./pages/InventoryBlindCountReports";
import InventoryBlindCountDetails from "./pages/InventoryBlindCountDetails";
import ShowDepartmentsForBalance from "./applications/warehouse/sections/reports/pages/ShowDepartmentsForBalance";
import ShowInventives from "./applications/warehouse/sections/incentives/pages/showIncentives";
import ShowEmployeesDepartments from "./applications/warehouse/sections/incentives/pages/showEmployeesDepartments";
import ShowAllStaff from "./applications/warehouse/sections/incentives/pages/showAllStaff";
import ShowAllJobs from "./applications/warehouse/sections/incentives/pages/showAllJobs";
import AccountSetting from "./applications/warehouse/sections/accountSettings/AccountSetting.jsx";
import POSPage from "./pages/pos/POSPage.jsx";
import ActivitiesSubscriptions from "./components/activitiesSubscriptions/ActivitiesSubscriptions.jsx";
import ActivitiesCashier from "./components/activitiesSubscriptions/cashier/ActivitiesCashier/ActivitiesCashier.jsx";
import MembershipCards from './components/membershipCards/MembershipCards.jsx';

function App() {
  return (
    <div className="page-wrapper">
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/warehouse" element={<Warehouse />}>
          <Route
            path="/warehouse/unauthorized"
            element={<Unauthorized />}
          ></Route>
          <Route path="/warehouse/home" element={<Home />}></Route>
        </Route>
        <Route path="/warehouse" element={<Warehouse />}>
          <Route
            path="/warehouse/inventory/blind-count"
            element={
              <ProtectedRoute
              // requiredPermission={{
              //   id: 901,
              //   name: 'create inventory blind count',
              // }}
              >
                <InventoryBlindCount />
              </ProtectedRoute>
            }
          ></Route>
        </Route>
        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/suppliers" element={<Suppliers />}>
            <Route
              path="/warehouse/suppliers/show-suppliers"
              element={
                <ProtectedRoute
                  requiredPermission={{ id: 88, name: "view suppliers" }}
                >
                  <ShowSuppliers />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/suppliers/add-supplier"
              element={
                <ProtectedRoute
                  requiredPermission={{ id: 89, name: "add supplier" }}
                >
                  <AddSupplier />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/suppliers/:id/edit-supplier"
              element={
                <ProtectedRoute
                  requiredPermission={{ id: 90, name: "edit supplier" }}
                >
                  <EditSuppliers />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/suppliers/:id/show-invoices"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 92,
                    name: "show supplier invoices",
                  }}
                >
                  <ShowSupplierInvoices />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/recipes" element={<RecipesCategoryParent />}>
            <Route
              path="/warehouse/recipes/show-departments"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 73,
                    name: "view recipe_category_parents",
                  }}
                >
                  <Departments />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/recipes/review"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 147,
                    name: "view review-recipes",
                  }}
                >
                  <RecipesReview />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/recipes/show-recipes"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 73,
                    name: "view recipe_category_parents",
                  }}
                >
                  <ShowRecipesCategoryParent />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/recipes/add-recipes-parent"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 74,
                    name: "create recipe_category_parent",
                  }}
                >
                  <AddRecipeCategoryParent />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/recipes/edit-recipes-parent/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 75,
                    name: "edit recipe_category_parent",
                  }}
                >
                  <EditRecipeCategoryParent />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/returants" element={<Category />}>
            <Route
              path="/warehouse/returants/show-resturants"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 93,
                    name: "view categories",
                  }}
                >
                  <Resturants />
                </ProtectedRoute>
              }
            ></Route>

            {/* /////////////////////////// */}
            <Route
              path="/warehouse/returants/show-resturants2"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 93,
                    name: "view categories",
                  }}
                >
                  <ShowProduct2 />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/returants/show-resturants2/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 93,
                    name: "view categories",
                  }}
                >
                  <ShowSubCategory2 />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/returants/show-resturants2/:id/create-new"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 93,
                    name: "view categories",
                  }}
                >
                  <AddNewProduct2 />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/returants/show-resturants2/:id/updated-product"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 93,
                    name: "view categories",
                  }}
                >
                  <UpdateProduct2 />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/returants/show-resturants2/custom-price/product/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 93,
                    name: "view categories",
                  }}
                >
                  <CustomPrice />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/returants/show-resturants2/:id/details-product"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 93,
                    name: "view categories",
                  }}
                >
                  <DetailsProduct2 />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/returants/show-resturants2/:id/create-new/product"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 93,
                    name: "view categories",
                  }}
                >
                  <CreateNewProduct2 />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/returants/show-resturants2/updated-product/product/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 93,
                    name: "view categories",
                  }}
                >
                  <UpdateSubProduct2 />
                </ProtectedRoute>
              }
            ></Route>
            {/* //////////////////////////////// */}
            <Route
              path="/warehouse/returants/show-subCategory/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 97,
                    name: "view sub_categories",
                  }}
                >
                  <ShowSubCategory />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/returants/add-subcategory/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 98,
                    name: "add sub_category",
                  }}
                >
                  <AddSubCategory />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/returants/subCategory/:id/edit-subCategory"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 99,
                    name: "edit sub_category",
                  }}
                >
                  <EditSubCategory />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route
          path="/warehouse/reports/audit-dashboard"
          element={
            <ProtectedRoute
              requiredPermission={{
                id: 206,
                name: "view audit",
              }}
            >
              <AuditDashboard />
            </ProtectedRoute>
          }
        ></Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/returants/subcategory" element={<Product />}>
            <Route
              path="/warehouse/returants/subcategory/show-product/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 101,
                    name: "view products",
                  }}
                >
                  <ShowProduct />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/returants/subcategory/add-product/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 102,
                    name: "add product",
                  }}
                >
                  <AddProduct />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/returants/subcategory/add-product-to-department/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "add products to department",
                  }}
                >
                  <AddProductToDepartment />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/returants/subcategory/:id/edit-product"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "edit product",
                  }}
                >
                  {/* <EditProduct /> */}
                  <EditProduct />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/returants/subcategory/:id/add-rescipes"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 105,
                    name: "add products to department",
                  }}
                >
                  <AddProductRecipe />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route
            path="/warehouse/recipes/subCategory"
            element={<RecipesSubCategory />}
          >
            <Route
              path="/warehouse/recipes/subCategory/show-recipe-subcategory/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 77,
                    name: "view recipe_categories",
                  }}
                >
                  <ShowRecipesSubCategory />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/recipes/subCategory/add-recipes/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 78,
                    name: "add recipe_category",
                  }}
                >
                  <AddRecipeSubCategory />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/recipes/subCategory/:id/edit-recipes"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 79,
                    name: "edit recipe_category",
                  }}
                >
                  <EditRecipeSubCategory />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/recipes/recipe" element={<Recipe />}>
            <Route
              path="/warehouse/recipes/recipe/show-recipe/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 81,
                    name: "view recipes",
                  }}
                >
                  <ShowRecipe />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/recipes/recipe/add-recipes/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 82,
                    name: "add recipe",
                  }}
                >
                  <AddRecipes />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/recipes/recipe/:id/edit-recipes"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 81,
                    name: "edit recipe",
                  }}
                >
                  <EditRecipes />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/recipes/recipe/:id/get-products"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 834,
                    name: "view recipes",
                  }}
                >
                  <RelatedProducts />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/invoices" element={<Invoice />}>
            <Route
              path="/warehouse/invoices/show"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 140,
                    name: "view invoices",
                  }}
                >
                  <InvoiceCategories />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/invoices/show-tained"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view tainted",
                  }}
                >
                  <ShowTaintedInvoices />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/invoices/add-tainted-invoices"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "add tainted",
                  }}
                >
                  <AddTaintedInvoices />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/invoices/print/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "edit invoice",
                  }}
                >
                  <PrintInvoice />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/invoices/incoming"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 140,
                    name: "view invoices",
                  }}
                >
                  <IncomingInvoice />
                </ProtectedRoute>
              }
            >
              <Route
                path="/warehouse/invoices/incoming/add-Invoices/in_coming"
                element={
                  <ProtectedRoute
                    requiredPermission={{
                      id: 141,
                      name: "view invoices",
                    }}
                  >
                    <AddInvoices />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/warehouse/invoices/incoming/add-Invoices/out_going"
                element={
                  <ProtectedRoute
                    requiredPermission={{
                      id: 141,
                      name: "view invoices",
                    }}
                  >
                    <AddInvoices />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/warehouse/invoices/incoming/add-Invoices/returned"
                element={
                  <ProtectedRoute
                    requiredPermission={{
                      id: 141,
                      name: "view invoices",
                    }}
                  >
                    <AddInvoices />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/warehouse/invoices/incoming/add-Invoices/transfare"
                element={
                  <ProtectedRoute
                    requiredPermission={{
                      id: 141,
                      name: "view invoices",
                    }}
                  >
                    <AddInvoices />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>
        </Route>
        <Route path="/warehouse" element={<Warehouse />}>
          <Route
            path="/warehouse/underLimit/show-under-limit"
            element={
              <ProtectedRoute
                requiredPermission={{
                  id: 85,
                  name: "safe limit",
                }}
              >
                <ShowUnderLimit />
              </ProtectedRoute>
            }
          ></Route>

          <Route
            path="/warehouse/underLimit/show-under-limit/show-expire-limit"
            element={
              <ProtectedRoute
                requiredPermission={{
                  id: 103,
                  name: "expire_date limit",
                }}
              >
                <ShowExpireLimit />
              </ProtectedRoute>
            }
          ></Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/requests" element={<Requests />}>
            <Route
              path="/warehouse/requests/show-requests"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 130,
                    name: "view requests",
                  }}
                >
                  <ShowRequests />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/requests/add-request"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 131,
                    name: "add request",
                  }}
                >
                  <AddRequest />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/requests/:id/edit-request"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 132,
                    name: "edit request",
                  }}
                >
                  <EditRequest />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/cashier" element={<Cashiers />}>
            <Route
              path="/warehouse/cashier/create-order"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 123,
                    name: "add order",
                  }}
                >
                  <AddCashierOrder />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/cashier/opened-tables"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 123,
                    name: "add order",
                  }}
                >
                  <OpenedTables />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/cashier/selles-points"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 123,
                    name: "add order",
                  }}
                >
                  <SellsPoints />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/cashier/selles-points/menu/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 123,
                    name: "add order",
                  }}
                >
                  <MenuSellsPoints />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/cashier/order/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 123,
                    name: "view orders",
                  }}
                >
                  <OrderDetails />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/cashier/warehouse-requests"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 130,
                    name: "view orders",
                  }}
                >
                  <CashierWarehouseRequests />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/cashier/add-orders"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 124,
                    name: "add order",
                  }}
                >
                  <CashierKitchenRequests />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/cashier/kitchen-requests"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 123,
                    name: "view orders",
                  }}
                >
                  <KitchenRequests />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/cashier/deleted-orders"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 123,
                    name: "view orders",
                  }}
                >
                  <DeletedOrders />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/cashier/kitchen-requests"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 123,
                    name: "view orders",
                  }}
                >
                  <KitchenRequests />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/cashier/kitchen-orders"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 123,
                    name: "view Kitchen_orders",
                  }}
                >
                  <KitchenOrders />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/cashier/order-reports"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 123,
                    name: "view orders",
                  }}
                >
                  <OrdersReports />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/cashier/print-order/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 123,
                    name: "add order",
                  }}
                >
                  <PrintOrder />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/cashier/:id/add-products-to-order"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 105,
                    name: "view orders",
                  }}
                >
                  <AddProductToOrder />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/users" element={<Users />}>
            <Route
              path="/warehouse/users/show-users"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 113,
                    name: "view users",
                  }}
                >
                  <ShowUsers />
                </ProtectedRoute>
              }
            ></Route>
            {/* <Route
              path="/warehouse/users/show-users"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 113,
                    name: "view users",
                  }}
                >
                  <ShowUsers />
                </ProtectedRoute>
              }
            ></Route> */}
            <Route
              path="/warehouse/users/:id/edit-user"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 115,
                    name: "edit user",
                  }}
                >
                  <EditUser />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/users/add-user"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 114,
                    name: "add user",
                  }}
                >
                  <AddUser />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/roles" element={<Roles />}>
            <Route
              path="/warehouse/roles/show-roles"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 118,
                    name: "add role",
                  }}
                >
                  <ShowRoles />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/roles/add-role"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 118,
                    name: "add role",
                  }}
                >
                  <AddRole />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/roles/:id/edit-role"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 117,
                    name: "edit role",
                  }}
                >
                  <EditRole />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/departments" element={<Department />}>
            <Route
              path="/warehouse/departments/show-departments"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 81,
                    name: "view recipes",
                  }}
                >
                  <ShowDepartment />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/departments/add-departments"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "create department",
                  }}
                >
                  <AddDepartments />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/departments/:id/edit-departments"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "edit department",
                  }}
                >
                  <EditDepartment />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/departments/show-departments/product/:id"
              element={
                <ProtectedRoute
                  // requiredPermission={{
                  //   id: 103,
                  //   name: "get products in department",
                  // }}
                  requiredPermission={{
                    id: 81,
                    name: "view recipes",
                  }}
                >
                  <ShowProductDepartment />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/departments/show-departments/product2/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 81,
                    name: "view recipes",
                  }}
                >
                  <ShowProductDepartment2 />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/departments/add-product-to-department/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "add products to department",
                  }}
                >
                  <AddProductToDepartment />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/departments/show-departments/tables"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "ترابيزات مفتوحة",
                  }}
                >
                  <ShowAllTable />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/departments/show-departments/tables/show-details/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "ترابيزات مفتوحة",
                  }}
                >
                  <DetailsOrder2 />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/units" element={<Unit />}>
            <Route
              path="/warehouse/units/show-units"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view units",
                  }}
                >
                  <ShowUnits />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/units/add-units"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "add unit",
                  }}
                >
                  <AddUnits />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/units/:id/edit-units"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "edit unit",
                  }}
                >
                  <EditUnits />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/payable" element={<Payables />}>
            <Route
              path="/warehouse/payable/show-payable"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view payable",
                  }}
                >
                  <ShowPayables />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/payable/add-payable"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "add payable",
                  }}
                >
                  <AddPayable />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route path="/warehouse/clients" element={<Clients />}>
            <Route
              path="/warehouse/clients/payment-method"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view payment methods",
                  }}
                >
                  <PaymentMethod />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/clients/add-payment-method"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "add payment method",
                  }}
                >
                  <AddPaymentMethod />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/clients/:id/edit-payment-method"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "edit payment method",
                  }}
                >
                  <EditPaymentMethod />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/clients/discount-reason"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view discount reasons",
                  }}
                >
                  <DiscountReason />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/clients/:id/edit-discount-reason"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "edit discount reason",
                  }}
                >
                  <EditDiscountReason />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/clients/add-discount-reason"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "add discount reason",
                  }}
                >
                  <AddDiscountReason />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/clients/client-type"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view client types",
                  }}
                >
                  <ClientType />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/clients/:id/edit-client-type"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "edit client type",
                  }}
                >
                  <EditClientType />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/clients/add-client-type"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "add client type",
                  }}
                >
                  <AddClientType />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/clients/client"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view clients",
                  }}
                >
                  <Client />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/clients/add-client"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "add client",
                  }}
                >
                  <AddClient />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/clients/:id/edit-client"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "edit client",
                  }}
                >
                  <EditClient />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
        </Route>

        <Route path="/warehouse" element={<Warehouse />}>
          <Route
            path="/warehouse/Incentives/show-Incentives"
            element={
              <ProtectedRoute
                requiredPermission={{
                  id: 148,
                  name: "view incentives",
                }}
              >
                <ShowInventives />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/warehouse/staff/show-staff"
            element={
              <ProtectedRoute
                requiredPermission={{
                  id: 148,
                  name: "view employees_and_jobs",
                }}
              >
                <ShowAllStaff />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/warehouse/jobs/show-jobs"
            element={
              <ProtectedRoute
                requiredPermission={{
                  id: 148,
                  name: "view employees_and_jobs",
                }}
              >
                <ShowAllJobs />
              </ProtectedRoute>
            }
          ></Route>{" "}
          <Route
            path="/warehouse/staff/show-staff"
            element={
              <ProtectedRoute
                requiredPermission={{
                  id: 148,
                  name: "view employees_and_jobs",
                }}
              >
                <ShowAllStaff />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/warehouse/show-employees-departments"
            element={
              <ProtectedRoute
                requiredPermission={{
                  id: 148,
                  name: "view employees_and_jobs",
                }}
              >
                <ShowEmployeesDepartments />
              </ProtectedRoute>
            }
          ></Route>
          <Route path="/warehouse/reports" element={<Reports />}>
            <Route
              path="/warehouse/reports/show-reports"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowReports />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/department"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowAllDepartment />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/departmentbalance"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowDepartmentsForBalance />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/department/recipe/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowRecipeReports />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/supplier-invoieces"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowSupplierInvoicesReport />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/ShowSupplierInvoicesReport/inventory"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <InventoryShowSupplierInvoicesReport />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/ShowSupplierInvoicesReport/cashier"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <CashierShowSupplierInvoicesReport />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/ShowAllOrdersReport/Reports"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowAllOrdersReports />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/ShowAllSalesDetails/Reports"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowAllSalesDetails />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/ShowDepartments"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowDepartmentsProducts />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/ShowDepartments/order-products/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowDepartmentProductsReport />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/external-orders/show"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 154,
                    name: "view external-orders-reports",
                  }}
                >
                  <ExternalOrdersReport />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/inventory-discrepancy-reviews/show"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <InventoryDiscrepancyReviews />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/inventory-blind-counts"
              element={
                <ProtectedRoute
                // requiredPermission={{
                //   id: 902,
                //   name: 'view inventory blind count reports',
                // }}
                >
                  <InventoryBlindCountReports />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/inventory-blind-counts/:id"
              element={
                <ProtectedRoute
                // requiredPermission={{
                //   id: 902,
                //   name: 'view inventory blind count reports',
                // }}
                >
                  <InventoryBlindCountDetails />
                </ProtectedRoute>
              }
            ></Route>

            <Route
              path="/warehouse/reports/show-reports/get-allsupllier"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowAllSupplier />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/get-total-stores"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowTotalStores />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/get-recipe-report"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowOneRecipeReport />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/inventory-balance/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowInventoryBalanceReport />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/department-orders"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowInventoryDepartmentOrdersReport />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/type-card"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowCardTypeReport />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/category-inventory-departments"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowDepartmentsForCategoryReport />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/category-inventory/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <CategoryInventoryReport />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/alldepartments"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowRecipesFromAllDepartments />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/get-recipe-report/recipe/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <OneRecipeReport />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-reports/get-allsupllier/recipes/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ShowRecipesForSupplier />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/show-shifts"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view shifts",
                  }}
                >
                  <ShoowShifts />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/shift"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <Shifts />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/witer"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <Witer />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/review"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ReviewProducts />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/review-product"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <ReviewProduct />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/review-product/update/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <UpdateReviewProduct />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/witer/create-new"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <CreateNewWiter />
                </ProtectedRoute>
              }
            ></Route>
            <Route
              path="/warehouse/reports/witer/update-witer/:id"
              element={
                <ProtectedRoute
                  requiredPermission={{
                    id: 103,
                    name: "view reports",
                  }}
                >
                  <UpdateWiter />
                </ProtectedRoute>
              }
            ></Route>
          </Route>
          <Route
            path="/warehouse/reception/cashier"
            element={
              <ProtectedRoute
                requiredPermission={{
                  id: 200,
                  name: "view reception cashier",
                }}
              >
                <CashierPage />
              </ProtectedRoute>
            }
          >
            {" "}
          </Route>
          <Route
            path="/warehouse/accounting"
            element={
              <ProtectedRoute
                requiredPermission={{
                  id: 200,
                  name: "view reception cashier",
                }}
              >
                <AccountingPage />
              </ProtectedRoute>
            }
          >
            {" "}
          </Route>
          <Route
            path="/warehouse/reception/management"
            element={
              <ProtectedRoute
                requiredPermission={{ id: 201, name: "manage reception" }}
              >
                <ReceptionPage />
              </ProtectedRoute>
            }
          >
            {" "}
          </Route>
          <Route
            path="/warehouse/pos"
            element={
              <ProtectedRoute
                requiredPermission={{ id: 205, name: "add order v2" }}
              >
                <POSPage />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/warehouse/account-settings"
            element={<AccountSetting />}
          ></Route>
          <Route
            path="/warehouse/activities-subscriptions"
            element={
              <ProtectedRoute
                requiredPermission={{
                  id: 201,
                  name: "manage activities subscriptions",
                }}
              >
                <ActivitiesSubscriptions />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/warehouse/activities-cashier"
            element={
              <ProtectedRoute
                requiredPermission={{
                  id: 201,
                  name: "manage activities cashier",
                }}
              >
                <ActivitiesCashier />
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/warehouse/membership-cards"
            element={
              <ProtectedRoute
                requiredPermission={{ id: 210, name: "manage membership-cards" }}
              >
                <MembershipCards />
              </ProtectedRoute>
            }
          ></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
