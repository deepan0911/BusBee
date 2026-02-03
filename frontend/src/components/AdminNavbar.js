import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { LayoutDashboard, Bus, BookOpen, Users, MapPin, Building2, LogOut } from "lucide-react"

const AdminNavbar = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/admin/dashboard" className="flex items-center space-x-2">
                            <Bus className="h-8 w-8 text-gray-700" />
                            <span className="text-xl font-bold text-gray-900">BusBee Admin</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        <Link
                            to="/admin/dashboard"
                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            to="/admin/buses"
                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Bus className="h-4 w-4" />
                            <span>Buses</span>
                        </Link>
                        <Link
                            to="/admin/routes"
                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <MapPin className="h-4 w-4" />
                            <span>Routes</span>
                        </Link>
                        <Link
                            to="/admin/bookings"
                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <BookOpen className="h-4 w-4" />
                            <span>Bookings</span>
                        </Link>
                        <Link
                            to="/admin/users"
                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Users className="h-4 w-4" />
                            <span>Users</span>
                        </Link>
                        <Link
                            to="/admin/operators"
                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Building2 className="h-4 w-4" />
                            <span>Operators</span>
                        </Link>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default AdminNavbar
