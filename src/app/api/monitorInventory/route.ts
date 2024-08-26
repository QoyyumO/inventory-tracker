// src/app/api/monitorInventory/route.ts
import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { firestore } from '../../../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Define the interface for an inventory item
interface InventoryItem {
  id: string;
  quantity: number;
  expiryDate: Timestamp; // or Date if you store it as a Date
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  const { organizationId } = await request.json();

  try {
    // Fetch inventory data from Firestore
    const inventorySnapshot = await getDocs(collection(firestore, `organizations/${organizationId}/inventory`));
    const inventoryData: InventoryItem[] = inventorySnapshot.docs.map(doc => {
      const data = doc.data() as Omit<InventoryItem, 'id'>; // Exclude id from the data
      return {
        id: doc.id,
        ...data, // Spread the rest of the data
      };
    });

    // Get current date
    const currentDate = new Date();
    
    // Calculate one week from now
    const oneWeekFromNow = new Date(currentDate);
    oneWeekFromNow.setDate(currentDate.getDate() + 7);

    // Filter items with quantity < 5 or expiry date within a week
    const filteredItems = inventoryData.filter(item => {
      const quantityCondition = item.quantity < 5;
      const expiryCondition = item.expiryDate && item.expiryDate.toDate() <= oneWeekFromNow;

      return quantityCondition || expiryCondition;
    });

    // Prepare data for AI analysis, requesting a list format
    const analysisPrompt = `Please list the following inventory items that are low on stock or nearing expiry: ${JSON.stringify(filteredItems)}`;

    // Send data to Groq for analysis
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: analysisPrompt }],
      model: 'llama3-8b-8192',
    });

    // Log the entire Groq API response
    console.log('Groq API completion:', JSON.stringify(completion, null, 2));

    // Directly get the content of the response
    const responseContent = completion.choices[0]?.message?.content;

    let analysis;

    if (responseContent) {
      // No need to parse; it's plain text
      analysis = responseContent;
    } else {
      analysis = { error: 'No response from Groq API' };
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('Error in monitorInventory API:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
