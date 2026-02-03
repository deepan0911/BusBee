"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { Search, UserCheck, Shield, AlertCircle, Trash } from "lucide-react"
import toast from "react-hot-toast"

const AdminOperators = () => {
    const [operators, setOperators] = useState([])
    const [filteredOperators, setFilteredOperators] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    })

    // State for verification confirmation
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        id: null,
        currentStatus: null,
        type: 'verify', // 'verify' or 'delete'
        details: null
    })

    const fetchOperators = useCallback(async () => {
        try {
            const response = await axios.get("/api/admin/operators")
            setOperators(response.data)
            setLoading(false)
        } catch (error) {
            toast.error("Failed to fetch operators")
            setLoading(false)
        }
    }, [])

    const triggerVerificationToggle = (id, currentStatus) => {
        setConfirmModal({
            show: true,
            id,
            currentStatus,
            type: 'verify'
        })
    }

    const triggerDelete = (operator) => {
        setConfirmModal({
            show: true,
            id: operator._id,
            details: operator,
            type: 'delete'
        })
    }

    const confirmAction = async () => {
        const { id, currentStatus, type } = confirmModal

        try {
            if (type === 'verify') {
                await axios.put(`/api/admin/users/${id}/verify-operator`)
                toast.success(`Operator ${currentStatus ? 'unverified' : 'verified'} successfully`)
            } else if (type === 'delete') {
                await axios.delete(`/api/admin/users/${id}`)
                toast.success("Operator deleted successfully")
            }

            fetchOperators()
            setConfirmModal({ show: false, id: null, currentStatus: null, type: 'verify', details: null })
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${type === 'delete' ? 'delete' : 'update status'}`)
        }
    }

    const handleCreateOperator = async (e) => {
        e.preventDefault()
        try {
            await axios.post("/api/admin/operators", formData)
            toast.success("Operator created successfully")
            setShowModal(false)
            setFormData({ name: "", email: "", password: "", phone: "" })
            fetchOperators()
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create operator")
        }
    }

    const filterOperators = useCallback(() => {
        let filtered = operators

        if (searchTerm) {
            filtered = filtered.filter(
                (op) =>
                    op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    op.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        setFilteredOperators(filtered)
    }, [operators, searchTerm])

    useEffect(() => {
        fetchOperators()
    }, [fetchOperators])

    useEffect(() => {
        filterOperators()
    }, [filterOperators])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p>Loading operators...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Operators</h1>
                        <p className="text-gray-600">Verify and manage bus operators</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                    >
                        <UserCheck className="h-5 w-5 mr-2" />
                        Add Operator
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search operators..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input w-full pl-10"
                            />
                        </div>
                        <div className="text-sm text-gray-600 flex items-center">Total: {filteredOperators.length} operators</div>
                    </div>
                </div>

                {/* Operators Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOperators.length === 0 ? (
                        <div className="col-span-full bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-xl font-medium">No operators found</p>
                            <p className="text-sm">Register new operators to see them here.</p>
                        </div>
                    ) : (
                        filteredOperators.map((operator) => (
                            <div key={operator._id} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${operator.isVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                            <Shield className={`h-6 w-6 ${operator.isVerified ? 'text-green-600' : 'text-yellow-600'}`} />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">{operator.name}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full ${operator.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {operator.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Email:</span> {operator.email}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Phone:</span> {operator.phone || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Joined: {new Date(operator.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 flex space-x-3">
                                    <button
                                        onClick={() => triggerVerificationToggle(operator._id, operator.isVerified)}
                                        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md transition-colors ${operator.isVerified
                                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                                            }`}
                                    >
                                        {operator.isVerified ? (
                                            <>
                                                <AlertCircle className="h-4 w-4 mr-2" />
                                                Revoke
                                            </>
                                        ) : (
                                            <>
                                                <UserCheck className="h-4 w-4 mr-2" />
                                                Verify
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => triggerDelete(operator)}
                                        className="flex items-center justify-center px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors"
                                        title="Delete Operator"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Operator Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Add New Operator</h2>
                        <form onSubmit={handleCreateOperator} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company Name / Name</label>
                                <input
                                    type="text"
                                    className="input w-full mt-1"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    className="input w-full mt-1"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="text"
                                    className="input w-full mt-1"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    className="input w-full mt-1"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create Operator
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-sm w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {confirmModal.type === 'delete' ? 'Delete Operator' : 'Confirm Action'}
                        </h3>

                        {confirmModal.type === 'delete' ? (
                            <div className="mb-6">
                                <p className="text-gray-600 mb-2">Are you sure you want to delete this operator?</p>
                                <div className="bg-red-50 p-3 rounded text-sm text-red-700">
                                    <p><span className="font-semibold">Name:</span> {confirmModal.details?.name}</p>
                                    <p><span className="font-semibold">Email:</span> {confirmModal.details?.email}</p>
                                    <p className="mt-2 font-bold">This action cannot be undone.</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to {confirmModal.currentStatus ? 'unverify' : 'verify'} this operator?
                            </p>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmModal({ show: false, id: null, currentStatus: null, type: 'verify', details: null })}
                                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`px-4 py-2 rounded-md text-white ${confirmModal.type === 'delete' || confirmModal.currentStatus
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {confirmModal.type === 'delete' ? 'Delete Operator' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default AdminOperators
