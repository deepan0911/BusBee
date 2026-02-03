import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useSidebar } from "../context/SidebarContext"
import { LayoutDashboard, Bus, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"

const OperatorSidebar = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const { isCollapsed, setIsCollapsed } = useSidebar()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const menuItems = [
        { path: "/operator/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/operator/buses", icon: Bus, label: "My Buses" },
        { path: "/operator/bookings", icon: BookOpen, label: "Bookings" },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
            {/* Logo/Brand */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                {!isCollapsed && (
                    <Link to="/operator/dashboard" className="flex items-center">
                        <span className="text-xl font-bold text-gray-900">BusBee Operator</span>
                    </Link>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors ml-auto"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {menuItems.map((item) => {
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            title={isCollapsed ? item.label : ""}
                        >
                            <span className={isCollapsed ? "text-center w-full" : ""}>{isCollapsed ? item.label.charAt(0) : item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4">
                <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
                    title={isCollapsed ? "Logout" : ""}
                >
                    <span className={isCollapsed ? "text-center w-full" : ""}>{isCollapsed ? "L" : "Logout"}</span>
                </button>
            </div>
        </div>
    )
}

export default OperatorSidebar
