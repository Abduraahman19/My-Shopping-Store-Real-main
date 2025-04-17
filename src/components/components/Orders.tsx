import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FiPackage, FiTruck, FiCreditCard, FiUser,
  FiCalendar, FiChevronDown, FiX
} from 'react-icons/fi';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

interface Order {
  _id: string;
  customer: Customer;
  products: Product[];
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Unpaid' | 'Failed' | 'Refunded';
  shippingMethod: string;
  paymentMethod: string;
  totalProducts: number;
  totalQuantity: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

type OrderStatusTab = 'All' | 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

const UserOrdersPopup: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderStatusTab>('All');
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    if (open) {
      fetchOrders();
    }
  }, [open]);

  useEffect(() => {
    filterOrders();
  }, [allOrders, activeTab, showCompleted]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ success: boolean; orders: Order[] }>('http://localhost:5000/api/orders');
      if (response.data.success) {
        setAllOrders(response.data.orders);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...allOrders];

    // Filter by active tab
    if (activeTab !== 'All') {
      filtered = filtered.filter(order => order.status === activeTab);
    }

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(order => {
        const isCompleted = order.status === 'Delivered' || order.status === 'Cancelled';
        return !isCompleted;
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'Shipped':
        return <FiTruck className="text-blue-500" />;
      case 'Processing':
        return <FaClock className="text-orange-500" />;
      case 'Cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const getPaymentStatusIcon = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'Paid':
        return <FaCheckCircle className="text-green-500" />;
      case 'Unpaid':
        return <FaTimesCircle className="text-red-500" />;
      case 'Failed':
        return <FaTimesCircle className="text-red-500" />;
      case 'Refunded':
        return <FaCheckCircle className="text-purple-500" />;
      default:
        return <FaClock className="text-yellow-500" />;
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError("");
  };

  const handleClose = () => {
    setOpen(false);
    setExpandedOrder(null);
  };

  const getTabClass = (tab: OrderStatusTab) => {
    const baseClass = "px-4 py-2 text-lg font-medium rounded-t-lg transition-all duration-300";
    const activeClass = "bg-white text-orange-600 border-b-2 border-orange-600";
    const inactiveClass = "text-gray-600 hover:text-gray-800 hover:bg-gray-100";
    return `${baseClass} ${activeTab === tab ? activeClass : inactiveClass}`;
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'bg-green-600/25 text-green-600';
      case 'Shipped': return 'bg-blue-600/25 text-blue-600';
      case 'Processing': return 'bg-orange-600/25 text-orange-600';
      case 'Cancelled': return 'bg-red-600/25 text-red-600';
      default: return 'bg-yellow-600/25 text-yellow-600';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'Paid':return 'bg-green-600/25 text-green-600';
      case 'Unpaid':return 'bg-red-600/25 text-red-600';
      case 'Failed':return 'bg-red-600/25 text-red-600';
      case 'Refunded':return 'bg-purple-600/25 text-purple-600';
      default:return 'bg-yellow-600/25 text-yellow-600';
    }
  };
  

  return (
    <div>
      <button
        onClick={handleOpen}
        className="flex items-center"
        aria-label="View orders"
      >
        <FiPackage className="text-[24px] mx-[-7px] text-gray-600 hover:text-gray-700 hover:bg-neutral-500/30 rounded-full h-14 p-2 w-14" />
      </button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '16px',
            minHeight: '80vh',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle className="bg-orange-600 text-white flex justify-between items-center">
          <div className="flex items-center">
            <FiPackage className="mr-3 text-5xl" />
            <h2 className="text-4xl font-bold">My Orders</h2>
          </div>
          <IconButton onClick={handleClose} className="text-white">
            <FiX className='text-4xl text-white' />
          </IconButton>
        </DialogTitle>

        <DialogContent className="bg-gray-100 p-0 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center mt-32 items-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-20 w-20 border-t-2 border-b-2 border-orange-700"
              ></motion.div>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-6"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg"
              >
                Retry
              </button>
            </motion.div>
          ) : (
            <>
              {/* Tabs Navigation */}
              <div className="bg-gray-200 mt-5 rounded-2xl shadow-lg px-6 pt-4">
                <div className="flex space-x-1 border-b border-gray-300 overflow-x-auto">
                  {(['All', 'Pending', 'Processing', 'Shipped', 'Delivered'] as OrderStatusTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={getTabClass(tab)}
                      style={{ fontSize: '1.4rem', whiteSpace: 'nowrap' }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Show completed orders toggle */}
                <div className="flex justify-end items-center py-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <div className="relative inline-block w-[32px] h-8">
                      <input
                        type="checkbox"
                        checked={showCompleted}
                        onChange={() => setShowCompleted(!showCompleted)}
                        className="absolute w-full h-full opacity-0 cursor-pointer peer"
                        aria-checked={showCompleted}
                        aria-label="Toggle completed orders visibility"
                      />
                      <div className="absolute inset-0 bg-gray-300 rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] peer-checked:bg-orange-600 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500/50 group-hover:bg-gray-400 peer-checked:group-hover:bg-orange-700"></div>
                      <div className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform peer-checked:translate-x-5 peer-active:scale-90"></div>
                    </div>
                    <span className="text-2xl font-bold text-gray-700 transition-colors duration-200 group-hover:text-gray-900">
                      Show completed orders
                    </span>
                  </label>
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-4 p-6">
                {filteredOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg shadow p-8 text-center"
                  >
                    <FiPackage className="mx-auto text-8xl text-gray-400 mb-4" />
                    <h2 className="text-3xl text-gray-700">
                      {activeTab === 'All' ? 'No Orders Found' : `No ${activeTab} Orders`}
                    </h2>
                    <p className="text-gray-500 text-2xl font-extrabold mt-2">
                      {activeTab === 'All'
                        ? "You don't have any orders right now"
                        : `You don't have any ${activeTab.toLowerCase()} orders`}
                    </p>
                  </motion.div>
                ) : (
                  filteredOrders.map((order, index) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${expandedOrder === order._id ? 'ring-2 ring-orange-100' : 'hover:shadow-lg'
                        }`}
                    >
                      <motion.div
                        className="p-5 cursor-pointer flex justify-between items-center"
                        onClick={() => toggleOrderExpand(order._id)}
                        whileHover={{ backgroundColor: 'rgba(255, 237, 213, 0.5)' }}
                      >
                        <div className="flex items-center space-x-4">
                          <h1 className="text-xl bg-black/15 inline-flex items-center justify-center w-10 aspect-square rounded-full text-gray-700">
                            {index + 1}
                          </h1>
                          <div className={`p-5 rounded-full ${getStatusColor(order.status)}`}>
                            <FiPackage className="text-3xl" />
                          </div>
                          <div>
                            <h2 className="font-bold text-gray-800">Order #{order._id.slice(-8).toUpperCase()}</h2>
                            <p className="text-lg text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 sm:space-x-6">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(order.status)}
                            <span
                              className={`text-sm sm:text-lg px-2 py-1 rounded-lg font-extrabold ${getStatusColor(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className="hidden sm:flex items-center space-x-2">
                            {getPaymentStatusIcon(order.paymentStatus)}
                            <span
                              className={`text-sm sm:text-lg px-2 py-1 rounded-lg font-extrabold ${getPaymentStatusColor(order.paymentStatus)}`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>

                          <div className="text-lg sm:text-2xl font-extrabold text-gray-700">
                            Rs.{order.grandTotal.toLocaleString()}
                          </div>
                          <motion.div
                            animate={{ rotate: expandedOrder === order._id ? 180 : 0 }}
                            className="text-gray-500"
                          >
                            <FiChevronDown />
                          </motion.div>
                        </div>
                      </motion.div>

                      <AnimatePresence>
                        {expandedOrder === order._id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{
                              opacity: 1,
                              height: 'auto',
                              transition: { duration: 0.3, ease: "easeInOut" }
                            }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-gray-200 px-5 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Order Details Card */}
                                <motion.div
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 }}
                                  className="bg-gray-100 rounded-2xl shadow-md p-5"
                                >
                                  <div className="flex items-center mb-3">
                                    <FiCalendar className="text-gray-500 text-2xl mr-2" />
                                    <h3 className="text-gray-700">Order Details</h3>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="font-extrabold text-gray-600">Order ID</p>
                                      <p className="mt-2 font-bold text-neutral-600">{order._id}</p>
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-gray-600">Date</p>
                                      <p className="mt-2 font-bold text-neutral-600">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-gray-600">Shipping</p>
                                      <p className="flex mt-2 font-bold text-neutral-600 items-center">
                                        <FiTruck className="mr-2" /> {order.shippingMethod}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-gray-600">Payment</p>
                                      <p className="flex mt-2 font-bold text-neutral-600 items-center">
                                        <FiCreditCard className="mr-2" /> {order.paymentMethod}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-gray-600">Status</p>
                                      <p className="flex mt-2 font-bold text-neutral-600 items-center">
                                        {getStatusIcon(order.status)} <span className="ml-2">{order.status}</span>
                                      </p>
                                    </div>
                                    <div>
                                      <p className="font-extrabold text-gray-600">Payment Status</p>
                                      <p className="flex mt-2 font-bold text-neutral-600 items-center">
                                        {getPaymentStatusIcon(order.paymentStatus)} <span className="ml-2">{order.paymentStatus}</span>
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>

                                {/* Customer Details Card */}
                                <motion.div
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 }}
                                  className="bg-gray-100 rounded-2xl shadow-md p-5"
                                >
                                  <div className="flex items-center mb-3">
                                    <FiUser className="text-gray-500 text-2xl mr-2" />
                                    <h3 className="text-gray-700">Customer Details</h3>
                                  </div>
                                  <div className="space-y-3 text-sm">
                                    <p>
                                      <span className="font-extrabold text-gray-600">Name:</span>{' '}
                                      <span className='font-bold text-neutral-600'>{order.customer.name}</span>
                                    </p>
                                    <p>
                                      <span className="font-extrabold text-gray-600">Email:</span>{' '}
                                      <span className='font-bold text-neutral-600'>{order.customer.email}</span>
                                    </p>
                                    <p>
                                      <span className="font-extrabold text-gray-600">Phone:</span>{' '}
                                      <span className='font-bold text-neutral-600'>{order.customer.phone}</span>
                                    </p>
                                    <p>
                                      <span className="font-extrabold text-gray-600">Address:</span>{' '}
                                      <span className='font-bold text-neutral-600'>{order.customer.address}</span>
                                    </p>
                                    <p>
                                      <span className="font-extrabold text-gray-600">City:</span>{' '}
                                      <span className='font-bold text-neutral-600'>{order.customer.city}</span>
                                    </p>
                                    <p>
                                      <span className="font-extrabold text-gray-600">Country:</span>{' '}
                                      <span className='font-bold text-neutral-600 uppercase'>{order.customer.country}</span>
                                    </p>
                                    <p>
                                      <span className="font-extrabold text-gray-600">ZipCode:</span>{' '}
                                      <span className='font-bold text-neutral-600'>{order.customer.zipCode}</span>
                                    </p>
                                  </div>
                                </motion.div>

                                {/* Order Items Table */}
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                  className="md:col-span-2 bg-gray-300 rounded-2xl p-4"
                                >
                                  <h3 className="text-3xl text-gray-700 mb-3">Order Items ({order.totalProducts})</h3>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-300">
                                      <thead className="bg-gray-200">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-xl font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                                          <th className="px-4 py-2 text-left text-xl font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                          <th className="px-4 py-2 text-left text-xl font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                                          <th className="px-4 py-2 text-left text-xl font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                          <th className="px-4 py-2 text-left text-xl font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-neutral-100 divide-y divide-gray-300">
                                        {order.products?.map((product) => (
                                          <motion.tr
                                            key={product._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="divide-x divide-gray-300" // 🔥 Adds vertical lines between columns
                                          >
                                            <td className="px-4 py-3 whitespace-nowrap">
                                              <img
                                                src={product.image}
                                                alt={product.name}
                                                className="h-16 w-16 object-cover rounded-lg border"
                                              />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xl font-bold text-gray-700">
                                              {product.name}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xl font-bold text-gray-600">
                                              {product.quantity}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xl font-bold text-gray-500">
                                              Rs.{product.price.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xl font-bold text-gray-700">
                                              Rs.{product.totalPrice.toLocaleString()}
                                            </td>
                                          </motion.tr>
                                        ))}
                                      </tbody>

                                    </table>
                                  </div>

                                </motion.div>
                              </div>

                              {/* Order Summary */}
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-6 flex justify-end"
                              >
                                <div className="bg-orange-600/20 rounded-lg p-4 w-full md:w-1/3">
                                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                                    <span className="font-extrabold text-2xl text-gray-600">Items ({order.totalQuantity})</span>
                                    <span className="font-bold text-xl">Rs.{order.grandTotal.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                                    <span className="font-extrabold text-2xl text-gray-600">Shipping</span>
                                    <span className="font-bold text-xl">Rs.0</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-2">
                                    <span className="font-extrabold text-2xl text-gray-800">Total</span>
                                    <span className="font-bold text-xl text-orange-600">Rs.{order.grandTotal.toLocaleString()}</span>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserOrdersPopup;