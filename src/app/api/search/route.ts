import { NextRequest, NextResponse } from 'next/server';
import Service from '../../../models/Service';
import User from '../../../models/User';
import dbConnect from '../../../lib/dbConnect';
//import { ensureModels } from '../../../lib/ensureModels';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ suggestions: [] });
    }

    await dbConnect();
    

    
    const services = await Service.find({
      
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { features: { $elemMatch: { $regex: query, $options: 'i' } } }
      ]
    })
    .select('title category location')
    .limit(5);

    // Format the suggestions
    const suggestions = services.map(service => ({
      id: service._id,
      text: service.title,
      type: 'service',
      category: service.category,
      location: service.location
    }));

  

    return NextResponse.json({ suggestions: suggestions });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Failed to fetch search suggestions' }, { status: 500 });
  }
}
