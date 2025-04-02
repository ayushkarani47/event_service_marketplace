import { Request, Response } from 'express';
import Booking, { BookingStatus } from '../models/Booking';
import Service from '../models/Service';
import { UserRole } from '../models/User';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customer only)
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add user id to request body
    req.body.customer = req.user.id;

    // Check if user is a customer
    if (req.user.role !== UserRole.CUSTOMER) {
      res.status(403).json({
        success: false,
        message: 'Only customers can create bookings'
      });
      return;
    }

    // Get service details
    const service = await Service.findById(req.body.service);
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      });
      return;
    }

    // Add provider to booking
    req.body.provider = service.provider;

    // Calculate total price (could be more complex in a real application)
    req.body.totalPrice = service.price;

    // Create booking
    const booking = await Booking.create(req.body);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Get all bookings (provider gets their bookings, customer gets their bookings)
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    let query = {};

    // If customer, get only their bookings
    if (req.user.role === UserRole.CUSTOMER) {
      query = { customer: req.user.id };
    }

    // If service provider, get only their bookings
    if (req.user.role === UserRole.SERVICE_PROVIDER) {
      query = { provider: req.user.id };
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate({
        path: 'service',
        select: 'title category price location images'
      })
      .populate({
        path: 'customer',
        select: 'name email profileImage'
      })
      .populate({
        path: 'provider',
        select: 'name email profileImage'
      })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination: any = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination,
      total,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'service',
        select: 'title category price location images'
      })
      .populate({
        path: 'customer',
        select: 'name email profileImage phone'
      })
      .populate({
        path: 'provider',
        select: 'name email profileImage phone'
      });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: `Booking not found with id of ${req.params.id}`
      });
      return;
    }

    // Make sure user is booking owner or service provider
    if (
      booking.customer._id.toString() !== req.user.id &&
      booking.provider._id.toString() !== req.user.id &&
      req.user.role !== UserRole.ADMIN
    ) {
      res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to view this booking`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: `Booking not found with id of ${req.params.id}`
      });
      return;
    }

    // Service provider can confirm or cancel booking
    if (req.user.role === UserRole.SERVICE_PROVIDER) {
      if (booking.provider.toString() !== req.user.id) {
        res.status(403).json({
          success: false,
          message: `User ${req.user.id} is not authorized to update this booking`
        });
        return;
      }

      if (![BookingStatus.CONFIRMED, BookingStatus.CANCELLED].includes(status as BookingStatus)) {
        res.status(400).json({
          success: false,
          message: 'Service providers can only confirm or cancel bookings'
        });
        return;
      }
    }

    // Customer can only cancel their booking
    if (req.user.role === UserRole.CUSTOMER) {
      if (booking.customer.toString() !== req.user.id) {
        res.status(403).json({
          success: false,
          message: `User ${req.user.id} is not authorized to update this booking`
        });
        return;
      }

      if (status !== BookingStatus.CANCELLED) {
        res.status(400).json({
          success: false,
          message: 'Customers can only cancel bookings'
        });
        return;
      }
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'service',
        select: 'title category price location images'
      })
      .populate({
        path: 'customer',
        select: 'name email profileImage'
      })
      .populate({
        path: 'provider',
        select: 'name email profileImage'
      });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private (Customer only)
export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentStatus, paymentId } = req.body;

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({
        success: false,
        message: `Booking not found with id of ${req.params.id}`
      });
      return;
    }

    // Only customer who made the booking can update payment status
    if (booking.customer.toString() !== req.user.id && req.user.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update payment for this booking`
      });
      return;
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentId },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
}; 