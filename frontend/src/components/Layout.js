import { useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import AdminSidebar from "./AdminSidebar"
import OperatorSidebar from "./OperatorSidebar"
import Footer from "./Footer"
import { useSidebar } from "../context/SidebarContext"

const Layout = ({ children }) => {
  const location = useLocation()
  const { isCollapsed } = useSidebar()

  const isAdminPage = location.pathname.startsWith("/admin")
  const isOperatorPage = location.pathname.startsWith("/operator")
  const isLoginPage = location.pathname === "/login"
  const isRegisterPage = location.pathname === "/register"

  // Hide standard layout elements on auth pages
  const hideStandardLayout = isLoginPage || isRegisterPage

  // Calculate margin based on sidebar state
  const getMainMargin = () => {
    if (!isAdminPage && !isOperatorPage) return ""
    return isCollapsed ? "ml-16" : "ml-64"
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar for admin/operator pages */}
      {isAdminPage && <AdminSidebar />}
      {isOperatorPage && <OperatorSidebar />}

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Top navbar only for regular user pages */}
        {!isAdminPage && !isOperatorPage && !hideStandardLayout && <Navbar />}

        {/* Main content with left padding when sidebar is present */}
        <main
          className={`flex-1 bg-gray-50 transition-all duration-300 ${getMainMargin()}`}
        >
          {children}
        </main>

        {/* Footer only for home page */}
        {location.pathname === "/" && <Footer />}
      </div>
    </div>
  )
}

export default Layout
