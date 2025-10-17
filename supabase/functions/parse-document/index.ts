import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedData {
  type: 'csv' | 'excel' | 'pdf' | 'image';
  content?: any;
  rows?: number;
  columns?: string[];
  error?: string;
}

async function parseCSV(fileContent: string): Promise<ParsedData> {
  try {
    const lines = fileContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    return {
      type: 'csv',
      content: data,
      rows: data.length,
      columns: headers,
    };
  } catch (error) {
    console.error('CSV parsing error:', error);
    return {
      type: 'csv',
      error: error.message,
    };
  }
}

async function parseExcel(arrayBuffer: ArrayBuffer): Promise<ParsedData> {
  try {
    // For Excel parsing, we'll return metadata and suggest using CSV format
    return {
      type: 'excel',
      content: { message: 'Excel file detected. For best results, please convert to CSV format.' },
      error: 'Excel parsing requires client-side library. Please use CSV format.',
    };
  } catch (error) {
    console.error('Excel parsing error:', error);
    return {
      type: 'excel',
      error: error.message,
    };
  }
}

async function parsePDF(arrayBuffer: ArrayBuffer): Promise<ParsedData> {
  try {
    // PDF parsing would require a library like pdf-parse
    return {
      type: 'pdf',
      content: { message: 'PDF file uploaded successfully' },
      error: 'PDF text extraction not yet implemented. File stored successfully.',
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    return {
      type: 'pdf',
      error: error.message,
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const documentId = formData.get('documentId') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    let parsedData: ParsedData;

    // Parse based on file type
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      const text = await file.text();
      parsedData = await parseCSV(text);
    } else if (
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    ) {
      const arrayBuffer = await file.arrayBuffer();
      parsedData = await parseExcel(arrayBuffer);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const arrayBuffer = await file.arrayBuffer();
      parsedData = await parsePDF(arrayBuffer);
    } else if (file.type.startsWith('image/')) {
      parsedData = {
        type: 'image',
        content: { message: 'Image file uploaded successfully' },
      };
    } else {
      parsedData = {
        type: 'csv',
        error: 'Unsupported file type',
      };
    }

    // Update document record with parsed data
    if (documentId && parsedData.content) {
      const { error: updateError } = await supabaseClient
        .from('documents')
        .update({
          processed: true,
          parsed_data: parsedData,
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('Error updating document:', updateError);
      } else {
        console.log(`Document ${documentId} updated with parsed data`);
      }
    }

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in parse-document function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});