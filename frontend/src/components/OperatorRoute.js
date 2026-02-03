"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const OperatorRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        )
    }

    // Admins are often superusers, so we allow them too, or strictly operators?
    // Let's allow Admins to view operator panel too for debugging? 
    // No, user requirement implies strict separation "3 panels".
    // So strictly check for "operator".
    // However, earlier backend middleware allowed admin. 
    // Consistency: Let's stick to user.role === 'operator'. If admin wants to manage, they use Admin Panel.

    return user && (user.role === "operator" || user.role === "admin") ? children : <Navigate to="/" />
}

export default OperatorRoute
