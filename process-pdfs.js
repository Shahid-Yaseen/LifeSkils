import { ragPDFProcessor } from './server/services/rag-pdf-processor.ts';
import * as path from 'path';
import * as fs from 'fs';

async function processAllPDFs() {
  try {
    console.log('🚀 Starting PDF processing for RAG system...');
    
    const publicDir = path.join(process.cwd(), 'client', 'public');
    console.log(`📁 Processing PDFs from: ${publicDir}`);
    
    // Check if directory exists
    if (!fs.existsSync(publicDir)) {
      throw new Error(`Directory does not exist: ${publicDir}`);
    }
    
    // Process all PDFs in the directory
    const results = await ragPDFProcessor.processAllPDFsInDirectory(publicDir);
    
    console.log('\n✅ PDF Processing Complete!');
    console.log(`📊 Processed ${results.length} books:`);
    
    results.forEach((result, index) => {
      console.log(`\n📚 Book ${index + 1}:`);
      console.log(`   - Book ID: ${result.bookId}`);
      console.log(`   - Total Chunks: ${result.totalChunks}`);
      console.log(`   - Topics Generated: ${result.topics.length}`);
      console.log(`   - Tests Generated: ${result.tests.length}`);
    });
    
    console.log('\n🎉 All PDFs have been processed and stored in the RAG system!');
    console.log('💡 The system is now ready to generate content based on the book data.');
    
  } catch (error) {
    console.error('❌ Error processing PDFs:', error);
    process.exit(1);
  }
}

// Run the processing
processAllPDFs();
