import { Bus, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Bus className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">BusBee</span>
            </div>
            <p className="text-gray-400 mb-4">Your trusted partner for safe and comfortable bus travel across India.</p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button className="hover:text-white">
                  About Us
                </button>
              </li>
              <li>
                <button className="hover:text-white">
                  Services
                </button>
              </li>
              <li>
                <button className="hover:text-white">
                  Contact
                </button>
              </li>
              <li>
                <button className="hover:text-white">
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button className="hover:text-white">
                  Help Center
                </button>
              </li>
              <li>
                <button className="hover:text-white">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button className="hover:text-white">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="hover:text-white">
                  Cancellation Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>support@busbee.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 BusBee. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
