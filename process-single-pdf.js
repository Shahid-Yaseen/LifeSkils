import { ragPDFProcessor } from './server/services/rag-pdf-processor.ts';
import * as path from 'path';

async function processSinglePDF() {
  try {
    console.log('🚀 Starting single PDF processing for RAG system...');
    
    // Process just one PDF to start with
    const pdfPath = path.join(process.cwd(), 'client', 'public', 'LIFEINUKTEST-CHEATSHEET revisionnotes2025.pdf');
    const bookTitle = 'Life in UK Test Cheatsheet 2025';
    
    console.log(`📁 Processing PDF: ${pdfPath}`);
    
    const result = await ragPDFProcessor.processPDF(pdfPath, bookTitle, 'Official Study Guide');
    
    console.log('\n✅ PDF Processing Complete!');
    console.log(`📊 Processed book: ${bookTitle}`);
    console.log(`   - Book ID: ${result.bookId}`);
    console.log(`   - Total Chunks: ${result.totalChunks}`);
    console.log(`   - Topics Generated: ${result.topics.length}`);
    console.log(`   - Tests Generated: ${result.tests.length}`);
    
    console.log('\n🎉 PDF has been processed and stored in the RAG system!');
    console.log('💡 The system is now ready to generate content based on the book data.');
    
  } catch (error) {
    console.error('❌ Error processing PDF:', error);
    process.exit(1);
  }
}

// Run the processing
processSinglePDF();
