import { Request, Response } from 'express';
import Service, { ServiceCategory } from '../models/Service';
import { UserRole } from '../models/User';

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Service Provider only)
export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add user id to request body
    req.body.provider = req.user.id;

    // Check if user is a service provider
    if (req.user.role !== UserRole.SERVICE_PROVIDER) {
      res.status(403).json({
        success: false,
        message: 'Only service providers can create services'
      });
      return;
    }

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Get all services with filtering, sorting, and pagination
// @route   GET /api/services
// @access  Public
export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    let query: any = {};

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Remove fields from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Find resource
    query = Service.find(JSON.parse(queryStr));

    // Handle search
    if (req.query.search) {
      query = query.find({ $text: { $search: req.query.search as string } });
    }

    // Handle category filter
    if (req.query.category) {
      query = query.find({ category: req.query.category });
    }

    // Handle location filter
    if (req.query.location) {
      query = query.find({ location: { $regex: req.query.location, $options: 'i' } });
    }

    // Handle price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      const priceFilter: any = {};
      if (req.query.minPrice) priceFilter.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) priceFilter.$lte = Number(req.query.maxPrice);
      query = query.find({ price: priceFilter });
    }

    // Handle rating filter
    if (req.query.minRating) {
      query = query.find({ rating: { $gte: Number(req.query.minRating) } });
    }

    // Select Fields
    if (req.query.select) {
      const fields = (req.query.select as string).split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Service.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Populate provider
    query = query.populate({
      path: 'provider',
      select: 'name email profileImage rating'
    });

    // Execute query
    const services = await query;

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
      count: services.length,
      pagination,
      total,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
export const getService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: 'provider',
      select: 'name email profileImage bio phone location'
    });

    if (!service) {
      res.status(404).json({
        success: false,
        message: `Service not found with id of ${req.params.id}`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Service Provider only)
export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: `Service not found with id of ${req.params.id}`
      });
      return;
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this service`
      });
      return;
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Service Provider only)
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: `Service not found with id of ${req.params.id}`
      });
      return;
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== UserRole.ADMIN) {
      res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this service`
      });
      return;
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
};

// @desc    Get services by provider
// @route   GET /api/services/provider/:id
// @access  Public
export const getProviderServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const services = await Service.find({ provider: req.params.id });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error
    });
  }
}; 